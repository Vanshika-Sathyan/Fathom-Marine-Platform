const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'fathom_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  { host: process.env.DB_HOST || 'localhost', dialect: 'postgres', logging: false }
);

const Course = sequelize.define('Course', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING },
  duration: { type: DataTypes.INTEGER }, // minutes
  level: { type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'), defaultValue: 'beginner' },
  s3MaterialUrl: { type: DataTypes.STRING }, // S3 URL for training material
  assessmentId: { type: DataTypes.UUID },
  credentialType: { type: DataTypes.STRING }, // credential issued on completion
  createdBy: { type: DataTypes.STRING },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const Enrollment = sequelize.define('Enrollment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  workerId: { type: DataTypes.STRING, allowNull: false }, // pod ID
  courseId: { type: DataTypes.UUID, allowNull: false },
  status: { type: DataTypes.ENUM('enrolled', 'in_progress', 'completed', 'failed'), defaultValue: 'enrolled' },
  progress: { type: DataTypes.INTEGER, defaultValue: 0 }, // 0-100
  startedAt: { type: DataTypes.DATE },
  completedAt: { type: DataTypes.DATE },
  score: { type: DataTypes.FLOAT },
  credentialIssued: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const Assessment = sequelize.define('Assessment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  courseId: { type: DataTypes.UUID },
  title: { type: DataTypes.STRING },
  questions: { type: DataTypes.JSONB }, // array of question objects
  passingScore: { type: DataTypes.FLOAT, defaultValue: 70.0 },
  s3Url: { type: DataTypes.STRING }
});

Course.hasMany(Enrollment, { foreignKey: 'courseId' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId' });
Course.hasOne(Assessment, { foreignKey: 'courseId' });

module.exports = { sequelize, Course, Enrollment, Assessment };