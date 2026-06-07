/*
=========================================
FinanceTracker Database
=========================================
*/

CREATE DATABASE IF NOT EXISTS finance_tracker;

USE finance_tracker;


/*
=========================================
Users Table
=========================================
*/

CREATE TABLE IF NOT EXISTS users (

    user_id INT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(100) NOT NULL UNIQUE,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


/*
=========================================
Categories Table
=========================================
*/

CREATE TABLE IF NOT EXISTS categories (

    category_id INT AUTO_INCREMENT PRIMARY KEY,

    category_name VARCHAR(100) NOT NULL,

    category_type ENUM(
        'Income',
        'Expense'
    ) NOT NULL
);


/*
=========================================
Transactions Table
=========================================
*/

CREATE TABLE IF NOT EXISTS transactions (

    transaction_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    category_id INT NOT NULL,

    amount DECIMAL(10,2) NOT NULL,

    transaction_type ENUM(
        'Income',
        'Expense'
    ) NOT NULL,

    description VARCHAR(255),

    transaction_date DATE NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
);


INSERT INTO categories
(category_name, category_type)

VALUES

('Salary', 'Income'),
('Freelance', 'Income'),
('Bonus', 'Income'),

('Food', 'Expense'),
('Travel', 'Expense'),
('Shopping', 'Expense'),
('Entertainment', 'Expense'),
('Bills', 'Expense');

INSERT INTO users
(
    username,
    email,
    password_hash
)

VALUES
(
    'admin',
    'admin@gmail.com',
    'admin123'
);

INSERT INTO transactions
(
    user_id,
    category_id,
    amount,
    transaction_type,
    description,
    transaction_date
)

VALUES

(
    1,
    4,
    500,
    'Expense',
    'Lunch',
    '2025-06-01'
),

(
    1,
    5,
    250,
    'Expense',
    'Coffee',
    '2025-06-05'
),

(
    1,
    1,
    25000,
    'Income',
    'Monthly Salary',
    '2025-06-01'
);
SHOW TABLES;
CREATE TABLE IF NOT EXISTS budgets (

    budget_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    budget_month INT NOT NULL,

    budget_year INT NOT NULL,

    budget_amount DECIMAL(10,2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
);
