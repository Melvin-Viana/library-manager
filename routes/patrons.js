const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const patrons = require('../models').patrons;
const loans = require('../models').loans;
const books = require('../models').books;
/* GET users listing. */
router.get('/', (req, res) => {

  res.redirect('patrons/all');
});

router.get("/all",(req,res)=>{
  patrons.findAll({
    order:[['last_name','ASC'],['id',"ASC"]],
  }).then(patrons=>{
    res.render('./patrons/all_patrons',{
      title:"All Patrons",
      patrons
    })
  })
});

//New patron
router.get("/new",(req,res)=>{
  res.render('./patrons/new_patron',{
    patron:{},
    title:"New Patron"
  });
});

router.post("/new",(req,res)=>{
  patrons.create(req.body).then(patronData=>{
    res.redirect(`/patrons/${patronData.id}`);
  }).catch(err=>{
    if(err.name==="SequelizeValidationError"){
      res.render('patrons/new_patron',{
        patron:patrons.build(req.body),
        errors:err.errors
      })

    }else{
      throw err;
    }
  })
});

// Patron Detail
router.get("/:id",(req,res)=>{
  patrons.findOne({
    where:{id:req.params.id},
    include:{model:loans,include:[{
      model:books
    },
  {model:patrons}]}
  }).then(patron=>{
    res.render('./patrons/detail',{
      title:`${patron.first_name} ${patron.last_name}`,
      loans:patron.loans,
      patron
    })
  })
});


// Edit Patron detail
router.put("/:id",(req,res)=>{
  patrons.findById(req.params.id).then(patron=>patron.update(req.body))
  .then(()=>res.redirect('/patrons/all')).catch(err=>{
    if(err.name="SequelizeValidationError"){
      patrons.findOne({
        where:{id:req.params.id},
        include:{model:loans,include:[{
          model:books
        },
      {model:patrons}]}
      }).then(patron=>{
        res.render('./patrons/detail',{
          title:`${patron.first_name} ${patron.last_name}`,
          loans:patron.loans,
          patron,
          errors:err.errors
        })
      })
    }
    else{
     throw err; 
    }
  })
});



module.exports = router;
