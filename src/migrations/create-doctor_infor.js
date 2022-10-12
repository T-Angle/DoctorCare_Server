'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('doctor_infor', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      doctorId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      specialtyId: {
        type: Sequelize.INTEGER
      },
      clinicId: {
        type: Sequelize.INTEGER
      },
      priceId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      provinceId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      paymentId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      addressClinic: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nameClinic: {
        type: Sequelize.STRING,
        allowNull: false
      },
      notes: {
        type: Sequelize.STRING
      },
      count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    await queryInterface.dropTable('doctor_infor');
  }
};