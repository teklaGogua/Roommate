async function submitForm(event) {
  event.preventDefault();

  // Get data from both forms
  const userData = {
    user_name: localStorage.getItem("signup_name"),
    user_email: localStorage.getItem("signup_email"),
    user_mobile: localStorage.getItem("signup_mobile"),
    user_password: localStorage.getItem("signup_password"),
    user_age: parseInt(document.getElementById("age").value),
    user_nationality: document.getElementById("nationality").value,
    user_gender: document.getElementById("gender").value,
    user_bio: document.getElementById("bio").value,
    user_role: "user", 
  };

  try {
    // Send registration request
    const response = await fetch("http://94.137.160.8:13001/rpc/add_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Registration failed");
    }

    const data = await response.json();

    // Store JWT token
    localStorage.setItem("jwt", data.jwt);

    // Clear temporary signup data
    localStorage.removeItem("signup_name");
    localStorage.removeItem("signup_email");
    localStorage.removeItem("signup_mobile");
    localStorage.removeItem("signup_password");

    // Redirect to index page
    window.location.href = "../index.html";
  } catch (error) {
    console.error("Error:", error);
    alert("Registration failed. Please try again.");
  }
}

// Add this to prevent form submission if user hits enter
document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  submitForm(e);
});
