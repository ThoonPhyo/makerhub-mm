/* ==========================================================================
   Arduino Lab - Lessons/Study Room Logic (Dynamic System)
   ========================================================================== */

// ၁။ လက်ရှိ ဝင်ရောက်နေသော အခြေအနေများကို မှတ်သားထားမည့် Variables
let currentCardId = null;
let currentLessonId = 1; // ကနဦးတွင် ပထမဆုံးသင်ခန်းစာခွဲကို ပြပါမည်

/**
 * ၂။ စာမျက်နှာ စဖွင့်ချင်း URL ထဲမှ Card ID အား ဖတ်ယူပြီး လုပ်ဆောင်ချက်များကို စတင်ခြင်း
 */
document.addEventListener("DOMContentLoaded", () => {
  // URL parameters ကို ဖတ်ခြင်း (ဥပမာ- lessons.html?id=1)
  const urlParams = new URLSearchParams(window.location.search);
  const idParam = urlParams.get("id");

  if (idParam) {
    currentCardId = parseInt(idParam);

    // မူရင်းဒေတာထဲတွင် ဤ Card ID ရှိမရှိ စစ်ဆေးခြင်း
    const cardExists = arduinoJourneyData.some(
      (card) => card.id === currentCardId,
    );

    if (cardExists) {
      // အဆင့် (က) - ဘယ်ဘက် Sidebar မီနူးအား Dynamic ဆောက်ခြင်း
      generateSidebar(currentCardId);

      // အဆင့် (ခ) - ပထမဆုံး သင်ခန်းစာခွဲ (Lesson 1) ၏ Content အား ညာဘက်တွင် ပြသခြင်း
      renderLessonContent(1);
    } else {
      alert("တောင်းဆိုထားသော သင်ခန်းစာအုပ်စုကို မတွေ့ရှိပါ။");
      window.location.href = "index.html";
    }
  } else {
    // ID မပါလာပါက ပင်မစာမျက်နှာသို့ ပြန်ပို့မည်
    window.location.href = "index.html";
  }
});

/**
 * ၃။ ရွေးချယ်လိုက်သော Card ID အလိုက် ဘယ်ဘက် Sidebar နှင့် Progress Bar အား တည်ဆောက်ခြင်း
 */
function generateSidebar(cardId) {
  const card = arduinoJourneyData.find((c) => c.id === cardId);
  const sidebarContainer = document.getElementById("sidebar-lessons");
  if (!card || !sidebarContainer) return;

  // Sidebar Header နှင့် Progress Bar အတွက် Template ဆောက်ခြင်း
  // CSS ထဲက CSS Variable တွေနဲ့ ကွက်တိကိုက်အောင် ဖွဲ့စည်းထားပါတယ်
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
  card.lessons.forEach((lesson) => {
    sidebarHTML += `
      <button class="list-group-item list-group-item-action" data-id="${lesson.id}">
        ${lesson.id}. ${lesson.title}
      </button>
    `;
  });

  sidebarContainer.innerHTML = sidebarHTML;

  // Sidebar ခလုတ်များကို နှိပ်ပါက အလုပ်လုပ်စေရန် Event ချိတ်ဆက်ခြင်း
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
      const lessonId = parseInt(e.currentTarget.getAttribute("data-id"));
      renderLessonContent(lessonId);
    });
  });
}

/**
 * ၅။ ရွေးချယ်လိုက်သော သင်ခန်းစာအလိုက် ညာဘက်ခြမ်း Main Content နှင့် Progress ကို အပ်ဒိတ်လုပ်ခြင်း
 */
