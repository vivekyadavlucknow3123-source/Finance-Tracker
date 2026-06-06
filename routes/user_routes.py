"""
User Routes
"""

from flask import Blueprint, jsonify

from services.user_service import get_all_users

user_bp = Blueprint(
    'user_bp',
    __name__
)


@user_bp.route('/users')
def users():

    data = get_all_users()

    return jsonify(data)