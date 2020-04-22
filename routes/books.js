const express = require("express");
const router = express.Router();
const books = require("../models").books;
const loans = require("../models").loans;
const patrons = require('../models').patrons;
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const moment = require('moment');

//TODO: ADD Patrons to loan history
/* GET all books page. */
router.get("/all", function (req, res, next) {
  books
    .findAll({
      order: [
        ["id", "ASC"]
      ]
    })
    .then(function (bookData) {
      res.render("books/all_books", {
        books: bookData,
        title: "All Books"
      });
    })
    .catch(function (error) {
      res.send(500, error);
    });
});
/* GET overdue books page. */
router.get("/overdue", function (req, res, next) {
  books
    .findAll({
      order:[['id','ASC']],
      include: [{
        model: loans,
        where: {
          id: Sequelize.col('book_id'),
          return_by: {
            [Op.lt]: new Date(),
          },
          returned_on: {
            [Op.is]: null
          },
          return_by:{
            [Op.lt]:new Date()
          }
        }
      },
    ]
    })
    .then((books) => {
      res.render("books/overdue_books", {
        title: "Overdue Books",
        books
      })
    }).catch(function (error) {
      res.send(500, error);
    });
});
/* GET checked books page. */
router.get("/checked_out", function (req, res, next) {
      books
        .findAll({
          order:[['id','ASC']],
          include: [{
            model: loans,
            where: {
              id: Sequelize.col('book_id'),
              returned_on: {
                [Op.is]: null
              }
            }
          }]
        }).then(books => res.render("books/checked_books", {
            title: "Checked Out Books",
            books
          }))
          .catch(function (error) {
            res.send(500, error);
          });
        });
    /* GET new book page. */
    router.get("/new_book", function (req, res, next) {
      res.render("books/new_book", {
        book: {},
        title: "New Book"
      });
    });
    /* POST create book. */
    router.post("/new_book", function (req, res, next) {
      books.create(req.body).then(bookData => {
          res.redirect(`/books/${bookData.id}`);
        }).catch(err => {
          if (err.name === "SequelizeValidationError") {
            res.render('books/new_book', {
              book: books.build(req.body),
              errors: err.errors
            });
          } else {
            throw err;
          }
        })
        .catch(err => {
          res.send(500);
        });
    })
    /* GET book detail page. */
    router.get("/:id", function (req, res, next) {
      books
        .findOne({where:{id:req.params.id},include:[{model:loans,include:[
          {model:patrons}
        ]}
      ]})
        .then(function (book) {
          if (book) {
            res.render("books/detail", {
              book,
              title: book.title,
             loans:book.loans,
            });
          } else {
            res.send(404);
          }
        }
        )
        .catch(function (error) {
          res.send(500, error);
        });
    });
    //Update books
    router.put("/:id", function (req, res, next) {
      books.findById(req.params.id).then((book) => {
        return book.update(req.body);
      }).then(() => {
        res.redirect('/books/all');
      }).catch(err => {
        if (err.name === "SequelizeValidationError") {
          books.findOne({where:{id:req.params.id},include:[{model:loans
     }]}).then(book => res.render("books/detail", {
            book,
            title: book.title,
            loans:book.loans,
            errors: err.errors
          }));
        } else {
          throw err;
        }
      })
    });
    module.exports = router;