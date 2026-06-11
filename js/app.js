/* =====================================================================
   API Configuration & State Management
   // We store our API link and the current user data here so any function can use them.
===================================================================== */
const ACCOUNTS_API_URL = "https://6a1144953e35d0f37ee31c1d.mockapi.io/api/accounts/accounts";
let currentUserData = null; // Stores fetched DB data globally for UI rendering

// Get the logged-in user's session from the browser's local storage
function getCurrentUser() {
  const sessionData = localStorage.getItem("userSession");
  return sessionData ? JSON.parse(sessionData) : null;
}

// Fetch user data from the API
async function initUserData() {
  // Prevent infinite redirect loops on login or register pages
  if (
    window.location.pathname.includes("login.html") ||
    window.location.pathname.includes("register.html")
  ) {
    return false;
  }

  const session = getCurrentUser();
  if (!session) return false;

  try {
    const res = await fetch(`${ACCOUNTS_API_URL}/${session.id}`);

    // Check if the admin deleted the user account (API returns 404 Not Found)
    if (res.status === 404) {
      alert("🔒 Your account has been removed or deactivated by the administrator. You will be logged out automatically.");
      // Clear the local session token and force redirect to login page
      localStorage.removeItem("userSession");
      window.location.href = "login.html";
      return false;
    }

    if (res.ok) {
      currentUserData = await res.json();
      return true;
    }
  } catch (error) {
    console.error("Failed to fetch user data:", error);
  }
  return false;
}

// Helper to save newly earned XP, progress, or daily streak back to API
async function saveProgressToAPI(updatedFields) {
  const session = getCurrentUser();
  if (!session || !currentUserData) return;

  try {
    const res = await fetch(`${ACCOUNTS_API_URL}/${session.id}`, {
      method: "PUT", // Updating the specific user's data
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...currentUserData, ...updatedFields }),
    });

    if (res.ok) {
      currentUserData = await res.json(); // Sync local state with the newly saved data
      updateMainHubProgress();
      updateXpProgress();
    }
  } catch (error) {
    console.error("Failed to save progress to server:", error);
  }
}

/* =====================================================================
   Daily Streak Logic
   // Checks if the user logged in today, yesterday, or missed a day.
===================================================================== */
async function checkAndUpdateStreak() {
  // If no user is logged in, we don't need to run this
  if (!currentUserData) return;

  // Step 1: Create date strings for Today and Yesterday (Format: YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0]; 
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1); // Subtract 1 day
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Step 2: Get current streak from the API data (make sure it's a number)
  let currentStreak = parseInt(currentUserData.daily_streak) || 0;
  let lastStreakDate = currentUserData.last_streak_date;
  let needToUpdate = false;

  // Step 3: Check the dates and apply the streak logic
  if (lastStreakDate === todayStr) {
    // Condition A: User already visited today. Do nothing.
    console.log("Daily streak is already updated for today.");
  } 
  else if (lastStreakDate === yesterdayStr) {
    // Condition B: User visited yesterday and came back today. Add 1!
    currentStreak += 1;
    needToUpdate = true;
  } 
  else {
    // Condition C: Fake data (like '59'), or the user missed days. Restart at 1.
    currentStreak = 1;
    needToUpdate = true;
  }

  // Step 4: If the streak changed, save it to the API
  if (needToUpdate) {
    await saveProgressToAPI({
      daily_streak: currentStreak,
      last_streak_date: todayStr // Replace old data with today's real date
    });
    console.log(`Streak updated to ${currentStreak} days!`);
  }

  // Step 5: Show the correct number on the HTML page
  const streakEl = document.getElementById("streak-count");
  if (streakEl) {
    // Always show the most accurate global data
    const finalStreak = currentUserData.daily_streak || currentStreak;
    streakEl.textContent = `${finalStreak} Days`;
  }
}

// Highlight the correct day box (Mon, Tue, Wed...) based on today's date
function highlightTodayBox() {
  const jsDay = new Date().getDay(); // Sunday is 0, Monday is 1, etc.
  let targetIndex;

  // Adjust JS days to match our HTML which starts on Monday (index 0)
  if (jsDay === 0) {
    targetIndex = 6; // Sunday
  } else {
    targetIndex = jsDay - 1; // Monday to Saturday
  }

  const todayBox = document.getElementById(`day-${targetIndex}`);

  // If the box exists, make it green and add a blinking animation
  if (todayBox) {
    todayBox.style.background = "#22c55e"; 
    todayBox.style.animation = "fade 2s infinite"; 
  }
}
document.addEventListener("DOMContentLoaded", highlightTodayBox);

