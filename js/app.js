/* =====================================================================
   API Configuration & State Management
===================================================================== */
const ACCOUNTS_API_URL =
  "https://6a1144953e35d0f37ee31c1d.mockapi.io/api/accounts/accounts";
let currentUserData = null; // Store fetched DB data globally for UI rendering

// Retrieve Session
function getCurrentUser() {
  const sessionData = localStorage.getItem("userSession");
  return sessionData ? JSON.parse(sessionData) : null;
}

// Fetch user data from the API
async function initUserData() {
  const session = getCurrentUser();
  if (!session) return false;

  try {
    const res = await fetch(`${ACCOUNTS_API_URL}/${session.id}`);
    if (res.ok) {
      currentUserData = await res.json();
      return true;
    }
  } catch (error) {
    console.error("Failed to fetch user data:", error);
  }
  return false;
}

// 💡 Helper to save newly earned XP, progress, or daily streak back to API
async function saveProgressToAPI(updatedFields) {
  const session = getCurrentUser();
  if (!session || !currentUserData) return;

  try {
    const res = await fetch(`${ACCOUNTS_API_URL}/${session.id}`, {
      method: "PUT", // Use PUT or PATCH based on your API settings
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...currentUserData, ...updatedFields }),
    });

    if (res.ok) {
      currentUserData = await res.json(); // Sync local state
      updateMainHubProgress();
      updateXpProgress();
    }
  } catch (error) {
    console.error("Failed to save progress to server:", error);
  }
}

/* =====================================================================
   Track Helpers (Now using API data instead of LocalStorage)
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

  // 💡 Safe parsing: If MockAPI returns a stringified JSON, parse it back to an object
  if (typeof progress === "string") {
    try {
      progress = JSON.parse(progress);
    } catch (e) {
      progress = {};
    }
  } else {
    progress = progress || {};
  }

  return progress[cardId] || false;
}

function getTrackCardStatus(trackName, cardId) {
  if (!currentUserData) return false;
  const key = trackName + "_progress";
  let progress = currentUserData[key];

  // 💡 Safe parsing for Main Hub tracking
  if (typeof progress === "string") {
    try {
      progress = JSON.parse(progress);
    } catch (e) {
      progress = {};
    }
  } else {
    progress = progress || {};
  }

  return progress[cardId] || false;
}

/* ===================================================================== */

// Dynamic track data selection
let currentTrackData = [];
const currentPath = window.location.pathname;

if (currentPath.includes("/esp32/")) {
  currentTrackData =
    typeof esp32JourneyData !== "undefined" ? esp32JourneyData : [];
} else if (currentPath.includes("/esp8266/")) {
  currentTrackData =
    typeof esp8266JourneyData !== "undefined" ? esp8266JourneyData : [];
} else if (currentPath.includes("/raspberry/")) {
  currentTrackData =
    typeof raspberryJourneyData !== "undefined" ? raspberryJourneyData : [];
} else {
  currentTrackData =
    typeof arduinoJourneyData !== "undefined" ? arduinoJourneyData : [];
}

// =====================================================================
// Theme Toggle
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
// Initialize theme logic immediately so that icons are correct on page load
initThemeLogic();

/* =====================================================================
   Initialization (Replaces all scattered DOMContentLoaded events)
===================================================================== */
document.addEventListener("DOMContentLoaded", async () => {
  console.log("MakerHub MM Initialized!");

  // 🚀 ကနဦးလုပ်ဆောင်ချက် - Search Logic ကို Event Listener ချိတ်ထားမယ်
  initSearchLogic();

  // 1. Fetch public items (Community & Market) ကို အရင်ဆုံး 'await' သုံးပြီး စောင့်ယူမယ်
  // ဒါမှ ဒေတာတွေ Array ထဲ အရင်ရောက်ပြီး Search က ကောက်စစ်လို့ရမှာပါ
  await fetchLiveProjects();

  // 2. Fetch user state SECOND to populate progress and XP accurately
  await initUserData();

  // 3. Render UI components based on the fetched data
  if (typeof renderLessons === "function") renderLessons();
  if (typeof updateMainHubProgress === "function") updateMainHubProgress();
  if (typeof updateHeroProgress === "function") updateHeroProgress();
  updateXpProgress();
});

