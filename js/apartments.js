// Global Variables
const filterButtons = document.querySelectorAll(
  ".offers-filtration-box-el-btn"
);
const clickBox = document.querySelectorAll(".icon-for-marking");
let previouslyClickedBtn = null;
const addListingBtn = document.getElementById("add-listing");
const filterSubmitButtons = document.querySelectorAll(
  ".offers-filtration-box-el-dropdown-btn"
);
let filtrationState = {};
const profileBtn = document.querySelector(".user-profile");
const profileName = document.querySelector(".user-profile-name");
const profilePic = document.querySelector(".user-profile-avatar");

// Setting up nav profile
const userData = JSON.parse(sessionStorage.getItem("userData"));
profileName.textContent = userData.name;

// Getting Pfp
async function getImg() {
  try {
    const response = await fetch(
      `http://94.137.160.8/get/pfp/${userData.pfp_id}.png`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      }
    );

    if (!response.ok) {
      console.log("Image not found");
      return;
    }

    const blob = await response.blob();
    const imgUrl = URL.createObjectURL(blob);
    sessionStorage.setItem("pfp", imgUrl);

    // Set image source
    profilePic.src = imgUrl;
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

getImg();

// Displays profile page
profileBtn.addEventListener("click", () => {
  window.location.href = "profile.html";
});
//

// Filter buttons' functionality
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const dropdownId = btn.getAttribute("data-dropdown");
    const dropdown = document.getElementById(`${dropdownId}-dropdown`);
    const arrowUp = btn.querySelector(".btn-up");
    const arrowDown = btn.querySelector(".btn-down");

    // Opens/closes the current dropdown and toggles arrows
    dropdown.classList.toggle("active-dropdown");
    arrowUp.classList.toggle("active");
    arrowDown.classList.toggle("active");

    // Closes the previously active dropdown and resets its arrows
    if (previouslyClickedBtn && previouslyClickedBtn !== btn) {
      const prevDropdownId = previouslyClickedBtn.getAttribute("data-dropdown");
      const prevDropdown = document.getElementById(
        `${prevDropdownId}-dropdown`
      );
      const prevArrowUp = previouslyClickedBtn.querySelector(".btn-up");
      const prevArrowDown = previouslyClickedBtn.querySelector(".btn-down");

      prevDropdown.classList.remove("active-dropdown");
      prevArrowUp.classList.add("active");
      prevArrowDown.classList.remove("active");
    }
    previouslyClickedBtn = btn;

    // Closes the dropdown when clicking outside (except dropdown list)
    const closeOnOutsideClick = (e) => {
      e.preventDefault();

      const excludedElements = document.querySelectorAll(
        ".offers-filtration-box-el-dropdown"
      );
      let isExcluded = false;

      for (const el of excludedElements) {
        if (el.contains(e.target)) {
          isExcluded = true;
          break;
        }
      }

      if (!btn.contains(e.target) && !isExcluded) {
        dropdown.classList.remove("active-dropdown");
        arrowUp.classList.add("active");
        arrowDown.classList.remove("active");
        previouslyClickedBtn = null;
        document.removeEventListener("click", closeOnOutsideClick);
      }
    };

    document.addEventListener("click", closeOnOutsideClick);
  });
});

// Checkbox buttons' functionality
clickBox.forEach((btn) =>
  btn.addEventListener("click", () => {
    const emptyBtn = btn.querySelector(".empty-icon");
    const markedBtn = btn.querySelector(".marked-icon");

    emptyBtn.classList.toggle("hidden");
    markedBtn.classList.toggle("active");
  })
);

// "Filter" button's functionality
filterSubmitButtons.forEach((filterBtn) => {
  filterBtn.addEventListener("click", () => {
    const dropdown = filterBtn.closest(".offers-filtration-box-el-dropdown");

    if (
      dropdown.id === "region-dropdown" ||
      dropdown.id === "bedroom-dropdown"
    ) {
      let filterArr = [];
      const markedIcons = dropdown.querySelectorAll(".marked-icon.active");

      markedIcons.forEach((icon) => {
        const pElement = icon
          .closest(".offers-filtration-box-el-dropdown-list-row")
          .querySelector("a");
        if (pElement) {
          let el = pElement.textContent === "3+" ? -1 : pElement.textContent;
          filterArr.push(isNaN(el) ? el : parseInt(el));
        }
      });

      // Update state only if filters are selected
      if (filterArr.length > 0) {
        if (dropdown.id === "region-dropdown") {
          filtrationState.search_city = filterArr;
        } else {
          filtrationState.search_bedrooms = filterArr;
        }
      } else {
        delete filtrationState[
          dropdown.id === "region-dropdown" ? "search_city" : "search_bedrooms"
        ];
      }
    } else if (dropdown.id === "price-dropdown") {
      const minPrice = parseInt(document.querySelector(".minPrice").value);
      const maxPrice = parseInt(document.querySelector(".maxPrice").value);

      if (!isNaN(minPrice)) {
        filtrationState.search_price_min = minPrice;
      } else {
        delete filtrationState.search_price_min;
      }

      if (!isNaN(maxPrice)) {
        filtrationState.search_price_max = maxPrice;
      } else {
        delete filtrationState.search_price_max;
      }
    } else if (dropdown.id === "area-dropdown") {
      const minArea = parseInt(document.querySelector(".minArea").value);
      const maxArea = parseInt(document.querySelector(".maxArea").value);

      if (!isNaN(minArea)) {
        filtrationState.search_area_min = minArea;
      } else {
        delete filtrationState.search_area_min;
      }

      if (!isNaN(maxArea)) {
        filtrationState.search_area_max = maxArea;
      } else {
        delete filtrationState.search_area_max;
      }
    }

    displayListings(filtrationState);
  });
});

