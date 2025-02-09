// Global Variables
const allLinks = document.querySelectorAll("a:link");
const carouselInner = document.querySelector(".carousel-inner");
const prevButtonCar = document.querySelector(".carousel-control.prev");
const nextButtonCar = document.querySelector(".carousel-control.next");
const totalItems = document.querySelectorAll(".carousel-item").length;
let currentIndex = 0;

// Displays Apartments page, if user is loged in
function checkLoginStatus() {
  const jwt = localStorage.getItem("jwt");

  if (jwt) {
    // Verify JWT is still valid
    fetch("http://94.137.160.8/rpc/get_user_info", {
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
