# Bertie’s Books – Dynamic Web Application

A Node.js + Express.js + MySQL web application for managing a small bookshop.  
Built for **Dynamic Web Applications – Lab 6**.

---

## Technologies Used

- **Node.js**
- **Express.js**
- **MySQL / mysql2**
- **EJS templating**
- **CSS (main.css)**

---

## Project Structure

```text
06_berties_33796889
│
├── index.js                # Main server application
├── package.json
├── package-lock.json
│
├── routes/
│   ├── books.js            # Book-related routes (list, add, search, bargains)
│   ├── main.js             # Homepage + about page
│   └── users.js            # User registration page
│
├── views/
│   ├── index.ejs           # Homepage with navigation menu
│   ├── about.ejs
│   ├── list.ejs            # View all books
│   ├── addbook.ejs         # Add book form
│   ├── search.ejs          # Search form
│   ├── searchresults.ejs   # Search results page
│   └── bargains.ejs        # Bargain books page
│
├── public/
│   └── main.css            # Styling for all pages
│
├── create_db.sql           # Creates berties_books database + tables
└── insert_test_data.sql    # Inserts sample dataset
```

## dotenv

I used the dotenv package to secure my database credentials instead of storing
them directly in the code.

I created a `.env` file that contains the variables:

BB_USER
BB_PASSWORD
BB_DATABASE
BB_HOST

The MySQL connection in `index.js` reads these using process.env so no credentials are pushed to GitHub.

My `.env` file is included in `.gitignore` so it stays private.

## Audit logging

I implemented a simple audit log to record all login attempts.

I created an `audit_log` table with the columns:
`username`, `success` (boolean), and `timestamp`.

In `routes/users.js` I added a `logAttempt(username, success)` helper that
inserts a row into `audit_log` every time a user tries to log in. It logs
successful logins as well as failed attempts (wrong password or unknown user).

There is also a `/users/audit` route and `audit.ejs` view which display the
full login history in a table for debugging and security monitoring.

## Access Control (Authorisation)

This application uses session-based access control with a `redirectLogin` middleware. The middleware checks whether `req.session.userId` exists and redirects unauthenticated users to the login page.

### Public Routes (No Login Required)

- `/`
- `/about`
- `/users/register`
- `/users/login`
- `/books/search`
- `/books/search-result`

These routes stay open so visitors can browse, search for books, or create an account.

### Protected Routes (Login Required)

- `/books/list`
- `/books/addbook`
- `/books/bookadded`
- `/books/bargainbooks`
- `/users/list`
- `/users/audit`
- `/logout`

These pages contain user data or allow database changes, so only authenticated users can access them.

If a non-logged-in user tries to access a protected route, the `redirectLogin` middleware automatically redirects them to `/users/login`.

## Validation

I added server-side validation to several parts of the application using `express-validator` to ensure data is safe and correct before it is stored in the database.

### Registration Page (users.js)

I added validation for:

- **Email** – must be a valid email format (`isEmail()`).
- **Username** – must be between 5 and 20 characters (`isLength()`).
- **Password** – must be at least 8 characters long (`isLength()`).
- **First name / Last name** – cannot be empty (`notEmpty()`).

These fields are sensitive or user-identifying, so validating them prevents malformed accounts, accidental user errors, and improves the security of login credentials.

---

### Add Book Page (books.js)

I added validation for:

- **Book name** – must not be empty (`notEmpty()`).
- **Price** – must be a number and 0 or higher (`isFloat({ min: 0 })`).

Only valid book data should enter the database. A missing title or invalid price would corrupt the books table or cause display issues in the UI.

---

## Sanitisation Overview

This project uses `express-sanitizer` to protect input fields from Cross-Site Scripting (XSS) attacks. Sanitisation ensures that any user-submitted HTML or JavaScript is safely removed before the data is validated, stored in the database, or displayed back to the user.

Below is an explanation of where sanitisation was applied, where it was not applied, and the reasoning behind these decisions.

---

### Where Sanitisation **Was Applied**

#### Registration Form (`users.js`)\*\*

Sanitised fields:

- `username`
- `first`
- `last`
- `email`
- `password`

**Reason:**  
These fields come directly from users and some of them are shown back in the registration confirmation message. Without sanitisation, an attacker could enter code such as `<script>alert('XSS')</script>` which would execute in the browser. Sanitising these inputs removes any potentially malicious tags before validation and database storage.

---

#### Add Book Form (`books.js`)\*\*

Sanitised fields:

- `name`
- `price`

