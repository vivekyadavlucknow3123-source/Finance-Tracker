from flask import Blueprint
from flask import jsonify
from flask import session

from services.analytics_service import get_category_totals

analytics_bp = Blueprint(
    'analytics_bp',
    __name__
)


@analytics_bp.route(
    "/analytics/categories"
)
def category_totals():

    user_id = session["user_id"]

    return jsonify(
        get_category_totals(user_id)
    )