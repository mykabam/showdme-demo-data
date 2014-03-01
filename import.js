var async = require('async');
var models = require('./models');
var Org = models.Organization;

// Create Kabam Admin
function createAdmin(cb) {
  var user = new models.User({
    'UTCOffset': -240,
    'apiKey': '90eef5d71432922160a2fcc0d6e8470410a00544ffa3b7f93eae1fd1883bf9de1844cb6d055c6bf3596596c2f8e4dba4ff97278b40fb235099b89e3839b53d2d',
    'email': 'admin@monimus.com',
    'emailVerified': true,
    'groups': [],
    'isBanned': false,
    'lang': 'en',
    'password': 'f34b73ba6e9abf665cc44d48c74ab6bdb34325be645a29bbdfea7032ea86c74d78b0f45f54bd53224bb0c073b4844fc4abccba6a8141069f7b29a2eccb1693ce',
    'profile' : { 'about' : 'Proin magna est, iaculis sit amet ligula eget, auctor elementum eros. Proin id pharetra sapien. Vestibulum nec dolor sapien. Sed ut augue metus. Vivamus fringilla, erat id elementum vestibulum, lacus nunc sagittis ante, id consequat lacus enim sed eros. Sed in euismod velit, lacinia adipiscing ante. Nulla facilisi. Nam at faucibus sapien. Nam at tristique nulla. Morbi feugiat consequat dictum. In facilisis pulvinar massa non vulputate. Integer sed fermentum metus. Maecenas arcu purus, ullamcorper at velit a, semper tincidunt purus. Suspendisse consequat felis non sapien mattis, commodo consectetur tellus pulvinar. Duis libero nibh, feugiat id est ac, accumsan viverra metus. In fringilla mauris diam, sit amet dapibus nibh porta sagittis.', 'location' : 'New York, NY', 'lastName' : 'Administrator', 'firstName' : 'System', 'address' : [ ], 'positions' : [ ], 'education' : [ ], 'skills' : [  'some' ], 'contacts' : null },
    'roles' : [],
    'salt': 'a03da8075fb61d83e113d3e23f617c3e70ff47055d721aca46dc50e566f49b359d2a236f871cd297c7c8d3e868fe8e4d210286dfa92d95e6716ad0caf5bdbcac',
    'username': 'kabamadmin'
  });

  user.save(function(err, admin) {
    cb(err, admin);
  });
}

// Create organizations
function createWorld(admin, cb) {
  var org = new Org({
    groupType: 'World',
    name: 'World',
    ownerId: admin._id,
    description: 'Public Group',
    _permissions: { 'delete': [], 'update': [], 'read': [], 'create': [], 'grantRole': [] },
    parentPath: [],
    removed: false
  });

  org.save(function(err, world) {
    // console.log(err);
    admin.groups.push(world._id);
    admin.save(function(err, newAdmin) {
      cb(null, newAdmin, world);
    });
  });
}

function createDemo(admin, world, cb) {
  var org = new Org({
    groupType: 'Organization',
    name: 'Demo Organization',
    ownerId: world.ownerId,
    description: 'Demo Organization',
    _permissions: { 'delete': [ ], 'readPermissions': [  'manager' ], 'readUsers': [  'manager' ], 'read': [  'manager',  'member' ], 'update': [  'manager' ], 'create': [  'manager' ], 'revoke': [  'manager' ], 'grant': [  'manager' ] },
    parentPath: [ world._id ],
    originalElement: { '_permissions': {}, 'settings': {} },
    settings: { requestsRequireApproval: false },
    shortname: 'demo',
    removed: false
  });

  org.save(function(err, demo) {
    cb(null, admin, world, demo);
  });
}

function createResources(admin, world, demo, next) {
  // console.log(arguments);
  // Import resources
  var resources = [
    'profiles',
    'skills'
  ];

  async.each(resources, function(res, cb) {
    require('./import-'+res).import(admin, world, demo, cb);
  }, next);
}

function start() {
  async.waterfall([
    createAdmin,
    createWorld,
    createDemo,
    createResources
  ], function(err) {
    if(err) { console.log(err); }
    console.log('hereee');
    process.exit();
  });
}

start();
