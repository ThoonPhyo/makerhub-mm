// ─────────────────────────────────────────────────────────
// 🌐 API CONFIG
// ─────────────────────────────────────────────────────────
const API_BASE_URL = "https://6a1144953e35d0f37ee31c1d.mockapi.io/api";
const MARKET_API_URL = `${API_BASE_URL}/accounts/accounts`;

// ─────────────────────────────────────────────────────────
// 📦 GLOBAL STATE
// ─────────────────────────────────────────────────────────
let allMarketItems = [];
let allProjects = [];

// ─────────────────────────────────────────────────────────
// 👤 CURRENT USER
// ─────────────────────────────────────────────────────────
function getCurrentUser() {
  const sessionData = localStorage.getItem("userSession");
  return sessionData ? JSON.parse(sessionData) : null;
}

// ─────────────────────────────────────────────────────────
// 📥 LOAD MARKETPLACE ITEMS & PROJECTS
// ─────────────────────────────────────────────────────────
async function loadMarketplaceItems() {
  const loadingEl = document.getElementById("marketLoading");
  const containerEl = document.getElementById("marketGrid");

  try {
    const response = await fetch(MARKET_API_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch marketplace items");
    }

    const rawData = await response.json();

    // 💡 FIX 1: Market Items ရော Projects (Community) ရော နှစ်ခုလုံးကို ခွဲထုတ်ပြီး သိမ်းမယ်
    allMarketItems = rawData.filter((item) => item.type === "market").reverse();
    allProjects = rawData.filter((item) => item.type === "community").reverse(); // <- ဒါလေး ထည့်ပေးရပါမယ်!

    loadingEl?.classList.add("d-none");
    containerEl?.classList.remove("d-none");

    // 💡 FIX 2: API ကနေ ဒေတာတွေ ကျလာတဲ့အချိန်မှာ User လက်ရှိရောက်နေတဲ့ Tab အလိုက် UI ကို ချက်ချင်း Update လုပ်ပေးရန်
    const activeBtn = document.querySelector(".cat-btn-active");
    if (activeBtn) {
      const btnText = activeBtn.textContent.trim();

      if (btnText.includes("My Projects")) {
        filterItems("My Projects", activeBtn);
      } else if (btnText.includes("My Sell Items")) {
        filterItems("My Sell Items", activeBtn);
      } else if (btnText.includes("My Save Items")) {
        filterItems("My Save Items", activeBtn);
      }
    }
  } catch (error) {
    console.error("Marketplace & Projects Load Error:", error);
    loadingEl?.classList.add("d-none");

    if (containerEl) {
      containerEl.classList.remove("d-none");
      containerEl.innerHTML = `
        <div class="col-12 text-center text-danger py-5">
          ❌ Failed to load items.
        </div>
      `;
    }
  }
}

