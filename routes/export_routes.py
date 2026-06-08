"""
=========================================
Export Routes
Day 11
=========================================
"""

from flask import (
    Blueprint,
    send_file,
    session
)

from services.transaction_service import (
    get_all_transactions,
    get_transactions_by_user
)

from services.export_service import (
    export_transactions_to_csv
)

export_bp = Blueprint(
    "export_bp",
    __name__
)


@export_bp.route(
    "/export/csv",
    methods=["GET"]
)
def export_csv():

    user_id = session["user_id"]

    transactions = get_transactions_by_user(
    user_id
    )

    file_path = (
        "transactions_report.csv"
    )

    export_transactions_to_csv(
        transactions,
        file_path
    )

    return send_file(
        file_path,
        as_attachment=True
    )