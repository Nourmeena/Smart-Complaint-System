'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CategoryKeywords extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
     CategoryKeyword.belongsTo(Category)
    }
  }
  CategoryKeywords.init({
    category_id: DataTypes.INTEGER,
    keyword: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CategoryKeywords',
  });
  return CategoryKeywords;
};