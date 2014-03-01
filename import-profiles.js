/*
 * import-profiles.js
 * Import profiles into Mongo for 'Demo Organization'
 *
 */

var LOGGING = true;

var fs = require('fs');
var crypto = require('crypto');
var request = require('superagent');
var async = require('async');
var models = require('./models');
var ObjectId = models.ObjectId;

var people = require('./data/new-profiles');
var profiles = {};
var count = 0;

var config = require('./config');

var worldOrg = config.WORLD_ORG;
var demoOrg = config.DEMO_ORG;

function log(m) {
  if(LOGGING) {
    console.log(m);
  }
}

function sha512(str) {
  return crypto.createHash('sha512').update(str).digest('hex').toString();
}

function rack() {
  var rackSeed = crypto.randomBytes(64);
  var result = sha512(rackSeed + crypto.randomBytes(64).toString());
  rackSeed = result;
  return result;
}

function capitalise(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getRandomUser(data, cb) {
  request
    .get('http://api.randomuser.me')
    .end(function(err, res) {
      var user = res.body.results[0].user;
      if(profiles[user.username]) {
        getRandomUser(data, cb);
      } else {
        cb(null, user, data);
      }
    });
}

function createUser(user, data, cb) {
  var salt = sha512(rack());

  var profile = {
    email: user.email.replace(/example\.com/, 'monimus.com'),
    username: user.username,
    salt: salt,
    password: sha512(salt + 'password'),
    apiKey: sha512(rack()),
    apiKeyCreatedAt: new Date(),
    lang: 'en',
    isBanned: false,
    roles: [],
    rootGroup: null,
    emailVerified: true,
    serviceAccounts: [],
    UTCOffset: 180,
    profileComplete: true,
    profile: {
      firstName: capitalise(user.name.first),
      lastName: capitalise(user.name.last),
      location: capitalise(user.location.city)+', '+capitalise(user.location.state),
      skills: data.skills,
      photoUrl: user.picture,
      about: data.summary
    },
    groups: [],
    courses: []
  };

  var model = new models.User(profile);
  model.save(cb);
}

function createUserGroup(user, c, cb) {
  var userGroup = new models.UserGroup({
    name: user.username+'\'s UserGroup',
    ownerId: user._id,
    groupType: 'UserGroup',
    _permissions: { "delete": [], "read": [], "update": [], "create": [] }
  });
  userGroup.save(function() {
    cb(null, user, userGroup);
  });
}

function updateUser(user, userGroup, cb) {
  user.roles = [
    'organization:'+worldOrg+':member',
    'organization:'+demoOrg+':member',
    'usergroup:'+userGroup._id.toString()+':admin'
  ];

  user.groups = [
    worldOrg,
    demoOrg,
    userGroup._id
  ];

  user.rootGroup = userGroup._id;

  user.save(cb);
}

function save() {
  fs.writeFileSync('./data/import-profiles.json', JSON.stringify(profiles, null, 2));
}

module.exports.import = function(admin, world, demo, next) {
  if(world) {
    worldOrg = world._id;
  }

  if(demo) {
    demoOrg = demo._id;
  }

  async.eachSeries(people, function(data, callback) {
    log(count++);
    async.waterfall([
      function(cb) { cb(null, data); },
      getRandomUser,
      createUser,
      createUserGroup,
      updateUser
    ], function(err, user) {
      if(err) { return callback(err); }
      log(user.username);
      profiles[user.username] = user;
      callback();
    });
  }, save);
};

