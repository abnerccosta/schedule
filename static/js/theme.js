window.addEventListener("load", () => {
    
    // Get user chosen theme
    $.ajax({
        url: "/theme",
        type: "GET",
        dataType: "json"
    }).done(function(theme) {
        // Change theme to dark if this option was checked
        if (theme == 1) {
            const html = document.getElementById("header");
            const navbar = document.getElementById("navbar");
            const links = document.querySelectorAll(".link-dark");

            html.setAttribute("data-bs-theme", "dark");
            navbar.setAttribute("data-bs-theme", "dark");

            // Each link is set as dark
            for (const link of links) {
                link.classList.replace("link-dark", "link-light");
            }
        }
    });
})