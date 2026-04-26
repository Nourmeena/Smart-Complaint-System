'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PriorityRules extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
  PriorityRules.belongsTo(models.Category, { foreignKey: "category_id" }); // ✅ صح
  PriorityRules.belongsTo(models.User, { foreignKey: "created_by" });      // ✅ صح
}
  }
  PriorityRules.init({
    priority_level: DataTypes.INTEGER,
    description: DataTypes.STRING,
    examples: DataTypes.STRING,
    category_id: DataTypes.INTEGER,
    created_by: DataTypes.INTEGER,
    //updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'PriorityRules',
    tableName: 'PriorityRules',
    timestamps: false
  });
  return PriorityRules;
};