// Example function to fetch dynamic data for the cards later
document.addEventListener("DOMContentLoaded", () => {
  console.log("MakerHub MM Initialized!");

  // Future API call example:
  // fetch('https://api.yourbackend.com/v1/user/streak')
  //   .then(response => response.json())
  //   .then(data => updateStreakUI(data))
  //   .catch(error => console.error('Error fetching data:', error));
});

// Search icon ကို နှိပ်ရင် အလုပ်လုပ်ဖို့ simple logic
document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.querySelector(".search-link");

  if (searchBtn) {
    searchBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const searchQuery = prompt("ဘာကို ရှာဖွေချင်ပါသလဲ?");
      if (searchQuery) {
        console.log("Searching for:", searchQuery);
      }
    });
  }
});

/* ════════════════════════════
   THEME
════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  const themeBtns = document.querySelectorAll(".btn-theme-toggle");

  // 👉 load saved theme
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    updateIcons(true);
  } else {
    updateIcons(false);
  }

  // 👉 click toggle
  themeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isLight = document.body.classList.toggle("light-theme");

      // save to localStorage
      localStorage.setItem("theme", isLight ? "light" : "dark");

      updateIcons(isLight);
    });
  });

  // 👉 icon updater function
  function updateIcons(isLight) {
    document.querySelectorAll(".theme-icon").forEach((icon) => {
      icon.classList.remove("bi-moon-stars-fill", "bi-sun-fill");

      if (isLight) {
        icon.classList.add("bi-sun-fill");
      } else {
        icon.classList.add("bi-moon-stars-fill");
      }
    });
  }
});

/* ════════════════════════════
   nav tabs
════════════════════════════ */
// const currentPath = window.location.pathname;
// const navLinks = document.querySelectorAll('.nav-link');

// navLinks.forEach(link => {
//     link.classList.remove('active');
    
//     const linkPath = link.getAttribute('href');
    
//     if (currentPath === '/' || currentPath.endsWith('index.html')) {
//         if (linkPath === '#' || linkPath.endsWith('index.html')) {
//             if (!linkPath.includes('/Learning/')) {
//                 link.classList.add('active');
//             }
//         }
//     } 
    
//     if (linkPath !== '#' && currentPath.includes(linkPath)) {
//         link.classList.add('active');
//     }
// });
