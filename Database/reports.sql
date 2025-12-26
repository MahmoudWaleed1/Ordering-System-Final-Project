USE Order_Processing_System;

DELIMITER //

CREATE PROCEDURE Report_Sales_Previous_Month()
BEGIN
    SELECT SUM(cost) AS Total_Sales
    FROM customer_order
    WHERE order_date >= DATE_FORMAT(NOW() - INTERVAL 1 MONTH, '%Y-%m-01') AND order_date < DATE_FORMAT(NOW(), '%Y-%m-01');
END;
//

DELIMITER ;

DELIMITER //

CREATE PROCEDURE Report_Sales_By_Date(IN target_date DATE)
BEGIN
    SELECT SUM(cost) AS Total_Sales
    FROM customer_order
    WHERE DATE(order_date) = target_date;
END;
//

DELIMITER ;

DELIMITER //

CREATE PROCEDURE Report_Top_5_Customers()
BEGIN
    SELECT first_name, last_name, SUM(cost) AS total_purchase_amount   
    FROM customer_order NATURAL JOIN user        
    WHERE customer_order.order_date >= (CURRENT_DATE - INTERVAL 3 MONTH)        
    GROUP BY customer_order.username      
    ORDER BY total_purchase_amount DESC       
    LIMIT 5;
END;
//

DELIMITER ;

DELIMITER //

CREATE PROCEDURE Report_Top_10_Selling_Books()
BEGIN
    SELECT title, SUM(item_quantity) AS total_number_of_copies_sold
    FROM book_order NATURAL JOIN book NATURAL JOIN customer_order
    WHERE customer_order.order_date >= (CURRENT_DATE - INTERVAL 3 MONTH)
    GROUP BY title
    ORDER BY total_number_of_copies_sold DESC
    LIMIT 10;
END;
//

DELIMITER ;

DELIMITER //

CREATE PROCEDURE Report_Replenishment_History(In input_ISBN_number VARCHAR(20))
BEGIN
    SELECT COUNT(order_id) AS number_of_replenishments
    FROM publisher_order
    WHERE ISBN_number = input_ISBN_number;
END;
//

DELIMITER ;