/* =====================================================================
    Homepage Stats Initialization 
    // Fetches total learners, projects, and market items for the counter
===================================================================== */
async function initHomepageStats() {
  // Default fallback numbers in case the API is slow or offline
  let learnersTarget = 0;
  let projectsTarget = 0;
  let saleItemsTarget = 0;
  const boardsTarget = 4; // Static data
  const ratingTarget = 4.9; // Static data

  try {
    const response = await fetch(ACCOUNTS_API_URL);
    if (!response.ok) throw new Error("Database connection failed.");

    const allData = await response.json();

    // Filter data to count how many of each type we have
    const projects = allData.filter((item) => item.type === "community");
    const marketItems = allData.filter((item) => item.type === "market");
    const users = allData.filter(
      (item) => item.type !== "community" && item.type !== "market"
    );

    // Set the target numbers based on real API lengths
    learnersTarget = users.length;
    projectsTarget = projects.length;
    saleItemsTarget = marketItems.length;
  } catch (error) {
    console.error("Failed to load real-time stats, using fallback numbers:", error);
    // Dummy data if offline
    learnersTarget = 14;
    projectsTarget = 8;
    saleItemsTarget = 5;
  } finally {
    // Run the count-up animation for all stats at the same time
    animateStatCounter("statLearners", learnersTarget, "+");
    animateStatCounter("statProjects", projectsTarget, "+");
    animateStatCounter("statSaleItems", saleItemsTarget, "+");
    animateStatCounter("statBoards", boardsTarget, "");
    animateStatCounter("statRating", ratingTarget, ` <i class="bi bi-star-fill text-warning"></i>`, true);
  }
}

// Function to make numbers tick up smoothly (Ease-Out Animation)
function animateStatCounter(elementId, targetValue, appendStr = "", isDecimal = false) {
  const element = document.getElementById(elementId);
  if (!element) return;

  let startValue = 0;
  const duration = 1500; // 1.5 seconds total
  const fps = 60;
  const totalSteps = Math.round(duration / (1000 / fps));
  let currentStep = 0;

  const timer = setInterval(() => {
    currentStep++;
    // Math to make the counter slow down as it gets closer to the target
    const progress = currentStep / totalSteps;
    const easeOutProgress = 1 - Math.pow(1 - progress, 3);
    startValue = easeOutProgress * targetValue;

    if (currentStep >= totalSteps) {
      element.innerHTML = isDecimal
        ? targetValue.toFixed(1) + appendStr
        : Math.round(targetValue).toLocaleString() + appendStr;
      clearInterval(timer); // Stop the loop
    } else {
      element.innerHTML = isDecimal
        ? startValue.toFixed(1) + appendStr
        : Math.round(startValue).toLocaleString() + appendStr;
    }
  }, 1000 / fps);
}
document.addEventListener("DOMContentLoaded", initHomepageStats);

/* =====================================================================
   Learning Track Helpers
   // Helps figure out which electronics track (ESP32, Arduino, etc.) the user is on
===================================================================== */
function getStorageKey() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes("/esp32/")) return "esp32_progress";
  if (path.includes("/esp8266/")) return "esp8266_progress";
  if (path.includes("/raspberry/")) return "raspberry_progress";
  return "arduino_progress"; // Default
}

function getCardStatus(cardId) {
  if (!currentUserData) return false;
  const key = getStorageKey();
  let progress = currentUserData[key];

  // Safe parsing in case the API returned a string instead of a JSON object
  if (typeof progress === "string") {
    try { progress = JSON.parse(progress); } catch (e) { progress = {}; }
  } else {
    progress = progress || {};
  }
  return progress[cardId] || false;
}

function getTrackCardStatus(trackName, cardId) {
  if (!currentUserData) return false;
  const key = trackName + "_progress";
  let progress = currentUserData[key];

  if (typeof progress === "string") {
    try { progress = JSON.parse(progress); } catch (e) { progress = {}; }
  } else {
    progress = progress || {};
  }
  return progress[cardId] || false;
}

// Select the correct curriculum data array based on the current page URL
let currentTrackData = [];
const currentPath = window.location.pathname;

