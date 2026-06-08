from flask import Blueprint
from flask import jsonify
from flask import session

from services.budget_service import (
    get_budget
)

budget_bp = Blueprint(
    "budget_bp",
    __name__
)


@budget_bp.route('/budget')
def budget():

    user_id = session["user_id"]

    return jsonify(
        get_budget(user_id)
    )