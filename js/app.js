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

  // Future API call example:
  // fetch('https://api.yourbackend.com/v1/user/streak')
  //   .then(response => response.json())
  //   .then(data => updateStreakUI(data))
  //   .catch(error => console.error('Error fetching data:', error));

  // show current xp points
  // ၁။ LocalStorage ထဲက စုစုပေါင်း XP နံပါတ်အပြည့်ကို လှမ်းယူတယ် (ဥပမာ - 7550)
  const savedXP = parseInt(localStorage.getItem("student_total_xp") ?? "0");

  // ၂။ Home Page ပေါ်က <span id="xpPoints"> နေရာကို လှမ်းဖမ်းတယ်
  const xpPointsEl = document.getElementById("xpPoints");

  if (xpPointsEl) {
    // 💡 Advanced JS: .textContent ကိုသုံးပြီး တစ်လိုင်းတည်းဖြင့် format ချကာ တိုက်ရိုက် အစားထိုးလိုက်ခြင်း ဖြစ်ပါတယ်ဗျာ
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

    // HTML ID ကို dynamic အတိုင်း တိကျစွာ ခေါ်
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
      if (getCardStatus(topic.id)) {
        completedTopics++;
      }
    });

    globalTotalTopics += totalTopics;
    globalCompletedTopics += completedTopics;

    if (percentEl && fillEl) {
      const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
      percentEl.textContent = `${percentage}%`;
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
      globalTotalTopics > 0 ? Math.round((globalCompletedTopics / globalTotalTopics) * 100) : 0;

    if (totalPercentEl) {
      totalPercentEl.textContent = `${totalPercentage}%`;
    }
    if (totalFillEl) {
      totalFillEl.style.setProperty("width", `${totalPercentage}%`, "important");
    }
  }
}

// စာမျက်နှာပွင့်ချိန်တွင် မောင်းနှင်ပေးရန် ချိတ်ဆက်ခြင်း
document.addEventListener("DOMContentLoaded", () => {
  if (typeof renderLessons === "function") {
    renderLessons(); // အကယ်၍ ဒိုင်နမစ်ကတ်ဆောက်တဲ့ စာမျက်နှာဖြစ်ပါက မောင်းနှင်မည်
  }
  updateMainHubProgress(); // 🌟 ပင်မကတ်ကြီး ၄ ခုလုံးရဲ့ Progress ဘားများကို အသက်သွင်းခြင်း
});

/* ════════════════════════════
XP Progress Bar
════════════════════════════ */
function updateXpProgress() {
  const fillEl = document.getElementById("xpProgressBar");
  if (!fillEl) return; // 💡 Bug ကာကွယ်ရန်: Element မရှိရင် အောက်ကကုဒ်တွေကို ဆက်မောင်းမရအောင် တားခြင်း

  // ၁။ LocalStorage ထဲက Pure Number ကို အရင်ယူမယ် (ဥပမာ - 7550)
  const finalTotalXP = parseInt(
    localStorage.getItem("student_total_xp") ?? "0",
  );

  // ၂။ 💡 Target XP ကို 10,000 လို့ ထားပြီး ရာခိုင်နှုန်းကို နံပါတ်ချင်း တိုက်ရိုက်တွက်ချက်မယ်
  const targetXP = 10000;
  const percentage = Math.round((finalTotalXP / targetXP) * 100);

  // ၃။ ရလာတဲ့ ရာခိုင်နှုန်းကို CSS Width ထဲ ထည့်ပေးလိုက်တာပါဗျာ
  // 💡 [FIXED TYPO] Bootstrap Overriding မဖြစ်အောင် setProperty အမှန်အတိုင်း ပြင်ဆင်ပြီး ဖြစ်ပါတယ်ဗျာ
  fillEl.style.setProperty(
    "width",
    `${Math.min(percentage, 100)}%`,
    "important",
  );
}
// show when page start
document.addEventListener("DOMContentLoaded", () => {
  updateXpProgress();
});

/**
 * Hero Section ရှိ ပင်မ Progress Bar အား ဒေတာအလိုက် အသက်သွင်းပေးမည့် လုပ်ဆောင်ချက်
 */
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

// 🔄 စာမျက်နှာ စတင်ပွင့်ချိန် (DOM Loaded) တွင် အလုပ်လုပ်စေရန် ချိတ်ဆက်ခြင်း
document.addEventListener("DOMContentLoaded", () => {
  renderLessons(); // ရှိပြီးသား ကတ်များထုတ်ပေးသည့် function
  updateHeroProgress(); // 🌟 Hero Progress ကိုပါ တစ်ခါတည်း မောင်းနှင်ခိုင်းလိုက်ခြင်း
});

/* ════════════════════════════
   topic grid (Dynamic & LocalStorage System)
════════════════════════════ */

