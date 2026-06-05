DROP DATABASE IF EXISTS finance_tracker;
CREATE DATABASE finance_tracker;
USE finance_tracker;
SHOW TABLES;
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SHOW TABLES;
create table categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_name VARCHAR(50) NOT NULL,
    type ENUM('Income', 'Expense') NOT NULL,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,

    amount DECIMAL(10,2) NOT NULL,
    transaction_type ENUM('Income', 'Expense') NOT NULL,

    description VARCHAR(255),
    transaction_date DATE NOT NULL,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE,

    FOREIGN KEY (category_id)
    REFERENCES categories(category_id)
    ON DELETE CASCADE
);
CREATE TABLE budgets (
    budget_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,

    monthly_limit DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE,

    FOREIGN KEY (category_id)
    REFERENCES categories(category_id)
    ON DELETE CASCADE
);
show tables;
INSERT INTO users
(username, email, password_hash)
VALUES
('john', 'john@example.com', 'hashed_password');
show tables;
INSERT INTO categories
(user_id, category_name, type)
VALUES
(1, 'Food', 'Expense'),
(1, 'Rent', 'Expense'),
(1, 'Salary', 'Income');
SELECT * FROM users;
select * from categories;
show tables;