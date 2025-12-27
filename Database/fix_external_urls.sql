-- Fix incorrectly prefixed external URLs in the database
-- This removes the /images/ prefix from URLs that start with /images/http:// or /images/https://
USE Book_Order_Processing_System;

-- Fix URLs that have /images/https:// prefix
UPDATE book 
SET book_image = REPLACE(book_image, '/images/https://', 'https://') 
WHERE book_image LIKE '/images/https://%';

-- Fix URLs that have /images/http:// prefix
UPDATE book 
SET book_image = REPLACE(book_image, '/images/http://', 'http://') 
WHERE book_image LIKE '/images/http://%';

