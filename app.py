"""
FinanceTracker Main Application
"""

from flask import Flask

from routes.user_routes import user_bp
from routes.transaction_routes import transaction_bp
from flask import render_template

app = Flask(__name__)

# Register route groups
app.register_blueprint(user_bp)
app.register_blueprint(transaction_bp)


@app.route('/')
def home():

    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)