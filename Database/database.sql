CREATE DATABASE Order_Processing_System;

USE Order_Processing_System;

CREATE TABLE user (
    username VARCHAR(225) NOT NULL,
    role ENUM('Admin', 'Customer') NOT NULL,
    shipping_address VARCHAR(255),
    phone_number VARCHAR(20),
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (username)
);

CREATE TABLE publisher (
    publisher_id INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (publisher_id)
);

CREATE TABLE credit_card (
    credit_card_number VARCHAR(20) NOT NULL,
    expiration_date DATE NOT NULL,
    PRIMARY KEY (credit_card_number)
);

CREATE TABLE publisher_telephone (
    publisher_id INT NOT NULL,
    telephone_number VARCHAR(20) NOT NULL,
    FOREIGN KEY (publisher_id) REFERENCES publisher(publisher_id),
    PRIMARY KEY (publisher_id, telephone_number)
);

CREATE TABLE publisher_address (
    publisher_id INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    FOREIGN KEY (publisher_id) REFERENCES publisher(publisher_id),
    PRIMARY KEY (publisher_id, address)
);

CREATE TABLE book (
    ISBN_number VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    publication_year INT NOT NULL,
    quantity_stock INT NOT NULL,
    category ENUM('Science', 'Art', 'Religion', 'History', 'Geography') NOT NULL,
    threshold INT NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    publisher_id INT NOT NULL,
    book_image VARCHAR(255) NOT NULL,
    PRIMARY KEY (ISBN_number),
    FOREIGN KEY (publisher_id) REFERENCES publisher(publisher_id)
);

CREATE TABLE author (
    ISBN_number VARCHAR(20) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (ISBN_number) REFERENCES book(ISBN_number),
    PRIMARY KEY (ISBN_number, author_name)
);

CREATE TABLE publisher_order (
    order_id INT NOT NULL AUTO_INCREMENT,
    cost DECIMAL(10, 2) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Confirmed') NOT NULL,
    quantity INT NOT NULL,
    ISBN_number VARCHAR(20) NOT NULL,
    FOREIGN KEY (ISBN_number) REFERENCES book(ISBN_number),
    PRIMARY KEY (order_id)
);

CREATE TABLE customer_order (
    order_id INT NOT NULL AUTO_INCREMENT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cost DECIMAL(10, 2) NOT NULL,
    credit_card_number VARCHAR(20) NOT NULL,
    username VARCHAR(225) NOT NULL,
    FOREIGN KEY (username) REFERENCES user(username),
    FOREIGN KEY (credit_card_number) REFERENCES credit_card(credit_card_number),
    PRIMARY KEY (order_id)
);

CREATE TABLE book_order (
    ISBN_number VARCHAR(20) NOT NULL,
    order_id INT NOT NULL,
    item_quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (ISBN_number, order_id),
    FOREIGN KEY (ISBN_number) REFERENCES book(ISBN_number),
    FOREIGN KEY (order_id) REFERENCES customer_order(order_id)
);