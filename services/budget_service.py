from database.database.db_connection import get_connection


def get_budget(user_id):

    conn = get_connection()

    cursor = conn.cursor(
        dictionary=True
    )

    query = """
    SELECT monthly_limit
    FROM budgets
    WHERE user_id = %s
    ORDER BY budget_id DESC
    LIMIT 1
    """

    cursor.execute(
        query,
        (user_id,)
    )

    budget = cursor.fetchone()

    cursor.close()
    conn.close()

    if budget:
        return budget

    return {
        "monthly_limit": 0
    }
def save_budget(

    user_id,

    category_id,

    monthly_limit,

    budget_type

):

    conn = get_connection()

    cursor = conn.cursor()

    query = """
    INSERT INTO budgets
    (
        user_id,
        category_id,
        monthly_limit,
        budget_type
    )
    VALUES
    (
        %s,
        %s,
        %s,
        %s
    )
    """

    cursor.execute(

        query,

        (

            user_id,

            category_id,

            monthly_limit,

            budget_type

        )
    )

    conn.commit()

    cursor.close()

    conn.close()