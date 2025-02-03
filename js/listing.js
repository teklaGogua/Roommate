async function handleFormSubmission(event) {
  event.preventDefault(); // Prevent the default form submission

  // Gather form data
  const formData = {
    listing_city: document.getElementById("listing_city").value,
    listing_cat: document.getElementById("listing_cat").value,
    listing_description: document.getElementById("listing_description").value,
    listing_area: parseInt(document.getElementById("listing_area").value),
    listing_bedroom_count: parseInt(
      document.getElementById("listing_bedroom_count").value
    ),
    listing_price: parseInt(document.getElementById("listing_price").value),
    listing_address: document.getElementById("listing_address").value,

    smoking: document.getElementById("smoking").value,
    pets: document.getElementById("pets").value,
    party_habits: document.getElementById("party_habits").value,
    food_preference: document.getElementById("food_preference").value,
    roommate_gender: document.getElementById("roommate_gender").value,
  };

  try {
    const response = await fetch(
      "http://94.137.160.8:13000/rpc/add_listing_temporary",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(formData),
      }
    );

    if (response.ok) {
      console.log("Listing added successfully!");

      // Redirect to index page
      window.location.href = "../index.html";
    } else {
      console.error("Error adding listing:", await response.text());
    }
  } catch (error) {
    console.error("Error sending data:", error);
  }
}

const form = document.getElementById("listing-form");
form.addEventListener("submit", handleFormSubmission);
