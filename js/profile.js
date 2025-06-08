// Fetch user data from session storage
const userData = JSON.parse(sessionStorage.getItem("userData"));
const pfp = sessionStorage.getItem("pfp");

// Populate the profile page with user data
document.querySelector(".profile-pic").src = pfp;
document.getElementById("name").textContent = userData.name;
document.getElementById("age").textContent = userData.age;
document.getElementById("nationality").textContent = userData.nationality;
document.getElementById("gender").textContent = userData.roommate_gender;
document.getElementById("email").textContent = userData.email;
document.getElementById("mobile").textContent = userData.telephone;
document.getElementById("bio").textContent = userData.bio;

// Log out functionality
function logout() {
  localStorage.removeItem("jwt");
  sessionStorage.removeItem("userData");
  sessionStorage.removeItem("pfp");
  sessionStorage.removeItem("imgListing");
  window.location.href = "/index.html";
}

// Back btn functionality
const backBtn = document.querySelector(".backBtn");
backBtn.addEventListener("click", () => {
  window.location.href = "apartments.html";
});

// Modal functionality
const modal = document.querySelector(".modal");
const btnShowModal = document.querySelector(".showModal");
const accept = document.querySelector(".accept");
const deny = document.querySelector(".deny");

// Show modal
btnShowModal.addEventListener("click", () => modal.showModal());

// Close with deny button
deny.addEventListener("click", () => modal.close());

// Close modal when clicking outside
modal.addEventListener("click", (event) => {
  const dialogDimensions = modal.getBoundingClientRect();
  if (
    event.clientX < dialogDimensions.left ||
    event.clientX > dialogDimensions.right ||
    event.clientY < dialogDimensions.top ||
    event.clientY > dialogDimensions.bottom
  ) {
    modal.close();
  }
});

// Edit toggle functionality
const creatorBtns = document.querySelectorAll(".creatorBtn");
const creatorInputs = document.querySelectorAll(".creatorInput");
const changeBtn = document.querySelector(".change");

// Show/hide edit inputs
creatorBtns[0].addEventListener("click", () => {
  const currentDisplay = window.getComputedStyle(creatorInputs[0]).display;
  const newDisplay = currentDisplay === "block" ? "none" : "inline-block";

  // Toggle visibility of inputs and static text
  creatorInputs.forEach((input) => {
    input.style.setProperty("display", newDisplay, "important");
  });
  document.querySelectorAll("p:not(.label)").forEach((p) => {
    p.style.display = newDisplay === "block" ? "none" : "block";
  });
});

// Initialize input values with current user data
document.getElementById("user_name_change").value = userData.name;
document.getElementById("user_email_change").value = userData.email;
document.getElementById("user_mobile_change").value = userData.telephone;
document.getElementById("user_bio_change").value = userData.bio;
document.getElementById("user_nationality_change").value = userData.nationality;
document.getElementById("user_gender_change").value = userData.roommate_gender;
document.getElementById("user_age_change").value = userData.age;

// Function to get only changed data
function getChangedData() {
  const changedData = {};

  // Check each field for changes
  const currentName = document.getElementById("user_name_change").value;
  if (currentName !== userData.name) {
    changedData.user_name_change = currentName;
  }

  const currentEmail = document.getElementById("user_email_change").value;
  if (currentEmail !== userData.email) {
    changedData.user_email_change = currentEmail;
  }

  const currentMobile = document.getElementById("user_mobile_change").value;
  if (currentMobile !== userData.telephone) {
    changedData.user_mobile_change = currentMobile;
  }

  const currentBio = document.getElementById("user_bio_change").value;
  if (currentBio !== userData.bio) {
    changedData.user_bio_change = currentBio;
  }

  const currentNationality = document.getElementById(
    "user_nationality_change"
  ).value;
  if (currentNationality !== userData.nationality) {
    changedData.user_nationality_change = currentNationality;
  }

  const currentGender = document.getElementById("user_gender_change").value;
  if (currentGender !== userData.roommate_gender) {
    changedData.user_gender_change = currentGender;
  }

  const currentAge = document.getElementById("user_age_change").value;
  if (currentAge !== userData.age) {
    changedData.user_age_change = currentAge;
  }

  return changedData;
}

// Update user data - only send changed fields
async function updateUserData() {
  const changedData = getChangedData();

  // Only proceed if there are changes
  if (Object.keys(changedData).length === 0) {
    console.log("No changes detected");
    return;
  }

  console.log("Changed data:", changedData);

  try {
    // Send update request with only changed data
    const response = await fetch(
      "https://roommates.kikvadze.com/rpc/update_user_info",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(changedData),
      }
    );

    if (response.ok) {
      const updatedUser = await response.json();

      // Update userData in session storage
      updateSessionalUserData(updatedUser.jwt);
    }
  } catch (error) {
    console.error("Update error:", error);
    alert("Failed to update profile");
  }
}

// Updates userData in session storage
function updateSessionalUserData(jwt) {
  if (jwt) {
    // Verify JWT is still valid
    fetch("https://roommates.kikvadze.com/rpc/get_user_info", {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((userData) => {
            sessionStorage.setItem("userData", JSON.stringify(userData));

            location.reload();
          });
        } else {
          // JWT expired or invalid
          localStorage.removeItem("jwt");
        }
      })
      .catch(() => {
        localStorage.removeItem("jwt");
      });
  }
}

// Change button handler
changeBtn.addEventListener("click", updateUserData);

// Delete user account and associated data
async function deleteUser() {
  try {
    const password = document.getElementById("password").value;

    // Delete user
    const response = await fetch(
      "https://roommates.kikvadze.com/rpc/delete_user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({ user_password: password }),
      }
    );

    if (!response.ok) {
      alert("Wrong password. Please try again.");
      return;
    }

    // Delete profile picture
    const responsePfp = await fetch(
      `https://roommates.kikvadze.com/upload/pfp/${userData.pfp_id}.png`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      }
    );

    // Check for existing listings
    const listingRes = await fetch(
      "https://roommates.kikvadze.com/rpc/get_listing",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({ user_id: userData.user_id }),
      }
    );

    if (listingRes.ok) {
      // Delete listing and associated data
      const apartment = await listingRes.json();
      const responseMd = await fetch(
        "https://roommates.kikvadze.com/rpc/main_delete_user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );

      // Delete listing image
      const responsePng = await fetch(
        `https://roommates.kikvadze.com/upload/listing/${apartment.png_id}.png`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );
    }

    logout();
  } catch (error) {
    console.error("Error:", error);
    alert("Deletion failed. Please try again.");
  }
}

accept.addEventListener("click", deleteUser);