/* ════════════════════════════
    Search Logic for Community & Marketplace
════════════════════════════ */
function initSearchLogic() {
  // 🚀 ပိုမိုစိတ်ချရအောင် စာမျက်နှာတစ်ခုလုံး (document) ပေါ်မှာ ရိုက်သမျှ Input Event ကို ဖမ်းမယ်
  document.addEventListener("input", (e) => {
    // ရိုက်လိုက်တဲ့ကောင်က .nav-search-input class ဖြစ်ခဲ့ရင်
    if (e.target && e.target.classList.contains("nav-search-input")) {
      const query = e.target.value.trim().toLowerCase();
      performLiveSearch(query);
    }
  });

  // Enter ခေါက်တဲ့ Keypress Event ကိုလည်း တစ်ခါတည်း ဖမ်းမယ်
  document.addEventListener("keypress", (e) => {
    if (
      e.key === "Enter" &&
      e.target &&
      e.target.classList.contains("nav-search-input")
    ) {
      e.preventDefault();
      const query = e.target.value.trim().toLowerCase();
      performLiveSearch(query);
    }
  });

  console.log("Search system hooked via Document Listener!");
}

function performLiveSearch(query) {
  console.log("Live Searching for:", query);

  // ── ၁။ ကွန်မြူနတီ (COMMUNITY) အတွက် ရှာဖွေခြင်း ────────────────
  const pContainer = document.getElementById("projectContainer");
  const hpContainer = document.getElementById("homeProjectContainer");

  if (typeof myProjects !== "undefined" && myProjects.length > 0) {
    const filteredProjects = myProjects.filter((project) => {
      // 💡 MockAPI ထဲမှာ title ရော itemName ပါ ရှိနိုင်လို့ နှစ်ခုလုံးကို Safe ဖြစ်အောင် စစ်ပါတယ်
      const title = project.title || project.itemName || "";
      const desc = project.description || project.itemdescription || "";
      const author = project.name || project.sellerName || "";

      return (
        title.toLowerCase().includes(query) ||
        desc.toLowerCase().includes(query) ||
        author.toLowerCase().includes(query)
      );
    });

    console.log("Filtered Community Projects Count:", filteredProjects.length);

    // လက်ရှိ ရောက်နေတဲ့ စာမျက်နှာအလိုက် Card တွေကို ပြန်ဆွဲခိုင်းမယ်
    if (pContainer && typeof displayProjects === "function") {
      displayProjects(filteredProjects);
    }
    if (hpContainer && typeof displayHomeProjects === "function") {
      displayHomeProjects(filteredProjects);
    }
  }

  // ── ၂။ မားကတ်ပလေ့စ် (MARKETPLACE) အတွက် ရှာဖွေခြင်း ──────────────
  const hmGrid = document.getElementById("homeMarketGrid");
  if (typeof myMarketItems !== "undefined" && myMarketItems.length > 0) {
    const filteredMarket = myMarketItems.filter((item) => {
      const name = item.itemName || "";
      const desc = item.itemdescription || "";
      const category = item.itemcategory || "";

      return (
        name.toLowerCase().includes(query) ||
        desc.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query)
      );
    });

    if (hmGrid && typeof displayHomeMarketPlace === "function") {
      displayHomeMarketPlace(filteredMarket);
    }
    if (typeof renderCards === "function") {
      renderCards(filteredMarket);
    }
  }
}