function renderLessonContent(lessonId) {
  const card = arduinoJourneyData.find((c) => c.id === currentCardId);
  if (!card) return;

  const lesson = card.lessons.find((l) => l.id === lessonId);
  if (!lesson) return;

  currentLessonId = lessonId; // လက်ရှိဖတ်နေသော ID အား မှတ်သားခြင်း

  // 📈 ရာခိုင်နှုန်း Dynamic တွက်ချက်ခြင်း: (လက်ရှိသင်ခန်းစာခွဲ ID / သင်ခန်းစာခွဲစုစုပေါင်း) * ၁၀၀
  const totalLessons = card.lessons.length;
  const progressPercentage = Math.round((lessonId / totalLessons) * 100);

  // Sidebar ပေါ်က Progress Bar နှင့် စာသားများကို အပ်ဒိတ်လုပ်ခြင်း
  const progressBar = document.getElementById("sidebar-progress-bar");
  const progressText = document.getElementById("sidebar-progress-text");

  if (progressBar && progressText) {
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.setAttribute("aria-valuenow", progressPercentage);
    progressText.textContent = `${progressPercentage}%`;
  }

  // Top Navbar/Breadcrumb ပြောင်းလဲခြင်း
  const breadcrumbEl = document.getElementById("breadcrumb-lesson");
  if (breadcrumbEl) {
    breadcrumbEl.textContent = `${card.title} / Lesson ${lesson.id}`;
  }

  // နောက်ဆုံးသင်ခန်းစာ ဟုတ်မဟုတ် စစ်ဆေးပြီး ခလုတ်ပုံစံ ပြောင်းခြင်း
  const isFinalLesson = lessonId === totalLessons;
  let actionBtnHTML = isFinalLesson
    ? `<button class="btn btn-success fw-bold px-4 shadow-sm" id="content-btn">Mark as Complete</button>`
    : `<button class="btn btn-primary fw-bold px-4 shadow-sm" id="content-btn">Next</button>`;

  const prevDisabled = currentLessonId === 1 ? "disabled" : "";

  // ညာဘက်ခြမ်း Dynamic Content Area ထဲသို့ HTML များ ထည့်သွင်းခြင်း
  document.getElementById("dynamic-content").innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary-subtle">
      <h2 class="h4 fw-bold mb-0 text-info">${lesson.title}</h2>
      <span class="badge bg-success-subtle px-3 py-2 fw-bold">+${lesson.xp} XP</span>
    </div>

    <p class="text-secondary leading-relaxed mb-4">${lesson.text}</p>

    ${
      lesson.code
        ? `
    <div class="mt-4">
      <h6 class="text-uppercase text-success small fw-bold mb-2 font-monospace">📟 Arduino Source Code</h6>
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

  // HTML အသစ်လဲပြီးတိုင်း ကုဒ်တွေကို လိုက်လံ အရောင်ခြယ်ခိုင်းခြင်း ဖြစ်ပါတယ်
  if (typeof Prism !== "undefined") {
    Prism.highlightAll();
  }

  // အောက်ခြေ Navigation ခလုတ်များအတွက် Event ပြန်လည်ချိတ်ဆက်ခြင်း
  setupNavigationEvents(isFinalLesson);

  // Sidebar ခလုတ်များထဲမှ လက်ရှိဖတ်နေသောခလုတ်အား Active Class ပေးခြင်း
  updateSidebarActiveStyle(lessonId);
}

/**
 * ၆။ Next, Previous နှင့် Mark as Complete ခလုတ်များ၏ အလုပ်လုပ်ပုံစနစ်
 */
function setupNavigationEvents(isFinalLesson) {
  // Next သို့မဟုတ် Mark as Complete ခလုတ် နှိပ်ချိန်
  document.getElementById("content-btn").addEventListener("click", () => {
    if (!isFinalLesson) {
      renderLessonContent(currentLessonId + 1);
    } else {
      // 🎉 နောက်ဆုံး သင်ခန်းစာဖြစ်ပါက ပရောဂျက်အောင်မြင်ကြောင်း localStorage တွင် သိမ်းဆည်းမည်
      saveCardComplete(currentCardId);

      alert(`🎉 ဂုဏ်ယူပါတယ်ဗျာ! သင်ခန်းစာအားလုံးကို လေ့လာပြီးမြောက်သွားပါပြီ။`);
      window.location.href = "index.html"; // Dashboard သို့ ပြန်လှည့်မည်
    }
  });

  // Previous ခလုတ် နှိပ်ချိန်
  document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentLessonId > 1) {
      renderLessonContent(currentLessonId - 1);
    }
  });
}

/**
 * ၇။ Sidebar ခလုတ်များထဲမှ လက်ရှိ ဖတ်နေသော သင်ခန်းစာအား အပြာရောင် Active လိုင်းလေး ပြသပေးခြင်း
 */
function updateSidebarActiveStyle(lessonId) {
  const buttons = document.querySelectorAll(
    "#sidebar-lessons .list-group-item",
  );

  buttons.forEach((btn) => {
    const btnId = parseInt(btn.getAttribute("data-id"));
    if (btnId === lessonId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

/**
 * ၈။ Helper Function: ကုဒ်ထဲတွင် ပါဝင်သော HTML တဂ်များကို စာသားအဖြစ် ဘေးကင်းစွာ ပြသနိုင်ရန် ပြောင်းလဲပေးခြင်း
 */
function escapeHTML(html) {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