if (currentPath.includes("/esp32/")) {
  currentTrackData = typeof esp32JourneyData !== "undefined" ? esp32JourneyData : [];
} else if (currentPath.includes("/esp8266/")) {
  currentTrackData = typeof esp8266JourneyData !== "undefined" ? esp8266JourneyData : [];
} else if (currentPath.includes("/raspberry/")) {
  currentTrackData = typeof raspberryJourneyData !== "undefined" ? raspberryJourneyData : [];
} else {
  currentTrackData = typeof arduinoJourneyData !== "undefined" ? arduinoJourneyData : [];
}

/* =====================================================================
   Theme Toggle (Light / Dark Mode)
===================================================================== */
function initThemeLogic() {
  const themeBtns = document.querySelectorAll(".btn-theme-toggle");
  const savedTheme = localStorage.getItem("theme");

  function updateIcons(isLight) {
    document.querySelectorAll(".theme-icon").forEach((icon) => {
      icon.classList.remove("bi-sun-fill", "bi-moon-stars-fill");
      if (isLight) icon.classList.add("bi-moon-stars-fill");
      else icon.classList.add("bi-sun-fill");
    });
  }

  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    updateIcons(true);
  } else {
    updateIcons(false);
  }

  themeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isLight = document.body.classList.toggle("light-theme");
      localStorage.setItem("theme", isLight ? "light" : "dark");
      updateIcons(isLight);
    });
  });
}
initThemeLogic();

/* =====================================================================
   Initialization Block (Runs when the webpage fully loads)
   // This is the brain that calls everything in the correct order.
===================================================================== */
document.addEventListener("DOMContentLoaded", async () => {
  console.log("MakerHub App Initialized!");

  // Step 1: Hook up the search bar events
  initSearchLogic();

  // Step 2: Fetch community and market items so users can search them
  await fetchLiveProjects();

  // Step 3: Fetch the logged-in user data
  await initUserData();

  // Step 4: Now that we have user data, calculate and update their streak!
  if (currentUserData) {
    await checkAndUpdateStreak();
  }

  // Step 5: Render all the learning cards and progress bars
  if (typeof renderLessons === "function") renderLessons();
  if (typeof updateMainHubProgress === "function") updateMainHubProgress();
  if (typeof updateHeroProgress === "function") updateHeroProgress();
  updateXpProgress();
});

/* =====================================================================
   Search Logic for Community & Marketplace
===================================================================== */
function initSearchLogic() {
  // Listen for user typing anywhere in the document
  document.addEventListener("input", (e) => {
    if (e.target && e.target.classList.contains("nav-search-input")) {
      const query = e.target.value.trim().toLowerCase();
      performLiveSearch(query);
    }
  });

  // Listen for the Enter key
  document.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && e.target && e.target.classList.contains("nav-search-input")) {
      e.preventDefault();
      const query = e.target.value.trim().toLowerCase();
      performLiveSearch(query);
    }
  });
}

function performLiveSearch(query) {
  const dropdown = document.getElementById("globalSearchDropdown");
  if (!dropdown) return;

  // Hide dropdown if search is empty
  if (!query || query.length < 1) {
    dropdown.classList.add("d-none");
    dropdown.innerHTML = "";
    return;
  }

  let htmlResults = "";
  let matchCount = 0;

  // Search through Community Projects
  if (typeof myProjects !== "undefined" && myProjects.length > 0) {
    const matchedProjects = myProjects.filter((p) => {
      const title = p.title || p.itemName || "";
      return title.toLowerCase().includes(query);
    });

    matchedProjects.forEach((p) => {
      matchCount++;
      htmlResults += `
        <a href="/community/project-detail.html?id=${p.id}" class="search-item-link">
          <div class="text-truncate me-2">
            <i class="bi bi-cpu me-2 text-info"></i> ${p.title || p.itemName}
          </div>
          <span class="badge bg-info-subtle text-info small">Project</span>
        </a>
      `;
    });
  }

  // Search through Marketplace Items
  if (typeof myMarketItems !== "undefined" && myMarketItems.length > 0) {
    const matchedMarket = myMarketItems.filter((item) => {
      const name = item.itemName || "";
      return name.toLowerCase().includes(query);
    });

    matchedMarket.forEach((item) => {
      matchCount++;
      const isDummy = item.itemName && item.itemName.includes("itemName");
      const finalName = isDummy ? `Maker Component v${item.id}` : item.itemName;

      htmlResults += `
        <a href="/marketplace/market-detail/index.html?id=${item.id}" class="search-item-link">
          <div class="text-truncate me-2">
            <i class="bi bi-cart3 me-2 text-success"></i> ${finalName}
          </div>
          <span class="badge bg-success-subtle text-success small">Market</span>
        </a>
      `;
    });
  }

  // Show the results in the UI
  if (matchCount > 0) {
    dropdown.innerHTML = htmlResults;
    dropdown.classList.remove("d-none");
  } else {
    dropdown.innerHTML = `<div class="p-3 text-muted text-center small">No matches found for "${query}"</div>`;
    dropdown.classList.remove("d-none");
  }
}

