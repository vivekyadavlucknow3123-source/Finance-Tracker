"""
FinanceTracker Main Application
"""

from flask import Flask

from flask import session, redirect
from routes.user_routes import user_bp
from routes.transaction_routes import transaction_bp
from flask import render_template
from routes.category_routes import category_bp
from routes.analytics_routes import analytics_bp
from routes.budget_routes import budget_bp
from routes.monthly_trend_routes import monthly_bp
from routes.export_routes import (
    export_bp
)
from routes.pdf_routes import (
    pdf_bp
)
from routes.auth_routes import (
    auth_bp
)
from routes.ai_routes import (
    ai_bp
)

app = Flask(__name__)
app.secret_key = "FinanceTrackerSecretKey"

# Register route groups
app.register_blueprint(user_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(transaction_bp)
app.register_blueprint(
    budget_bp
)
app.register_blueprint(
monthly_bp
)
app.register_blueprint(
    export_bp
)
app.register_blueprint(
    pdf_bp
)

@app.route("/")
def home():

    if "user_id" not in session:
        return redirect("/login")

    return render_template(
        "index.html"
    )
    
app.register_blueprint(category_bp)

app.register_blueprint(
    analytics_bp
)
app.register_blueprint(
    ai_bp
)


if __name__ == '__main__':
    app.run(debug=True)