// ─────────────────────────────────────────────────────────
// 🎨 RENDER MARKET CARDS
// ─────────────────────────────────────────────────────────
function renderCards(items) {
  const containerEl = document.getElementById("marketGrid");

  if (!containerEl) return;

  containerEl.innerHTML = "";

  // empty state
  if (!items || items.length === 0) {
    containerEl.innerHTML = `

      <div class="col-12 text-center py-5">

        <h5 style="color: var(--text-muted);">

          No marketplace items found.

        </h5>

      </div>
    `;

    return;
  }

  items.forEach((item) => {
    // =====================================================
    // USER WISHLIST STATE
    // =====================================================

    const currentUser = getCurrentUser();

    const wishlistUsers = Array.isArray(item.wishlistUsers)
      ? item.wishlistUsers
      : [];

    const isSaved =
      currentUser && wishlistUsers.includes(String(currentUser.id));

    const bookmarkClass = isSaved
      ? "bi-bookmark-fill text-success"
      : "bi-bookmark";

    // =====================================================
    // IMAGE FALLBACK
    // =====================================================

    const finalImage =
      item.itemimage && item.itemimage.startsWith("http")
        ? item.itemimage
        : "https://images.unsplash.com/photo-1608564697171-2f6118fc5f37?w=500";

    // =====================================================
    // AVATAR FALLBACK
    // =====================================================

    const finalAvatar =
      item.sellerAvatar && item.sellerAvatar.startsWith("http")
        ? item.sellerAvatar
        : "https://ui-avatars.com/api/?name=Seller&background=161b22&color=22c55e&bold=true";

    // =====================================================
    // CARD HTML (With Integrated Hover Slide Delete Dropdown)
    // =====================================================
    const cardHtml = `
  <div
    class="col d-flex justify-content-center"
    id="market-item-${item.id}"
  >
    <div
      class="classic-market-card market-item-card position-relative h-100 d-flex flex-column shadow-sm border rounded-3 w-100"
    >
      
      <div class="card-action-dropdown shadow-sm">
        <button class="action-drop-btn delete-btn" onclick="deleteItem('${item.id}')">
          <i class="fa-regular fa-trash-can me-1"></i> Delete
        </button>
      </div>

      <div
        class="card-img-wrapper position-relative"
        style="
          height: 180px;
          background: #0d1117;
          overflow: hidden;
        "
      >
        <img
          src="${finalImage}"
          alt="${item.itemName}"
          class="w-100 h-100 object-fit-cover"
          onerror="
            this.onerror=null;
            this.src='https://images.unsplash.com/photo-1608564697171-2f6118fc5f37?w=500';
          "
        >
        <span
          class="condition-badge position-absolute top-0 end-0 m-2 badge bg-dark border"
        >
          ${item.condition || "Used"}
        </span>
      </div>

      <div
        class="p-3 d-flex flex-column flex-grow-1"
        style="background: var(--surface);"
      >
        <span
          class="classic-category"
          style="
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
          "
        >
          <i class="bi bi-tag-fill me-1"></i>
          ${item.itemcategory || "Others"}
        </span>

        <h6
          class="card-title text-truncate mb-1 fw-bold"
          title="${item.itemName}"
          style="
            color: var(--text);
            margin-top: 4px;
          "
        >
          ${item.itemName || "Untitled Item"}
        </h6>

        <div
          class="price-tag mb-2"
          style="
            color: var(--neon-green);
            font-weight: bold;
            font-size: 1.1rem;
          "
        >
          ${item.price || "0 MMK"}
        </div>

        <p
          class="text-muted small mb-3"
          style="
            font-size: 0.8rem;
            height: 2.4rem;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          "
        >
          ${item.itemdescription || "No description available."}
        </p>

        <div
          class="seller-info d-flex align-items-center gap-2 mb-3 pt-2"
          style="
            border-top: 1px solid var(--border);
            margin-top: auto;
          "
        >
          <img
            src="${finalAvatar}"
            alt="Seller"
            class="rounded-circle"
            style="
              width: 24px;
              height: 24px;
              object-fit: cover;
            "
          >
          <span
            class="small text-truncate"
            style="
              color: var(--text-muted);
              max-width: 120px;
              font-size: 0.8rem;
            "
          >
            ${item.sellerName || "Anonymous"}
          </span>
        </div>

        <div class="d-flex gap-2">
          <a
            href="/marketplace/market-detail/index.html?id=${item.id}"
            class="btn flex-grow-1 rounded-2"
            style="
              background: var(--bg-elevated);
              border: 1px solid var(--border);
              color: var(--text);
            "
          >
            <i class="bi bi-eye me-1"></i> View
          </a>

          <button
            class="btn rounded-2"
            id="saveBtn-${item.id}"
            onclick="toggleWishlist('${item.id}')"
            style="
              background: var(--bg-elevated);
              border: 1px solid var(--border);
              color: var(--text);
            "
          >
            <i
              class="bi ${bookmarkClass}"
              id="bookmarkIcon-${item.id}"
            ></i>
          </button>
        </div>

      </div>
    </div>
  </div>
`;

    containerEl.insertAdjacentHTML("beforeend", cardHtml);
  });
}

