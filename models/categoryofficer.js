'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CategoryOfficer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CategoryOfficer.init({
    category_id: DataTypes.INTEGER,
    officer_id: DataTypes.INTEGER,
    assigned_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'CategoryOfficer',
  });
  return CategoryOfficer;
};