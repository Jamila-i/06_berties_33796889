// Create a new router
const express = require("express");
const router = express.Router();

// Middleware to restrict access to logged-in users
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("../users/login"); // redirect to the login page if no session userId
  } else {
    next(); // move to the next middleware function
  }
};

// Handle our routes
router.get("/", function (req, res, next) {
  res.render("index.ejs");
});

router.get("/about", function (req, res, next) {
  res.render("about.ejs");
});

router.get("/logout", redirectLogin, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      // if there was a problem destroying the session, go back to home
      return res.redirect("/");
    }

    // session destroyed successfully
    res.send("You are now logged out. <a href='/'>Home</a>");
  });
});

// Export the router object so index.js can access it
module.exports = router;
