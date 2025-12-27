-- Assign random images to books from the available images in public/images folder
USE Book_Order_Processing_System;

-- Assign images to each book (distributed across all 6 images)
UPDATE book SET book_image = '/images/OIP.jpg' WHERE ISBN_number = '978-0131103627';
UPDATE book SET book_image = '/images/OIP (1).jpg' WHERE ISBN_number = '978-0596007126';
UPDATE book SET book_image = '/images/OIP (2).jpg' WHERE ISBN_number = '978-0062316097';
UPDATE book SET book_image = '/images/OIP (3).jpg' WHERE ISBN_number = '978-0141439518';
UPDATE book SET book_image = '/images/OIP (4).jpg' WHERE ISBN_number = '978-3030555555';
UPDATE book SET book_image = '/images/attachment_80004080-e1488217702832.avif' WHERE ISBN_number = '978-5555555555';

-- Show the results
SELECT ISBN_number, title, book_image 
FROM book 
ORDER BY ISBN_number;