const gridContainer = document.getElementById("learning-grid");

/**
 * ၁။ ကတ်တစ်ခုချင်းစီ၏ Lock/Unlock နှင့် Done/Start အခြေအနေကို တွက်ချက်ပေးမည့် လုပ်ဆောင်ချက်
 */
function getCardContentStatus(lesson, index) {
  // localStorage ထဲမှ ဤကတ်၏ ပြီးမြောက်မှု အခြေအနေကို စစ်ဆေးခြင်း (data.js ထဲက function ကို လှမ်းသုံးသည်)
  const isCompleted = getCardStatus(lesson.id);

  // ပထမဆုံးကတ် ဖြစ်ပါက အလိုအလျောက် ပွင့်မည် (Unlocked)
  let isUnlocked = index === 0;

  // ဒုတိယကတ်မှစ၍ ရှေ့ကတ် ပြီးခဲ့သလား (Completed ဖြစ်ခဲ့သလား) ကို localStorage တွင် လှမ်းစစ်မည်
  if (index > 0) {
    // 💡 [DYNAMIC CHANGER] arduinoJourneyData နေရာတွင် ဘုံသုံးအဖြစ် ပြောင်းလဲခြင်း
    const prevCardId = currentTrackData[index - 1].id;
    isUnlocked = getCardStatus(prevCardId);
  }

  // UI ပေါ်တွင် ပြသမည့် စာသား၊ အိုင်ကွန် နှင့် Class များကို စနစ်တကျ သတ်မှတ်ခြင်း
  return {
    isUnlocked: isUnlocked,
    isCompleted: isCompleted,
    statusIcon: isUnlocked ? (isCompleted ? "✅" : "▶️") : "🔒",
    statusText: isUnlocked ? (isCompleted ? "Done" : "Start") : "Locked",
    cardClass: isUnlocked ? "unlocked" : "locked",
  };
}

/**
 * ၂။ data.js မှ ဗဟိုဒေတာများကို ယူ၍ Dashboard ပေါ်တွင် ကတ်များ လာရောက်ဆောက်ပေးမည့် လုပ်ဆောင်ချက်
 */
function renderLessons() {
  if (!gridContainer) return; // အကယ်၍ Grid Container မရှိပါက Error မတက်စေရန် စစ်ထုတ်ခြင်း
  gridContainer.innerHTML = "";

  // 💡 [DYNAMIC CHANGER] currentTrackData ကို Loop ပတ်ပြီး Track အလိုက် ကတ်များဆောက်ခြင်း
  currentTrackData.forEach((lesson, index) => {
    // လက်ရှိကတ်၏ Status များကို အပေါ်က Helper ထံမှ တောင်းယူခြင်း
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

/**
 * ၃။ ကတ်တစ်ခုကို နှိပ်လိုက်ချိန်တွင် လမ်းကြောင်းလွှဲပေးမည့် လုပ်ဆောင်ချက်
 */
function startLesson(id, unlocked) {
  if (!unlocked) {
    alert("အရင်သင်ခန်းစာကို အရင်ပြီးအောင် လုပ်ပေးပါ။");
    return;
  }
  // သက်ဆိုင်ရာ Card ID ကို URL Parameter အနေဖြင့် သယ်ဆောင်သွားမည်
  window.location.href = `lessons.html?id=${id}`;
}

// စာမျက်နှာ စတင်ပွင့်ချိန်တွင် ကတ်များကို ဆောက်ပေးရန် မောင်းနှင်ခြင်း
document.addEventListener("DOMContentLoaded", () => {
  renderLessons();
});

// reset when click reload
// reset when click reload
document.addEventListener("DOMContentLoaded", () => {
  const navigationEntries = performance.getEntriesByType("navigation");

  if (navigationEntries.length > 0) {
    const navigationType = navigationEntries[0].type;

    if (navigationType === "reload") {
      // ၁။ XP ကို အမြဲ Reset လုပ်မယ်
      localStorage.removeItem("student_total_xp");

      // 💡 အဓိက ပြင်ဆင်ချက်:
      // arduino_progress ကို အသေရေးမယ့်အစား getStorageKey() ကို သုံးပြီး လက်ရှိရောက်နေတဲ့ Track အလိုက် ဖျက်ပေးမယ်
      if (typeof getStorageKey === "function") {
        const currentKey = getStorageKey();
        localStorage.removeItem(currentKey);
      } else {
        // Fallback အနေနဲ့ အဟောင်းကို ဖျက်ပေးထားမယ်
        localStorage.removeItem("arduino_progress");
      }

      // ၂။ UI ကို ပြန်ရှင်းမယ်
      const xpBadge = document.getElementById("xpPoints");
      if (xpBadge) {
        xpBadge.textContent = "0";
      }

      renderLessons();
      console.log("Current track progress reset successfully!");
    }
  }
});
