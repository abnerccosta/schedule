window.addEventListener("load", () => {
    // Do an ajax request to load folders
    function listFolders() {
        $.ajax({
            url: "/files?functionName=" + 'listFolders',
            type: "GET",
            dataType: "json"
        }).done(function(folders) {
            // Sort folders
            folders.sort()
            
            // Find folders select section
            const selectElement = document.getElementById('files-selector-folders');

            const message = document.createElement("h6");
            message.className = "modal-title";
            message.textContent = "Select where you want to save:";
            selectElement.appendChild(message);

            // Insert folders into files.html
            for (const folder of folders) {
                const option = document.createElement("option");
                option.className = "list-group-item list-group-item-action";
                option.value = folder;
                option.textContent = folder;
                selectElement.appendChild(option);
            }
        });
    };

    function listFiles() {
        $.ajax({
            url: "/files?functionName=" + 'listFiles' + `&type=${location}`,
            type: "GET",
            dataType: "json"
        }).done(function(files) {
            // Find files area
            const selectElement = document.getElementById("files-select-area");

            const message = document.createElement("h6");
            message.className = "modal-title file-delete-space";
            message.id = "files-selector-message";
            message.textContent = "Select which file you want to remove:";
            selectElement.appendChild(message);

            const selectForm = document.createElement("select");
            selectForm.className = "form-select";
            selectForm.name = "files-selector-file";
            selectForm.id = "files-selector-file";
            selectElement.appendChild(selectForm);

            // Insert files into files.html
            for (const file of files) {
                const option = document.createElement("option");
                option.className = "list-group-item list-group-item-action";
                option.value = file;
                option.textContent = file;
                selectForm.appendChild(option);
            }
        });
    };

    // Avoid multiple form-select
    function cleanFiles() {
        const selectElement = document.getElementById("files-selector-file");

        if (selectElement) {
            selectElement.remove();
            document.getElementById("files-selector-message").remove();
        };
    };

    // Avoid calling listFolders() more than one time
    var listFoldersCheck = false;
    var location = null;

    document.getElementById("files-remove-select").onclick = function() {
        if (listFoldersCheck != true) {
            listFolders();
            listFoldersCheck = true;
        };
    };

    document.getElementById("files-selector-folders").onclick = function() {
        location = document.getElementById("files-selector-folders").value;
        listFiles();
        cleanFiles();
    };
});