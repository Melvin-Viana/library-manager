'use strict';
module.exports = (sequelize, DataTypes) => {
  const isEmpty=(val,name)=>{
    if(val===""){
      throw new Error(`* The ${name} field is required.`)
    }
  }
  const loans = sequelize.define('loans', {
    book_id: DataTypes.INTEGER,
    patron_id: DataTypes.INTEGER,
    loaned_on: {type:DataTypes.DATEONLY,validate:{
        isDate:{msg:"Please enter a loan date with the following format YYYY-MM-DD"}}
    },
    return_by: {type:DataTypes.DATEONLY,
        validate:{
          isDate:{msg:"Please enter a return date with the following format: YYYY-MM-DD"}
      }
    },
    returned_on: {type:DataTypes.DATEONLY,
    validate:{
      isDate:{msg:"Please enter a return date with the following format: YYYY-MM-DD"}
    }}
  }, {});
  loans.associate = function(models) {
    // associations can be defined here
    loans.belongsTo(models.books,{foreignKey:"book_id"});
    loans.belongsTo(models.patrons,{foreignKey:"patron_id"});
  };
  return loans;
};