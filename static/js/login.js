// Insert error messages when some login information is wrong
function incorrectMessage() {
    document.getElementById("email").classList.add("is-invalid");
    document.getElementById("password").classList.add("is-invalid");
    document.getElementById("email-text").innerHTML = "Invalid email or password";
}

incorrectMessage();