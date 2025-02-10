document
  .querySelector(".form-box")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://94.137.160.8/rpc/login", {
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
        throw new Error("Login failed");
      }
      const data = await response.json();

      // Store JWT token
      localStorage.setItem("jwt", data.jwt);

      // Redirect to apartments' page
      window.location.href = "../index.html";
    } catch (error) {
      console.error("Error:", error);
      alert("Login failed. Please check your email and password.");
    }
  });
