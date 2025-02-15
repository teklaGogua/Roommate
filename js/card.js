// Fetch user and apartment data from session storage
const apartment = JSON.parse(sessionStorage.getItem("apartment"));
const userData = JSON.parse(sessionStorage.getItem("userData"));
const imgListing = sessionStorage.getItem("imgListing");

async function getCreatorData() {
  try {
    const res = await fetch("http://94.137.160.8/rpc/get_user_info", {
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
    document.getElementById("mobile").textContent = creatorData.telephone;
  } catch (error) {
    console.error("Error in getCreatorData:", error);
  }
}
getCreatorData();

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
document.querySelector(".img").src = imgListing;

// Preferences
function displayPreferences(preference) {
  document.getElementById(preference).textContent =
    apartment[preference] || apartment[`roommate_${preference}`];

  if (apartment.preference === "No preference") {
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
displayPreferences("gender");

// Back btn functionality
const backBtn = document.querySelector(".backBtn");

function backBtnFunc() {
  sessionStorage.removeItem("apartment");
  window.location.href = "apartments.html";
}
backBtn.addEventListener("click", backBtnFunc);

// Delete btn functionality
const deleteBtn = document.querySelector(".delete");
if (apartment.owner_id === userData.user_id) {
  deleteBtn.classList.add("active");
}

async function deleteListing() {
  const response = await fetch("http://94.137.160.8/rpc/delete_listing", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
    },
  });

  backBtnFunc();

  if (!response.ok) {
    alert("U can't delete listing");
    return;
  }
}

deleteBtn.addEventListener("click", deleteListing);