/* ════════════════════════════
   Hub & Progress Logic
════════════════════════════ */
function updateMainHubProgress() {
  const tracks = {
    arduino:
      typeof arduinoJourneyData !== "undefined" ? arduinoJourneyData : [],
    esp32: typeof esp32JourneyData !== "undefined" ? esp32JourneyData : [],
    esp8266:
      typeof esp8266JourneyData !== "undefined" ? esp8266JourneyData : [],
    raspberry:
      typeof raspberryJourneyData !== "undefined" ? raspberryJourneyData : [],
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

    // Fetches status safely using the API user data
    trackData.forEach((topic) => {
      if (getTrackCardStatus(trackName, topic.id)) {
        completedTopics++;
      }
    });

    globalTotalTopics += totalTopics;
    globalCompletedTopics += completedTopics;

    if (percentEl || fillEl) {
      const percentage =
        totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
      if (percentEl) percentEl.textContent = `${percentage}%`;
      if (fillEl)
        fillEl.style.setProperty("width", `${percentage}%`, "important");
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
    const totalPercentage =
      globalTotalTopics > 0
        ? Math.round((globalCompletedTopics / globalTotalTopics) * 100)
        : 0;
    if (totalPercentEl) totalPercentEl.textContent = `${totalPercentage}%`;
    if (totalFillEl)
      totalFillEl.style.setProperty(
        "width",
        `${totalPercentage}%`,
        "important",
      );
  }
}

function updateXpProgress() {
  const fillEl = document.getElementById("xpProgressBar");
  const xpPointsEl = document.getElementById("xpPoints");

  // 💡 Ensure we parse the API XP as a Number, not a String
  const finalTotalXP = currentUserData
    ? parseInt(currentUserData.student_total_xp || 0)
    : 0;

  if (xpPointsEl) {
    xpPointsEl.textContent = finalTotalXP.toLocaleString();
  }

  if (!fillEl) return;
  const targetXP = 10000;
  const percentage = Math.round((finalTotalXP / targetXP) * 100);

  fillEl.style.setProperty(
    "width",
    `${Math.min(percentage, 100)}%`,
    "important",
  );
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

  const percentage =
    totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  heroProgressBar.style.width = `${percentage}%`;
  heroProgressBar.setAttribute("aria-valuenow", percentage);
  heroProgressLabel.textContent = `${completedCards} / ${totalCards} done`;
}

/* ════════════════════════════
   Topic Grid & Lessons
════════════════════════════ */
const gridContainer = document.getElementById("learning-grid");

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
  // Prevent unauthorized access
  if (!getCurrentUser()) {
    alert(
      "သင်ခန်းစာများလေ့လာရန်နှင့် အမှတ်များစုဆောင်းရန် အကောင့်ဝင်ပေးပါ။ (Please log in to learn and track progress.)",
    );
    // window.location.href = "login.html"; // Optional redirection
    return;
  }

  if (!unlocked) {
    alert("အရင်သင်ခန်းစာကို အရင်ပြီးအောင် လုပ်ပေးပါ။");
    return;
  }
  window.location.href = `lessons.html?id=${id}`;
}

// ==========================================================================
// Community & Marketplace Code (Retained your exact logic)
// ==========================================================================

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
      return (
        project.category &&
        project.category.toLowerCase().trim() === selectedCategory
      );
    });
    displayProjects(filtered);
  }
}

function displayHomeProjects(projectsList) {
  const loadingIndicator = document.getElementById("loadingIndicator");
  if (loadingIndicator) loadingIndicator.classList.add("d-none");
  if (!homeProjectContainer) return;
  homeProjectContainer.innerHTML = "";

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
  const latestFour = [...projectsList].reverse().slice(0, 4);

  latestFour.forEach((item) => {
    const currentUser = getCurrentUser();
    const currentUserId = currentUser?.id ? String(currentUser.id) : null;
    const wishlistUsers = Array.isArray(item.wishlistUsers)
      ? item.wishlistUsers
      : [];

    const isSaved = currentUserId
      ? wishlistUsers.includes(currentUserId)
      : false;
    const iconClass = isSaved ? "bi-bookmark-fill text-success" : "bi-bookmark";

    const isDummy = item.itemName && item.itemName.includes("itemName");

    const finalImage =
      item.itemimage && item.itemimage.includes("http")
        ? item.itemimage
        : `https://images.unsplash.com/photo-1608564697171-2f6118fc5f37?w=500&q=80&sig=${item.id}`;

    const finalName = isDummy ? `Maker Component v${item.id}` : item.itemName;
    const finalPrice = isDummy
      ? `${(item.id * 15000).toLocaleString()} MMK`
      : item.price;
    const finalCondition = isDummy
      ? item.id % 2 === 0
        ? "New"
        : "Used"
      : item.condition;

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
    const apiProjectsUrl =
      "https://6a1144953e35d0f37ee31c1d.mockapi.io/api/accounts/accounts";

    // 1. Fetch only once (since it's the same URL)
    const res = await fetch(apiProjectsUrl);
    const allData = await res.json();

    // 2. 🛡️ FILTER: Extract ONLY the data that belongs to each section
    // Use the 'type' field we added earlier
    const filteredProjects = allData.filter(
      (item) => item.type === "community",
    );
    const filteredMarket = allData.filter((item) => item.type === "market");

    // 3. Update your variables with the CLEANED data
    myProjects = filteredProjects;
    myMarketItems = filteredMarket;

    // 4. Pass the cleaned data to your display functions
    displayProjects(myProjects);
    displayHomeProjects(myProjects);
    displayHomeMarketPlace(myMarketItems);
  } catch (error) {
    console.error("Live API မှ ဒေတာဆွဲရာတွင် အမှားအယွင်းရှိနေပါသည် -", error);
    const projectContainer = document.getElementById("projectGrid");
    if (projectContainer) {
      projectContainer.innerHTML = `
        <div class="col-12 text-center text-danger py-5">
          <i class="bi bi-exclamation-triangle-fill fs-2 d-block mb-2"></i>
          Server connection failed! Please check your internet.
        </div>`;
    }
  }
}

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
