// Global Variables
const filterButtons = document.querySelectorAll(
  ".offers-filtration-box-el-btn"
);
const clickBox = document.querySelectorAll(".icon-for-marking");
let previouslyClickedBtn = null;
const addListingBtn = document.getElementById("add-listing");

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

// Smooth scrolling animation
const allLinks = document.querySelectorAll("a:link");

allLinks.forEach(function (link) {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const href = link.getAttribute("href");

    // Scroll back to top
    if (href === "#")
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    // Scroll to other links
    if (href !== "#" && href.startsWith("#")) {
      const selectedEl = document.querySelector(href);
      selectedEl.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Display log in and sign up pages
document.querySelector(".loginBtn").addEventListener("click", function () {
  window.location.href = "pages/log_in.html";
});

document.querySelector(".signUpBtn").addEventListener("click", function () {
  window.location.href = "pages/sign_up1.html";
});

///////////////////////////////////////////////////////////
function checkLoginStatus() {
  const jwt = localStorage.getItem("jwt");

  const profileBtn = document.querySelector(".user-profile");
  const profileName = document.querySelector(".user-profile-name");
  const registratioBtn = document.getElementById("registrationBtn");
  const registratio = document.getElementById("registration");
  const offers = document.querySelector(".appartment-func");

  if (jwt) {
    // Verify JWT is still valid
    fetch("http://94.137.160.8:13001/rpc/get_user_info", {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((userData) => {
            sessionStorage.setItem("userData", JSON.stringify(userData));

            registratioBtn.classList.add("hidden");
            registratio.classList.add("hidden");
            profileBtn.classList.remove("hidden");
            profileName.textContent = userData.name;
            offers.classList.remove("hidden");
          });
        } else {
          // JWT expired or invalid
          localStorage.removeItem("jwt");
        }
      })
      .catch(() => {
        localStorage.removeItem("jwt");
      });
  } else {
    profileBtn.classList.add("hidden");
    registratioBtn.classList.remove("hidden");
    registratio.classList.remove("hidden");
  }

  profileBtn.addEventListener("click", () => {
    window.location.href = "pages/profile.html";
  });
}

// Run on page load
document.addEventListener("DOMContentLoaded", checkLoginStatus);

///////////////////////////////////////////////////////////

addListingBtn.addEventListener("click", function () {
  window.location.href = "pages/listing.html";
});

//////////////////////////////////////////////////////////////////
// API
const apiUrl = "https://jsonplaceholder.org/posts/";
const offersContainer = document.querySelector(".offers-apartments");
const paginationNumbers = document.querySelector(".pagination-numbers");
const prevButton = document.querySelector(".pagination-btn.prev");
const nextButton = document.querySelector(".pagination-btn.next");
const itemsPerPage = 10;
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

function displayApartments(pageNumber) {
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageApartments = allApartments.slice(startIndex, endIndex);

  let cardsHTML = "";
  pageApartments.forEach((apartment) => {
    cardsHTML += `<div onclick="displayCard()" class="offers-apartments-card">
            <img class="offers-apartments-card-img" src="${apartment.thumbnail}" alt="Property" />
            <div class="offers-apartments-card-text">
                <h3 class="offers-apartments-card-text-price">80 000 $</h3>
                <p class="offers-apartments-card-text-address">${apartment.slug}</p>
                <div class="offers-apartments-card-text-info">
                    <div class="offers-apartments-card-text-info-item">
                        <img src="images/main-page/icons/icon-bed.png" alt="icon-bed" />
                        <span>${apartment.userId}</span>
                    </div>
                    <div class="offers-apartments-card-text-info-item">
                        <img src="images/main-page/icons/icon-area.svg" alt="icon-area" />
                        <span>${apartment.userId} m²</span>
                    </div>
                    <div class="offers-apartments-card-text-info-item">
                        <img src="images/main-page/icons/icon-number.svg" alt="icon-number" />
                        <span>${apartment.userId}</span>
                    </div>
                </div>
            </div>
        </div>`;
  });

  offersContainer.innerHTML = cardsHTML;
  updatePaginationState();
}

// After clicking card display one with more info on diffrent page
function displayCard() {
  window.location.href = "pages/card.html";
}

// Event Listeners
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

// Initial fetch
fetch(apiUrl)
  .then((response) => {
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  })
  .then((apartments) => {
    allApartments = apartments;
    totalPages = Math.ceil(allApartments.length / itemsPerPage);
    displayApartments(currentPage);
  })
  .catch((error) => {
    console.error("Error:", error);
    offersContainer.innerHTML = `<p class="error">Error loading apartments: ${error.message}</p>`;
  });

// CAROUSEL
const carouselInner = document.querySelector(".carousel-inner");
const prevButtonCar = document.querySelector(".carousel-control.prev");
const nextButtonCar = document.querySelector(".carousel-control.next");
const totalItems = document.querySelectorAll(".carousel-item").length;
let currentIndex = 0;

// Function to update the carousel position
function updateCarousel() {
  const offset = -currentIndex * 100;
  carouselInner.style.transform = `translateX(${offset}%)`;
}

// Event listener for the "Next" button
nextButtonCar.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % totalItems;
  updateCarousel();
});

// Event listener for the "Previous" button
prevButtonCar.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + totalItems) % totalItems;
  updateCarousel();
});
