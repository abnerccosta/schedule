window.addEventListener("load", () => {
    const checkbox = document.getElementById('coffee-switch');
    const message = document.getElementById('coffee-break');

    checkbox.addEventListener('change', (event) => {
        if (event.target.checked) {
            $(message).modal('show'); // Show the modal if the checkbox is checked
        }
    });

    message.addEventListener('hidden.bs.modal', function() {
        checkbox.click(); // Disable switch if modal is closed
    });
});