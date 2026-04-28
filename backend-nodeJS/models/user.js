'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
    User.belongsTo(models.Student, { foreignKey: "student_id" });

    User.hasMany(models.Complaint, { foreignKey: "user_id" });
    User.hasMany(models.AuditLog, { foreignKey: "user_id" });
    User.hasMany(models.ComplaintHistory, { foreignKey: "changed_by" });

    // Many-to-Many with categories
    User.belongsToMany(models.Category, {
      through: "category_officers",
      foreignKey: "officer_id"
    });
     User.hasMany(models.Appeal, {
      foreignKey: "responded_by"
    });
    }
  }
  User.init({
    student_id: DataTypes.INTEGER,
    full_name: DataTypes.STRING,
    email: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    role: DataTypes.ENUM,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};