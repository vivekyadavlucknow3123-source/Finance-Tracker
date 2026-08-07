from flask import (
    Blueprint,
    jsonify,
    session
)

from services.ai_service import (
    get_ai_insights,
    get_budget_recommendations,
    get_financial_health_score
)
from services.ai_service import (
    get_monthly_report
)
from services.ai_service import (
    get_ai_dashboard
)
from services.chatbot_service import (
    chatbot_reply
)
from services.ai_service import (
    get_expense_forecast
)
from services.ai_service import (
    get_smart_alerts
)
from flask import request

ai_bp = Blueprint(
    "ai_bp",
    __name__
)


@ai_bp.route(
    "/ai/insights"
)
def ai_insights():

    user_id = session["user_id"]

    return jsonify(
        get_ai_insights(
            user_id
        )
    )

@ai_bp.route(
    "/ai/forecast"
)
def ai_forecast():

    user_id = (
        session["user_id"]
    )

    return jsonify(

        get_expense_forecast(
            user_id
        )

    )

@ai_bp.route(
    "/ai/recommendations"
)
def ai_recommendations():

    user_id = session["user_id"]

    return jsonify(
        get_budget_recommendations(
            user_id
        )
    )
@ai_bp.route(
    "/ai/report"
)
def ai_report():

    user_id = (
        session["user_id"]
    )

    return jsonify(

        get_monthly_report(
            user_id
        )

    )

@ai_bp.route(
    "/ai/health"
)
def ai_health():

    user_id = session["user_id"]

    return jsonify(
        get_financial_health_score(
            user_id
        )
    )
@ai_bp.route(
    "/ai/dashboard"
)
def ai_dashboard():

    user_id = (
        session["user_id"]
    )

    return jsonify(

        get_ai_dashboard(
            user_id
        )

    )

@ai_bp.route(
    "/ai/chat",
    methods=["POST"]
)
def ai_chat():

    data = request.get_json()

    user_id = (
        session["user_id"]
    )

    reply = chatbot_reply(

        user_id,

        data["message"]

    )

    return jsonify({

        "reply":
        reply

    })
@ai_bp.route(
    "/ai/alerts"
)
def ai_alerts():

    user_id = (
        session["user_id"]
    )

    return jsonify(

        get_smart_alerts(
            user_id
        )

    )