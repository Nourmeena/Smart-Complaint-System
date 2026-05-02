module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("PriorityRules", "examples", {
      type: Sequelize.TEXT("long"),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("PriorityRules", "examples", {
      type: Sequelize.STRING,
    });
  },
};
