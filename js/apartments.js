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
async function getImg(id) {
  try {
    const response = await fetch(`http://94.137.160.8/get/pfp/${id}.png`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
    });

    if (!response.ok) {
      console.log("Image not found");
      return;
    }

    const blob = await response.blob();
    const imgUrl = URL.createObjectURL(blob);
    sessionStorage.setItem("pfp", imgUrl);
    profilePic.src = imgUrl;
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

getImg(userData.pfp_id);

// Displays profile page
profileBtn.addEventListener("click", () => {
  window.location.href = "profile.html";
});

// Filter buttons' functionality
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const dropdownId = btn.getAttribute("data-dropdown");
    const dropdown = document.getElementById(`${dropdownId}-dropdown`);
    const arrowUp = btn.querySelector(".btn-up");
    const arrowDown = btn.querySelector(".btn-down");

    dropdown.classList.toggle("active-dropdown");
    arrowUp.classList.toggle("active");
    arrowDown.classList.toggle("active");

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

    filtrationState.current_page = 1;
    displayListings(filtrationState);
  });
});

// Pagination handlers management
let paginationHandlers = {
  prev: null,
  next: null,
  numbers: null,
};

// Displays listings with backend pagination
async function displayListings(filters = {}) {
  const offersContainer = document.querySelector(".offers-apartments");
  const paginationNumbers = document.querySelector(".pagination-numbers");
  const prevButton = document.querySelector(".pagination-btn.prev");
  const nextButton = document.querySelector(".pagination-btn.next");
  let currentPage = filters.current_page || 1;
  let totalPages = 0;

  // Show loading state
  offersContainer.innerHTML = '<div class="loading">Loading...</div>';

  // Remove existing listeners
  if (paginationHandlers.prev) {
    prevButton.removeEventListener("click", paginationHandlers.prev);
    nextButton.removeEventListener("click", paginationHandlers.next);
    paginationNumbers.removeEventListener("click", paginationHandlers.numbers);
  }

  function updatePaginationState() {
    const maxVisiblePages = 5;
    const halfRange = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, currentPage + halfRange);

    if (currentPage <= halfRange) {
      endPage = Math.min(totalPages, maxVisiblePages);
    } else if (currentPage + halfRange > totalPages) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    let paginationHTML = "";
    if (startPage > 1) {
      paginationHTML += `<button class="page-number" data-page="1">1</button>`;
      if (startPage > 2) paginationHTML += `<span class="ellipsis">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `<button class="page-number ${
        i === currentPage ? "active" : ""
      }" data-page="${i}">${i}</button>`;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1)
        paginationHTML += `<span class="ellipsis">...</span>`;
      paginationHTML += `<button class="page-number" data-page="${totalPages}">${totalPages}</button>`;
    }

    paginationNumbers.innerHTML = paginationHTML;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
  }

  async function displayApartments(apartments) {
    try {
      const safeApartments = apartments || [];

      const apartmentsWithImages = await Promise.all(
        safeApartments.map(async (apartment) => ({
          ...apartment,
          imgUrl: await getListingImg(apartment),
        }))
      );

      let cardsHTML = "";
      apartmentsWithImages.forEach((apartment) => {
        cardsHTML += `<div onclick="displayCard('${
          apartment.listing_id
        }')" class="offers-apartments-card">
        <img class="offers-apartments-card-img" src="${
          apartment.imgUrl || "../images/errors/default-apartment.jpg"
        }" alt="Listing Image" />
        <div class="offers-apartments-card-text">
          <h3 class="offers-apartments-card-text-price">${
            apartment.price
          } $</h3>
          <p class="offers-apartments-card-text-address">${apartment.city}</p>
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
    } catch (error) {
      console.error("Display error:", error);
      offersContainer.innerHTML = `<p class="error">Error displaying apartments: ${error.message}</p>`;
    }
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

      if (!response.ok) return "../images/errors/default-apartment.jpg";

      const blob = await response.blob();
      const imgListing = URL.createObjectURL(blob);
      sessionStorage.setItem("imgListing", imgListing);
      return imgListing;
    } catch (error) {
      console.error("Fetch error:", error);
      return "../images/errors/default-apartment.jpg";
    }
  }

  // Add fresh listeners
  paginationHandlers.prev = () => {
    if (currentPage > 1) {
      filtrationState.current_page = currentPage - 1;
      displayListings(filtrationState);
    }
  };

  paginationHandlers.next = () => {
    if (currentPage < totalPages) {
      filtrationState.current_page = currentPage + 1;
      displayListings(filtrationState);
    }
  };

  paginationHandlers.numbers = (e) => {
    if (e.target.classList.contains("page-number")) {
      const pageNumber = parseInt(e.target.dataset.page);
      filtrationState.current_page = pageNumber;
      displayListings(filtrationState);
    }
  };

  prevButton.addEventListener("click", paginationHandlers.prev);
  nextButton.addEventListener("click", paginationHandlers.next);
  paginationNumbers.addEventListener("click", paginationHandlers.numbers);

  // Fetch data with backend pagination
  try {
    const response = await fetch("http://94.137.160.8/rpc/search_listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({ ...filters, current_page: currentPage }),
    });

    if (response.ok) {
      const data = await response.json();
      totalPages = data.meta.total_pages;
      currentPage = data.meta.current_page;
      filtrationState.current_page = currentPage;

      if (data.listings && data.listings.length > 0) {
        displayApartments(data.listings);
      } else {
        offersContainer.innerHTML = `<p class="error">No apartments found matching your criteria</p>`;
        paginationNumbers.innerHTML = "";
        prevButton.disabled = true;
        nextButton.disabled = true;
      }
    }
  } catch (error) {
    console.error("Error:", error);
    offersContainer.innerHTML = `<p class="error">Error loading apartments: ${error.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  displayListings();
});

// Card display function
async function displayCard(id) {
  try {
    await fetch("http://94.137.160.8/rpc/get_listing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({ listing_id: id }),
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

// Add listing button
addListingBtn.addEventListener("click", function () {
  window.location.href = "listing.html";
});
