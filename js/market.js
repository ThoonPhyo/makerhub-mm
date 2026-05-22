// ─────────────────────────────────────────────────────────
// 🌐 1. API CONFIGURATIONS
// ─────────────────────────────────────────────────────────
const BASE_URL = "https://6a0e53941736097c3609b735.mockapi.io/api/v1";
const apiMarketUrl = `${BASE_URL}/marketplace`;

// To store all market items in memory from the API
let allMarketItems = [];

// ─────────────────────────────────────────────────────────
// 📥 2. DATA LOADING FUNCTIONS
// ─────────────────────────────────────────────────────────

// Fetch all market items from the API and store them in memory
async function loadMarketplaceItems() {
  const loadingEl = document.getElementById("marketLoading");
  const containerEl = document.getElementById("marketGrid");

  try {
    const response = await fetch(apiMarketUrl);
    if (!response.ok) throw new Error("Failed to fetch marketplace data");

    allMarketItems = await response.json();

    if (loadingEl) loadingEl.classList.add("d-none");
    if (containerEl) containerEl.classList.remove("d-none");

    // HTML Cards တွေကို မူရင်းဒေတာအတိုင်း တန်းပြီး Render လုပ်မယ်
    renderCards(allMarketItems);

  } catch (error) {
    console.error("Error rendering marketplace:", error);
    if (loadingEl) loadingEl.classList.add("d-none");
    if (containerEl) {
      containerEl.classList.remove("d-none");
      containerEl.innerHTML = `<div class="col-12 text-center text-danger py-4">❌ Error loading items.</div>`;
    }
  }
}

