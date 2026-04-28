'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    Student.belongsTo(models.Faculty, { foreignKey: "faculty_id" });
    Student.hasOne(models.User, { foreignKey: "student_id" });

    }
  }
  Student.init({
    student_number: DataTypes.STRING,
    full_name: DataTypes.STRING,
    email: DataTypes.STRING,
    department: DataTypes.STRING,
    academic_year: DataTypes.INTEGER,
    faculty_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Student',
  });
  return Student;
};