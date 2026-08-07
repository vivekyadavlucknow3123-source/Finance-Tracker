from services.db_service import get_connection


def get_all_transactions():

    conn = get_connection()

    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        transaction_id,
        user_id,
        category_id,
        amount,
        transaction_type,
        description,
        transaction_date
    FROM transactions
    """

    cursor.execute(query)

    transactions = cursor.fetchall()

    cursor.close()
    conn.close()

    return transactions


def add_transaction(
    user_id,
    category_id,
    amount,
    transaction_type,
    description,
    transaction_date
):

    conn = get_connection()

    cursor = conn.cursor()

    query = """
    INSERT INTO transactions
    (
        user_id,
        category_id,
        amount,
        transaction_type,
        description,
        transaction_date
    )
    VALUES
    (%s, %s, %s, %s, %s, %s)
    """

    cursor.execute(
        query,
        (
            user_id,
            category_id,
            amount,
            transaction_type,
            description,
            transaction_date
        )
    )

    # IMPORTANT
    conn.commit()

    cursor.close()
    conn.close()
def get_transactions_by_user(
    user_id
):

    connection = get_connection()

    cursor = connection.cursor(
        dictionary=True
    )

    query = """
    SELECT *
    FROM transactions
    WHERE user_id = %s
    ORDER BY transaction_date DESC
    """

    cursor.execute(
        query,
        (user_id,)
    )

    transactions = (
        cursor.fetchall()
    )

    cursor.close()
    connection.close()

    return transactions

    cursor.execute(
        query,
        (user_id,)
    )

    transactions = (
        cursor.fetchall()
    )

    cursor.close()
    connection.close()

    return transactions

    conn.commit()

    cursor.close()
    conn.close()