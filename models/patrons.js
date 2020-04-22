'use strict';
module.exports = (sequelize, DataTypes) => {
  const patrons = sequelize.define('patrons', {
    first_name: {type:DataTypes.STRING,
    validate:{notEmpty:{msg:"The first name field is required"}}},
    last_name: {type:DataTypes.STRING,
    validate:{notEmpty:{msg:"The last name field is required"}}},
    address: {type:DataTypes.STRING,
    validate:{notEmpty:{msg:"The address name field is required"}}},
    email: {type:DataTypes.STRING,
    validate:{isEmail:{msg:"Please enter a valid email address"},notEmpty:{msg:"The email field is required"}}},
    library_id: {type:DataTypes.STRING,
    validate:{notEmpty:{msg:"The libary id field is required"}}},
    zip_code: {type:DataTypes.INTEGER,
      validate:{notEmpty:{msg:"The zip code field is required"}}},
  }, {});
  patrons.associate = function(models) {
    // associations can be defined here
    patrons.hasMany(models.loans,{foreignKey:"patron_id"});
  };
  return patrons;
};