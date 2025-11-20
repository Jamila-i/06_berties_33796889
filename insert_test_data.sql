# Insert data into the tables

USE berties_books;

-- Clear existing rows to avoid duplicates
DELETE FROM books;
DELETE FROM users;

-- Insert books
INSERT INTO books (name, price) VALUES
('Brighton Rock', 20.25),
('Brave New World', 25.00),
('Animal Farm', 12.99),
('1984', 14.50),
('To Kill a Mockingbird', 18.99),
('The Great Gatsby', 16.75),
('The Kite Runner', 12.00);

-- Insert user
INSERT INTO users (username, firstname, lastname, email, hashedPassword)
VALUES
('gold', 'Gold', 'User', 'gold@example.com', '$2b$10$w6i9.dMfH.C7pY3bvYknveEXkc7SMQIqCYwX0ZKKOlrdp/mi2Chj.');