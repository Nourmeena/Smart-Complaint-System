'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Faculty extends Model {
    static associate(models) {

      this.hasMany(models.Student, { foreignKey: "faculty_id" });
      this.hasMany(models.Category, { foreignKey: "faculty_id" });
      this.hasMany(models.Regulation, { foreignKey: "faculty_id" });

    }
  }
  Faculty.init({
    name: DataTypes.STRING,
    email_domain: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Faculty',
    timestamps: true,
    underscored: true
  });

  return Faculty;
};