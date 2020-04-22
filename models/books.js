'use strict';

module.exports = (sequelize, DataTypes) => {
  const isEmpty=(val,name)=>{
  if(val===""){
    throw new Error(`The ${name} field is required.`)
  }
}
  const books = sequelize.define('books', {
    title: {type:DataTypes.STRING,
            validate:{
            customFunc:function(value){isEmpty(value,'title')}}
                            },
    author: {type:DataTypes.STRING,
            validate:{
            customFunc:function(value){isEmpty(value,'author')}}
                            },
    genre: {type:DataTypes.STRING,
            validate:{
            customFunc:function(value){isEmpty(value,'genre')}}
                            },
    first_published: {type:DataTypes.INTEGER,
      validate:{
        isNum:function(value){
          if(isNaN(value)){
            throw new Error('Make sure a numeric value is entered in first published field')
          }
        }
      }
      }
  }, {});
  books.associate = function(models) {
    // associations can be defined here
       books.hasMany(models.loans,{foreignKey:'book_id'});
  };
  return books;
};