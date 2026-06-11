from flask import (
    Blueprint,
    jsonify,
    request,
    session
)

from services.budget_service import (
    get_budget,
    save_budget
)

budget_bp = Blueprint(
    "budget_bp",
    __name__
)

@budget_bp.route(
    "/budget",
    methods=["GET"]
)
def budget():

    user_id = session["user_id"]

    return jsonify(
        get_budget(user_id)
    )


@budget_bp.route(
    "/budget",
    methods=["POST"]
)
def create_budget():

    data = request.get_json()

    save_budget(

        user_id=
        session["user_id"],

        category_id=4,

        monthly_limit=
        data["monthly_limit"],

        budget_type=
        data["budget_type"]

    )

    return jsonify({

        "message":
        "Budget Saved"

    })