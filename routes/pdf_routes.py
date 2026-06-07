"""
=========================================
PDF Routes
Day 12
=========================================
"""

from flask import (
    Blueprint,
    send_file
)

from services.transaction_service import (
    get_all_transactions
)

from services.pdf_service import (
    generate_pdf_report
)

pdf_bp = Blueprint(
    "pdf_bp",
    __name__
)


@pdf_bp.route(
    "/export/pdf",
    methods=["GET"]
)
def export_pdf():

    transactions = (
        get_all_transactions()
    )

    total_income = 0
    total_expense = 0

    for transaction in transactions:

        amount = float(
            transaction["amount"]
        )

        if (
            transaction[
                "transaction_type"
            ] == "Income"
        ):

            total_income += amount

        else:

            total_expense += amount

    file_path = (
        "finance_report.pdf"
    )

    generate_pdf_report(
        total_income,
        total_expense,
        file_path
    )

    return send_file(
        file_path,
        as_attachment=True
    )