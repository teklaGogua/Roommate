// Fetch user and apartment data from session storage
const apartment = JSON.parse(sessionStorage.getItem("apartment"));
const userData = JSON.parse(sessionStorage.getItem("userData"));

async function getCreatorData() {
  try {
    const res = await fetch(
      "https://roommates.kikvadze.com/rpc/get_user_info",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({
          user_id: apartment.owner_id,
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch creator data");
    }

    const creatorData = await res.json();

    // Fetch profile picture
    try {
      const response = await fetch(
        `https://roommates.kikvadze.com/get/pfp/${creatorData.pfp_id}.png`,
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

const preferenceSelects = {
  smoking: document.getElementById("smoking_change"),
  pets: document.getElementById("pets_change"),
  party_habits: document.getElementById("party_habits_change"),
  food_preference: document.getElementById("food_preference_change"),
  roommate_gender: document.getElementById("roommate_gender_change"),
};

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
for (const [pref, select] of Object.entries(preferenceSelects)) {
  select.value = apartment[pref];
}

// Preferences
function displayPreferences(preference) {
  const textElement = document.getElementById(preference);
  const selectElement = preferenceSelects[preference];

  textElement.textContent = apartment[preference];
  selectElement.value = apartment[preference];

  if (apartment[preference] === "No preference") {
    return;
  }

  textElement.classList.toggle(
    "green",
    apartment[preference] === userData[preference]
  );
  textElement.classList.toggle(
    "red",
    apartment[preference] !== userData[preference]
  );
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
async function deleteListing() {
  try {
    const response = await fetch(
      "https://roommates.kikvadze.com/rpc/delete_listing",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      }
    );

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

const deleteBtn = document.querySelector(".delete");
deleteBtn.addEventListener("click", deleteListing);

// Creator btninputs, inputs, selects
const creatorBtns = document.querySelectorAll(".creatorBtn");
if (apartment.owner_id === userData.user_id) {
  creatorBtns.forEach((btn) => {
    btn.style.setProperty("display", "inline-block", "important");
  });
}

const creatorInputs = document.querySelectorAll(".creatorInput");
creatorBtns[0].addEventListener("click", () => {
  const currentDisplay = window.getComputedStyle(creatorInputs[0]).display;
  const newDisplay = currentDisplay === "block" ? "none" : "inline-block";

  creatorInputs.forEach((input) => {
    input.style.setProperty("display", newDisplay, "important");
  });
});

// Changing btn functionality
const changeBtn = document.querySelector(".change");
async function changeListingData() {
  const data = {};

  // Get all editable fields (both inputs and selects)
  const editableFields = document.querySelectorAll(`
    .creatorInput:not(.change):not(.delete),
    .editable-select
  `);

  editableFields.forEach((element) => {
    const currentValue = element.value.trim();

    // Get field identifier from ID
    const fieldKey = element.id.replace(/_change|_select/, "");

    // Get original value from apartment data
    const originalValue = apartment[fieldKey]?.toString() || "";

    // Check if value changed and not empty
    if (currentValue && currentValue !== originalValue) {
      // Convert numeric fields back to numbers
      const finalValue = ["price", "area", "bedroom_count"].includes(fieldKey)
        ? Number(currentValue)
        : currentValue;

      data[element.id] = finalValue;
    }
  });

  try {
    const res = await fetch("https://roommates.kikvadze.com/rpc/update_listing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      window.location.href = "apartments.html";
    }
  } catch {
    console.error("Error changing listing data:", error);
  }
}

changeBtn.addEventListener("click", changeListingData);
