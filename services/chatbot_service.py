from services.ai_service import (
    get_ai_insights,
    get_financial_health_score
)


def chatbot_reply(
    user_id,
    message
):

    message = (
        message.lower()
    )

    insights = (
        get_ai_insights(
            user_id
        )
    )

    health = (
        get_financial_health_score(
            user_id
        )
    )

    if "expense" in message:

        return (
            f"Your total expense is ₹{insights['total_expense']}"
        )

    if "income" in message:

        return (
            f"Your total income is ₹{insights['total_income']}"
        )

    if "category" in message:

        return (
            f"Your highest spending category is {insights['top_category']}"
        )

    if "health" in message:

        return (
            f"Your financial health score is {health['score']}"
        )

    return (
        "I do not understand that question."
    )