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

async function deleteUser() {
  try {
    const password = document.getElementById("password").value;

    // Delete user
    const response = await fetch("http://94.137.160.8/rpc/delete_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({ user_password: password }),
    });

    if (!response.ok) {
      alert("Wrong password. Please try again.");
      return;
    }

    // Delete Pfp img
    const responsePfp = await fetch(
      `http://94.137.160.8/upload/pfp/${userData.pfp_id}.png`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      }
    );

    if (!responsePfp.ok) {
      console.log("Image not found");
      return;
    }

    // Fetch Listing if it exists
    const listingRes = await fetch("http://94.137.160.8/rpc/get_listing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({ user_id: userData.user_id }),
    });

    if (listingRes.ok) {
      const apartment = await listingRes.json();
      console.log(apartment);

      // Delete user from MD and listing
      const responseMd = await fetch(
        "http://94.137.160.8/rpc/main_delete_user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );

      if (!responseMd.ok) {
        throw new Error("Failed to delete listing");
      }

      // Delete Listing img
      const responsePng = await fetch(
        `http://94.137.160.8/upload/listing/${apartment.png_id}.png`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );

      if (!responsePng.ok) {
        throw new Error("Failed to delete image");
      }
    }

    logout();
  } catch (error) {
    console.error("Error:", error);
    alert("Delation failed. Please try again.");
  }
}

accept.addEventListener("click", deleteUser);
