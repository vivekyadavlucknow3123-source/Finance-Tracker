from flask import Blueprint
from flask import jsonify

from services.category_service import (
    get_all_categories
)

category_bp = Blueprint(
    'category_bp',
    __name__
)


@category_bp.route('/categories')
def categories():

    data = get_all_categories()

    return jsonify(data)