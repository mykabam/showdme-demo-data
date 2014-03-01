var fs = require('fs');
var async = require('async');
var request = require('superagent');
var cheerio = require('cheerio');
var _ = require('lodash');

var count = 0;
var people = _.shuffle(Object.keys(require('./data/profiles')));
var profiles = {};

getProfile();

function getProfile() {
  if(count > 199) {
    var saveProfiles = Object.keys(profiles).map(function(id) {
      return profiles[id];
    });
    fs.writeFileSync('new-profiles.json', JSON.stringify(saveProfiles, null, 2));
    Object.keys(profiles).forEach(function(id) {
      profiles[id] = true;
    });
    count = 0;
    // page++;
    return process.exit();
    // return getProfile();
  }

  var url = people.shift();
  var id = url.split('?')[0];
  if(profiles[id]) { return getProfile(); }

  console.log();
  console.log(url);

  request.get(url).end(function(err, res) {
    extract(url, res.text);
    getProfile();
  });
}

function extract(url, data) {
  var $ = cheerio.load(data);

  var id = url.split('?')[0];
  profiles[id] = {
    firstName: $('#name .given-name').text().trim(),
    lastName: $('#name .family-name').text().trim(),
    photo: (function(cb) {
      var img = $('#profile-picture img');
      return img.attr ? img.attr('src') : null;
    })(),
    summary: $("#profile-experience .description.current-position").text().trim(),
    location: $('#headline .locality').text().trim(),
    skills: (function(cb) {
      var skills = [];
      var $skills = $('#profile-skills #skills-list li span');
      $skills.each(function() {
        skills.push($(this).text().trim());
      });
      return skills;
    })()
  };

  var $persons = $('#extra .browsemap li.with-photo strong a');
  $persons.each(function() {
    var url = $(this).attr('href').trim();
    if(!profiles[url.split('?')[0]]) {
      people.push(url);
    }
  });

  console.log(++count);
}
