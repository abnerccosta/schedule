import os
import json

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session, send_file
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
from pathlib import Path

from helpers import verify_login, error

# Configure Flask
app = Flask(__name__)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Use CS50 library to connect with SQLite database
db = SQL("sqlite:///schedule.db")


@app.route("/", methods=["GET", "POST"])
@verify_login
def index():
    """Show user schedule"""

    if request.method == "POST":
        if request.args.get("functionName") == "saveGoals":
            # Message obtained via AJAX
            message = request.json

            # Check if goals already exists
            goals = db.execute(
                """SELECT content FROM goals WHERE user_id = (?)""", session["user_id"]
            )

            if not goals:
                db.execute(
                    """INSERT INTO goals (user_id, content) VALUES (?, ?)""",
                    session["user_id"], 
                    message,
                )
            
            else:
                db.execute(
                    """UPDATE goals SET content = (?) WHERE user_id = (?)""",
                    message, 
                    session["user_id"],
                )

            return redirect("/")
    
    else:
        if request.args.get("functionName") == "listGoals":
            # Get goals
            goals = db.execute(
                """SELECT content FROM goals WHERE user_id = (?)""", session["user_id"]
            )
            
            # Converts to JSON list
            if goals:
                jgoals = json.dumps(goals[0]["content"])
            else:
                jgoals = []

            return jgoals

        is_dropdown_menu = True
        
        return render_template("home.html", is_dropdown_menu=is_dropdown_menu)
    

@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    is_login = True
    incorrect = True

    # Clear user session
    session.clear()
    
    if request.method == "POST":
        # Ensure email was submitted
        if not request.form.get("email"):
            return error("Email is blank.")
        
        # Ensure password was submitted
        if not request.form.get("password"):
            return error("Password is blank.")
        
        # Query database for email
        rows = db.execute(
            "SELECT * FROM users WHERE email = (?)", request.form.get("email")
        )

        # Ensure email exists and password is correct
        if len(rows) != 1 or not check_password_hash(
            rows[0]["hash"], request.form.get("password")
        ):
            return render_template("login.html", is_login=is_login, incorrect=incorrect)
        
        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to homepage
        return redirect("/")
    else:
        # Return login page
        return render_template("login.html", is_login=is_login)
    

@app.route("/register", methods=["GET", "POST"])
def register():
    """Register new user"""

    if request.method == "POST":
        # Ensure email is not registered yet
        rows = db.execute(
            "SELECT * FROM users WHERE email = (?)", request.form.get("email")
        )
        if len(rows) >= 1:
            return error("Email already registered. Perhaps you forgot to sign in?")
        
        # Check if email or password is blank
        if not request.form.get("email"):
            return error("Email camp is blank.")
        elif not request.form.get("password"):
            return error("Password camp is blank.")
        
        # Create temporary variables
        email = request.form.get("email")
        hash = generate_password_hash(request.form.get("password"), salt_length=16)

        # Register user
        db.execute("INSERT INTO users (email, hash) VALUES (?, ?)", email, hash)

        # User path name
        user_path = db.execute("SELECT id FROM users WHERE email = (?)", email)[0]["id"]

        # Create user folder
        folders = ["Documents", "Pictures", "Music", "Videos"]

        for folder in folders:
            Path(f"users/{user_path}/{folder}").mkdir(parents=True)

        # Return to login
        return redirect("/")

    else:
        # Return register page
        return render_template("register.html")


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


@app.route("/theme", methods=["GET", "POST"])
def theme():
    """Change user theme"""

    if request.method == "POST":
        # Store current theme
        current = db.execute(
            "SELECT theme FROM custom WHERE user_id = (?)", session["user_id"]
        )

        # Delete old theme
        db.execute("DELETE FROM custom WHERE user_id = (?)", session["user_id"])

        # Assign temporary value to current if not defined
        if not current:
            current = [{"theme": 0}]

        # Change theme
        if current[0]["theme"] == 0:
            theme = 1
        else:
            theme = 0
        
        db.execute(
            "INSERT INTO custom (user_id, theme) VALUES (?, ?)", 
            session["user_id"], 
            theme,
        )
        
        # Redirect to homepage
        return redirect("/")

    else:
        # Search for user theme
        theme = db.execute(
            "SELECT theme FROM custom WHERE user_id = (?)", session["user_id"]
        )

        # Converts to JSON list
        jtheme = json.dumps(theme[0]["theme"])

        return jtheme
    

