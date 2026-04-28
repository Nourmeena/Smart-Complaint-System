'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Appeal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    Appeal.belongsTo(models.Complaint, { foreignKey: "complaint_id" });

    Appeal.belongsTo(models.User, { foreignKey: "responded_by" });

    }
  }
  Appeal.init({
    complaint_id: DataTypes.INTEGER,
    reason: DataTypes.TEXT,
    status: DataTypes.STRING,
    response_text: DataTypes.TEXT,
    responded_at: DataTypes.DATE,
    responded_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Appeal',
  });
  return Appeal;
};