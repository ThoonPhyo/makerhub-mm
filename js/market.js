// ─────────────────────────────────────────────────────────
// 🌐 API CONFIG
// ─────────────────────────────────────────────────────────

const API_BASE_URL = "https://6a1144953e35d0f37ee31c1d.mockapi.io/api";

const MARKET_API_URL = `${API_BASE_URL}/accounts/accounts`; // 💡 အစ်ကို့ MockAPI URL ထည့်ပါ

// ─────────────────────────────────────────────────────────
// 📦 GLOBAL STATE
// ─────────────────────────────────────────────────────────

let allMarketItems = [];

// ─────────────────────────────────────────────────────────
// 👤 CURRENT USER
// ─────────────────────────────────────────────────────────

function getCurrentUser() {
  const sessionData = localStorage.getItem("userSession");

  return sessionData ? JSON.parse(sessionData) : null;
}

// ─────────────────────────────────────────────────────────
// 📥 LOAD MARKETPLACE ITEMS
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

    // 🚀 FILTER: Keep only the items that are actually marked as 'market'
    // This removes all user accounts and community posts from the marketplace view
    const filteredItems = rawData.filter((item) => item.type === "market");

    // newest first
    filteredItems.reverse();
    // save globally
    allMarketItems = filteredItems;

    loadingEl?.classList.add("d-none");
    containerEl?.classList.remove("d-none");

    // 🚀 Pass the FILTERED data to your renderer
    renderCards(filteredItems);
  } catch (error) {
    console.error("Marketplace Load Error:", error);

    loadingEl?.classList.add("d-none");

    if (containerEl) {
      containerEl.classList.remove("d-none");

      containerEl.innerHTML = `

        <div class="col-12 text-center text-danger py-5">

          ❌ Failed to load marketplace items.

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
    // CARD HTML
    // =====================================================

    const cardHtml = `

      <div
        class="col d-flex justify-content-center"
        id="market-item-${item.id}"
      >

        <div
          class="classic-market-card h-100 d-flex flex-column shadow-sm border rounded-3 w-100"
        >

          <!-- IMAGE -->
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

          <!-- CONTENT -->
          <div
            class="p-3 d-flex flex-column flex-grow-1"
            style="background: var(--surface);"
          >

            <!-- CATEGORY -->
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

            <!-- TITLE -->
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

            <!-- PRICE -->
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

            <!-- DESCRIPTION -->
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

            <!-- SELLER -->
            <div
              class="seller-info d-flex align-items-center gap-2 mb-3 pt-2"
              style="
                border-top: 1px solid rgba(240,246,252,0.06);
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

            <!-- BUTTONS -->
            <div class="d-flex gap-2">

              <!-- VIEW -->
              <a
                href="./market-detail/index.html?id=${item.id}"

                class="btn flex-grow-1 rounded-2"

                style="
                  background: var(--bg-elevated);
                  border: 1px solid var(--border);
                  color: var(--text);
                "
              >

                <i class="bi bi-eye me-1"></i>

                View

              </a>

              <!-- SAVE -->
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
// 🔍 FILTER ITEMS
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

  // =====================================================
  // ALL
  // =====================================================

  if (category === "All") {
    renderCards(allMarketItems);

    return;
  }

  // =====================================================
  // SAVED ITEMS
  // =====================================================

  if (category === "Saved Items") {
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

  // =====================================================
  // NORMAL CATEGORY
  // =====================================================

  const filteredItems = allMarketItems.filter((item) => {
    const itemCategory = item.itemcategory ? item.itemcategory.toLowerCase() : "";

    return itemCategory.includes(category.toLowerCase());
  });

  renderCards(filteredItems);
}

// ─────────────────────────────────────────────────────────
// ❤️ TOGGLE WISHLIST
// ─────────────────────────────────────────────────────────

async function toggleWishlist(itemId) {
  // login check
  const currentUser = getCurrentUser();

  if (!currentUser) {
    alert("Please login first.");

    window.location.href = "/login.html";

    return;
  }

  // find icon
  const bookmarkIcon = document.getElementById(`bookmarkIcon-${itemId}`);

  if (!bookmarkIcon) return;

  // find item
  const itemIndex = allMarketItems.findIndex(
    (item) => String(item.id) === String(itemId),
  );

  if (itemIndex === -1) return;

  const item = allMarketItems[itemIndex];

  // wishlist users
  let wishlistUsers = Array.isArray(item.wishlistUsers)
    ? item.wishlistUsers
    : [];

  const userId = String(currentUser.id);

  const alreadySaved = wishlistUsers.includes(userId);

  // remove
  if (alreadySaved) {
    wishlistUsers = wishlistUsers.filter((id) => id !== userId);
  } else {
    // add
    wishlistUsers.push(userId);
  }

  try {
    // update api
    const response = await fetch(`${MARKET_API_URL}/${itemId}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        wishlistUsers,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update wishlist");
    }

    // update memory
    allMarketItems[itemIndex].wishlistUsers = wishlistUsers;

    // saved
    if (!alreadySaved) {
      bookmarkIcon.classList.remove("bi-bookmark");

      bookmarkIcon.classList.add("bi-bookmark-fill", "text-success");

      alert("❤️ Added to watchlist!");
    } else {
      // removed
      bookmarkIcon.classList.remove("bi-bookmark-fill", "text-success");

      bookmarkIcon.classList.add("bi-bookmark");

      alert("🤍 Removed from watchlist!");

      // refresh saved page
      const activeBtn = document.querySelector(".cat-btn-active");

      if (activeBtn && activeBtn.textContent.includes("Saved Items")) {
        filterItems("Saved Items", activeBtn);
      }
    }
  } catch (error) {
    console.error("Wishlist Toggle Error:", error);

    alert("❌ Failed to update watchlist.");
  }
}

// ─────────────────────────────────────────────────────────
// 🚀 HERO SECTION CARDS
// ─────────────────────────────────────────────────────────

async function loadHeroCards() {
  const container = document.getElementById("heroDecorContainer");
  if (!container) return;

  try {
    // 🚀 FIXED: Added type=market to the URL.
    // This ensures you only get market items, not user accounts.
    const response = await fetch(
      `${MARKET_API_URL}?type=market&page=1&limit=3`,
    );

    if (!response.ok) {
      throw new Error("Failed to load hero cards");
    }

    const items = await response.json();

    // 🛡️ Optional Safety: Check if items exist before mapping
    if (items.length === 0) {
      container.innerHTML =
        '<p class="text-muted text-center">No items available.</p>';
      return;
    }

    container.innerHTML = items
      .map((item, index) => {
        // ... (rest of your existing mapping logic remains exactly the same)
        const animClass = `hero-card-${index + 1}`;
        const finalImage =
          item.itemimage && item.itemimage.startsWith("http")
            ? item.itemimage
            : "https://images.unsplash.com/photo-1608564697171-2f6118fc5f37?w=150";

        return `
            <div class="${animClass}" style="width: 130px; margin: 0 5px; transition: all 0.3s ease;">
              <div class="market-card h-100 d-flex flex-column" style="background-color: var(--bg-elevated); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.5);">
                <div class="card-img-wrapper" style="position: relative; width: 100%; height: 85px; background-color: var(--bg);">
                  <img src="${finalImage}" alt="${item.itemName}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div class="p-2 d-flex flex-column flex-grow-1 text-start" style="line-height: 1.2;">
                  <span style="font-size: 0.55rem; color: var(--text-muted); text-transform: uppercase;">
                    ${item.itemcategory || "Others"}
                  </span>
                  <h6 class="card-title text-truncate mb-1 fw-bold" title="${item.itemName}" style="color: var(--text); font-size: 0.75rem;">
                    ${item.itemName || "Untitled"}
                  </h6>
                  <div class="price-tag" style="color: var(--green); font-size: 0.8rem; font-weight: bold;">
                    ${item.price || "0 MMK"}
                  </div>
                </div>
              </div>
            </div>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Hero Cards Error:", error);
  }
}

// ─────────────────────────────────────────────────────────
// 🏁 INITIALIZATION
// ─────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  loadMarketplaceItems();

  loadHeroCards();
});
