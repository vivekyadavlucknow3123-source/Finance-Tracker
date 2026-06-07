"""
=========================================
PDF Report Service
Day 12
=========================================
"""

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)

from reportlab.lib.styles import (
    getSampleStyleSheet
)


def generate_pdf_report(
    total_income,
    total_expense,
    file_path
):
    """
    Generate PDF report.
    """

    pdf = SimpleDocTemplate(
        file_path
    )

    styles = getSampleStyleSheet()

    content = []

    content.append(
        Paragraph(
            "FinanceTracker Report",
            styles["Title"]
        )
    )

    content.append(
        Spacer(1, 20)
    )

    content.append(
        Paragraph(
            f"Total Income: ₹{total_income}",
            styles["Normal"]
        )
    )

    content.append(
        Paragraph(
            f"Total Expense: ₹{total_expense}",
            styles["Normal"]
        )
    )

    content.append(
        Spacer(1, 20)
    )

    content.append(
        Paragraph(
            "Generated using FinanceTracker",
            styles["Italic"]
        )
    )

    pdf.build(content)

    return file_path