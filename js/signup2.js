document
  .getElementById("signupForm2")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    localStorage.setItem(
      "signup_user_age",
      parseInt(document.getElementById("age").value)
    );
    localStorage.setItem(
      "signup_user_nationality",
      document.getElementById("nationality").value
    );
    localStorage.setItem(
      "signup_user_gender",
      document.getElementById("gender").value
    );
    localStorage.setItem(
      "signup_user_bio",
      document.getElementById("bio").value
    );

    window.location.href = "sign_up3.html";
  });
