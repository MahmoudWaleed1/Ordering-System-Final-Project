USE Order_Processing_System;

DELIMITER //

CREATE TRIGGER before_book_update_negative_stock
BEFORE UPDATE ON book
FOR EACH ROW
BEGIN
    IF NEW.quantity_stock < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Error: Stock quantity cannot be negative.';
    END IF;
END;
//

DELIMITER ;

DELIMITER //

CREATE TRIGGER after_book_update_restock
AFTER UPDATE ON book
FOR EACH ROW
BEGIN
    DECLARE restock_quantity INT DEFAULT 50;
    
    IF OLD.quantity_stock >= NEW.threshold AND NEW.quantity_stock < NEW.threshold THEN
        INSERT INTO publisher_order (cost, status, quantity, ISBN_number)
        VALUES (NEW.selling_price * restock_quantity, 'Pending', restock_quantity, NEW.ISBN_number);
    END IF;
END;
//

DELIMITER ;

DELIMITER //

CREATE TRIGGER after_publisher_order_confirm
AFTER UPDATE ON publisher_order
FOR EACH ROW
BEGIN
    IF OLD.status != 'Confirmed' AND NEW.status = 'Confirmed' THEN
        UPDATE book
        SET quantity_stock = quantity_stock + NEW.quantity
        WHERE ISBN_number = NEW.ISBN_number;
    END IF;
END;
//

DELIMITER ;

DELIMITER //

CREATE TRIGGER after_customer_purchase
AFTER INSERT ON book_order
FOR EACH ROW
BEGIN
    UPDATE book
    SET quantity_stock = quantity_stock - NEW.item_quantity
    WHERE ISBN_number = NEW.ISBN_number;
END;
//

DELIMITER ;