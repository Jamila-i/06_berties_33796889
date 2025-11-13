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
