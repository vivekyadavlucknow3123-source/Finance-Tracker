CREATE DATABASE IF NOT EXISTS finance_tracker;
SHOW DATABASES;
use finance_tracker;

create table users(
user_id  int auto_increment primary key,
username varchar(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);





insert into users (username, email, password_hash)
VALUES
('john', 'john@example.com', 'hashed_password');
SELECT * FROM users;
SELECT * FROM transactions;
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
    1,
    500,
    'Expense',
    'Lunch',
    '2025-06-01'
);
SELECT * FROM transactions;
CREATE TABLE IF NOT EXISTS categories (

    category_id INT AUTO_INCREMENT PRIMARY KEY,

    category_name VARCHAR(100) NOT NULL,

    category_type ENUM(
        'Income',
        'Expense'
    ) NOT NULL
);
INSERT INTO categories
(category_name, category_type)

VALUES

('Salary', 'Income'),
('Freelance', 'Income'),

('Food', 'Expense'),
('Travel', 'Expense'),
('Shopping', 'Expense'),
('Entertainment', 'Expense');