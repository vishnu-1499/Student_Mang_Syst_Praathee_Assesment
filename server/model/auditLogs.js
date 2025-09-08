const { DataTypes } = require("sequelize");
const db = require("../config/db");

const AuditLog = db.define("AuditLog", {
  userId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  action: {
    type: DataTypes.ENUM("create", "update", "delete"),
    allowNull: false,
  },
  dataChanges: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = AuditLog;