// Displays (all or filtered) listings(cards) and pagination
async function displayListings(filters = {}) {
  const offersContainer = document.querySelector(".offers-apartments");
  const paginationNumbers = document.querySelector(".pagination-numbers");
  const prevButton = document.querySelector(".pagination-btn.prev");
  const nextButton = document.querySelector(".pagination-btn.next");
  const itemsPerPage = 8;
  let currentPage = 1;
  let totalPages = 0;
  let allApartments = [];

  function updatePaginationState() {
    // Update pagination numbers dynamically
    const maxVisiblePages = 5; // Number of page numbers to show at a time
    const halfRange = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, currentPage + halfRange);

    // Adjust start and end if we're near the beginning or end
    if (currentPage <= halfRange) {
      endPage = Math.min(totalPages, maxVisiblePages);
    } else if (currentPage + halfRange > totalPages) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    // Generate pagination buttons
    let paginationHTML = "";
    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `<button class="page-number ${
        i === currentPage ? "active" : ""
      }" data-page="${i}">${i}</button>`;
    }

    // Add ellipsis and last page if necessary
    if (endPage < totalPages) {
      paginationHTML += `<span class="ellipsis">...</span>`;
      paginationHTML += `<button class="page-number" data-page="${totalPages}">${totalPages}</button>`;
    }

    // Add first page and ellipsis if necessary
    if (startPage > 1) {
      paginationHTML =
        `<button class="page-number" data-page="1">1</button>` +
        `<span class="ellipsis">...</span>` +
        paginationHTML;
    }

    paginationNumbers.innerHTML = paginationHTML;

    // Update prev/next buttons
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
  }

  async function displayApartments(pageNumber) {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageApartments = allApartments.slice(startIndex, endIndex);

    // Preload all images first
    const apartmentsWithImages = await Promise.all(
      pageApartments.map(async (apartment) => {
        return {
          ...apartment,
          imgUrl: await getListingImg(apartment),
        };
      })
    );

    let cardsHTML = "";
    apartmentsWithImages.forEach((apartment) => {
      cardsHTML += `<div onclick="displayCard('${
        apartment.listing_id
      }')" class="offers-apartments-card">
              <img class="offers-apartments-card-img" src="${
                apartment.imgUrl || "../images/placeholder.png"
              }" alt="Listing Image" />
              <div class="offers-apartments-card-text">
                  <h3 class="offers-apartments-card-text-price">${
                    apartment.price
                  } $</h3>
                  <p class="offers-apartments-card-text-address">${
                    apartment.city
                  }</p>
                  <div class="offers-apartments-card-text-info">
                      <div class="offers-apartments-card-text-info-item">
                          <img src="../images/main-page/icons/icon-bed.png" alt="icon-bed" />
                          <span>${apartment.bedroom_count}</span>
                      </div>
                      <div class="offers-apartments-card-text-info-item">
                          <img src="../images/main-page/icons/icon-area.svg" alt="icon-area" />
                          <span>${apartment.area} m²</span>
                      </div>
                      <div class="offers-apartments-card-text-info-item">
                          <img src="../images/main-page/icons/icon-number.svg" alt="icon-number" />
                          <span>${apartment.listing_category}</span> 
                      </div>
                  </div>
              </div>
          </div>`;
    });

    offersContainer.innerHTML = cardsHTML;
    updatePaginationState();
  }

  async function getListingImg(apartment) {
    try {
      const response = await fetch(
        `http://94.137.160.8/get/listing/${apartment.png_id}.png`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );

      if (!response.ok) return "../images/image-not-found.png";

      const blob = await response.blob();
      const imgListing = URL.createObjectURL(blob);
      sessionStorage.setItem("imgListing", imgListing);
      return imgListing;
    } catch (error) {
      console.error("Fetch error:", error);
      return "../images/image-error.png";
    }
  }

  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayApartments(currentPage);
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayApartments(currentPage);
    }
  });

  paginationNumbers.addEventListener("click", (e) => {
    if (e.target.classList.contains("page-number")) {
      const pageNumber = parseInt(e.target.dataset.page);
      if (pageNumber !== currentPage) {
        currentPage = pageNumber;
        displayApartments(currentPage);
      }
    }
  });

  const filtrationData = { ...filters };

  try {
    const response = await fetch("http://94.137.160.8/rpc/search_listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify(filtrationData),
    });

    if (response.ok) {
      response.json().then((apartments) => {
        if (apartments) {
          allApartments = apartments;
          totalPages = Math.ceil(allApartments.length / itemsPerPage);
          displayApartments(currentPage);
        } else {
          offersContainer.innerHTML = `<p class="error">There are no apartments found</p>`;
        }
      });
    }
  } catch (error) {
    console.error("Error:", error);
    offersContainer.innerHTML = `<p class="error">Error loading apartments: ${error.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  displayListings();
});

// After clicking card, it will display listing with more info on diffrent page
async function displayCard(id) {
  try {
    await fetch("http://94.137.160.8/rpc/get_listing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({
        listing_id: id,
      }),
    }).then((response) => {
      if (response.ok) {
        response.json().then((apartment) => {
          sessionStorage.setItem("apartment", JSON.stringify(apartment));
        });
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }

  window.location.href = "card.html";
}

// Displays add listing page
addListingBtn.addEventListener("click", function () {
  window.location.href = "listing.html";
});
