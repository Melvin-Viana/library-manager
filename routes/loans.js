const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const loans = require('../models').loans;
const books = require('../models').books;
const patrons = require('../models').patrons;
const moment = require('moment')
  const today = moment().format("YYYY-MM-DD");
      const dueDate = moment().add(7, "day").format("YYYY-MM-DD");
router.get('/', (req, res) => {

  res.redirect('/loans/all');
});
router.get('/all', function (req, res, next) {

  loans.findAll({
    order: [
      ["id", "ASC"]
    ],
    include: [{
        model: books
      },
      {
        model: patrons
      }
    ]
  }).then(loans => {
    res.render('./loans/all_loans', {
      title: 'All Loans',
      loans
    });
  });
});

/* GET overdue loans page. */
router.get('/overdue', function (req, res, next) {
  loans.findAll({
    where: {
      return_by: {
        [Op.lt]: new Date()
      },
      returned_on: {
        [Op.is]: null
      }
    },
    include: [{
        model: books
      },
      {
        model: patrons
      }
    ]
  }).then(
    loans => {

      res.render('./loans/all_loans', {
        title: 'Overdue Loans',
        loans
      });
    }
  ).catch(err => console.error())
});

/* GET checked out loans page. */
router.get('/checked_out', function (req, res, next) {
  loans.findAll({
    where: {
      returned_on: {
        [Op.is]: null
      }
    },
    include: [{
        model: books
      },
      {
        model: patrons
      }
    ]
  }).then(
    loans => {
      res.render('./loans/all_loans', {
        title: 'Checked Out Books',
        loans
      });
    }
  ).catch(err => console.error())
});

/* GET new loan page. */
router.get("/new_loan", function (req, res, next) {
  const booksArr = books.findAll({
    order: [
      ["title", "ASC"]
    ]
  });
  const patronsArr = patrons.findAll({
    order: [
      ["first_name", "ASC"],
      ["last_name", "ASC"]
    ]
  });
   Promise.all([booksArr, patronsArr]).then(values => {
    res.render("loans/new_loan", {
      books: values[0],
      patrons: values[1],
      title: "New Loan",
      today,
      dueDate
    });
  });
});

router.post("/new_loan", (req, res) => {
  loans.create(req.body).then(loans => {
      res.redirect(`/loans/all`);
    }).catch(err => {
      const booksArr = books.findAll({
        order: [
          ["title", "ASC"]
        ]
      });
      const patronsArr = patrons.findAll({
        order: [
          ["first_name", "ASC"],
          ["last_name", "ASC"]
        ]
      });
    
      if (err.name === "SequelizeValidationError") {
        Promise.all([booksArr, patronsArr]).then(values => {
          res.render("loans/new_loan", {
            books: values[0],
            patrons: values[1],
            title: "New Loan",
            today,
            dueDate,
            errors: err.errors
          });
        });
      } else {
        throw err;
      }
    })
    .catch(err => {
      res.send(500);
    });
});

/*GET return book */
router.get("/return/:id",(req,res)=>{
  loans.findOne({where:{id:req.params.id},
  include:[{model:books},{model:patrons}]}).then(
    loan=>{
  res.render('loans/return_book',{
    loan,
    book:loan.book,
    name:`${loan.patron.first_name} ${loan.patron.last_name}`,
    today});
    }
  )
});
/*POST return book */
// 
router.put("/return/:id",(req,res)=>{
loans.findById(req.params.id).then((loan)=>{
  return loan.update(req.body);
}).then(()=>{
  res.redirect('/loans/all');
}).catch(err=>{
  // TODO: Error handling
  if(err.name==="SequelizeValidationError"){
    loans.findOne({where:{id:req.params.id},
      include:[{model:books},{model:patrons}]}).then(
        loan=>{
      res.render('loans/return_book',{
        loan,
        book:loan.book,
        name:`${loan.patron.first_name} ${loan.patron.last_name}`,
        today,
      errors:err.errors});
        }
      )
  }
})
});
module.exports = router;