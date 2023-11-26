window.addEventListener("load", () => {
    // Do an ajax request to load goals
    function listGoals() {
        $.ajax({
            url: "/?functionName=" + 'listGoals',
            type: "GET",
            dataType: "json"
        }).done(function(goals) {
            // Find goals select section
            const selectElement = document.getElementById("goals-text-area");

            var message;

            if (goals.length != 0) {
                message = goals;
            } else {
                message = "Insert your goals here.";
            }

            selectElement.value = message;
        });
    }

    function saveGoals() {
        var message = document.getElementById("goals-text-area").value;

        $.ajax({
            url: "/?functionName=" + 'saveGoals',
            type: "POST",
            dataType: "json",
            data: JSON.stringify(message),
            contentType: 'application/json'
        })
    }

    // List content of a task
    function listContent(value) {
        $.ajax({
            url: "/calendar?functionName=" + 'listContent' + '&taskName=' + value,
            type: "GET",
            dataType: "json"
        }).done(function(content) {

            const selectElement = document.getElementById("calendar-list-text");

            // If a task is null paragraph is removed
            const paragraph = document.getElementById('task-content');

            // Check if paragraph exists
            if (paragraph != null) {
                selectElement.removeChild(paragraph);
            };

            // Check if description is not null
            if (content[0]['description'] != '') {
                const paragraph = document.createElement('div');
                paragraph.className = 'modal-body';
                paragraph.style = "max-height: 15rem; overflow-y: auto;"
                paragraph.id = 'task-content';
                paragraph.innerText = content[0]['description'];

                selectElement.appendChild(paragraph);
            };
        });
    }

    function listCalendar() {
        $.ajax({
            url: "/calendar?functionName=" + 'listCalendar',
            type: "GET",
            dataType: "json"
        }).done(function(tasks) {
            // Find calendar menu
            const selectElement = document.getElementById("calendar-menu");

            for (const task of tasks) {
                const button = document.createElement("button");
                button.className = "list-group-item list-group-item-action calendar-task";
                button.value = task;
                button.dataset.bsToggle = "modal";
                button.dataset.bsTarget = "#calendar-show";
                button.textContent = task;
                selectElement.appendChild(button);
            }

            var buttons = document.querySelectorAll('.calendar-task');
            
            for (const button of buttons) {
                button.addEventListener('click', function() {
                    const value = button.value;

                    document.getElementById('calendar-list-title').textContent = value;
                    listContent(value);
                });
            }
        });
    }

    function listNotes() {
        $.ajax({
            url: "/notes?functionName=" + 'listNotesItems',
            type: "GET",
            dataType: "json"
        }).done(function(notes) {
            // Find notes menu
            const selectElement = document.getElementById("notes-menu");

            for (const note of notes) {
                const button = document.createElement("button");
                button.className = "list-group-item list-group-item-action notes-note";
                button.value = note;
                button.dataset.bsToggle = "modal";
                button.dataset.bsTarget = "#notes-show";
                button.textContent = note;
                selectElement.appendChild(button);
            }

            var buttons = document.querySelectorAll('.notes-note');

            for (const button of buttons) {
                // List text of a note
                button.addEventListener('click', function() {

                    const value = button.value;

                    document.getElementById('notes-list-title').textContent = value;
                    
                    const selectElement = document.getElementById("notes-list-text");

                    // Remove old text
                    text = document.getElementById('note-content');

                    if (text != null) {
                        selectElement.removeChild(text);
                    }

                    $.ajax({
                        url: "/notes?functionName=" + 'listNoteText' + '&noteName=' + value,
                        type: "GET",
                        dataType: "json"
                    }).done(function(text) {
                        const paragraph = document.createElement('div');
                        paragraph.className = "modal-body";
                        paragraph.id = 'note-content';
                        paragraph.innerText = text;

                        selectElement.appendChild(paragraph);
                    });
                });
            }
        });
    };

    function listFiles() {
        $.ajax({
            url: "/files?functionName=" + 'listFolders',
            type: "GET",
            dataType: "json"
        }).done(function(folders) {
            const selectElement = document.getElementById("files-menu");

            // Sort folders
            folders.sort();

            for (const folder of folders) {
                const button = document.createElement("button");
                button.className = "list-group-item list-group-item-action files-folder";
                button.value = folder;
                button.dataset.bsToggle = "modal";
                button.dataset.bsTarget = "#files-show";
                button.textContent = folder;
                selectElement.appendChild(button);
            }

            var buttons = document.querySelectorAll('.files-folder');

            for (const button of buttons) {
                const value = button.value;

                button.addEventListener('click', function() {
                    document.getElementById('folder-title').textContent = value;

                    $.ajax({
                        url: "/files?functionName=" + 'listFiles' + `&type=${value}`,
                        type: "GET",
                        dataType: "json"
                    }).done(function(files) {
                        const selectElement = document.getElementById("folder-view-area");

                        cleanElement = document.getElementById("files-selector-file");

                        // Avoid multiple form-select
                        if (cleanElement) {
                            cleanElement.remove();
                            document.getElementById("files-selector-message").remove();
                        }

                        const message = document.createElement("h6");
                        message.className = "modal-title file-delete-space";
                        message.id = "files-selector-message";
                        message.textContent = "Select which file you want to view:";
                        selectElement.appendChild(message);
            
                        const selectForm = document.createElement("select");
                        selectForm.className = "form-select";
                        selectForm.name = "files-selector-file";
                        selectForm.id = "files-selector-file";
                        selectElement.appendChild(selectForm);

                        // Default option
                        const defaultOption = document.createElement("option");
                        defaultOption.className = "default-option";
                        defaultOption.textContent = "Select file";
                        selectForm.appendChild(defaultOption);
            
                        // Insert files into files.html
                        for (const file of files) {
                            const option = document.createElement("option");
                            option.className = "list-group-item list-group-item-action";
                            option.value = file;
                            option.textContent = file;
                            selectForm.appendChild(option);
                        }

                        // When select area is clicked open link is updated
                        var file = document.getElementById("files-selector-file");

                        file.onchange = function() {
                            var link = document.getElementById("files-open");

                            var location = `${value}/${file.value}`;

                            link.href = `/files?functionName=openFile&type=${location}`;
                        };
                    });
                });
            }
        });
    };

    // List calendar tasks when page loads
    listCalendar();

    // List notes when page loads
    listNotes();

    // List goals when page loads
    listGoals();

    // List files when page loads
    listFiles();

    // When user type their goals will be saved automatically
    document.getElementById("goals-text-area").onkeyup = function() {
        saveGoals();
    };

    // Register task conclusion
    document.getElementById('calendar-submit-conclude').onclick = function() {
        var calendarData = {
            functionName: 'conclude',
            taskName: document.getElementById("calendar-list-title").textContent
        };

        $.ajax({
            url: 'calendar',
            type: 'POST',
            data: calendarData
        })
    }
});
