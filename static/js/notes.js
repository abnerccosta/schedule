window.addEventListener("load", () => {
    // Show modal and its elements
    var notes_show = null;

    function listNotesItems() {
        $.ajax({
            // Remember the name of the function when requesting Python
            url: "/notes?functionName=" + 'listNotesItems',
            type: "GET",
            dataType: "json"
        }).done(function(notes) {
            // Find notes select section
            const selectElement = document.querySelector("select[name='" + notes_show + "']");

            for (const note of notes) {
                const option = document.createElement("option");
                // Value returned to app.py
                option.value = note;
                option.textContent = note;
                selectElement.appendChild(option);
            }
        });
    };

    var dateOutputs;
    var textOutputs;

    function listNotesDate() {
        $.ajax({
            // Remember the name of the function when requesting Python
            url: "/notes?functionName=" + 'listNotesDate',
            type: "GET",
            dataType: "json"
        }).done(function(dates) {
            // Get title element
            const selectElement = document.getElementById("notes-modify-title");

            if ((typeof dateOutputs) == 'undefined') {
                // Select note camp to inject modification date
                const selectCamp = document.getElementById("notes-date-camp");

                // Create date section
                dateOutputsMessage = document.createElement("label");
                dateOutputsMessage.className = 'form-label';
                dateOutputsMessage.textContent = 'Edited in:';
                selectCamp.appendChild(dateOutputsMessage);

                dateOutputs = document.createElement("input");
                dateOutputs.type = 'date';
                dateOutputs.readOnly = true;
                selectCamp.appendChild(dateOutputs);
            };

            // Get chosen option index
            const selectedIndex = selectElement.selectedIndex;

            // Apparently selectedIndex always start in 1
            dateOutputs.value = dates[selectedIndex - 1];
        });
    }
    
    function listNotesText() {
        $.ajax({
            // Remember the name of the function when requesting Python
            url: "/notes?functionName=" + 'listNotesText',
            type: "GET",
            dataType: "json"
        }).done(function(text) {

            // Get title element
            const selectElement = document.getElementById("notes-modify-title");

            if ((typeof textOutputs) == 'undefined') {
                // Select note camp to inject text
                const selectCamp = document.getElementById("notes-text-camp");

                // Create text session
                textOutputsMessage = document.createElement("label");
                textOutputsMessage.className = 'form-label';
                textOutputsMessage.textContent = 'Text';
                selectCamp.appendChild(textOutputsMessage);

                textOutputs = document.createElement("textarea");
                textOutputs.className = 'form-control';
                textOutputs.rows = '10';
                textOutputs.name = 'notes-modify-text';
                selectCamp.appendChild(textOutputs);
            };

            // Get chosen option index
            const selectedIndex = selectElement.selectedIndex;

            textOutputs.value = text[selectedIndex - 1];

        });
    }

    // Avoid calling listNotesItems() more than one time for each element
    notesChange = false;
    notesRemove = false;

    // Add an event listener for all notes anchors
    document.getElementById("notes-modify-select").onclick = function() {
        notes_show = "notes-modify-title";
        if (notesChange != true) {
            listNotesItems();
            notesChange = true
        };
    };

    // Add an event listener for select note
    document.getElementById("notes-modify-title").onchange = function() {
        listNotesDate();
        listNotesText();
    }

    document.getElementById("notes-remove-select").onclick = function() {
        notes_show = "notes-remove-title";
        if (notesRemove != true) {
            listNotesItems();
            notesRemove = true;
        }
    }
});