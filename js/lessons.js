/* ==========================================================================
   Lab - Lessons/Study Room Logic (Dynamic Shared System)
   ========================================================================== */

// 🎯 သင်ခန်းစာ ပြီးဆုံးကြောင်းကို လက်ရှိ Track အလိုက် မှန်ကန်စွာ စစ်ဆေး/သိမ်းဆည်းရန် Helpers
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

function saveCardComplete(cardId) {
  const key = getStorageKey();
  const progress = JSON.parse(localStorage.getItem(key)) || {};
  progress[cardId] = true;
  localStorage.setItem(key, JSON.stringify(progress));
}

// ၁။ လက်ရှိ ဝင်ရောက်နေသော အခြေအနေများကို မှတ်သားထားမည့် Variables
let currentCardId = null;
let currentLessonId = 1; 

// 💡 URL လမ်းကြောင်းကိုကြည့်ပြီး ဘယ် Track ဒေတာကို သုံးမလဲဆိုတာ Dynamic ဆုံးဖြတ်ခြင်း
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

/**
 * ၂။ စာမျက်နှာ စဖွင့်ချင်း URL ထဲမှ Card ID အား ဖတ်ယူပြီး လုပ်ဆောင်ချက်များကို စတင်ခြင်း
 */
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const idParam = urlParams.get("id");

  if (idParam) {
    currentCardId = idParam;

    // currentTrackData ထဲတွင် ဤ Card ID ရှိမရှိ စစ်ဆေးခြင်း
    const cardExists = currentTrackData.some(
      (card) => String(card.id) === String(currentCardId),
    );

    if (cardExists) {
      generateSidebar(currentCardId);
      renderLessonContent(1); // အခန်းခွဲ ၁ ကနေ စဖွင့်မည်
    } else {
      alert("တောင်းဆိုထားသော သင်ခန်းစာအုပ်စုကို မတွေ့ရှိပါ။");
      window.location.href = "index.html";
    }
  } else {
    window.location.href = "index.html";
  }
});

/**
 * ၃။ ရွေးချယ်လိုက်သော Card ID အလိုက် ဘယ်ဘက် Sidebar နှင့် Progress Bar အား တည်ဆောက်ခြင်း
 */
function generateSidebar(cardId) {
  const card = currentTrackData.find((c) => String(c.id) === String(cardId));
  const sidebarContainer = document.getElementById("sidebar-lessons");
  if (!card || !sidebarContainer) return;

  let sidebarHTML = `
    <div class="text-secondary small fw-bold mb-2 px-2 text-uppercase">
      ${card.title}
    </div>
    
    <div class="progress-container mb-3 px-2" id="sidebar-progress-wrapper">
      <div class="progress custom-progress mb-2" style="height: 8px">
        <div
          class="progress-bar"
          id="sidebar-progress-bar"
          role="progressbar"
          style="width: 0%"
          aria-valuenow="0"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
      <div
        class="text-secondary d-flex justify-content-between"
        style="font-size: 11px; color: var(--text-muted) !important;"
      >
        <span>Journey Completion</span>
        <span class="fw-bold text-success" id="sidebar-progress-text">0%</span>
      </div>
    </div>
    <hr class="border-secondary-subtle my-2 mx-2">
  `;

  // Card အတွင်းရှိ သင်ခန်းစာခွဲ Button များကို ပတ်မောင်း၍ ထည့်သွင်းခြင်း
  card.lessons.forEach((lesson, index) => {
    sidebarHTML += `
      <button class="list-group-item list-group-item-action" data-id="${index + 1}">
        ${index + 1}. ${lesson.name || lesson.title}
      </button>
    `;
  });

  sidebarContainer.innerHTML = sidebarHTML;
  setupSidebarClickEvents();
}

/**
 * ၄။ Sidebar ခလုတ်များကို Click လုပ်ပါက သက်ဆိုင်ရာ Lesson သို့ ကူးပြောင်းစေမည့် စနစ်
 */
function setupSidebarClickEvents() {
  const buttons = document.querySelectorAll(
    "#sidebar-lessons .list-group-item",
  );

  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const lessonIdx = parseInt(e.currentTarget.getAttribute("data-id"));
      renderLessonContent(lessonIdx);
    });
  });
}

/**
 * ၅။ ရွေးချယ်လိုက်သော သင်ခန်းစာအလိုက် ညာဘက်ခြမ်း Main Content နှင့် Progress ကို အပ်ဒိတ်လုပ်ခြင်း
 */
