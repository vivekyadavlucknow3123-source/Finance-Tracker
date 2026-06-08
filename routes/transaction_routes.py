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

@transaction_bp.route(
    "/transactions",
    methods=["GET"]
)
def get_transactions():

    user_id = (
        session["user_id"]
    )

    transactions = (
        get_transactions_by_user(
            user_id
        )
    )

    return jsonify(
        transactions
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
    data["user_id"] = session["user_id"]

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
from services.delete_transaction import delete_transaction


@transaction_bp.route(
    '/transactions/<int:transaction_id>',
    methods=['DELETE']
)
def delete_transaction_route(transaction_id):

    delete_transaction(transaction_id)

    return {
        "message":
        "Transaction Deleted Successfully"
    }

@transaction_bp.route(
    '/transactions/<int:transaction_id>',
    methods=['PUT']
)
def update_transaction_route(
    transaction_id
):

    data = request.get_json()

    update_transaction(

        transaction_id,

        data['amount'],

        data['description']
    )

    return {
        "message":
        "Transaction Updated Successfully"
    }