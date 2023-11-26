window.addEventListener("load", () => {
  
    // Insert error messages if a camp is blank or passwords don't match
    function validateForm() {
        document.getElementById("confirm").onclick = function() {
            const emailInput = document.getElementById("email");
            const passwordInput = document.getElementById("password");
            const confirmationInput = document.getElementById("confirmation");

            const verify = [emailInput, passwordInput, confirmationInput];

            var validate = true;

            // Each wrong camp is set as "is-invalid"
            for (var i = 0; i < verify.length; i++) {
                if (verify[i] != null) {
                    if (verify[i].value.trim() === '') {
                        verify[i].classList.add("is-invalid");
                        validate = false;
                    } else {
                        verify[i].classList.remove("is-invalid");
                    }
                }
            }

            if (!validate) {
                return false;
            }

            // Insert confirm error message
            if (confirmationInput != null) {
                if (passwordInput.value != confirmationInput.value) {
                    confirmationInput.classList.add("is-invalid");
                    document.getElementById("confirm-text").innerHTML = "Passwords don't match";
                    return false;
                } else {
                    confirmationInput.classList.remove("is-invalid");
                    document.getElementById("confirm-text").innerHTML = "Confirm password";
                }
            }
        }
    }

    validateForm();
});