// Close the dropdown if the user clicks outside of it
document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("globalSearchDropdown");
  if (dropdown && !e.target.classList.contains("nav-search-input")) {
    dropdown.classList.add("d-none");
  }
});

/* =====================================================================
   Learning Hub & Progress Bar Logic
===================================================================== */
function updateMainHubProgress() {
  const tracks = {
    arduino: typeof arduinoJourneyData !== "undefined" ? arduinoJourneyData : [],
    esp32: typeof esp32JourneyData !== "undefined" ? esp32JourneyData : [],
    esp8266: typeof esp8266JourneyData !== "undefined" ? esp8266JourneyData : [],
    raspberry: typeof raspberryJourneyData !== "undefined" ? raspberryJourneyData : [],
  };

  let globalTotalTopics = 0;
  let globalCompletedTopics = 0;

  Object.keys(tracks).forEach((trackName) => {
    const trackData = tracks[trackName];

    const percentEl = document.getElementById(`${trackName}-percent`);
    const fillEl = document.getElementById(`${trackName}-fill`);
    const lessonCountEl = document.getElementById(`${trackName}-lessons-count`);
    const xpCountEl = document.getElementById(`${trackName}-xp-count`);

    const totalTopics = trackData.length;
    let completedTopics = 0;
    let totalLessonsInTrack = 0;
    let totalXpInTrack = 0;

    trackData.forEach((card) => {
      if (card.lessons) {
        totalLessonsInTrack += card.lessons.length;
        card.lessons.forEach((lesson) => {
          totalXpInTrack += lesson.xp || 0;
        });
      }
    });

    trackData.forEach((topic) => {
      if (getTrackCardStatus(trackName, topic.id)) {
        completedTopics++;
      }
    });

    globalTotalTopics += totalTopics;
    globalCompletedTopics += completedTopics;

    if (percentEl || fillEl) {
      const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
      if (percentEl) percentEl.textContent = `${percentage}%`;
      if (fillEl) fillEl.style.setProperty("width", `${percentage}%`, "important");
    }

    if (lessonCountEl) {
      lessonCountEl.textContent = `${totalLessonsInTrack} lessons`;
    }

    if (xpCountEl) {
      xpCountEl.textContent = `${totalXpInTrack} XP`;
    }
  });

  const totalPercentEl = document.getElementById("total-journey-percent");
  const totalFillEl = document.getElementById("total-journey-fill");

  if (totalPercentEl || totalFillEl) {
    const totalPercentage = globalTotalTopics > 0 ? Math.round((globalCompletedTopics / globalTotalTopics) * 100) : 0;
    if (totalPercentEl) totalPercentEl.textContent = `${totalPercentage}%`;
    if (totalFillEl) totalFillEl.style.setProperty("width", `${totalPercentage}%`, "important");
  }
}

function updateXpProgress() {
  const fillEl = document.getElementById("xpProgressBar");
  const xpPointsEl = document.getElementById("xpPoints");

  // Make sure we parse the API XP as a Number
  const finalTotalXP = currentUserData ? parseInt(currentUserData.student_total_xp || 0) : 0;

  if (xpPointsEl) {
    xpPointsEl.textContent = finalTotalXP.toLocaleString();
  }

  if (!fillEl) return;
  const targetXP = 10000;
  const percentage = Math.round((finalTotalXP / targetXP) * 100);

  fillEl.style.setProperty("width", `${Math.min(percentage, 100)}%`, "important");
}