// ─────────────────────────────────────────────────────────
// 🔍 FILTER ITEMS (Section Toggle စနစ်ကို အောက်တွင် ဖြည့်စွက်ထားသည်)
// ─────────────────────────────────────────────────────────
function filterItems(category, btnElement) {
  const allBtns = document.querySelectorAll(".cat-btn");

  // reset buttons
  allBtns.forEach((btn) => {
    btn.classList.remove("cat-btn-active");
    btn.classList.add("btn-outline-secondary");
  });

  // active
  if (btnElement) {
    btnElement.classList.remove("btn-outline-secondary");
    btnElement.classList.add("cat-btn-active");
  }

  // HTML ပေါ်က HTML Sections တွေကို လှမ်းယူခြင်း
  const projectContainer = document.getElementById("projectContainer");
  const marketGridSection = document.getElementById("marketGrid");
  const projectLoading = document.getElementById("projectLoading");

  if (projectContainer) projectContainer.classList.add("d-none");
  if (marketGridSection) marketGridSection.classList.add("d-none");
  if (projectLoading) projectLoading.classList.add("d-none");

  // =====================================================
  // My Projects Tab
  // =====================================================
  if (category === "My Projects") {
    if (projectContainer) projectContainer.classList.remove("d-none");

    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert("Please login first.");
      window.location.href = "/login.html";
      return;
    }

    // display pj
    function displayProjects(projectsList) {
      const projectLoading = document.getElementById("projectLoading");
      if (projectLoading) projectLoading.classList.add("d-none");
      if (!projectContainer) return;
      projectContainer.innerHTML = "";

      if (projectsList.length === 0) {
        projectContainer.innerHTML = `<div class="col-12 text-muted text-center py-5">No projects found here yet!</div>`;
        return;
      }

      projectsList.forEach((project) => {
        projectContainer.innerHTML += `
    <div class="col">
      <a href="/community/project-detail.html?id=${project.id}" class="text-decoration-none text-dark">
        <div class="showcase-card position-relative">
            <div class="position-absolute top-0 end-0 m-2 delete-btn-wrapper" style="z-index: 5;">
                <button class="btn btn-sm btn-danger rounded-circle shadow" 
                    style="width: 30px; height: 30px; padding: 0;"
                    onclick="event.preventDefault(); event.stopPropagation(); deleteProject('${project.id}')">
            <i class="fa-regular fa-trash-can"></i>
            </button>
        </div>
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

    // filter my pj
    const myProjects = allProjects.filter(
      (project) => String(project.userId) === String(currentUser.id),
    );

    displayProjects(myProjects);

    return;
  }

  // =====================================================
  // My Sell Items (အစ်ကို့ မူရင်း "My Items" ကို နာမည်ပြန်ညှိထားသည်)
  // =====================================================
  if (category === "My Sell Items") {
    if (marketGridSection) marketGridSection.classList.remove("d-none");

    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert("Please login first.");
      window.location.href = "/login.html";
      return;
    }

    const myItems = allMarketItems.filter(
      (item) => String(item.sellerId) === String(currentUser.id),
    );

    renderCards(myItems);
    return;
  }

  // =====================================================
  // My Save Items (အစ်ကို့ မူရင်း "My Saved Items" ကို နာမည်ပြန်ညှိထားသည်)
  // =====================================================
  if (category === "My Save Items") {
    if (marketGridSection) marketGridSection.classList.remove("d-none");

    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert("Please login first.");
      window.location.href = "/login.html";
      return;
    }

    const savedItems = allMarketItems.filter((item) => {
      const wishlistUsers = Array.isArray(item.wishlistUsers)
        ? item.wishlistUsers
        : [];
      return wishlistUsers.includes(String(currentUser.id));
    });

    renderCards(savedItems);
    return;
  }
}

// ─────────────────────────────────────────────────────────
// ❤️ TOGGLE WISHLIST
// ─────────────────────────────────────────────────────────
async function toggleWishlist(itemId) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    alert("Please login first.");
    window.location.href = "/login.html";
    return;
  }

  const bookmarkIcon = document.getElementById(`bookmarkIcon-${itemId}`);
  if (!bookmarkIcon) return;

  const itemIndex = allMarketItems.findIndex(
    (item) => String(item.id) === String(itemId),
  );
  if (itemIndex === -1) return;

  const item = allMarketItems[itemIndex];
  let wishlistUsers = Array.isArray(item.wishlistUsers)
    ? item.wishlistUsers
    : [];
  const userId = String(currentUser.id);
  const alreadySaved = wishlistUsers.includes(userId);

  if (alreadySaved) {
    wishlistUsers = wishlistUsers.filter((id) => id !== userId);
  } else {
    wishlistUsers.push(userId);
  }

  try {
    const response = await fetch(`${MARKET_API_URL}/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wishlistUsers }),
    });

    if (!response.ok) {
      throw new Error("Failed to update wishlist");
    }

    allMarketItems[itemIndex].wishlistUsers = wishlistUsers;

    if (!alreadySaved) {
      bookmarkIcon.classList.remove("bi-bookmark");
      bookmarkIcon.classList.add("bi-bookmark-fill", "text-success");
      alert("❤️ Added to watchlist!");
    } else {
      bookmarkIcon.classList.remove("bi-bookmark-fill", "text-success");
      bookmarkIcon.classList.add("bi-bookmark");
      alert("🤍 Removed from watchlist!");

      // Refresh Watchlist Area (စာသားကို HTML အတိုင်း My Save Items ဟု ပြင်ထားသည်)
      const activeBtn = document.querySelector(".cat-btn-active");
      if (activeBtn && activeBtn.textContent.includes("My Save Items")) {
        filterItems("My Save Items", activeBtn);
      }
    }
  } catch (error) {
    console.error("Wishlist Toggle Error:", error);
    alert("❌ Failed to update watchlist.");
  }
}

// ─────────────────────────────────────────────────────────
// 🗑️ DELETE ITEM
// ─────────────────────────────────────────────────────────

