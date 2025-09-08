const { DataTypes } = require("sequelize");
const db = require("../config/db");

const User = require("./user");
const Student = require("./student");
const AuditLog = require("./auditLogs");

module.exports = { db, User, Student, AuditLog };