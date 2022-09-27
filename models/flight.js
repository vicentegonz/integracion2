'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Flight extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Flight.init({
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    departure: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    destination: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    total_distance: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    traveled_distance: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    bearing: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    position: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Flight',
  });
  return Flight;
};