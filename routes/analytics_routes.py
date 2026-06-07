from flask import Blueprint
from flask import jsonify

from services.analytics_service import get_category_totals

analytics_bp = Blueprint(
    'analytics_bp',
    __name__
)


@analytics_bp.route(
    '/analytics/categories'
)
def category_analytics():

    data = get_category_totals()

    return jsonify(data)