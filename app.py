"""
FinanceTracker Main Application
"""
from flask import Flask, jsonify, request

from flask import Flask, jsonify

from services.user_service import get_all_users

from services.transaction_service import get_all_transactions

from flask import request
from services.transaction_service import (
    get_all_transactions,
    add_transaction
)
from services.delete_transaction import delete_transaction
from services.update_transaction import update_transaction

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

@app.route('/transactions', methods=['POST'])
def create_transaction():
    """
    Create a new transaction.

    Receives JSON data from client.
    Saves transaction in MySQL.
    """

    # Get JSON data
    data = request.get_json()

    # Insert transaction
    add_transaction(
        user_id=data['user_id'],
        category_id=data['category_id'],
        amount=data['amount'],
        transaction_type=data['transaction_type'],
        description=data['description'],
        transaction_date=data['transaction_date']
    )

    return jsonify({
        "message": "Transaction Added Successfully"
    }), 201
    
# This is a placeholder route for testing POST requests. on postman
'''@app.route('/transactions', methods=['POST'])
def create_transaction():

    data = request.get_json()

    print("Received Data:", data)

    return jsonify({
        "received": data
    })'''

@app.route('/transactions/<int:transaction_id>', methods=['DELETE'])
def remove_transaction(transaction_id):

    delete_transaction(transaction_id)

    return jsonify({
        "message": "Transaction Deleted Successfully"
    })
@app.route('/transactions/<int:transaction_id>', methods=['PUT'])
def edit_transaction(transaction_id):
    """
    Update transaction.
    """

    data = request.get_json()

    update_transaction(
        transaction_id,
        data['amount'],
        data['description']
    )

    return jsonify({
        "message": "Transaction Updated Successfully"
    })

if __name__ == "__main__":
    app.run(debug=True)