function updateHeroProgress() {
  const heroProgressBar = document.getElementById("hero-progress-bar");
  const heroProgressLabel = document.getElementById("main-progress-label");

  if (!heroProgressBar || !heroProgressLabel) return;

  const totalCards = currentTrackData.length;
  let completedCards = 0;

  currentTrackData.forEach((card) => {
    if (getCardStatus(card.id)) {
      completedCards++;
    }
  });

  const percentage = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  heroProgressBar.style.width = `${percentage}%`;
  heroProgressBar.setAttribute("aria-valuenow", percentage);
  heroProgressLabel.textContent = `${completedCards} / ${totalCards} done`;
}

/* =====================================================================
   Topic Grid & Lessons Rendering
===================================================================== */
const gridContainer = document.getElementById("learning-grid");

// Check if a card is unlocked (either it's the first card, or the previous one is done)
function getCardContentStatus(lesson, index) {
  const isCompleted = getCardStatus(lesson.id);
  let isUnlocked = index === 0;

  if (index > 0) {
    const prevCardId = currentTrackData[index - 1].id;
    isUnlocked = getCardStatus(prevCardId);
  }

  return {
    isUnlocked: isUnlocked,
    isCompleted: isCompleted,
    statusIcon: isUnlocked ? (isCompleted ? "✅" : "▶️") : "🔒",
    statusText: isUnlocked ? (isCompleted ? "Done" : "Start") : "Locked",
    cardClass: isUnlocked ? "unlocked" : "locked",
  };
}

function renderLessons() {
  if (!gridContainer) return;
  gridContainer.innerHTML = "";

  currentTrackData.forEach((lesson, index) => {
    const status = getCardContentStatus(lesson, index);

    const col = document.createElement("div");
    col.className = "col";

    col.innerHTML = `
      <div class="course-card h-100 ${status.cardClass}" 
           onclick="startLesson('${lesson.id}', ${status.isUnlocked})">
          
          <div class="status-icon">
              ${status.statusIcon}
          </div>
          
          <div class="card-img-box">
               <i class="${lesson.icon}"></i> 
          </div>

          <div class="card-info">
              <span class="lesson-num">${String(index + 1).padStart(2, "0")}</span>
              <h6 class="lesson-title">${lesson.title}</h6>
              
              <div class="lesson-footer">
                  <span><i class="bi bi-clock"></i> ${lesson.time}</span>
                  <span class="${status.isCompleted ? "text-success" : ""}">
                      ${status.statusText}
                  </span>
              </div>
          </div>
      </div>
    `;
    gridContainer.appendChild(col);
  });
}

function startLesson(id, unlocked) {
  if (!getCurrentUser()) {
    alert("Please log in to study lessons and collect experience points (XP).");
    return;
  }

  if (!unlocked) {
    alert("Please complete the previous lesson first before starting this one!");
    return;
  }
  window.location.href = `lessons.html?id=${id}`;
}

/* ==========================================================================
   Community & Marketplace Features
========================================================================== */
const track = document.getElementById("navTrack");
const prev = document.getElementById("prevBtn");
const next = document.getElementById("nextBtn");
const projectContainer = document.getElementById("projectContainer");
const homeProjectContainer = document.getElementById("homeProjectContainer");

function displayProjects(projectsList) {
  const loadingIndicator = document.getElementById("loadingIndicator");
  if (loadingIndicator) loadingIndicator.classList.add("d-none");
  if (!projectContainer) return;
  projectContainer.innerHTML = "";

  if (projectsList.length === 0) {
    projectContainer.innerHTML = `<div class="col-12 text-muted text-center py-5">No projects found here yet!</div>`;
    return;
  }

  projectsList.forEach((project) => {
    projectContainer.innerHTML += `
    <div class="col">
      <a href="project-detail.html?id=${project.id}" class="text-decoration-none text-dark">
        <div class="showcase-card">
          <div class="post-img-container">
            <img src="${project.image}" class="showcase-img" alt="Project" />
          </div>
          <div class="card-content p-3 d-flex flex-column flex-grow-1">
            <h5 class="project-title mb-1">${project.title}</h5>
            <p class="project-desc mb-3">${project.description}</p>
            
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <div class="d-flex align-items-center">
                <img src="${project.avatar || "https://via.placeholder.com/40"}" class="rounded-circle me-2 user-avatar" width="24" height="24" alt="Avatar" />
                <span class="user-name">${project.name}</span>
              </div>
              <div class="stats-group d-flex gap-3">
                <span class="stats-icons"><i class="fa-regular fa-heart me-1 text-danger"></i> ${project.likes}</span>
                <span class="stats-icons"><i class="fa-regular fa-comment me-1"></i> ${project.comments || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </a>
    </div>
  `;
  });
}

