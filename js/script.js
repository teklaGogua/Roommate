// Global Variables
const allLinks = document.querySelectorAll("a:link");
const carouselInner = document.querySelector(".carousel-inner");
const prevButtonCar = document.querySelector(".carousel-control.prev");
const nextButtonCar = document.querySelector(".carousel-control.next");
const totalItems = document.querySelectorAll(".carousel-item").length;
let currentIndex = 0;
const burger = document.getElementById("burger");
const navMenu = document.querySelector(".header-nav");

// Burger Menu Functionality
// Toggle mobile menu
burger.addEventListener("click", function (e) {
  e.stopPropagation();
  this.classList.toggle("active");
  navMenu.classList.toggle("active");
  document.body.classList.toggle("menu-open");
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (!navMenu.contains(e.target) && !burger.contains(e.target)) {
    burger.classList.remove("active");
    navMenu.classList.remove("active");
    document.body.classList.remove("menu-open");
  }
});

// Close menu when clicking links
document.querySelectorAll(".header-nav-list-el a").forEach((link) => {
  link.addEventListener("click", () => {
    burger.classList.remove("active");
    navMenu.classList.remove("active");
    document.body.classList.remove("menu-open");
  });
});

// Displays Apartments page, if user is loged in
function checkLoginStatus() {
  const jwt = localStorage.getItem("jwt");

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

            window.location.href = "pages/apartments.html";
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

// Run on page load
document.addEventListener("DOMContentLoaded", checkLoginStatus);

// Smooth scrolling animation
allLinks.forEach(function (link) {
  link.addEventListener("click", function (e) {
    const href = link.getAttribute("href");

    // Only handle local anchor links
    if (href.startsWith("#")) {
      e.preventDefault();

      // Scroll to top
      if (href === "#") {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        // Scroll to target element
        const selectedEl = document.querySelector(href);
        if (selectedEl) {
          selectedEl.scrollIntoView({ behavior: "smooth" });
        } else {
          // If target doesn't exist, allow default jump
          window.location.hash = href;
        }
      }
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

// CAROUSEL
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
