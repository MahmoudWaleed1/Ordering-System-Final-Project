USE Book_Order_Processing_System;

-- ==========================================================
-- 1. SEARCH OPERATIONS (Simulating User Input)
-- ==========================================================

-- TEST 1: SEARCH BY TITLE (Input: "History")
-- Simulation: User types "History" into the search bar
SET @search_input = 'History';

SELECT ISBN_number, title, category, selling_price, quantity_stock, name AS publisher_name
FROM book NATURAL JOIN publisher
WHERE title LIKE CONCAT('%', @search_input, '%') COLLATE utf8mb4_general_ci;


-- TEST 2: SEARCH BY CATEGORY (Input: "Science")
-- Simulation: User selects "Science" from a dropdown menu
SET @category_input = 'Science';

SELECT ISBN_number, title, author_name, selling_price, quantity_stock
FROM book NATURAL JOIN author
WHERE category = @category_input COLLATE utf8mb4_general_ci;


-- TEST 3: SEARCH BY AUTHOR (Input: "Jane")
-- Simulation: User searches for an author
SET @author_input = 'Jane';

SELECT ISBN_number, title, author_name, selling_price, quantity_stock
FROM book NATURAL JOIN author
WHERE author_name LIKE CONCAT('%', @author_input, '%') COLLATE utf8mb4_general_ci;


-- TEST 4: SEARCH BY PUBLISHER (Input: "Pearson")
-- Simulation: User searches for a specific publisher
SET @publisher_input = 'Pearson';

SELECT ISBN_number, title, name AS publisher_name, selling_price, quantity_stock
FROM book NATURAL JOIN publisher
WHERE name LIKE CONCAT('%', @publisher_input, '%') COLLATE utf8mb4_general_ci;


-- ==========================================================
-- 2. USER ACTIONS (Simulating Registration & Login)
-- ==========================================================

-- TEST 5: REGISTER NEW USER
-- Simulation: User fills out the Sign-Up form
SET @new_user = 'demo_user_02';
SET @new_pass = 'hashed_secret_pass';
SET @new_email = 'demo02@example.com';

INSERT INTO user (username, role, shipping_address, phone_number, email, password_hash, first_name, last_name)
VALUES (@new_user, 'Customer', '123 Test St, Alex', '012-999-8888', @new_email, @new_pass, 'Demo', 'User');

-- Verify the user was added
SELECT * FROM user WHERE username = @new_user COLLATE utf8mb4_general_ci;


-- TEST 6: UPDATE USER PROFILE
-- Simulation: User changes their address
UPDATE user
SET shipping_address = '999 Updated Ave, Cairo'
WHERE username = @new_user COLLATE utf8mb4_general_ci;

-- Verify update
SELECT username, shipping_address FROM user WHERE username = @new_user COLLATE utf8mb4_general_ci;


-- ==========================================================
-- 3. CHECKOUT PROCESS (Simulating a Cart Purchase)
-- ==========================================================

-- TEST 7: CHECKOUT (Place Order)

-- Simulation: User 'john_doe' buys books.
-- A. Create the Order
INSERT INTO customer_order (cost, credit_card_number, username)
VALUES (105.00, '1111-2222-3333-4444', 'john_doe');

-- B. Capture the new Order ID
SET @last_order_id = LAST_INSERT_ID();

-- C. Add Items
INSERT INTO book_order (ISBN_number, order_id, item_quantity, unit_price)
VALUES ('978-0131103627', @last_order_id, 1, 60.00);

INSERT INTO book_order (ISBN_number, order_id, item_quantity, unit_price)
VALUES ('978-0596007126', @last_order_id, 1, 45.00);

-- D. Prove Stock Was Reduced
-- RESULT: CHECK STOCK REDUCTION
SELECT ISBN_number, title, quantity_stock 
FROM book 
WHERE ISBN_number IN ('978-0131103627', '978-0596007126');


-- ==========================================================
-- 4. VIEW HISTORY
-- ==========================================================

-- TEST 8: VIEW PAST ORDERS

SELECT order_id, order_date, cost AS total_order_cost, title, item_quantity
FROM customer_order NATURAL JOIN book_order NATURAL JOIN book
WHERE username = 'john_doe' COLLATE utf8mb4_general_ci
ORDER BY order_date DESC
LIMIT 5;