function filterCategory(categoryName, element) {
  const allLinks = document.querySelectorAll(".category-link");
  allLinks.forEach((link) => {
    link.classList.remove("active-category");
  });

  element.classList.add("active-category");
  const selectedCategory = categoryName.toLowerCase().trim();

  if (selectedCategory === "all") {
    displayProjects(myProjects);
  } else {
    const filtered = myProjects.filter((project) => {
      return (project.category && project.category.toLowerCase().trim() === selectedCategory);
    });
    displayProjects(filtered);
  }
}

function displayHomeProjects(projectsList) {
  const loadingIndicator = document.getElementById("loadingIndicator");
  if (loadingIndicator) loadingIndicator.classList.add("d-none");
  if (!homeProjectContainer) return;
  homeProjectContainer.innerHTML = "";

  // Show only the 3 newest projects
  const latestThree = [...projectsList].reverse().slice(0, 3);

  latestThree.forEach((project) => {
    homeProjectContainer.innerHTML += `
      <div class="col">
          <a href="community/project-detail.html?id=${project.id}" class="text-decoration-none text-dark">
            <div class="showcase-card">
          <div class="post-img-container">
            <img src="${project.image}" class="showcase-img" alt="Project" />
          </div>
          <div class="card-content p-3 d-flex flex-column flex-grow-1">
            <h5 class="project-title mb-1">${project.title}</h5>
            <p class="project-desc mb-3">${project.description}</p>
            
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <div class="d-flex align-items-center">
                <img src="${project.avatar}" class="rounded-circle me-2 user-avatar" width="24" height="24" alt="Avatar" />
                <span class="user-name">${project.name}</span>
              </div>
              <div class="stats-group d-flex gap-3">
                <span class="stats-icons"><i class="fa-regular fa-heart me-1 text-danger"></i> ${project.likes}</span>
                <span class="stats-icons"><i class="fa-regular fa-comment me-1"></i> ${project.comments || 0}</span>
              </div>
            </div>
          </div>
        </div>
          </a>
        </div>
      </div>
    `;
  });
}

