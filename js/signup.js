async function submitForm(event) {
  event.preventDefault();

  // Function to convert Data URL to Blob
  function dataURLtoBlob(dataURL) {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  // Get data from all forms
  const userData = {
    user_name: localStorage.getItem("signup_name"),
    user_email: localStorage.getItem("signup_email"),
    user_mobile: localStorage.getItem("signup_mobile"),
    user_password: localStorage.getItem("signup_password"),
    user_age: localStorage.getItem("signup_user_age"),
    user_nationality: localStorage.getItem("signup_user_nationality"),
    user_gender: localStorage.getItem("signup_user_gender"),
    user_bio: localStorage.getItem("signup_user_bio"),

    smoking: document.getElementById("smoking").value,
    pets: document.getElementById("pets").value,
    party_habits: document.getElementById("party_habits").value,
    food_preference: document.getElementById("food_preference").value,

    user_role: "user",
  };

  try {
    // Send registration request
    const response = await fetch("https://roommates.kikvadze.com/rpc/add_user", {
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
    const pfpId = data.pfp_id;
    const imageData = localStorage.getItem("signup_profile-pic");
    if (imageData) {
      const blob = dataURLtoBlob(imageData);
      const uploadResponse = await fetch(
        `https://roommates.kikvadze.com/upload/pfp/${pfpId}.png`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "image/png",
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
          body: blob,
        }
      );
      if (!uploadResponse.ok) throw new Error("Profile picture upload failed");
    }

    // Clear temporary signup data
    localStorage.removeItem("signup_name");
    localStorage.removeItem("signup_email");
    localStorage.removeItem("signup_mobile");
    localStorage.removeItem("signup_password");
    localStorage.removeItem("signup_profile-pic");
    localStorage.removeItem("signup_user_age");
    localStorage.removeItem("signup_user_nationality");
    localStorage.removeItem("signup_user_gender");
    localStorage.removeItem("signup_user_bio");

    // Redirect to apartments' page
    window.location.href = "../index.html";
  } catch (error) {
    console.error("Error:", error);
    alert("Registration failed. Please try again.");
  }
}

// Prevents form submission if user hits enter
document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  submitForm(e);
});
