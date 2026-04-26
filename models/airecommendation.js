'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AiRecommendation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
  AiRecommendation.belongsTo(models.Category, { foreignKey: "category_id" }); // ✅ كدة صح
}
  }
  AiRecommendation.init({
    category_id: DataTypes.INTEGER,
    pattern_detected: DataTypes.TEXT,
    recommendation: DataTypes.TEXT,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'AiRecommendation',
  });
  return AiRecommendation;
};