'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Regulation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Regulation.belongsTo(models.Faculty, { foreignKey: "faculty_id" }); // 
    }
  }
  Regulation.init({
    faculty_id: DataTypes.INTEGER,
    article_number: DataTypes.STRING,
    content: DataTypes.TEXT,
    type: DataTypes.STRING,
    embedding_id: DataTypes.STRING,
    added_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Regulation',
  });
  return Regulation;
};