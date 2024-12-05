// Global Variables
const filterButtons = document.querySelectorAll(".offers-filtration-box-el-btn");
const clickBox = document.querySelectorAll(".icon-for-marking");
let previouslyClickedBtn = null;

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
      const prevDropdown = document.getElementById(`${prevDropdownId}-dropdown`);
      const prevArrowUp = previouslyClickedBtn.querySelector(".btn-up");
      const prevArrowDown = previouslyClickedBtn.querySelector(".btn-down");

      prevDropdown.classList.remove("active-dropdown");
      prevArrowUp.classList.add("active");
      prevArrowDown.classList.remove("active");
    }
    previouslyClickedBtn = btn;
    
    // Closes the dropdown when clicking outside (except dropdown list)
    const closeOnOutsideClick = (e) => {
      const excludedElements = document.querySelectorAll(".offers-filtration-box-el-dropdown");
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
clickBox.forEach(btn => btn.addEventListener("click", () => {
  const emptyBtn = btn.querySelector(".empty-icon");
  const markedBtn = btn.querySelector(".marked-icon");

  emptyBtn.classList.toggle('hidden')
  markedBtn.classList.toggle('active')
}))