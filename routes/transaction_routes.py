"""
Transaction Routes
"""
from flask import (
    Blueprint,
    request,
    jsonify,
    session
)

transaction_bp = Blueprint(
    "transaction_bp",
    __name__
)

from services.transaction_service import (
    get_all_transactions,
    add_transaction
)

from services.update_transaction import (
     update_transaction
)
from services.transaction_service import (
    get_transactions_by_user
)
from services.delete_transaction import delete_transaction


@transaction_bp.route(
    "/transactions",
    methods=["GET"]
)
def get_transactions():
    user_id = session["user_id"]
    transactions = get_transactions_by_user(user_id)
    return jsonify(transactions)


@transaction_bp.route(
    '/transactions',
    methods=['POST']
)
def create_transaction():
    data = request.get_json()
    data["user_id"] = session["user_id"]

    # ✨ FIX: .get() use kiya hai taaki agar koi field chhoot jaye toh server 500 error se crash na ho
    add_transaction(
        user_id=data['user_id'],
        category_id=data.get('category_id', 1),  
        amount=data.get('amount', 0.0),
        transaction_type=data.get('transaction_type', 'Expense'),
        description=data.get('description', ''),
        transaction_date=data.get('transaction_date')
    )

    return jsonify({
        "message": "Transaction Added Successfully"
    })


@transaction_bp.route(
    '/transactions/<int:transaction_id>',
    methods=['DELETE']
)
def delete_transaction_route(transaction_id):
    delete_transaction(transaction_id)
    return {
        "message": "Transaction Deleted Successfully"
    }


@transaction_bp.route(
    '/transactions/<int:transaction_id>',
    methods=['PUT']
)
def update_transaction_route(transaction_id):
    data = request.get_json()
    update_transaction(
        transaction_id,
        data['amount'],
        data['description']
    )
    return {
        "message": "Transaction Updated Successfully"
    }