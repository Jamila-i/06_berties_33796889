// Create a new router
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { check, validationResult } = require("express-validator");

// Middleware to restrict access to logged-in users
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("./login"); // redirect to the login page if no session userId
  } else {
    next(); // move to the next middleware function
  }
};

router.get("/register", function (req, res, next) {
  res.render("register.ejs", {
    shopData: req.app.locals.shopData,
  });
});

// Show login page
router.get("/login", function (req, res, next) {
  res.render("login.ejs", {
    shopData: req.app.locals.shopData,
  });
});

router.post(
  "/registered",

  (req, res, next) => {
    req.body.first = req.sanitize(req.body.first);
    req.body.last = req.sanitize(req.body.last);
    req.body.username = req.sanitize(req.body.username);
    req.body.email = req.sanitize(req.body.email);
    req.body.password = req.sanitize(req.body.password);
    next();
  },

  [
    check("email").isEmail(),
    check("username").isLength({ min: 5, max: 20 }),
    check("password").isLength({ min: 8 }),
    check("first").notEmpty(),
    check("last").notEmpty(),
  ],

  function (req, res, next) {
    const errors = validationResult(req);
    console.log("Validation errors:", errors.array());

    if (!errors.isEmpty()) {
      return res.redirect("/users/register");
    }

    const first = req.body.first;
    const last = req.body.last;
    const plainPassword = req.body.password;

    bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
      if (err) return next(err);

      const sqlquery =
        "INSERT INTO users (username, firstname, lastname, email, hashedPassword) VALUES (?, ?, ?, ?, ?)";

      const newUser = [
        req.body.username,
        first,
        last,
        req.body.email,
        hashedPassword,
      ];

      db.query(sqlquery, newUser, function (err, result) {
        if (err) return next(err);

        let resultMessage = "";
        resultMessage +=
          "Hello " + first + " " + last + ", you are now registered! ";
        resultMessage +=
          "We will send an email to you at " + req.body.email + "<br><br>";
        resultMessage += "Your password is: " + req.body.password + "<br>";
        resultMessage += "Your hashed password is: " + hashedPassword + "<br>";

        res.send(resultMessage);
      });
    });
  }
);

// Handle login form submission
router.post("/loggedin", function (req, res, next) {
  // sanitise login fields
  const username = req.sanitize(req.body.username);
  const password = req.sanitize(req.body.password);

  const sqlquery = "SELECT * FROM users WHERE username = ?";

  db.query(sqlquery, [username], function (err, results) {
    if (err) {
      return next(err);
    }

    // No user found with that username
    if (results.length === 0) {
      logAttempt(username, false);
      return res.send("Login failed: user not found.");
    }

    const storedHash = results[0].hashedPassword;

    bcrypt.compare(password, storedHash, function (err, match) {
      if (err) {
        return next(err);
      }

      if (match) {
        // Save user session here, when login is successful
        req.session.userId = username;

        logAttempt(username, true);
        res.send(
          "Login successful. Welcome " + username + "!<br><a href='/'>Home</a>"
        );
      } else {
        logAttempt(username, false);
        res.send("Login failed: incorrect password.");
      }
    });
  });
});

router.get("/list", redirectLogin, function (req, res, next) {
  const sql = "SELECT username, firstname, lastname, email FROM users";

  db.query(sql, function (err, results) {
    if (err) {
      return next(err);
    }

    res.render("userlist.ejs", {
      users: results,
      shopData: req.app.locals.shopData,
    });
  });
});

// Show audit log of login attempts
router.get("/audit", redirectLogin, function (req, res, next) {
  const sql = "SELECT * FROM audit_log ORDER BY timestamp DESC";

  db.query(sql, function (err, results) {
    if (err) {
      return next(err);
    }

    res.render("audit.ejs", {
      audit: results,
      shopData: req.app.locals.shopData,
    });
  });
});

// Log login attempts to the audit_log table
function logAttempt(username, success) {
  const sql = "INSERT INTO audit_log (username, success) VALUES (?, ?)";
  db.query(sql, [username, success], function (err, result) {
    if (err) {
      console.error("Error logging attempt:", err);
    }
  });
}

// Export the router object so index.js can access it
module.exports = router;