// ─────────────────────────────────────────────────────────
// 🎨 3. UI RENDERING FUNCTION (CORE)
// ─────────────────────────────────────────────────────────
function renderCards(items) {
  const containerEl = document.getElementById("marketGrid");
  if (!containerEl) return;
  
  containerEl.innerHTML = "";

  if (items.length === 0) {
    containerEl.innerHTML = `<div class="col-12 text-center py-5"><h5 style="color: var(--text-muted);">No items found in this category.</h5></div>`;
    return;
  }

  items.forEach((item) => {
    const isSaved = item.wishlist === true;
    const iconClass = isSaved ? "bi-bookmark-fill text-success" : "bi-bookmark";

    // 💡 API ဒေတာက "itemName 1" လိုမျိုး Dummy ဖြစ်နေရင် Real Feel ဖြစ်အောင် ပြောင်းပေးမည့် Logic
    const isDummy = item.itemName && item.itemName.includes("itemName");
    
    const finalImage = (item.image && item.image.includes("http")) 
      ? item.image 
      : `https://images.unsplash.com/photo-1608564697171-2f6118fc5f37?w=500&q=80&sig=${item.id}`;

    const finalName = isDummy ? `Maker Hardware Component v${item.id}` : item.itemName;
    const finalPrice = isDummy ? `${(item.id * 15000).toLocaleString()} MMK` : item.price;
    const finalCondition = isDummy ? (item.id % 2 === 0 ? "New" : "Used") : item.condition;
    const finalCategory = isDummy ? (item.id % 2 === 0 ? "Microcontrollers" : "Sensors") : item.category;
    const finalDesc = isDummy ? "Premium grade electronic component for DIY makers and hardware engineers. High durability and stable performance." : item.description;
    const finalSeller = isDummy ? `Developer ${item.id}` : item.sellerName;
    const finalAvatar = isDummy ? `https://ui-avatars.com/api/?name=${finalSeller}&background=random&color=fff` : item.sellerAvatar;

    const cardHtml = `
      <div class="col-12 col-sm-6 col-lg-4 col-xl-3" id="market-item-${item.id}">
        <div class="classic-market-card h-100 d-flex flex-column shadow-sm border rounded-3">
          
          <div class="card-img-wrapper position-relative" style="height: 180px; background: #0d1117; overflow: hidden;">
            <img src="${finalImage}" alt="${finalName}" class="w-100 h-100 object-fit-cover"
                 onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1608564697171-2f6118fc5f37?w=500';">
            <span class="condition-badge position-absolute top-0 end-0 m-2 badge bg-dark border">${finalCondition || "Used"}</span>
          </div>

          <div class="p-3 d-flex flex-column flex-grow-1" style="background: var(--surface); box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);">
            
            <span class="classic-category" style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">
              <i class="bi bi-tag-fill me-1"></i> ${finalCategory || "Others"}
            </span>

            <h6 class="card-title text-truncate mb-1 fw-bold classic-title" title="${finalName}" style="color: var(--text); margin-top: 4px;">
              ${finalName}
            </h6>
            
            <div class="price-tag mb-2 classic-price" style="color: var(--neon-green); font-weight: bold; font-size: 1.1rem;">${finalPrice}</div>
            
            <p class="text-muted small mb-3 text-truncate-2 classic-desc" style="font-size: 0.8rem; height: 2.4rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
              ${finalDesc}
            </p>

            <div class="seller-info d-flex align-items-center gap-2 mb-3 pt-2 classic-seller-box" style="border-top: 1px solid rgba(240,246,252,0.06); margin-top: auto;">
              <img src="${finalAvatar}" class="rounded-circle classic-avatar" style="width:24px; height:24px;" alt="Seller">
              <span class="small text-truncate classic-seller-name" style="color: var(--text-muted); max-width: 120px; font-size: 0.8rem;">${finalSeller || "Anonymous"}</span>
            </div>

            <div class="d-flex gap-2">
              <a href="market-detail/index.html?id=${item.id}" class="btn flex-grow-1 text-nowrap rounded-2 classic-btn" style="background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text);">
                <i class="bi bi-telephone me-1"></i> View
              </a>
              <button class="btn rounded-2 classic-btn" id="saveBtn-${item.id}" onclick="toggleWishlist('${item.id}')" style="background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text);">
                <i class="bi ${iconClass}" id="bookmarkIcon-${item.id}"></i>
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
// 🔍 4. FILTER LOGIC
// ─────────────────────────────────────────────────────────
function filterItems(category, btnElement) {
  const allBtns = document.querySelectorAll(".cat-btn");
  allBtns.forEach((btn) => {
    btn.classList.remove("cat-btn-active");
    btn.classList.add("btn-outline-secondary");
    btn.style.color = "var(--text)";
  });

  if (btnElement) {
    btnElement.classList.remove("btn-outline-secondary");
    btnElement.classList.add("cat-btn-active");
  }

  if (category === "All") {
    renderCards(allMarketItems);
  } else if (category === "Saved Items") {
    // 💡 ၁။ Saved Items အတွက်ဆိုရင် Wishlist true ဖြစ်တာတွေကိုပဲ ယူမယ် (အရမ်းရိုးရှင်းပါတယ်)
    const savedData = allMarketItems.filter(item => item.wishlist === true);
    renderCards(savedData);
    
  }else {
    const filteredData = allMarketItems.filter((item) => {
      // Dummy data ရော Real data ပါ Category စစ်လို့ရအောင် ညှိထားပါတယ်
      const isDummy = item.itemName && item.itemName.includes("itemName");
      const finalCategory = isDummy ? (item.id % 2 === 0 ? "microcontrollers" : "sensors") : (item.category ? item.category.toLowerCase() : "");
      
      const itemName = item.itemName ? item.itemName.toLowerCase() : "";
      const targetCat = category.toLowerCase();

      return finalCategory.includes(targetCat) || itemName.includes(targetCat);
    });
    renderCards(filteredData);
  }
}

// ─────────────────────────────────────────────────────────
// ❤️ 5. WISHLIST TOGGLE LOGIC (PUT METHOD)
// ─────────────────────────────────────────────────────────
async function toggleWishlist(itemId) {
  const bookmarkIcon = document.getElementById(`bookmarkIcon-${itemId}`);
  if (!bookmarkIcon) return;

  // Memory ထဲက သက်ဆိုင်ရာ item index ကို ရှာမယ်
  const itemIndex = allMarketItems.findIndex(i => String(i.id) === String(itemId));
  if (itemIndex === -1) return;

  // လက်ရှိ status ကို ပြောင်းပြန်လှန်မယ် (true -> false / false -> true)
  const currentStatus = allMarketItems[itemIndex].wishlist === true;
  const newStatus = !currentStatus;

  try {
    // MockAPI ရဲ့ မူရင်း Item ဆီကို PUT Method နဲ့ တိုက်ရိုက်သွားပြင်မယ်
    const res = await fetch(`${apiMarketUrl}/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wishlist: newStatus })
    });

    if (!res.ok) throw new Error("Failed to update wishlist status");

    // Memory (Local array) ထဲမှာပါ အခြေအနေ လိုက်ပြင်မယ်
    allMarketItems[itemIndex].wishlist = newStatus;

    // UI Icon ကို ချက်ချင်း မီးလင်း/မီးပိတ် လုပ်မယ်
    if (newStatus) {
      bookmarkIcon.classList.remove("bi-bookmark");
      bookmarkIcon.classList.add("bi-bookmark-fill", "text-success");
      alert("❤️ Added to your Watchlist!");
    } else {
      bookmarkIcon.classList.remove("bi-bookmark-fill", "text-success");
      bookmarkIcon.classList.add("bi-bookmark");
      alert("🤍 Removed from your Watchlist!");
    }

  } catch (err) {
    console.error("Toggle Wishlist Error:", err);
    alert("❌ Error updating watchlist.");
  }
}

