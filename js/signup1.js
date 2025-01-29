document
  .getElementById("signupForm1")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    localStorage.setItem("signup_name", document.getElementById("name").value);
    localStorage.setItem(
      "signup_email",
      document.getElementById("email").value
    );
    localStorage.setItem(
      "signup_mobile",
      document.getElementById("mobile").value
    );
    localStorage.setItem(
      "signup_password",
      document.getElementById("password").value
    );

    window.location.href = "sign_up2.html";
  });
