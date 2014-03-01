module.exports = {
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost/kabam_dev',
  WORLD_ORG: process.env.WORLD_ORG, // || '52d3f1b237b9d2740d73fcad',
  WORLD_OWNER: process.env.WORLD_OWNER, // || '52d3f1b237b9d2740d73fca8',
  DEMO_ORG: process.env.DEMO_ORG // '52d74899fe4713d604e78cb0'
};

/*Object.keys(module.exports).forEach(function(o) {
  if(!module.exports[o]) {
    throw new Error('Please set env '+o);
    process.exit();
  }
});*/