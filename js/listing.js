async function handleFormSubmission(event) {
  event.preventDefault();

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
    const response = await fetch("http://94.137.160.8:13000/rpc/add_listing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    const pngId = data.png_id;

    const file = document.getElementById("file").files[0];
    if (!file) throw new Error("No file selected");

    // Convert File object to data URL
    const imageData = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

    // Convert data URL to Blob
    function dataURLtoBlob(dataURL) {
      const arr = dataURL.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      return new Blob([u8arr], { type: mime });
    }

    const blob = dataURLtoBlob(imageData);

    // Upload the blob
    const uploadResponse = await fetch(
      `http://94.137.160.8/upload/listing/${pngId}.png`,
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

    if (response.ok) {
      window.location.href = "apartments.html";
    } else {
      console.error("Error adding listing:", await response.text());
    }
  } catch (error) {
    console.error("Error sending data:", error);
  }
}

const form = document.getElementById("listing-form");
form.addEventListener("submit", handleFormSubmission);