// ─────────────────────────────────────────────────────────
// 🚀 6. HERO SECTION DECOR CARDS
// ─────────────────────────────────────────────────────────
async function loadHeroCards() {
  const container = document.getElementById("heroDecorContainer");
  if (!container) return;

  try {
    const response = await fetch(`${apiMarketUrl}?page=1&limit=3`);
    const items = await response.json();

    container.innerHTML = items
      .map((item, index) => {
        const animClass = `hero-card-${index + 1}`;
        const isDummy = item.itemName && item.itemName.includes("itemName");

        const finalImage = (item.image && item.image.includes("http")) 
          ? item.image 
          : `https://images.unsplash.com/photo-1608564697171-2f6118fc5f37?w=150&sig=${item.id}`;
        
        const finalName = isDummy ? `Component v${item.id}` : item.itemName;
        const finalPrice = isDummy ? `${(item.id * 15000).toLocaleString()} MMK` : item.price;
        const finalCategory = isDummy ? (item.id % 2 === 0 ? "Hardware" : "Sensors") : item.category;

        return `
        <div class="${animClass}" style="width: 130px; margin: 0 5px; transition: all 0.3s ease;">
          <div class="market-card h-100 d-flex flex-column" style="background-color: var(--bg-elevated); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.5);">
            <div class="card-img-wrapper" style="position: relative; width: 100%; height: 85px; background-color: var(--bg);">
              <img src="${finalImage}" alt="${finalName}" style="width: 100%; height: 100%; object-fit: cover;">
              <span class="badge position-absolute" style="top: 5px; right: 5px; background: rgba(0, 0, 0, 0.7); color: #fff; padding: 2px 6px; border: 1px solid var(--border); backdrop-filter: blur(4px); font-size: 0.55rem;">
                ${item.condition || "Used"}
              </span>
            </div>
            <div class="p-2 d-flex flex-column flex-grow-1 text-start" style="line-height: 1.2;">
              <span style="font-size: 0.55rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px;">
                <i class="bi bi-tag-fill"></i> ${finalCategory}
              </span>
              <h6 class="card-title text-truncate mb-1 fw-bold" style="color: var(--text); font-size: 0.75rem; margin-bottom: 2px;" title="${finalName}">
                ${finalName}
              </h6>
              <div class="price-tag mb-1" style="color: #22c55e; font-size: 0.8rem; font-weight: bold; margin-bottom: 4px;">
                ${finalPrice}
              </div>
            </div>
          </div>
        </div>
      `;
      })
      .join("");
  } catch (err) {
    console.error("Hero cards loading failed", err);
  }
}

// ─────────────────────────────────────────────────────────
// 🏁 7. INITIALIZATION
// ─────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadMarketplaceItems(); 
  loadHeroCards(); 
});