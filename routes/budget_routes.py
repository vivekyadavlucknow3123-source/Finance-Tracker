from flask import Blueprint
from flask import jsonify

from services.budget_service import (
    get_budget
)

budget_bp = Blueprint(
    "budget_bp",
    __name__
)


@budget_bp.route('/budget')
def budget():

    return jsonify(
        get_budget()
    )