@app.route("/modify", methods=["GET", "POST"])
def modify():
    """Modify user account"""

    if request.method == "POST":
        # Check if email is already registered
        rows = db.execute(
            "SELECT * FROM users WHERE email = (?)", request.form.get("email")
        )

        # Get user email
        if len(rows) >= 1:
            return error("This email is already registered. Try another one.")

        # Register changes
        if request.form.get("email"):
            db.execute(
                "UPDATE users SET email = (?) WHERE id = (?)", 
                request.form.get("email"), 
                session["user_id"],
            )
        if request.form.get("password"):
            # Generate password hash
            hash = generate_password_hash(request.form.get("password"), salt_length=16)

            db.execute(
                "UPDATE users SET hash = (?) WHERE id = (?)", hash, session["user_id"]
            )
        
        return redirect("/")
    
    else:
        # Return modification page
        return render_template("modify.html")
    

@app.route("/calendar", methods=["GET", "POST"])
def calendar():
    """Manage calendar tasks"""

    if request.method == "POST":
        # Check option selected
        if request.form.get("calendar-add-title"):
            # Create temporary variables
            title = request.form.get("calendar-add-title")
            description = request.form.get("calendar-add-description")
            year, month, day = map(int, request.form.get("calendar-date").split("-"))

            # Store information about a task
            db.execute(
                """INSERT INTO calendar (user_id, title, description, day, month, year)
                VALUES (?, ?, ?, ?, ?, ?)""", 
                session["user_id"], 
                title, 
                description, 
                day, 
                month, 
                year,
            )
            
        if request.form.get("calendar-change-title"):
            # Check if a task exists
            task = db.execute(
                "SELECT title FROM calendar WHERE user_id = (?) AND title = (?)", 
                session["user_id"], 
                request.form.get("calendar-change-title"),
            )
            
            if len(task) != 1:
                return error("Task does not exist or it's duplicated.")
            
            # Create temporary variables
            year, month, day = map(int, request.form.get("calendar-date").split("-"))
            
            # Write new date to database
            db.execute(
                "UPDATE calendar SET day = ?, month = ?, year = ? WHERE user_id = (?) AND title = (?)",
                day, 
                month, 
                year, 
                session["user_id"], 
                task[0]["title"],
            )
        
        if request.form.get("calendar-remove-title"):
            # Check if a task exists
            task = db.execute(
                "SELECT title FROM calendar WHERE user_id = (?) AND title = (?)",
                session["user_id"], 
                request.form.get("calendar-remove-title"),
            )

            if len(task) != 1:
                return error("Task does not exist or it's duplicated.")
            
            # Remove task
            db.execute(
                "DELETE FROM calendar WHERE user_id = (?) AND title = (?)",
                session["user_id"], 
                request.form.get("calendar-remove-title"),
            )
        
        if request.form.get("functionName") == "conclude":
            task = request.form.get("taskName")

            db.execute(
                "DELETE FROM calendar WHERE user_id = (?) AND title = (?)",
                session["user_id"], 
                task,
            )
        
        return redirect("/")

    else:
        if request.args.get("functionName") == "listContent":
            taskname = request.args.get("taskName")

            description = db.execute(
                "SELECT description FROM calendar WHERE user_id = (?) AND title = (?)", 
                session["user_id"], 
                taskname,
            )

            return description
        
        if request.args.get("functionName") == "listCalendar":
            date = datetime.now()

            tasks = db.execute(
                "SELECT * FROM calendar WHERE user_id = (?) AND day = (?) AND month = (?) AND year = (?)",
                session["user_id"], 
                date.day, 
                date.month, 
                date.year,
            )
        
        else:
            # Loop through tasks
            tasks = db.execute(
                "SELECT * FROM calendar WHERE user_id = (?)", session["user_id"]
            )
        
        # Create temporary list
        task_name = []

        # Append names to task_name
        for task in tasks:
            task_name.append(task["title"])

        # Converts to JSON list
        jtask = json.dumps(task_name)
        
        return jtask


