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

/**
 * Main Hub ပေါ်ရှိ ပင်မကတ်ကြီး (၄) ခု၏ Progress များကို Dynamic တွက်ချက်ပြသပေးမည့် လုပ်ဆောင်ချက်
 */
function updateMainHubProgress() {
  // ၄ ခုလုံးအတွက် သက်ဆိုင်ရာ ဒေတာ အစုအဝေးများကို Object တစ်ခုအနေဖြင့် သတ်မှတ်ခြင်း
  // (မှတ်ချက် - နောက်ပိုင်း ESP32, ESP8266 ဒေတာဖိုင်တွေ ဆောက်ရင် ဒီမှာ နာမည်လှမ်းချိတ်ရုံပါပဲ)
  const tracks = {
    arduino:
      typeof arduinoJourneyData !== "undefined" ? arduinoJourneyData : [],
    esp32: typeof esp32JourneyData !== "undefined" ? esp32JourneyData : [],
    esp8266:
      typeof esp8266JourneyData !== "undefined" ? esp8266JourneyData : [],
    raspberry:
      typeof raspberryJourneyData !== "undefined" ? raspberryJourneyData : [],
  };

  // Track တစ်ခုချင်းစီကို Loop ပတ်ပြီး ရာခိုင်နှုန်း ရှာဖွေခြင်း
  Object.keys(tracks).forEach((trackName) => {
    const trackData = tracks[trackName];

    const percentEl = document.getElementById(`${trackName}-percent`);
    const fillEl = document.getElementById(`${trackName}-fill`);

    // HTML Element မရှိသေးပါက ကျော်သွားမည်
    if (!percentEl || !fillEl) return;

    const totalTopics = trackData.length; // ဥပမာ - Arduino မှာ ခေါင်းစဉ် ၇ ခု သို့မဟုတ် ၁၀ ခု
    let completedTopics = 0;

    // LocalStorage ထဲတွင် ပြီးမြောက်ကြောင်း စစ်ဆေးခြင်း
    trackData.forEach((topic) => {
      if (getCardStatus(topic.id)) {
        completedTopics++;
      }
    });

    // ရာခိုင်နှုန်းတွက်ချက်ခြင်း: (ပြီးစီးသည့်ခေါင်းစဉ် / ခေါင်းစဉ်စုစုပေါင်း) * ၁၀၀
    const percentage =
      totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // 💻 UI ထဲသို့ တန်ဖိုးများ အစားထိုးထည့်သွင်းခြင်း
    percentEl.textContent = `${percentage}%`;
    fillEl.style.width = `${percentage}%`;
  });
}

// စာမျက်နှာပွင့်ချိန်တွင် မောင်းနှင်ပေးရန် ချိတ်ဆက်ခြင်း
document.addEventListener("DOMContentLoaded", () => {
  if (typeof renderLessons === "function") {
    renderLessons(); // အကယ်၍ ဒိုင်နမစ်ကတ်ဆောက်တဲ့ စာမျက်နှာဖြစ်ပါက မောင်းနှင်မည်
  }
  updateMainHubProgress(); // 🌟 ပင်မကတ်ကြီး ၄ ခုလုံးရဲ့ Progress ဘားများကို အသက်သွင်းခြင်း
});

/**
 * Hero Section ရှိ ပင်မ Progress Bar အား ဒေတာအလိုက် အသက်သွင်းပေးမည့် လုပ်ဆောင်ချက်
 */
function updateHeroProgress() {
  const heroProgressBar = document.getElementById("hero-progress-bar");
  const heroProgressLabel = document.getElementById("main-progress-label");

  // Element များ မရှိပါက Error မတက်စေရန် စစ်ထုတ်ခြင်း
  if (!heroProgressBar || !heroProgressLabel) return;

  const totalCards = arduinoJourneyData.length; // data.js ထဲက ကတ်စုစုပေါင်း အရေအတွက် (7 ကတ်)
  let completedCards = 0;

  // 📊 LocalStorage ထဲတွင် ပြီးမြောက်ကြောင်း (True) ဖြစ်နေသည့် ကတ်များကို လိုက်လံရေတွက်ခြင်း
  arduinoJourneyData.forEach((card) => {
    if (getCardStatus(card.id)) {
      completedCards++;
    }
  });

  // 📈 ရာခိုင်နှုန်း ရှာဖွေခြင်း
  const percentage =
    totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  // 💻 UI Element များကို ပြောင်းလဲခြင်း
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
    const prevCardId = arduinoJourneyData[index - 1].id;
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

  // data.js ထဲက arduinoJourneyData အာရ်ရေးကြီးကို Loop ပတ်မောင်းနှင်ခြင်း
  arduinoJourneyData.forEach((lesson, index) => {
    // လက်ရှိကတ်၏ Status များကို အပေါ်က Helper ထံမှ တောင်းယူခြင်း
    const status = getCardContentStatus(lesson, index);

    const col = document.createElement("div");
    col.className = "col";

    col.innerHTML = `
      <div class="course-card h-100 ${status.cardClass}" 
           onclick="startLesson(${lesson.id}, ${status.isUnlocked})">
          
          <div class="status-icon">
              ${status.statusIcon}
          </div>

          
          <div class="card-img-box">
               <i class="${lesson.icon}"></i> 
          </div>

          <div class="card-info">
              <span class="lesson-num">${String(lesson.id).padStart(2, "0")}</span>
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
// <div class="card-img-box">
//     <img src="/assets/icons/${lesson.img}" alt="${lesson.title}">
// </div>
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
document.addEventListener("DOMContentLoaded", () => {
  // 💡 Advanced JS: Browser ရဲ့ Navigation အမျိုးအစားကို စစ်ဆေးခြင်း
  const navigationEntries = performance.getEntriesByType("navigation");

  if (navigationEntries.length > 0) {
    const navigationType = navigationEntries[0].type;

    // 🚨 အကယ်၍ ကျောင်းသားက Chrome ရဲ့ Reload ခလုတ်ကို နှိပ်လိုက်တာ သေချာရင်...
    if (navigationType === "reload") {
      // ၁။ LocalStorage ထဲက ဒေတာတွေကို ချက်ချင်း ဖျက်ပစ်မယ်
      localStorage.removeItem("student_total_xp");
      localStorage.removeItem("arduino_progress");

      // ၂။ ဖျက်ပြီးရင် UI ပေါ်မှာ 0,00 ဖြစ်သွားအောင် ချက်ချင်း ပြောင်းလဲပစ်မယ်
      const xpPointsEl = document.getElementById("xpPoints");
      if (xpPointsEl) {
        xpPointsEl.textContent = "0,00";
      }

      alert(
        "🔄 Chrome Browser Reload ကြောင့် ဒေတာများကို Reset လုပ်ပြီးပါပြီ။",
      );
    }
  }
});
