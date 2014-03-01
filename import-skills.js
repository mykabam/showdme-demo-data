/*
 * import-skills.js
 * Import skills into Mongo
 *
 */
var config = require('./config');

var _ = require('lodash');
var async = require('async');
var xlsx = require('node-xlsx');
var Skill = require('./models').Skill;

var getSkills = function() {
  var doc = xlsx.parse('./data/skills.xlsx');
  var all = doc.worksheets.shift();
  var byCategory = {};

  doc.worksheets.forEach(function(ws) {
    // Remove title row
    ws.data.shift();
    byCategory[ws.name] = ws.data.map(function(row) {
      return row[0].value;
    });
  });

  return byCategory;
};

module.exports.import = function(admin, world, demo, next) {
  var skillsByCategory = getSkills();
  async.each(Object.keys(skillsByCategory), function(cat, callback) {
    async.mapSeries(skillsByCategory[cat], function(skill, cb) {
      // Skill to World Org
      var worldSkill = new Skill({
        name: skill,
        category: cat,
        description: skill,
        ownerId: world.ownerId,
        groupId: world._id,
        groups: [ world._id ]
      });

      // Skill to Demo Org
      var demoSkill = new Skill({
        name: skill,
        category: cat,
        description: skill,
        ownerId: demo.ownerId,
        groupId: demo._id,
        groups: [ world._id, demo._id ]
      });

      async.mapSeries([ worldSkill, demoSkill ], function(s, _cb) {
        s.save(_cb);
      }, cb);

    }, function(err, results) {
      if(err) { console.log(err); }
      console.log(results[0]);
      console.log(results.length);
      callback();
    });
  }, next);
};
