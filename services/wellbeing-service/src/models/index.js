const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, dialect: 'postgres', logging: false }
);

const Survey = sequelize.define('Survey', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  questions: { type: DataTypes.JSONB },
  isAnonymous: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  createdBy: { type: DataTypes.STRING }
});

const SurveyResponse = sequelize.define('SurveyResponse', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  surveyId: { type: DataTypes.UUID },
  workerId: { type: DataTypes.STRING }, // null if anonymous
  responses: { type: DataTypes.JSONB }, // { questionId: answer }
  wellbeingScore: { type: DataTypes.FLOAT }, // calculated score
  submittedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

Survey.hasMany(SurveyResponse, { foreignKey: 'surveyId' });

module.exports = { sequelize, Survey, SurveyResponse };