window.addEventListener("load", () => {
    function formatDate(date) {
        // Get day, month and year and full with 0
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        // Formated date
        const fdate = `${year}-${month}-${day}`;
        
        return fdate;
    }

    // Get today's date unformated
    date = new Date();

    // Format date
    today = formatDate(date);

    // Change date in HTML for each element
    const dateInputs = document.querySelectorAll(".calendar-date");

    dateInputs.forEach(input => {
        input.value = today;
    });

    // Show modal and its elements
    var calendar_show = null;

    function listCalendarItems() {
        $.ajax({
            url: "/calendar",
            type: "GET",
            dataType: "json"
        }).done(function(tasks) {
            // Find calendar select section
            const selectElement = document.querySelector("select[name='" + calendar_show + "']");

            // Create element option and add them to select section
            for (const task of tasks) {
                const option = document.createElement("option");
                // Value returned to app.py
                option.value = task;
                option.textContent = task;
                selectElement.appendChild(option);
            }
        });
    };

    // Avoid calling listCalendarItems() more than one time for each element
    calendarChange = false;
    calendarRemove = false;

    // Add an event listener for all calendar anchors
    document.getElementById("calendar-change-select").onclick = function() {
        calendar_show = "calendar-change-title";
        if (calendarChange != true) {
            listCalendarItems();
            calendarChange = true
        };
    };

    document.getElementById("calendar-remove-select").onclick = function() {
        calendar_show = "calendar-remove-title";
        if (calendarRemove != true) {
            listCalendarItems();
            calendarRemove = true;
        }
    }
});