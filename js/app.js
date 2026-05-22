/* =====================================================================
   🎯 LocalStorage Key များကို Track အလိုက် သီးသန့်ခွဲထုတ်ပေးမည့် Helpers
   (ဒါတွေက data.js ထဲက အဟောင်းတွေကို အစားထိုး အလုပ်လုပ်ပေးသွားပါမည်)
===================================================================== */
function getStorageKey() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes("/esp32/")) return "esp32_progress";
  if (path.includes("/esp8266/")) return "esp8266_progress";
  if (path.includes("/raspberry/")) return "raspberry_progress";
  return "arduino_progress"; // Default
}

function getCardStatus(cardId) {
  const key = getStorageKey();
  const progress = JSON.parse(localStorage.getItem(key)) || {};
  return progress[cardId] || false;
}

// 💡 အဓိက ပြင်ဆင်ချက် - Dashboard တွင် Track ၄ ခုလုံးကို သီးသန့်စီ မှန်ကန်စွာဖတ်ရန်
function getTrackCardStatus(trackName, cardId) {
  const key = trackName + "_progress"; // ဥပမာ- "esp32_progress"
  const progress = JSON.parse(localStorage.getItem(key)) || {};
  return progress[cardId] || false;
}

/* ===================================================================== */

// 💡 URL လမ်းကြောင်းကိုကြည့်ပြီး ဘယ် Track ဒေတာကို သုံးမလဲဆိုတာ Dynamic ဆုံးဖြတ်ခြင်း
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

// Example function to fetch dynamic data for the cards later
document.addEventListener("DOMContentLoaded", () => {
  console.log("MakerHub MM Initialized!");

  // show current xp points
  const savedXP = parseInt(localStorage.getItem("student_total_xp") ?? "0");
  const xpPointsEl = document.getElementById("xpPoints");

  if (xpPointsEl) {
    xpPointsEl.textContent = savedXP.toString().replace(".", ",");
  }
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
  const savedTheme = localStorage.getItem("theme");

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

/**
 * Main Hub ပေါ်ရှိ ပင်မကတ်ကြီး (၄) ခု၏ Progress များကို Dynamic တွက်ချက်ပြသပေးမည့် လုပ်ဆောင်ချက်
 */
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

    // 💡 အဓိက ပြင်ဆင်ချက် - Track အလိုက် သီးသန့် LocalStorage များကို ဖတ်စေခြင်း
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
    if (totalPercentEl) {
      totalPercentEl.textContent = `${totalPercentage}%`;
    }
    if (totalFillEl) {
      totalFillEl.style.setProperty(
        "width",
        `${totalPercentage}%`,
        "important",
      );
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof renderLessons === "function") {
    renderLessons();
  }
  updateMainHubProgress();
});

/* ════════════════════════════
XP Progress Bar
════════════════════════════ */
function updateXpProgress() {
  const fillEl = document.getElementById("xpProgressBar");
  if (!fillEl) return;

  const finalTotalXP = parseInt(
    localStorage.getItem("student_total_xp") ?? "0",
  );
  const targetXP = 10000;
  const percentage = Math.round((finalTotalXP / targetXP) * 100);

  fillEl.style.setProperty(
    "width",
    `${Math.min(percentage, 100)}%`,
    "important",
  );
}

document.addEventListener("DOMContentLoaded", () => {
  updateXpProgress();
});

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

document.addEventListener("DOMContentLoaded", () => {
  renderLessons();
  updateHeroProgress();
});

