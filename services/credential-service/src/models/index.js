const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'fathom_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
);

// Credential Model
const Credential = sequelize.define('Credential', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  credentialId: { type: DataTypes.STRING, unique: true, allowNull: false },
  workerId: { type: DataTypes.STRING, allowNull: false },
  workerName: { type: DataTypes.STRING, allowNull: false },
  workerEmail: { type: DataTypes.STRING, allowNull: false },
  credentialType: { type: DataTypes.STRING, allowNull: false },
  issuedBy: { type: DataTypes.STRING, allowNull: false },
  issuedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  expiresAt: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM('active', 'expired', 'revoked'), defaultValue: 'active' },
  metadata: { type: DataTypes.JSONB, defaultValue: {} }
});

// Worker/User Model
const Worker = sequelize.define('Worker', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  podId: { type: DataTypes.STRING, unique: true },  // Worker Pod ID
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('worker', 'admin', 'manager'), defaultValue: 'worker' },
  department: { type: DataTypes.STRING },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Associations
Worker.hasMany(Credential, { foreignKey: 'workerId', sourceKey: 'podId' });
Credential.belongsTo(Worker, { foreignKey: 'workerId', targetKey: 'podId' });

module.exports = { sequelize, Credential, Worker };