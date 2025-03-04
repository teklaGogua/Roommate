document
  .querySelector(".form-box")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("https://roommates.kikvadze.com/rpc/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_email: email,
          user_password: password,
        }),
      });

      if (!response.ok) {
        alert("Login failed. Please check your email and password.");
        return;
      }
      const data = await response.json();

      // Store JWT token
      localStorage.setItem("jwt", data.jwt);

      // Redirect to apartments' page
      window.location.href = "../index.html";
    } catch (error) {
      alert("Login failed. Please check your email and password.");
    }
  });
