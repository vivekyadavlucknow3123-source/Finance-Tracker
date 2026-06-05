"""
FinanceTracker Main Application
"""

from flask import Flask, jsonify

from services.user_service import get_all_users

from services.transaction_service import get_all_transactions

from flask import request
from services.transaction_service import (
    get_all_transactions,
    add_transaction
)

app = Flask(__name__)


@app.route('/')
def home():

    return "FinanceTracker Backend Running"


@app.route('/users')
def users():

    data = get_all_users()

    return jsonify(data)

@app.route('/transactions')
def transactions():

    data = get_all_transactions()

    return jsonify(data)    

@app.route('/add-test-transaction')
def add_test_transaction():

    add_transaction(
        user_id=1,
        category_id=1,
        amount=250,
        transaction_type='Expense',
        description='Coffee',
        transaction_date='2025-06-05'
    )

    return "Transaction Added Successfully"

if __name__ == "__main__":
    app.run(debug=True)

