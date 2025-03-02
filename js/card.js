// Fetch user and apartment data from session storage
const apartment = JSON.parse(sessionStorage.getItem("apartment"));
const userData = JSON.parse(sessionStorage.getItem("userData"));

async function getCreatorData() {
  try {
    const res = await fetch("https://roommates.kikvadze.com/rpc/get_user_info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({
        user_id: apartment.owner_id,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch creator data");
    }

    const creatorData = await res.json();

    // Fetch profile picture
    try {
      const response = await fetch(
        `http://94.137.160.8/get/pfp/${creatorData.pfp_id}.png`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const imgUrl = URL.createObjectURL(blob);
        document.querySelector(".profile-pic").src = imgUrl;
      } else {
        console.log("Profile picture not found, using placeholder");
        document.querySelector(".profile-pic").src =
          "../images/errors/default-pfp.png";
      }
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      document.querySelector(".profile-pic").src =
        "../images/errors/default-pfp.png";
    }

    // Populate creator information
    document.getElementById("name").textContent = creatorData.name;
    document.getElementById("email").textContent = creatorData.email;
    document.getElementById("email").href = `mailto:${creatorData.email}`;
    document.getElementById("mobile").textContent = creatorData.telephone;
    document.getElementById("mobile").href = `tel:${creatorData.telephone}`;
  } catch (error) {
    console.error("Error in getCreatorData:", error);
  }
}
getCreatorData();

async function getListingImg() {
  try {
    const response = await fetch(
      `https://roommates.kikvadze.com/get/listing/${apartment.png_id}.png`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      }
    );

    if (response.ok) {
      const blob = await response.blob();
      const imgUrl = URL.createObjectURL(blob);
      document.querySelector(".img").src = imgUrl;
    } else {
      console.log("Profile picture not found, using placeholder");
      document.querySelector(".img").src =
        "../images/errors/default-apartment.jpg";
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return "../images/errors/default-apartment.jpg";
  }
}
getListingImg();

// Populate with apartment data
document.getElementById("price").textContent = `$${apartment.price}`;
document.getElementById("precise_address").textContent =
  apartment.precise_address;
document.getElementById("area").textContent = `${apartment.area} m²`;
document.getElementById(
  "bedroom_count"
).textContent = `${apartment.bedroom_count} bedrooms`;
document.getElementById("custom_description").textContent =
  apartment.custom_description;

// Preferences
function displayPreferences(preference) {
  document.getElementById(preference).textContent = apartment[preference];

  if (apartment[preference] === "No preference") {
    return;
  } else if (apartment[preference] === userData[preference]) {
    document.getElementById(preference).classList.add("green");
  } else if (apartment[preference] !== userData[preference]) {
    document.getElementById(preference).classList.add("red");
  }
}

displayPreferences("smoking");
displayPreferences("pets");
displayPreferences("party_habits");
displayPreferences("food_preference");
displayPreferences("roommate_gender");

// Back btn functionality
const backBtn = document.querySelector(".backBtn");

function backBtnFunc() {
  sessionStorage.removeItem("apartment");
  sessionStorage.removeItem("imgListing");
  window.location.href = "apartments.html";
}
backBtn.addEventListener("click", backBtnFunc);

// Delete btn functionality
const deleteBtn = document.querySelector(".delete");
if (apartment.owner_id === userData.user_id) {
  deleteBtn.style.display = "inline-block";
}

async function deleteListing() {
  try {
    const response = await fetch("https://roommates.kikvadze.com/rpc/delete_listing", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete listing");
    }

    // Delete Listing img
    const responsePng = await fetch(
      `https://roommates.kikvadze.com/upload/listing/${apartment.png_id}.png`,
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

    backBtnFunc();
  } catch (error) {
    console.error("Error in deleteListing:", error);
    alert("Failed to delete listing. Please try again.");
  }
}

deleteBtn.addEventListener("click", deleteListing);