/* ════════════════════════════
   topic grid 
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
  if (!unlocked) {
    alert("အရင်သင်ခန်းစာကို အရင်ပြီးအောင် လုပ်ပေးပါ။");
    return;
  }
  window.location.href = `lessons.html?id=${id}`;
}

document.addEventListener("DOMContentLoaded", () => {
  renderLessons();
});

// reset all
// 🔄 Reload လုပ်လျှင် Data "အားလုံးကို" အကုန်ရှင်းလင်းမည့် စနစ် (Clear All)
document.addEventListener("DOMContentLoaded", () => {
  const navigationEntries = performance.getEntriesByType("navigation");

  if (navigationEntries.length > 0) {
    const navigationType = navigationEntries[0].type;

    if (navigationType === "reload") {
      // ၁။ XP များကို အကုန်ရှင်းလင်းမည်
      localStorage.removeItem("student_total_xp");

      // 💡 ၂။ Track အားလုံး၏ Progress များကို တစ်ပြိုင်နက်တည်း အကုန်ရှင်းလင်းမည် (Clear All Data)
      localStorage.removeItem("arduino_progress");
      localStorage.removeItem("esp32_progress");
      localStorage.removeItem("esp8266_progress");
      localStorage.removeItem("raspberry_progress");

      // ၃။ UI ပေါ်က XP တန်ဖိုးကို 0 ပြန်ထားမည်
      const xpBadge = document.getElementById("xpPoints");
      if (xpBadge) {
        xpBadge.textContent = "0";
      }

      // ၄။ Card များကို Lock အနေအထားဖြင့် အသစ်ပြန်ဆောက်မည်
      if (typeof renderLessons === "function") {
        renderLessons();
      }

      // ၅။ Main Hub ၏ Progress ကိုလည်း ပြန်လည် Refresh လုပ်မည်
      if (typeof updateMainHubProgress === "function") {
        updateMainHubProgress();
      }

      console.log(
        "🔄 Chrome Browser Reload ကြောင့် Track အားလုံးရှိ ဒေတာများကို ရှင်းလင်းပြီးပါပြီ (Clear All)။",
      );
    }
  }
});

// --------- community page--------------

// ==========================================================================
// ၁။ HTML နေရာများကို လှမ်းဖမ်းခြင်း (DOM Selection)
// ==========================================================================
const track = document.getElementById("navTrack");
const prev = document.getElementById("prevBtn");
const next = document.getElementById("nextBtn");

// Page အလိုက် Container ၂ ခုလုံးကို လှမ်းဖမ်းထားမယ်
const projectContainer = document.getElementById("projectContainer"); // Community Page အတွက်
const homeProjectContainer = document.getElementById("homeProjectContainer"); // Home Page အတွက်

// ==========================================================================
// ၂။ COMMUNITY PAGE အတွက် - ကတ်ပြားအားလုံး ဆွဲတင်ပြသမည့် စက်ရုံ (Render Function)
// ==========================================================================
function displayProjects(projectsList) {
  if (loadingIndicator) loadingIndicator.classList.add("d-none");
  if (!projectContainer) return; // ဒီနေရာမရှိရင် (ဥပမာ Home Page ဆိုရင်) အောက်ကကုဒ်တွေကို ဆက်မလုပ်ဘဲ ရပ်မယ်
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
                <img src="${project.userAvatar}" class="rounded-circle me-2 user-avatar" width="24" height="24" alt="Avatar" />
                <span class="user-name">${project.userName}</span>
              </div>
              <div class="stats-group d-flex gap-3">
                <span class="stats-icons"><i class="fa-regular fa-heart me-1 text-danger"></i> ${project.likes}</span>
                <span class="stats-icons"><i class="fa-regular fa-comment me-1"></i> ${project.comments}</span>
              </div>
            </div>
          </div>
        </div>
      </a>
    </div>
  `;
  });
}

// ==========================================================================
// ၃။ HOME PAGE အတွက် - နောက်ဆုံးပေါ် ကတ် ၃ ခုတည်းသာ ပြသမည့် စက်ရုံ
// ==========================================================================
function displayHomeProjects(projectsList) {
  if (loadingIndicator) loadingIndicator.classList.add("d-none");
  if (!homeProjectContainer) return;
  homeProjectContainer.innerHTML = "";

  const latestThree = projectsList.slice(0, 3);

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
                <img src="${project.userAvatar}" class="rounded-circle me-2 user-avatar" width="24" height="24" alt="Avatar" />
                <span class="user-name">${project.userName}</span>
              </div>
              <div class="stats-group d-flex gap-3">
                <span class="stats-icons"><i class="fa-regular fa-heart me-1 text-danger"></i> ${project.likes}</span>
                <span class="stats-icons"><i class="fa-regular fa-comment me-1"></i> ${project.comments}</span>
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

// ==========================================================================
// HOME PAGE အတွက် - နောက်ဆုံးပေါ် ကတ် ၄ ခု တင်ဆက်ပြသမည့် စနစ်
// ==========================================================================
function displayHomeMarketPlace(projectsList) {
  // Container ပုံးကို HTML ထဲက ID အသစ်အတိုင်း လှမ်းဖတ်မယ်
  const homeMarketPlaceContainer = document.getElementById("homeMarketGrid");
  const loadingIndicator = document.getElementById("marketLoading"); // ရှိရင် သုံးဖို့ပါ

  if (loadingIndicator) loadingIndicator.classList.add("d-none");
  if (!homeMarketPlaceContainer) return;

  homeMarketPlaceContainer.innerHTML = "";

  // 💡 ကတ် အရေအတွက် (၃) ခုကနေ (၄) ခုပြောင်းဖို့ slice(0, 4) လုပ်လိုက်ပါတယ်
  const latestFour = projectsList.slice(0, 4);

  latestFour.forEach((item) => {
    // Wishlist အခြေအနေကို စစ်ဆေးပြီး အစ်ကိုသုံးချင်တဲ့ text-success (အစိမ်းရောင်) သတ်မှတ်မယ်
    const isSaved = item.wishlist === true;
    const iconClass = isSaved ? "bi-bookmark-fill text-success" : "bi-bookmark";

    // 💡 API ဒေတာက "itemName 1" ဖြစ်နေရင် ဒေတာအစစ်လို လှပအောင် ပြောင်းလဲပေးမယ့် Logic
    const isDummy = item.itemName && item.itemName.includes("itemName");

    const finalImage =
      item.image && item.image.includes("http")
        ? item.image
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
      finalCategory = item.category || "Others";
    }

    const finalDesc = isDummy
      ? "Premium grade electronic hardware component for DIY engineering projects."
      : item.description;
    const finalSeller = isDummy ? `Developer ${item.id}` : item.sellerName;
    const finalAvatar = isDummy
      ? `https://ui-avatars.com/api/?name=${finalSeller}&background=random&color=fff`
      : item.sellerAvatar;

    // HTML Insert လုပ်ခြင်း
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
              <a href="market-detail/index.html?id=${item.id}" class="btn flex-grow-1 text-nowrap rounded-2 classic-btn" style="background: var(--bg-elevated, #161b22); border: 1px solid var(--border, #30363d); color: var(--text, #c9d1d9);">
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

// ==========================================================================
// ၄။ COMMUNITY PAGE အတွက် - Category ဇကာတင် စစ်ထုတ်ခြင်း (Safe Filtering Logic)
// ==========================================================================
function filterCategory(categoryName, element) {
  const allLinks = document.querySelectorAll(".category-link");
  allLinks.forEach((link) => {
    link.classList.remove("active-category");
  });

  element.classList.add("active-category");

  // 💡 စာလုံးအကြီးအသေးကြောင့် အလုပ်မလုပ်ပဲဖြစ်ခြင်းကို ကာကွယ်ရန် toLowerCase() သုံးပြီး တိုက်စစ်ခြင်း
  const selectedCategory = categoryName.toLowerCase().trim();

  if (selectedCategory === "all") {
    displayProjects(myProjects);
  } else {
    const filtered = myProjects.filter((project) => {
      // project.category ရှိမရှိ အရင်စစ်ပြီးမှ စာလုံးအသေးပြောင်းပြီး တိုက်စစ်ပါမယ်
      return (
        project.category &&
        project.category.toLowerCase().trim() === selectedCategory
      );
    });
    displayProjects(filtered);
  }
}

// ==========================================================================
// ၅။ စာမျက်နှာနှစ်ခုလုံး စဖွင့်ချင်းမှာ အလိုအလျောက် စစ်ဆေးပြီး ပတ်ပေးမည့်စနစ်
// ==========================================================================
// ၁။ API ကနေလာမည့် ဒေတာများကို သိမ်းဆည်းရန် Array အလွတ်များ
let myProjects = [];
let myMarketItems = []; // 💡 Marketplace အတွက် Array အသစ်

// 🌐 Cloud API ဆီကနေ Live ဒေတာ လှမ်းဆွဲမည့် စက်ရုံ (Async/Await Fetch)
async function fetchLiveProjects() {
  try {
    const apiProjectsUrl =
      "https://6a0e53941736097c3609b735.mockapi.io/api/v1/projects";
    const apiMarketUrl =
      "https://6a0e53941736097c3609b735.mockapi.io/api/v1/marketplace"; // 💡 Market API လမ်းကြောင်း

    // 🔗 API နှစ်ခုစလုံးကနေ ဒေတာကို တစ်ပြိုင်နက် လှမ်းဆွဲမယ် (ပိုမြန်ဆန်စေပါတယ်)
    const [resProjects, resMarket] = await Promise.all([
      fetch(apiProjectsUrl),
      fetch(apiMarketUrl),
    ]);

    // JSON ပြောင်းလဲခြင်း
    myProjects = await resProjects.json();
    myMarketItems = await resMarket.json();

    console.log("Projects ဒေတာ -", myProjects);
    console.log("Marketplace ဒေတာ -", myMarketItems);

    // 🚀 ဒေတာအသီးသီးကို သက်ဆိုင်ရာ စက်ရုံတွေဆီ မှန်ကန်စွာ ပို့ဆောင်ပေးခြင်း
    displayProjects(myProjects); // Community Page အတွက်
    displayHomeProjects(myProjects); // Home Page အတွက်

    // 💡 ကွက်တိအမှန်ကန်ဆုံး ဖြစ်သွားအောင် myMarketItems ကို ထည့်ပေးလိုက်ပါတယ်
    displayHomeMarketPlace(myMarketItems);
  } catch (error) {
    console.error("Live API မှ ဒေတာဆွဲရာတွင် အမှားအယွင်းရှိနေပါသည် -", error);
    const projectContainer = document.getElementById("projectGrid"); // အစ်ကို့ container id အတိုင်းပါ
    if (projectContainer) {
      projectContainer.innerHTML = `
        <div class="col-12 text-center text-danger py-5">
          <i class="bi bi-exclamation-triangle-fill fs-2 d-block mb-2"></i>
          Server connection failed! Please check your internet.
        </div>`;
    }
  }
}
// ၃။ စာမျက်နှာ စဖွင့်ချင်းမှာတင် Live API ကို တန်းခေါ်ခိုင်းခြင်း
document.addEventListener("DOMContentLoaded", () => {
  fetchLiveProjects();
});

// ==========================================================================
// ၆။ COMMUNITY PAGE အတွက် - ဘယ်/ညာ မြှားခလုတ်များ အလုပ်လုပ်စေမည့်စနစ် (Slider Logic)
// ==========================================================================

// Next Button (ညာဘက်မြှားခလုတ်)
if (next && track) {
  // 💡 Home Page မှာ Error မတက်အောင် ခလုတ်အမှန်တကယ် ရှိမှပဲ အလုပ်လုပ်ခိုင်းခြင်း
  next.addEventListener("click", () => {
    track.scrollBy({ left: 200, behavior: "smooth" });
  });
}

// Prev Button (ဘယ်ဘက်မြှားခလုတ်)
if (prev && track) {
  // 💡 ခလုတ်အမှန်တကယ် ရှိမှပဲ အလုပ်လုပ်ခိုင်းခြင်း
  prev.addEventListener("click", () => {
    track.scrollBy({ left: -200, behavior: "smooth" });
  });
}
