module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Complaints", "embedding", {
      type: Sequelize.TEXT("long"),
      allowNull: true,
    });

    await queryInterface.addColumn("Complaints", "deleted_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Complaints", "embedding");
    await queryInterface.removeColumn("Complaints", "deleted_at");
  },
};
