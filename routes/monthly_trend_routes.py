from flask import Blueprint
from flask import jsonify
from flask import session
from services.monthly_trend_service import (
    get_monthly_expenses
)

monthly_bp = Blueprint(
    'monthly_bp',
    __name__
)


@monthly_bp.route(
    '/analytics/monthly'
)
def monthly_chart():

    user_id = session["user_id"]

    return jsonify(
        get_monthly_expenses(
            user_id
        )
    )