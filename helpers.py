from flask import redirect, render_template, session
from functools import wraps


def verify_login(f):
    """
    Decorates routes to require login.

    http://flask.pocoo.org/docs/0.12/patterns/viewdecorators/
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    
    return decorated_function


def error(message, code=400):
    """Render an error message"""
    return render_template("error.html", message=message)