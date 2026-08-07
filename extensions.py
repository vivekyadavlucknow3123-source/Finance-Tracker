"""
=========================================
Shared Flask extensions
=========================================
Created here (uninitialized) and hooked up with app.init_app() in
app.py, so route modules can `from extensions import limiter` without
creating a circular import with app.py.
"""

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[]  # only routes with an explicit @limiter.limit(...) are limited
)
