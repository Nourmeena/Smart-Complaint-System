'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ComplaintHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
     
    ComplaintHistory.belongsTo(models.Complaint, { foreignKey: "complaint_id" });
    ComplaintHistory.belongsTo(models.User, { foreignKey: "changed_by" });
    }
  }
  ComplaintHistory.init({
    complaint_id: DataTypes.INTEGER,
    status: DataTypes.STRING,
    changed_by: DataTypes.INTEGER,
    changed_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'ComplaintHistory',
    timestamps: true,   // ✅ خليها true هنا كمان
    underscored: false
  });
  return ComplaintHistory;
};