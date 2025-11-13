// Routes for handling book-related pages
const express = require("express");
const router = express.Router();

/* ---------------------------------------------------------
   SEARCH PAGES
   --------------------------------------------------------- */

// Display the search form
router.get("/search", function (req, res, next) {
  res.render("search.ejs");
});

// Handle the search form results
router.get("/search-result", function (req, res, next) {
  //searching in the database
  res.send("You searched for: " + req.query.keyword);
});

/* ---------------------------------------------------------
   ADD BOOK PAGE
   --------------------------------------------------------- */

// Display the "Add Book" form
router.get("/addbook", function (req, res, next) {
  res.render("addbook.ejs", {
    shopData: req.app.locals.shopData, // Pass shop name into the view
  });
});

// Handle the "Add Book" form submission
router.post("/bookadded", function (req, res, next) {
  // saving data in database
  let sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";

  // data from the form
  let newrecord = [req.body.name, req.body.price];

  // Execute SQL query
  db.query(sqlquery, newrecord, (err, result) => {
    if (err) {
      return next(err);
    } else {
      res.send(
        "This book has been added to the database.<br>" +
          "Name: " +
          req.body.name +
          "<br>Price: £" +
          req.body.price +
          '<br><br><a href="/books/list">Back to book list</a>'
      );
    }
  });
});

/* ---------------------------------------------------------
   LIST ALL BOOKS
   --------------------------------------------------------- */

// display a list of all books in the database
router.get("/list", function (req, res, next) {
  let sqlquery = "SELECT * FROM books"; // Retrieve all book records

  db.query(sqlquery, (err, result) => {
    if (err) {
      return next(err); // If SQL query fails, pass error to Express handler
    }

    // Render the table view and pass the result array
    res.render("list.ejs", {
      shopData: req.app.locals.shopData, // Pass shop information
      books: result, // array of book rows
    });
  });
});

/* ---------------------------------------------------------
   BARGAIN BOOKS PAGE
   --------------------------------------------------------- */

// List books priced less than £20
router.get("/bargainbooks", function (req, res, next) {
  let sqlquery = "SELECT * FROM books WHERE price < 20";

  db.query(sqlquery, (err, result) => {
    if (err) {
      return next(err);
    }

    // Render the bargains.ejs page
    res.render("bargains.ejs", {
      shopData: req.app.locals.shopData,
      books: result,
    });
  });
});

// Allows index.js to use all routes defined here
module.exports = router;
