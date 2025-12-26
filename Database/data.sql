USE Book_Order_Processing_System;

-- ==========================================
-- 1. POPULATE PUBLISHERS
-- ==========================================
INSERT INTO publisher (name) VALUES 
('Pearson Education'),
('O Reilly Media'),
('HarperCollins'),
('Penguin Random House'),
('Springer Nature');

INSERT INTO publisher_telephone (publisher_id, telephone_number) VALUES 
(1, '555-0101'), (2, '555-0102'), (3, '555-0103'), (4, '555-0104'), (5, '555-0105');

INSERT INTO publisher_address (publisher_id, address) VALUES 
(1, '123 Education Lane, London'),
(2, '1005 Gravenstein Hwy, California'),
(3, '195 Broadway, New York'),
(4, '80 Strand, London'),
(5, 'Tiergartenstrasse 17, Heidelberg');

-- ==========================================
-- 2. POPULATE USERS & CREDIT CARDS
-- ==========================================
-- Admin
INSERT INTO user (username, role, shipping_address, phone_number, email, password_hash, first_name, last_name) VALUES 
('admin_alice', 'Admin', 'HQ Address', '123-456-7890', 'alice@store.com', 'hashed_secret_123', 'Alice', 'Adminson');

-- Customers
INSERT INTO user (username, role, shipping_address, phone_number, email, password_hash, first_name, last_name) VALUES 
('john_doe', 'Customer', '10 Main St, Cairo', '010-111-2222', 'john@gmail.com', 'pass123', 'John', 'Doe'),
('jane_smith', 'Customer', '20 Side Ave, Alex', '012-333-4444', 'jane@yahoo.com', 'pass456', 'Jane', 'Smith'),
('bob_reader', 'Customer', '5 Beach Rd, Giza', '011-555-6666', 'bob@hotmail.com', 'pass789', 'Bob', 'Reader');

-- Credit Cards
INSERT INTO credit_card (credit_card_number, expiration_date) VALUES 
('1111-2222-3333-4444', '2028-12-31'),
('5555-6666-7777-8888', '2029-06-30'),
('9999-8888-7777-6666', '2027-01-01');

-- ==========================================
-- 3. POPULATE BOOKS & AUTHORS
-- ==========================================
INSERT INTO book (ISBN_number, title, publication_year, quantity_stock, category, threshold, selling_price, publisher_id, book_image) VALUES 
('978-0131103627', 'The C Programming Language', 1988, 50, 'Science', 10, 60.00, 1, 'c_prog.jpg'),
('978-0596007126', 'Head First Design Patterns', 2004, 30, 'Science', 5, 45.00, 2, 'design_pat.jpg'),
('978-0062316097', 'Sapiens: A Brief History', 2014, 100, 'History', 20, 25.00, 3, 'sapiens.jpg'),
('978-0141439518', 'Pride and Prejudice', 1813, 20, 'Art', 5, 15.00, 4, 'pride.jpg'),
('978-3030555555', 'Geography of the World', 2021, 15, 'Geography', 5, 80.00, 5, 'geo.jpg'),
('978-5555555555', 'Test Trigger Book', 2025, 12, 'Science', 10, 100.00, 1, 'test.jpg'); -- Setup for trigger testing

INSERT INTO author (ISBN_number, author_name) VALUES 
('978-0131103627', 'Brian Kernighan'),
('978-0131103627', 'Dennis Ritchie'),
('978-0596007126', 'Eric Freeman'),
('978-0062316097', 'Yuval Noah Harari'),
('978-0141439518', 'Jane Austen'),
('978-3030555555', 'Geo Author'),
('978-5555555555', 'Test Author');

-- ==========================================
-- 4. POPULATE HISTORICAL ORDERS
-- ==========================================
-- Order 1: 3 Months Ago (John Doe)
INSERT INTO customer_order (order_date, cost, credit_card_number, username) 
VALUES (NOW() - INTERVAL 3 MONTH, 50.00, '1111-2222-3333-4444', 'john_doe');
SET @order_id_1 = LAST_INSERT_ID();
INSERT INTO book_order (ISBN_number, order_id, item_quantity, unit_price)
VALUES ('978-0062316097', @order_id_1, 2, 25.00); 

-- Order 2: 1 Month Ago (Jane Smith)
INSERT INTO customer_order (order_date, cost, credit_card_number, username) 
VALUES (NOW() - INTERVAL 1 MONTH, 45.00, '5555-6666-7777-8888', 'jane_smith');
SET @order_id_2 = LAST_INSERT_ID();
INSERT INTO book_order (ISBN_number, order_id, item_quantity, unit_price)
VALUES ('978-0596007126', @order_id_2, 1, 45.00);

-- Order 3: 1 Month Ago (John Doe - Big purchase)
INSERT INTO customer_order (order_date, cost, credit_card_number, username) 
VALUES (NOW() - INTERVAL 1 MONTH, 160.00, '1111-2222-3333-4444', 'john_doe');
SET @order_id_3 = LAST_INSERT_ID();
INSERT INTO book_order (ISBN_number, order_id, item_quantity, unit_price)
VALUES ('978-3030555555', @order_id_3, 2, 80.00);

-- Order 4: Today (Bob Reader)
INSERT INTO customer_order (order_date, cost, credit_card_number, username) 
VALUES (NOW(), 15.00, '9999-8888-7777-6666', 'bob_reader');
SET @order_id_4 = LAST_INSERT_ID();
INSERT INTO book_order (ISBN_number, order_id, item_quantity, unit_price)
VALUES ('978-0141439518', @order_id_4, 1, 15.00);