USE Book_Order_Processing_System;

-- ==========================================================
-- TEST SUITE: REPORTS
-- ==========================================================

SELECT '--- TESTING REPORT: SALES PREVIOUS MONTH ---' AS Test_Case;
-- Should show sales from exactly 1 month ago (Jane + John's 2nd order)
CALL Report_Sales_Previous_Month();

SELECT '--- TESTING REPORT: SALES BY DATE (TODAY) ---' AS Test_Case;
-- Should show Bob Reader's order from today
CALL Report_Sales_By_Date(DATE(NOW()));

SELECT '--- TESTING REPORT: TOP 5 CUSTOMERS ---' AS Test_Case;
-- John Doe should be #1 (Highest spender)
CALL Report_Top_5_Customers();

SELECT '--- TESTING REPORT: TOP SELLING BOOKS ---' AS Test_Case;
-- Should rank books by quantity sold in last 3 months
CALL Report_Top_10_Selling_Books();


-- ==========================================================
-- TEST SUITE: TRIGGERS & AUTOMATION
-- ==========================================================

SELECT '--- TESTING TRIGGER: AUTO-RESTOCK (Publisher Order) ---' AS Test_Case;
-- Scenario: 'Test Trigger Book' (978-5555555555) has Stock=12, Threshold=10.
-- We will simulate a sale of 3 items to drop stock to 9.

-- 1. Check BEFORE state
SELECT ISBN_number, quantity_stock, threshold FROM book WHERE ISBN_number = '978-5555555555';

-- 2. Perform Update (Trigger should fire)
UPDATE book SET quantity_stock = 9 WHERE ISBN_number = '978-5555555555';

-- 3. Check AFTER state (Look for new Pending order in publisher_order)
SELECT * FROM publisher_order WHERE ISBN_number = '978-5555555555' AND status = 'Pending';


SELECT '--- TESTING TRIGGER: CONFIRM ORDER (Stock Update) ---' AS Test_Case;
-- We will Confirm the order created in the previous step.

-- 1. Find the order ID created in the previous test
SET @pending_order_id = (SELECT order_id FROM publisher_order WHERE ISBN_number = '978-5555555555' AND status = 'Pending' LIMIT 1);

-- 2. Update status to Confirmed
UPDATE publisher_order SET status = 'Confirmed' WHERE order_id = @pending_order_id;

-- 3. Check if Book stock increased (9 + 50 should = 59)
SELECT ISBN_number, quantity_stock FROM book WHERE ISBN_number = '978-5555555555';


SELECT '--- TESTING REPLENISHMENT HISTORY REPORT ---' AS Test_Case;
-- Now that we have placed an order for the test book, this report should show data.
CALL Report_Replenishment_History('978-5555555555');


-- ==========================================================
-- TEST SUITE: CONSTRAINTS (NEGATIVE STOCK)
-- ==========================================================
SELECT '--- TESTING ERROR: NEGATIVE STOCK ---' AS Test_Case;


-- UPDATE book SET quantity_stock = -5 WHERE ISBN_number = '978-0131103627';
-- it causes an Error 45000, which would stop this script from running.