async function deleteItem(itemId) {
  const currentUser = getCurrentUser();

  // must login
  if (!currentUser) {
    alert("Please login first.");

    return;
  }

  try {
    // get latest item data
    const response = await fetch(`${MARKET_API_URL}/${itemId}`);

    if (!response.ok) {
      throw new Error("Item not found");
    }

    const item = await response.json();

    // owner check
    const isOwner = String(currentUser.id) === String(item.sellerId);

    if (!isOwner) {
      alert("❌ You can only delete your own item.");

      return;
    }

    // confirm
    const confirmDelete = confirm(
      "⚠️ Are you sure you want to delete this item?",
    );

    if (!confirmDelete) return;

    // button
    const btnDelete = document.getElementById("btnDelete");

    if (btnDelete) {
      btnDelete.disabled = true;

      btnDelete.innerHTML = `
        <span class="spinner-border spinner-border-sm"></span>
      `;
    }

    // delete
    const deleteResponse = await fetch(`${MARKET_API_URL}/${itemId}`, {
      method: "DELETE",
    });

    if (!deleteResponse.ok) {
      throw new Error("Delete failed");
    }

    alert("🗑️ Item deleted successfully!");

    window.location.href = "../index.html";
  } catch (error) {
    console.error("Delete Error:", error);

    alert("❌ Failed to delete item.");

    const btnDelete = document.getElementById("btnDelete");

    if (btnDelete) {
      btnDelete.disabled = false;

      btnDelete.innerHTML = `
        <i class="bi bi-trash3"></i>
      `;
    }
  }
}

// ─────────────────────────────────────────────────────────
// 🚀 DELETE PROJECT ONLY FUNCTION
// ─────────────────────────────────────────────────────────
async function deleteProject(projectId) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    alert("Please login first.");
    return;
  }

  try {
    // API ကနေ သက်ဆိုင်ရာ Project Data ကို လှမ်းယူမယ်
    const response = await fetch(`${MARKET_API_URL}/${projectId}`);
    if (!response.ok) {
      throw new Error("Project not found");
    }

    const project = await response.json();

    // Project ပိုင်ရှင် ဟုတ်မဟုတ် စစ်ဆေးမယ် (userId ကို သုံးထားပါတယ်)
    const isOwner = String(currentUser.id) === String(project.userId);
    if (!isOwner) {
      alert("❌ You can only delete your own project.");
      return;
    }

    // သေချာလား မေးမယ်
    if (!confirm("⚠️ Are you sure you want to delete this project?")) return;

    // API သို့ DELETE Request ပို့မယ်
    const deleteResponse = await fetch(`${MARKET_API_URL}/${projectId}`, {
      method: "DELETE",
    });

    if (!deleteResponse.ok) {
      throw new Error("Delete failed");
    }

    alert("🗑️ Project deleted successfully!");

    // Page ကို ချက်ချင်း Refresh လုပ်ပြီး Data အသစ် ပြန်ဆွဲခိုင်းမယ်
    window.location.reload();
  } catch (error) {
    console.error("Project Delete Error:", error);
    alert("❌ Failed to delete project.");
  }
}

// ─────────────────────────────────────────────────────────
// 🏁 INITIALIZATION (စုစည်းပြီး သပ်ရပ်အောင် ပေါင်းစည်းထားသည်)
// ─────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const sessionData = localStorage.getItem("userSession");

  // ── AUTH GUARD ──
  if (!sessionData) {
    alert("Please log in to access your profile.");
    window.location.href = "/login.html";
    return;
  }

  const user = JSON.parse(sessionData);
  document.title = `MakerHub MM | ${user.name}'s Profile`;

  // ── UI ELEMENTS INJECTIONS ──
  const avatarImg = document.getElementById("profile-avatar");
  const nameDisplay = document.getElementById("profile-name");
  const emailDisplay = document.getElementById("profile-email");
  const xpDisplay = document.getElementById("profile-xp");

  if (nameDisplay) nameDisplay.textContent = user.name;
  if (emailDisplay) emailDisplay.textContent = user.email;
  if (avatarImg) {
    avatarImg.src =
      user.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=161b22&color=22c55e&bold=true`;
  }
  if (xpDisplay) xpDisplay.textContent = `${user.student_total_xp || 0} XP`;

  // 💡 BLANK FIXED: Page စပွင့်ချင်းမှာ ပထမဆုံး Tab (Learning Progress) ကို ချက်ချင်းနှိပ်ခိုင်းထားမည်
  const defaultBtn = document.querySelector(".cat-btn");
  if (defaultBtn) {
    filterItems("My Projects", defaultBtn);
  }

  // ── BACKGROUND DATA CALLS ──
  loadMarketplaceItems();

  // ReferenceError မတက်အောင် ကုဒ်ရှိမှသာ ရန်းရန် Safe ပုံစံဖြင့် စစ်ထားပါသည်
  if (typeof loadHeroCards === "function") {
    loadHeroCards();
  }

  console.log("Profile loaded successfully for:", user.name);
});
