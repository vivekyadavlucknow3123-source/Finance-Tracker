"""
=========================================
Export Routes
Day 11
=========================================
"""

from flask import (
    Blueprint,
    send_file
)

from services.transaction_service import (
    get_all_transactions
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

    transactions = (
        get_all_transactions()
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