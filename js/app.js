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

    // 💡 အဓိက ပြင်ဆင်ချက် - Track အလိုက် သီးသန့် LocalStorage များကို ဖတ်စေခြင်း
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
    if (totalPercentEl) {
      totalPercentEl.textContent = `${totalPercentage}%`;
    }
    if (totalFillEl) {
      totalFillEl.style.setProperty("width", `${totalPercentage}%`, "important");
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

  const finalTotalXP = parseInt(localStorage.getItem("student_total_xp") ?? "0");
  const targetXP = 10000;
  const percentage = Math.round((finalTotalXP / targetXP) * 100);

  fillEl.style.setProperty("width", `${Math.min(percentage, 100)}%`, "important");
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

  const percentage = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

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

      console.log("🔄 Chrome Browser Reload ကြောင့် Track အားလုံးရှိ ဒေတာများကို ရှင်းလင်းပြီးပါပြီ (Clear All)။");
    }
  }
});