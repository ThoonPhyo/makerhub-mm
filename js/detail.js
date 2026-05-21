// This is js file for project detail page (project-detail.html)

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // ၁။ AUTHENTICATION LOGIC (CREATE POST BUTTON CONTROL)
  // ==========================================
  const userName = localStorage.getItem("userName");
  const createPostBtn = document.getElementById("btnCreatePost");

  if (createPostBtn) {
    if (userName && userName.trim() !== "") {
      createPostBtn.classList.remove("d-none");
    } else {
      createPostBtn.classList.add("d-none");
    }
  }

  // ==========================================
  // ၂။ URL PARAMETERS & GLOBAL VARIABLES
  // ==========================================
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");

  const loadingIndicator = document.getElementById("loadingIndicator");
  const projectContent = document.getElementById("projectContent");

  // Like စနစ်အတွက် ဒေတာများကို သိုလှောင်ရန် Variable များ
  let currentLikes = 0;
  let isLiked = false;

  if (!projectId) {
    console.error("No Project ID found in URL!");
    safeSetText("pjTitle", "No Project ID Provided");
    if (loadingIndicator) loadingIndicator.classList.add("d-none");
    if (projectContent) projectContent.classList.remove("d-none");
    return;
  }

  const apiUrl = `https://6a0e53941736097c3609b735.mockapi.io/api/v1/projects/${projectId}`;

  // ==========================================
  // ၃။ API မှ DATA လှမ်းခေါ်ယူခြင်း
  // ==========================================
  async function loadProjectDetails() {
  try {
    if (loadingIndicator) loadingIndicator.classList.remove("d-none");
    if (projectContent) projectContent.classList.add("d-none");

    const response = await fetch(apiUrl);
    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status}`);

    const project = await response.json();

    // Likes အချက်အလက်များ သိမ်းဆည်းခြင်း
    currentLikes = project.likes ?? 0;

    // ဤ User သည် ဤ Project ကို Like ထားခြင်း ရှိမရှိ LocalStorage တွင် စစ်ဆေးခြင်း
    const likedProjects = JSON.parse(
      localStorage.getItem("liked_projects") || "[]",
    );
    isLiked = likedProjects.includes(projectId);

    // DATA RENDERING
    safeSetText("pjTitle", project.title);
    safeSetText("pjAuthor", project.userName);
    safeSetText("pjCategory", project.category || "General");
    safeSetText("pjLikes", currentLikes);
    safeSetText(
      "pjComments",
      project.comments ?? Math.floor(Math.random() * 12) + 3,
    );

    // Like Button UI အခြေအနေကို Update လုပ်ခြင်း
    updateLikeUI();

    const avatarEl = document.getElementById("pjAvatar");
    if (avatarEl)
      avatarEl.src = project.userAvatar || "https://via.placeholder.com/40";

    const imgEl = document.getElementById("pjImage");
    if (imgEl)
      imgEl.src = project.image || "https://via.placeholder.com/800x400";

    const descEl = document.getElementById("pjDescription");
    if (descEl) {
      descEl.innerHTML = project.longDescription
        ? project.longDescription
            .split("\n")
            .map((p) => `<p class="mb-3">${p}</p>`)
            .join("")
        : "No description available.";
    }

    const wiringEl = document.getElementById("pjWiring");
    if (wiringEl) {
      wiringEl.innerHTML = project.wiringNotes
        ? project.wiringNotes
            .split("\n")
            .map(
              (line) =>
                `<li class="mb-2"><i class="bi bi-arrow-right-short text-warning me-1"></i>${line}</li>`,
            )
            .join("")
        : "<li>No wiring notes provided.</li>";
    }

    // SOURCE CODE SYNTAX HIGHLIGHTING (Prism.js)
    const codeElement = document.getElementById("pjCode");
    if (codeElement) {
      codeElement.textContent = project.sourceCode || "// No code available";
      // ဒေတာဝင်သွားပြီဆိုမှ Prism ကို Element အလိုက် ကာလာခြယ်ခိုင်းတာပါ
      Prism.highlightElement(codeElement);
    }

    renderList("pjElectronics", project.electronics);
    renderList("pjHardware", project.hardware);
    renderList("pjSoftware", project.software);

    if (loadingIndicator) loadingIndicator.classList.add("d-none");
    if (projectContent) projectContent.classList.remove("d-none");

    // Like Event Listener ကို ချိတ်ဆက်ခြင်း
    setupLikeFeature();

  } catch (error) {
    console.error("Error fetching project:", error);
    safeSetText("pjTitle", "Error Loading Project");
    if (loadingIndicator) loadingIndicator.classList.add("d-none");
    if (projectContent) projectContent.classList.remove("d-none");
  }
}

  // ==========================================
  // ၄။ LIKE & UNLIKE INTERACTION LOGIC (NEW)
  // ==========================================
  function setupLikeFeature() {
    const btnLike = document.getElementById("btnLike");
    if (!btnLike) return;

    btnLike.onclick = async () => {
      // အကယ်၍ User က Login မဝင်ထားရင် Like နှိပ်ခွင့်မပေးဘဲ Alert ပြပါမယ်
      if (!userName || userName.trim() === "") {
        alert("Please login first to like this project!");
        return;
      }

      // Button ကို ခေတ္တ Disable လုပ်ထားပါမယ် (API စောင့်နေစဉ်အတွင်း ထပ်ခါထပ်ခါ နှိပ်ခြင်းမှ ကာကွယ်ရန်)
      btnLike.disabled = true;

      // Toggle logic
      if (isLiked) {
        currentLikes--; // Unlike လုပ်လျှင် ၁ လျော့မည်
        isLiked = false;
      } else {
        currentLikes++; // Like လုပ်လျှင် ၁ တိုးမည်
        isLiked = true;
      }

      // Local UI ကို ချက်ချင်းအရင်ပြောင်းလဲခြင်း (အမြန်ဆန်ဆုံး ခံစားချက်ရစေရန်)
      updateLikeUI();
      safeSetText("pjLikes", currentLikes);

      try {
        // MockAPI ဆီသို့ နောက်ဆုံးရ Likes အရေအတွက်ကို PUT Method ဖြင့် သွားသိမ်းခြင်း
        await fetch(apiUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ likes: currentLikes }),
        });

        // LocalStorage ထဲတွင် Like/Unlike မှတ်တမ်းကို သိမ်းဆည်းခြင်း
        let likedProjects = JSON.parse(
          localStorage.getItem("liked_projects") || "[]",
        );
        if (isLiked) {
          likedProjects.push(projectId);
        } else {
          likedProjects = likedProjects.filter((id) => id !== projectId);
        }
        localStorage.setItem("liked_projects", JSON.stringify(likedProjects));
      } catch (err) {
        console.error("Failed to update like status on server:", err);
      } finally {
        // အားလုံးပြီးရင် Button ကို ပြန်ဖွင့်ပေးခြင်း
        btnLike.disabled = false;
      }
    };
  }

  // Like အခြေအနေအလိုက် အရောင်နှင့် Icon ပြောင်းလဲပေးသော စနစ်
  function updateLikeUI() {
    const likeIcon = document.getElementById("likeIcon");
    const btnLike = document.getElementById("btnLike");

    if (!likeIcon || !btnLike) return;

    if (isLiked) {
      // Like ထားလျှင်: Heart အပြည့်ဖြစ်သွားပြီး အရောင်က အနီလင်းရောင် သို့မဟုတ် Custom Active ဖြစ်သွားမည်
      likeIcon.className = "bi bi-heart-fill me-2";
      btnLike.style.color = "#ef4444"; // Red color
      btnLike.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
      btnLike.style.borderColor = "rgba(239, 68, 68, 0.25)";
    } else {
      // Unlike ဖြစ်လျှင်: မူရင်း အစိမ်းရောင် Outline ပုံစံပြန်ပြောင်းမည်
      likeIcon.className = "bi bi-heart me-2";
      btnLike.style.color = "var(--green)";
      btnLike.style.backgroundColor = "var(--green-dim)";
      btnLike.style.borderColor = "var(--border-accent)";
    }
  }

  // ==========================================
  // ၅။ HELPER FUNCTIONS
  // ==========================================
  function safeSetText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = text;
  }

  function renderList(elementId, items) {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (Array.isArray(items) && items.length > 0) {
      el.innerHTML = items
        .map(
          (item) => `
                <li>
                    <i class="bi bi-check2-circle"></i> <span>${item}</span>
                </li>
            `,
        )
        .join("");
    } else {
      el.innerHTML = `<li class="text-muted small">None</li>`;
    }
  }

  loadProjectDetails();
});

// create post button control logic is at the top of this file, just after DOMContentLoaded event listener.
// အစ်ကို့ရဲ့ JS ဖိုင်ထဲက setup ပိုင်းမှာ ဒါလေး ပြင်ပေးပါ
const createPostBtn = document.getElementById("btnCreatePost");
if (createPostBtn) {
  createPostBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Default link သွားတာကို ခေတ္တပိတ်မယ်

    const userName = localStorage.getItem("userName");
    if (userName && userName.trim() !== "") {
      // အကောင့်ဝင်ထားရင် ဖောင်ဖြည့်တဲ့ စာမျက်နှာကို သွားမယ်
      window.location.href = "create-post.html";
    } else {
      // အကောင့်မဝင်ထားရင် Login စာမျက်နှာကို မောင်းနှင်မယ်
      window.location.href = "login.html";
    }
  });
}
