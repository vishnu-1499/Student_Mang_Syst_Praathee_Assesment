const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Student = db.define("Student", {
  studentId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  class: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM("male", "female"),
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
  },
});

module.exports = Student;