function renderLessonContent(lessonIdx) {
  const card = currentTrackData.find((c) => String(c.id) === String(currentCardId));
  if (!card) return;

  const lesson = card.lessons[lessonIdx - 1];
  if (!lesson) return;

  currentLessonId = lessonIdx; // လက်ရှိ ဖတ်နေသော index အား မှတ်သားခြင်း

  const totalLessons = card.lessons.length;
  const progressPercentage = Math.round((lessonIdx / totalLessons) * 100);

  const progressBar = document.getElementById("sidebar-progress-bar");
  const progressText = document.getElementById("sidebar-progress-text");

  if (progressBar && progressText) {
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.setAttribute("aria-valuenow", progressPercentage);
    progressText.textContent = `${progressPercentage}%`;
  }

  const breadcrumbEl = document.getElementById("breadcrumb-lesson");
  if (breadcrumbEl) {
    breadcrumbEl.textContent = `${card.title} / Lesson ${lessonIdx}`;
  }

  const isFinalLesson = lessonIdx === totalLessons;
  let actionBtnHTML = isFinalLesson
    ? `<button class="btn btn-success fw-bold px-4 shadow-sm" id="content-btn">Mark as Complete</button>`
    : `<button class="btn btn-primary fw-bold px-4 shadow-sm" id="content-btn">Next</button>`;

  const prevDisabled = currentLessonId === 1 ? "disabled" : "";

  // ညာဘက်ခြမ်း Dynamic Content Area (Markdown Parsing & Source Code)
  document.getElementById("dynamic-content").innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary-subtle">
      <h2 class="h4 fw-bold mb-0 text-info">${lesson.name || lesson.title}</h2>
      <span class="badge bg-success-subtle px-3 py-2 fw-bold">+${lesson.xp} XP</span>
    </div>

    <div class="text-secondary leading-relaxed mb-4 lesson-content-body">
      ${lesson.text ? marked.parse(lesson.text) : "လေ့လာရန် အကြောင်းအရာများကို ဖြည့်စွက်ရန် ကျန်ရှိနေပါသည်။"}
    </div>

    ${
      lesson.code
        ? `
    <div class="mt-4">
      <h6 class="text-uppercase text-success small fw-bold mb-2 font-monospace">📟 Source Code</h6>
      <pre class="bg-dark p-3 rounded-3 font-monospace" style="font-size: 14px"><code class="language-cpp">${escapeHTML(lesson.code)}</code></pre>
    </div>
    `
        : ""
    }

    <div class="d-flex justify-content-between mt-5 pt-3 border-top border-secondary-subtle">
      <button class="btn btn-outline-secondary px-3 ${prevDisabled}" id="prev-btn">
        Previous
      </button>
      ${actionBtnHTML}
    </div>
  `;

  if (typeof Prism !== "undefined") {
    Prism.highlightAll();
  }

  setupNavigationEvents(isFinalLesson);
  updateSidebarActiveStyle(lessonIdx);
}

/**
 * ၆။ Next, Previous နှင့် Mark as Complete ခလုတ်များ၏ အလုပ်လုပ်ပုံစနစ်
 */
function setupNavigationEvents(isFinalLesson) {
  const contentBtn = document.getElementById("content-btn");
  const prevBtn = document.getElementById("prev-btn");

  if (!contentBtn) return;

  const newContentBtn = contentBtn.cloneNode(true);
  contentBtn.parentNode.replaceChild(newContentBtn, contentBtn);

  newContentBtn.addEventListener("click", () => {
    const card = currentTrackData.find((c) => String(c.id) === String(currentCardId));
    const currentLesson = card ? card.lessons[currentLessonId - 1] : null;
    const earnedXP = currentLesson ? currentLesson.xp : 0;

    const isTopicCompleted = getCardStatus(currentCardId);
    let earnedXPMsg = "";

    if (!isTopicCompleted) {
      let totalXP = parseInt(localStorage.getItem("student_total_xp") ?? "0");
      totalXP += earnedXP;
      localStorage.setItem("student_total_xp", totalXP);

      earnedXPMsg = `\n🎉 You got : ${earnedXP} XP`;
    } else {
      earnedXPMsg = `\nℹ️ (ဤသင်ခန်းစာအုပ်စုအား လေ့လာပြီးဖြစ်၍ XP ထပ်မံမတိုးတော့ပါ)`;
    }

    if (!isFinalLesson) {
      alert(`✨ သင်ခန်းစာ ပြီးမြောက်သွားပါပြီ။${earnedXPMsg}`);
      renderLessonContent(currentLessonId + 1);
    } else {
      saveCardComplete(currentCardId);

      const finalTotalXP = parseInt(localStorage.getItem("student_total_xp") ?? "0");
      const formattedTotalXP = (finalTotalXP / 1000).toString().replace(".", ",");

      alert(
        `🎉 ဂုဏ်ယူပါတယ်ဗျာ! သင်ခန်းစာအားလုံးကို လေ့လာပြီးမြောက်သွားပါပြီ။${earnedXPMsg} \n Current Total XP: ${formattedTotalXP}`,
      );

      window.location.href = "index.html";
    }
  });

  if (prevBtn) {
    const newPrevBtn = prevBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    newPrevBtn.addEventListener("click", () => {
      if (currentLessonId > 1) {
        renderLessonContent(currentLessonId - 1);
      }
    });
  }
}

/**
 * ၇။ Sidebar ခလုတ်များထဲမှ လက်ရှိ ဖတ်နေသော သင်ခန်းစာအား Active ပြသပေးခြင်း
 */
function updateSidebarActiveStyle(lessonIdx) {
  const buttons = document.querySelectorAll(
    "#sidebar-lessons .list-group-item",
  );

  buttons.forEach((btn) => {
    const btnId = parseInt(btn.getAttribute("data-id"));
    if (btnId === lessonIdx) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function escapeHTML(html) {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}