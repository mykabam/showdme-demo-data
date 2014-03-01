var config = require('./config');
require('mongoose-schema-extend');
var mongoose = require('mongoose');
mongoose.connect(config.MONGO_URL);
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var UserSchema = new Schema({
  email: {type: String, trim: true, index: true, unique: true, sparse: true, match: /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/},
  username: {type: String, trim: true, index: true, unique: true, match: /^[a-zA-Z0-9_]+$/, sparse: true},
  salt: String,//string to hash password
  password: String,//hashed password
  apiKey: {type: String, required: true, index: true, unique: true, /*default: rack,*/ match: /^[a-zA-Z0-9_]+$/ }, //for invalidating sessions by user request, for api interactions...
  apiKeyCreatedAt: Date,
  lang: {type: String, default: 'en', match: /^[a-z]{2}$/},
  isBanned: {type: Boolean, default: false},
  roles: [
    {type: String, match: /^[a-zA-Z0-9_:]+$/, index: true, unique: true, sparse: true }
  ],
  rootGroup: { type: ObjectId, ref: 'Group' },
  emailVerified: {type: Boolean, default: false},
  serviceAccounts: [],
  UTCOffset: Number,
  profile: {
    firstName: {type: String, trim: true},
    lastName: {type: String, trim: true},
    location: {type: String, trim: true},
    about: {type: String, trim: true},
    contacts: {
      skype: {type: String, trim: true}
    },
    skills: [{type: String, trim: true}],
    education: [],
    positions: [],
    photoUrl: String,
    address: [],
    birthDate: Date,
    faxNumber: String,
    gender: String,
    nationality: Schema.Types.Mixed,
    telephone: String,
    officeTelephone: String,
    cellNumber: String
  },
  lastSeenOnline: Date,
  groups: [
    { type: ObjectId, ref: 'Group', index: true, unique: true, sparse: true }
  ],
  courses: []
});
var User = mongoose.model('User', UserSchema);

var GroupSchema = new Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String
  },
  groupType: {
    type: String,
    required: true,
    index: true
  },
  parentId: {
    type: ObjectId,
    index: true
  },
  parentPath: [{
    type: ObjectId,
    index: true
  }],
  ownerId: {
    type: ObjectId,
    required: true,
    index: true
  },
  _permissions: {
    type: {},
    index: true
  },
  removed: {
    type: Boolean,
    default: 0
  }
}, { collection: 'groups' });

// Organization
var OrganizationSchema = GroupSchema.extend({
  shortname: { type: String, trim: true, unique: true, match: /^[a-zA-Z0-9_]+$/, sparse: true },
  settings: {
  }
});
var Organization = mongoose.model('Organization', OrganizationSchema);

// UserGroup
var UserGroupSchema = GroupSchema.extend({});
var UserGroup = mongoose.model('UserGroup', UserGroupSchema);

// Course
var CourseSchema = GroupSchema.extend({
  name: String,
  description: String,
  category: String,
  skills: [String],
  links: []
});
var Course = mongoose.model('Course', CourseSchema);

// CourseSession
var CourseSessionSchema = GroupSchema.extend({
  courseId: { type: ObjectId, ref: 'Course' },
  schedule: Date,
  location: String,
  maxApplicants: { type: Number, default: 0 },
  cutoffDate: Date,
  multiSession: { type: Boolean, required: true, default: false },
  frequency: { type: String, 'enum': ['daily', 'weekly', 'monthly', 'yearly'] },
  weekday: Number,
  startDate: Date,
  endDate: Date,
  duration: { type: Number, required: true },
  tutor: { type: ObjectId, ref: 'User' },
  status: { type: String, 'enum': [ 'registration', 'active', 'finished' ], default: 'registration' },
  links: [],
  notes: []
});
var CourseSession = mongoose.model('CourseSession', CourseSessionSchema);

var SkillSchema = new Schema({
  name: String,
  description: String,
  category: String,
  ownerId: ObjectId,
  groupId: ObjectId,
  groups: [],
  removed: Boolean
});
var Skill = mongoose.model('Skill', SkillSchema);

module.exports = {
  ObjectId: ObjectId,
  User: User,
  Organization: Organization,
  UserGroup: UserGroup,
  Course: Course,
  CourseSession: CourseSession,
  Skill: Skill
};