@app.route("/notes", methods=["GET", "POST"])
def notes():
    """Manage notes"""

    if request.method == "POST":
        # Check option selected
        if request.form.get("notes-add-title"):
            # Create temporary variablInsert your goals here.es
            title = request.form.get("notes-add-title")
            text = request.form.get("notes-add-text")
            date = datetime.now()

            # Check if a note already exists
            verify = db.execute(
                """SELECT title FROM notes
                    WHERE user_id = (?) AND title = (?)""", 
                session["user_id"], 
                title,
            )
            
            if verify != []:
                return error("This note already exists.")

            # Store information about a note
            db.execute(
                """INSERT INTO notes (user_id, title, text, day, month, year)
                VALUES (?, ?, ?, ?, ?, ?)""",
                session["user_id"], 
                title, 
                text, 
                date.day, 
                date.month, 
                date.year,
            )
        
        if request.form.get("notes-modify-title"):
            # Create temporary variables
            title = request.form.get("notes-modify-title")
            text = request.form.get("notes-modify-text")
            date = datetime.now()

            # Store information about a note
            db.execute(
                """UPDATE notes SET text = (?), day = (?), month = (?), year = (?)
                WHERE user_id = (?) AND title = (?)""",
                text, 
                date.day, 
                date.month, 
                date.year, 
                session["user_id"], 
                title,
            )

        if request.form.get("notes-remove-title"):
            title = request.form.get("notes-remove-title")
            
            # Remove note
            db.execute(
                """DELETE FROM notes WHERE user_id = (?) AND title = (?)""",
                session["user_id"], 
                title,
            )

        return redirect("/")
    
    else:
        if request.args.get("functionName") == "listNotesItems":
            # Loop through notes
            notes = db.execute(
                """SELECT * FROM notes WHERE user_id = (?)""", session["user_id"]
            )

            # Create a temporary list
            note_name = []

            # Append names to note_name
            for note in notes:
                note_name.append(note["title"])
            
            # Converts to JSON list
            jnames = json.dumps(note_name)

            return jnames
        
        elif request.args.get("functionName") == "listNotesDate":
            # Loop through notes
            notes = db.execute(
                """SELECT * FROM notes WHERE user_id = (?)""", session["user_id"]
            )

            # Create a temporary list
            note_date = []

            # Append date to note_date
            for note in notes:
                # Format day and month
                note["day"] = str(note["day"]).zfill(2)
                note["month"] = str(note["month"]).zfill(2)

                note_date.append(f"{note['year']}-{note['month']}-{note['day']}")
            
            # Converts to JSON list
            jdates = json.dumps(note_date)

            return jdates

        elif request.args.get("functionName") == "listNotesText":
            # Loop through notes
            notes = db.execute(
                """SELECT * FROM notes WHERE user_id = (?)""", session["user_id"]
            )

            # Create a temporary list
            note_text = []

            # Append text to note_text
            for note in notes:
                note_text.append(note["text"])

            # Convert to JSON list
            jtext = json.dumps(note_text)

            return jtext
        
        elif request.args.get("functionName") == "listNoteText":
            note = request.args.get("noteName")

            # Get a specific note text
            text = db.execute(
                """SELECT text FROM notes WHERE user_id = (?) AND title = (?)""",
                session["user_id"], 
                note,
            )

            # Converts to JSON list
            jtext = json.dumps(text[0]["text"])

            return jtext
        

@app.route("/files", methods=["GET", "POST"])
def files():
    """Manage files"""

    if request.method == "POST":
        # Add file selected
        if request.files:
            # See where file should be placed or if it would be rejected
            file = request.files["files-select-add"]
            filename = secure_filename(file.filename)
            file_extension = (
                (str(request.files["files-select-add"]).split("'")[1])
                .rsplit(".", 1)[1]
                .lower()
            )

            folder = None

            # Extensions allowed
            filetype = {
                "Documents": {"doc", "pdf", "docx", "odt", "txt"},
                "Pictures": {"jpg", "png", "jpeg", "gif"},
                "Music": {"mp3", "wav", "flac"},
                "Videos": {"mp4", "avi", "mkv"},
            }

            # If file extension is supported, then its category is stored
            for category, extensions in filetype.items():
                if file_extension in extensions:
                    folder = category
                    break
            
            if os.path.exists(f'users/{session["user_id"]}/{folder}/{filename}'):
                return error("File already exists.")

            if folder != None:
                file.save(
                    os.path.join(f'users/{session["user_id"]}/{folder}', filename)
                )

            return redirect("/")
        
        # Remove file selected
        else:
            file = request.form.get("files-selector-file")
            folder = request.form.get("files-selector-folders")

            path = Path(f"users/{session['user_id']}/{folder}/{file}")

            if path.exists():
                path.unlink()
            else:
                return error("File not found.")

            return redirect("/")
    
    else:
        if request.args.get("functionName") == "listFolders":
            # Get content from user folder
            path_folders = Path(f"users/{session['user_id']}")

            folders = []

            # Convert into a list
            for item in path_folders.iterdir():
                folders.append(str(item.parts[2]))

            # Format to JSON list
            jfolders = json.dumps(folders)

            return jfolders
        
        elif request.args.get("functionName") == "listFiles":
            # Get content from selected folder
            folder = request.args.get("type")
            path_files = Path(f"users/{session['user_id']}/{folder}")

            files = []

            # Convert into a list
            for item in path_files.iterdir():
                files.append(str(item.parts[3]))

            # Format to JSON list
            jfiles = json.dumps(files)

            return jfiles
        
        elif request.args.get("functionName") == "openFile":
            # Open chosen file
            file = request.args.get("type")

            return send_file(f"users/{session['user_id']}/{file}", as_attachment=True)


@app.route("/goals", methods=["POST"])
def goals():
    # Exclude all selected
    db.execute("""DELETE FROM goals WHERE user_id = (?)""", session["user_id"])

    return redirect("/")
