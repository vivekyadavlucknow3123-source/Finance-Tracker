"""
Update Transaction Service
"""

from database.database.db_connection import get_connection


def update_transaction(
    transaction_id,
    amount,
    description
):
    """
    Update transaction amount and description.
    """

    conn = get_connection()

    cursor = conn.cursor()

    query = """
    UPDATE transactions
    SET amount = %s,
        description = %s
    WHERE transaction_id = %s
    """

    cursor.execute(
        query,
        (
            amount,
            description,
            transaction_id
        )
    )

    conn.commit()

    cursor.close()
    conn.close()

    print("✅ Transaction Updated Successfully")
from database.database.db_connection import get_connection


def update_transaction(
    transaction_id,
    amount,
    description
):

    conn = get_connection()

    cursor = conn.cursor()

    query = """
    UPDATE transactions
    SET
        amount = %s,
        description = %s
    WHERE transaction_id = %s
    """

    cursor.execute(
        query,
        (
            amount,
            description,
            transaction_id
        )
    )

    conn.commit()

    cursor.close()

    conn.close()