function displayHomeMarketPlace(projectsList) {
  const homeMarketPlaceContainer = document.getElementById("homeMarketGrid");
  const loadingIndicator = document.getElementById("marketLoading");
  const homeMarketLoading = document.getElementById("homeMarketLoading");

  if (loadingIndicator) loadingIndicator.classList.add("d-none");
  if (homeMarketLoading) homeMarketLoading.classList.add("d-none");
  if (!homeMarketPlaceContainer) return;

  homeMarketPlaceContainer.innerHTML = "";
  // Show only the 4 newest items
  const latestFour = [...projectsList].reverse().slice(0, 4);

  latestFour.forEach((item) => {
    const currentUser = getCurrentUser();
    const currentUserId = currentUser?.id ? String(currentUser.id) : null;
    const wishlistUsers = Array.isArray(item.wishlistUsers) ? item.wishlistUsers : [];

    const isSaved = currentUserId ? wishlistUsers.includes(currentUserId) : false;
    const iconClass = isSaved ? "bi-bookmark-fill text-success" : "bi-bookmark";

    const isDummy = item.itemName && item.itemName.includes("itemName");
    const finalImage = item.itemimage && item.itemimage.includes("http")
        ? item.itemimage
        : `https://images.unsplash.com/photo-1608564697171-2f6118fc5f37?w=500&q=80&sig=${item.id}`;

    const finalName = isDummy ? `Maker Component v${item.id}` : item.itemName;
    const finalPrice = isDummy ? `${(item.id * 15000).toLocaleString()} MMK` : item.price;
    const finalCondition = isDummy ? (item.id % 2 === 0 ? "New" : "Used") : item.condition;

    let finalCategory = "";
    if (isDummy) {
      const remainder = (Number(item.id) || 0) % 4;
      if (remainder === 0) finalCategory = "Microcontrollers";
      else if (remainder === 1) finalCategory = "Sensors";
      else if (remainder === 2) finalCategory = "Motors";
      else finalCategory = "Displays";
    } else {
      finalCategory = item.itemcategory || "Others";
    }

    const finalDesc = isDummy
      ? "Premium grade electronic hardware component for DIY engineering projects."
      : item.itemdescription;
    const finalSeller = isDummy ? `Developer ${item.id}` : item.sellerName;
    const finalAvatar = isDummy
      ? `https://ui-avatars.com/api/?name=${finalSeller}&background=random&color=fff`
      : item.sellerAvatar;

    homeMarketPlaceContainer.innerHTML += `
      <div class="col d-flex justify-content-center" id="market-item-${item.id}">
        <div class="classic-market-card h-100 d-flex flex-column shadow-sm border rounded-3 w-100">
          
          <div class="card-img-wrapper position-relative" style="height: 180px; background: #0d1117; overflow: hidden;">
            <img src="${finalImage}" alt="${finalName}" class="w-100 h-100 object-fit-cover"
                 onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1608564697171-2f6118fc5f37?w=500';">
            <span class="condition-badge position-absolute top-0 end-0 m-2 badge bg-dark border">${finalCondition}</span>
          </div>

          <div class="p-3 d-flex flex-column flex-grow-1" style="background: var(--surface, #11161d);">
            
            <span class="classic-category" style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">
              <i class="bi bi-tag-fill me-1"></i> ${finalCategory}
            </span>

            <h6 class="card-title text-truncate mb-1 fw-bold classic-title" title="${finalName}" style="color: var(--text, #fff); margin-top: 4px;">
              ${finalName}
            </h6>
            
            <div class="price-tag mb-2 classic-price" style="color: var(--neon-green, #22c55e); font-weight: bold; font-size: 1.1rem;">${finalPrice}</div>
            
            <p class="text-muted small mb-3 text-truncate-2 classic-desc" style="font-size: 0.8rem; height: 2.4rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
              ${finalDesc}
            </p>

            <div class="seller-info d-flex align-items-center gap-2 mb-3 pt-2 classic-seller-box" style="border-top: 1px solid rgba(240,246,252,0.06); margin-top: auto;">
              <img src="${finalAvatar}" class="rounded-circle classic-avatar" style="width:24px; height:24px;" alt="Seller">
              <span class="small text-truncate classic-seller-name" style="color: var(--text-muted); max-width: 120px; font-size: 0.8rem;">${finalSeller}</span>
            </div>

            <div class="d-flex gap-2">
              <a href="/marketplace/market-detail/index.html?id=${item.id}" class="btn flex-grow-1 text-nowrap rounded-2 classic-btn" style="background: var(--bg-elevated, #161b22); border: 1px solid var(--border, #30363d); color: var(--text, #c9d1d9);">
                <i class="bi bi-telephone me-1"></i> View
              </a>
              <button class="btn rounded-2 classic-btn" id="saveBtn-${item.id}" onclick="toggleWishlist('${item.id}')" style="background: var(--bg-elevated, #161b22); border: 1px solid var(--border, #30363d); color: var(--text, #c9d1d9);">
                <i class="bi ${iconClass}" id="bookmarkIcon-${item.id}"></i>
              </button>
            </div>

          </div>
        </div>
      </div>
    `;
  });
}

let myProjects = [];
let myMarketItems = [];

async function fetchLiveProjects() {
  try {
    const apiProjectsUrl = "https://6a1144953e35d0f37ee31c1d.mockapi.io/api/accounts/accounts";

    const res = await fetch(apiProjectsUrl);
    const allData = await res.json();

    // Filter by type: Extract ONLY the community projects and market items
    const filteredProjects = allData.filter((item) => item.type === "community");
    const filteredMarket = allData.filter((item) => item.type === "market");

    myProjects = filteredProjects;
    myMarketItems = filteredMarket;

    // Pass the clean data to be displayed on screen
    displayProjects(myProjects);
    displayHomeProjects(myProjects);
    displayHomeMarketPlace(myMarketItems);
  } catch (error) {
    console.error("Error fetching live API data:", error);
    const projectContainer = document.getElementById("projectGrid");
    if (projectContainer) {
      projectContainer.innerHTML = `
        <div class="col-12 text-center text-danger py-5">
          <i class="bi bi-exclamation-triangle-fill fs-2 d-block mb-2"></i>
          Server connection failed! Please check your internet connection.
        </div>`;
    }
  }
}

// Side-scroll buttons for categories
if (next && track) {
  next.addEventListener("click", () => {
    track.scrollBy({ left: 200, behavior: "smooth" });
  });
}

if (prev && track) {
  prev.addEventListener("click", () => {
    track.scrollBy({ left: -200, behavior: "smooth" });
  });
}