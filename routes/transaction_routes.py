"""
Transaction Routes
"""

from flask import Blueprint
from flask import jsonify
from flask import request

from services.transaction_service import (
    get_all_transactions,
    add_transaction
)

transaction_bp = Blueprint(
    'transaction_bp',
    __name__
)


@transaction_bp.route('/transactions')
def transactions():

    data = get_all_transactions()

    return jsonify(data)


@transaction_bp.route(
    '/transactions',
    methods=['POST']
)
def create_transaction():

    data = request.get_json()

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
    })