**Reason:**  
Both values are displayed on the confirmation page and in the book list. Without sanitisation, a user could inject harmful scripts that would run when other users view the page. Sanitisation prevents XSS attacks by removing unsafe HTML/JS.

---

#### Search Keyword (`books.js`)\*\*

Sanitised field:

- `keyword` (GET query parameter)

**Reason:**  
The search keyword is displayed on the results page. This prevents reflective XSS attacks such as:  
`/books/search-result?keyword=<script>alert('x')</script>`.

---

### Where Sanitisation **Was Not Applied**

#### Static Pages (`index.ejs`, `about.ejs`)\*\*

These pages contain no user input.

**Reason:**  
No dynamic or user-submitted content is processed, so there is nothing to sanitise.

---

#### Database-generated numeric fields\*\*

Such as:

- `id`
- numeric `price` values retrieved from the database

**Reason:**  
These values are not user-editable text and cannot contain scripts, so sanitising them is unnecessary.

---

#### Logout Route\*\*

The logout endpoint only destroys the session and does not process user input.

**Reason:**  
No sanitisation needed because no user data is submitted.

---

This approach provides strong protection against XSS while keeping the application efficient and secure.

# Weather Feature

I added a simple weather feature using the OpenWeatherMap API.
Users can enter any city and the app fetches real-time weather data such as temperature, humidity, wind speed, and a short description.

## /weather (Interactive Page)

This page contains a small form where the user types a city name.
The server requests weather data from OpenWeatherMap and displays it in a formatted “weather card”.

The page includes:

- Temperature (°C)
- Feels-like temperature
- Humidity
- Wind speed
- Weather description (e.g., “cloudy”, “fog”, etc.)

The route also includes friendly error handling for:

- Invalid or unknown city names
- Empty form submissions
- Unexpected API responses

## /weather/now (Simple API Test Route)

This route was used to test the external API during development:

```
/weather/now
```

It automatically retrieves the weather for London and returns a short text message.
It also includes basic error checking (e.g., unreadable JSON or missing fields).

# API Documentation

Below is a concise overview of the JSON API added to Bertie’s Books.  
All endpoints return **pure JSON** and do **not** require a login.

---

## GET /api/books

Returns all books in JSON format.

### Example

# /api/books

**Sample Response:**

```json
[
  { "id": 1, "name": "Brighton Rock", "price": 20.25 },
  { "id": 2, "name": "Brave New World", "price": 25.0 }
]
```

## API Filters and Options (Search, Price Range, Sorting)

The /api/books route also supports several optional query parameters.
These allow clients to narrow down the results or change the order of the returned books.

All filters can be used on their own or combined.

1. Searching for books
   You can search for books by including a search keyword:

```
/api/books?search=animal
```

This returns all books that contain the given word or phrase in their title.

2. Filtering by price range
   You can filter books by specifying:

- a minimum price,
- a maximum price,
- or both.

### Examples

```
/api/books?minprice=10

/api/books?max_price=20

/api/books?minprice=10&max_price=20
```

This makes the endpoint more flexible, especially for shops or apps that only want books within a certain budget range.

3. Sorting results
   There is also a simple sorting feature:

```
/api/books?sort=name
```

or

```
/api/books?sort=price
```

Sorting works together with all other filters, so users can get results in the format that suits them best.

## Combined Example

Here is an example that uses all filters together:

```
/api/books?search=br&minprice=10&max_price=30&sort=price
```

This will:

- search for books containing "br"
- only include those priced between £10 and £30
- and then sort the final list by price (low to high)

### Sample Response

```json
{
  "search": "br",
  "minprice": 10,
  "max_price": 30,
  "sort": "price",
  "count": 2,
  "results": [
    { "id": 1, "name": "Brighton Rock", "price": 20.25 },
    { "id": 2, "name": "Brave New World", "price": 25.0 }
  ]
}
```

## Legacy Search Route

There is also an older endpoint:

```
/api/books/search?keyword=world
```

This was created while completing the earlier tasks. It does the same job as search= on /api/books, but /api/books?search= is now the preferred version.

## Error Handling

The API always returns JSON, even when something goes wrong.
For example, if a query is missing required data, or if the database returns an error, you’ll see JSON like this:

```
{ "error": "Please provide a search keyword using ?keyword=..." }
```

or:

```
{ "error": { "code": "...", "message": "..." } }
```

This ensures that clients can always process the response consistently.

## How to run it

1. Install dependencies

```
npm install
```

2. Start MySQL and create the database

```
mysql -u root -p
source create_db.sql;
source insert_test_data.sql;
```

3. Run the server

```
node index.js
```

Then visit:

```
http://localhost:8000
```
