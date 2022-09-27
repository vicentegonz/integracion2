'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Flights', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id: {
        type: Sequelize.STRING
      },
      departure: {
        type: Sequelize.JSON
      },
      destination: {
        type: Sequelize.JSON
      },
      total_distance: {
        type: Sequelize.FLOAT
      },
      traveled_distance: {
        type: Sequelize.FLOAT
      },
      bearing: {
        type: Sequelize.FLOAT
      },
      position: {
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Flights');
  }
};