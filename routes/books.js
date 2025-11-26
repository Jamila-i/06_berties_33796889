// Routes for handling book-related pages
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

// Middleware to restrict access to logged-in users
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("../users/login"); // redirect to the login page if no session userId
  } else {
    next(); // move to the next middleware function
  }
};

/* ---------------------------------------------------------
   SEARCH PAGES
   --------------------------------------------------------- */

// Display the search form
router.get("/search", function (req, res, next) {
  res.render("search.ejs");
});

/* ---------------------------------------------------------
   SEARCH RESULTS (advanced: partial title match)
   --------------------------------------------------------- */

router.get("/search-result", function (req, res, next) {
  // Get the search keyword from the query string
  const keyword = req.query.keyword;

  // Advanced search: find titles that contain the keyword anywhere
  let sqlquery = "SELECT * FROM books WHERE name LIKE ?";

  // Wrap keyword with % for partial match
  const searchTerm = "%" + keyword + "%";

  db.query(sqlquery, [searchTerm], (err, result) => {
    if (err) {
      return next(err);
    }

    res.render("searchresults.ejs", {
      shopData: req.app.locals.shopData,
      books: result,
      keyword: keyword,
    });
  });
});

/* ---------------------------------------------------------
   ADD BOOK PAGE
   --------------------------------------------------------- */

// Display the "Add Book" form
router.get("/addbook", redirectLogin, function (req, res, next) {
  res.render("addbook.ejs", {
    shopData: req.app.locals.shopData, // Pass shop name into the view
  });
});

// Handle the "Add Book" form submission
router.post(
  "/bookadded",
  redirectLogin,
  [
    check("name").notEmpty().withMessage("Book name is required"),
    check("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
  ],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send(
        "Invalid book data. Please make sure the name is not empty and the price is a positive number.<br><br>" +
          '<a href="/books/addbook">Back to Add Book</a>'
      );
    }

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
  }
);

/* ---------------------------------------------------------
   LIST ALL BOOKS
   --------------------------------------------------------- */

// display a list of all books in the database
router.get("/list", redirectLogin, function (req, res, next) {
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
router.get("/bargainbooks", redirectLogin, function (req, res, next) {
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
