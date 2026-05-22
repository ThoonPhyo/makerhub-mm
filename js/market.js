const BASE_URL = "https://6a0e53941736097c3609b735.mockapi.io/api/v1";
const apiMarketUrl = `${BASE_URL}/marketplace`;

// to store all market items in memory from the API
let allMarketItems = [];

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

// Render marketplace items as cards
function renderCards(items) {
  const containerEl = document.getElementById("marketGrid");
  containerEl.innerHTML = "";

  if (items.length === 0) {
    containerEl.innerHTML = `<div class="col-12 text-center py-5"><h5 style="color: var(--text-muted);">No items found in this category.</h5></div>`;
    return;
  }

  items.forEach((item) => {
    const cardHtml = `
      <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <div class="market-card h-100 d-flex flex-column">
          <div class="card-img-wrapper">
            <img src="${item.image || "https://via.placeholder.com/300x180"}" alt="${item.itemName}">
            <span class="condition-badge">${item.condition || "Used"}</span>
          </div>
          <div class="p-3 d-flex flex-column flex-grow-1">
            
            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
              <i class="bi bi-tag-fill me-1"></i> ${item.category || "Others"}
            </span>

            <h6 class="card-title text-truncate mb-1 fw-bold" title="${item.itemName}" style="color: var(--text);">${item.itemName}</h6>
            <div class="price-tag mb-2" style="color: var(--neon-green); font-size: 1.1rem; font-weight: bold;">${item.price}</div>
            <p class="text-muted small mb-3 text-truncate-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 0.8rem; height: 2.4rem;">
              ${item.description || "No description provided."}
            </p>
            <div class="seller-info d-flex align-items-center gap-2 mb-3 pt-2" style="border-top: 1px solid rgba(240,246,252,0.06);">
              <img src="${item.sellerAvatar || "https://ui-avatars.com/api/?name=User"}" class="rounded-circle" style="width:24px; height:24px;" alt="Seller">
              <span class="small text-truncate" style="color: var(--text-muted); max-width: 120px;">${item.sellerName || "Anonymous"}</span>
            </div>
            <div class="d-flex gap-2 mt-auto">
              <a href="market-detail/index.html?id=${item.id}" class="btn flex-grow-1 text-nowrap rounded-2" style="background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text);">
                <i class="bi bi-telephone me-1"></i> View
              </a>
              <button class="btn rounded-2" onclick="saveForLater('${item.id}')" style="background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text);">
                <i class="bi bi-heart"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    containerEl.insertAdjacentHTML("beforeend", cardHtml);
  });
}

//filter items by category
function filterItems(category, btnElement) {
  // ၁။ ခလုတ်တွေ အားလုံးဆီကနေ Active Style တွေကို အရင်ဖျက်မယ်
  const allBtns = document.querySelectorAll(".cat-btn");
  allBtns.forEach((btn) => {
    btn.classList.remove("cat-btn-active");
    btn.classList.add("btn-outline-secondary");
    btn.style.color = "var(--text)";
  });

  // ၂။ အခု လက်ရှိနှိပ်လိုက်တဲ့ ခလုတ်တစ်ခုတည်းကိုပဲ Active ဖြစ်အောင် အရောင်ပြောင်းမယ်
  btnElement.classList.remove("btn-outline-secondary");
  btnElement.classList.add("cat-btn-active");

  // ၃။ ဒေတာတွေကို အမျိုးအစားအလိုက် စစ်ထုတ်မယ် (Filtering Logic)
  if (category === "All") {
    renderCards(allMarketItems);
  } else {
    const filteredData = allMarketItems.filter((item) => {
      const itemCat = item.category ? item.category.toLowerCase() : "";
      const itemName = item.itemName ? item.itemName.toLowerCase() : "";
      const targetCat = category.toLowerCase();

      return itemCat.includes(targetCat) || itemName.includes(targetCat);
    });

    renderCards(filteredData);
  }
}

// hero section cards
// ၁။ HERO SECTION CARDS (ဒီဇိုင်းလှရုံ သီးသန့်ပြမယ့် ပစ္စည်း ၃ ခု)
// ─── HERO SECTION CARDS (Micro Real Card for 290px Hero Section) ─────
async function loadHeroCards() {
  const container = document.getElementById("heroDecorContainer");
  if (!container) return;

  try {
    const response = await fetch(`${apiMarketUrl}?page=1&limit=3`);
    const items = await response.json();

    container.innerHTML = items
      .map((item, index) => {
        const animClass = `hero-card-${index + 1}`;

        return `
        <div class="${animClass}" style="width: 130px; margin: 0 5px; transition: all 0.3s ease;">
          
          <div class="market-card h-100 d-flex flex-column" style="background-color: var(--bg-elevated); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.5);">
            
            <div class="card-img-wrapper" style="position: relative; width: 100%; height: 85px; background-color: var(--bg);">
              <img src="${item.image || "https://via.placeholder.com/150"}" alt="${item.itemName}" style="width: 100%; height: 100%; object-fit: cover;">
              <span class="badge position-absolute" style="top: 5px; right: 5px; background: rgba(0, 0, 0, 0.7); color: #fff; padding: 2px 6px; border: 1px solid var(--border); backdrop-filter: blur(4px); font-size: 0.55rem;">
                ${item.condition || "Used"}
              </span>
            </div>
            
            <div class="p-2 d-flex flex-column flex-grow-1 text-start" style="line-height: 1.2;">
              
              <span style="font-size: 0.55rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px;">
                <i class="bi bi-tag-fill"></i> ${item.category || "Others"}
              </span>

              <h6 class="card-title text-truncate mb-1 fw-bold" style="color: var(--text); font-size: 0.75rem; margin-bottom: 2px;" title="${item.itemName}">
                ${item.itemName}
              </h6>
              
              <div class="price-tag mb-1" style="color: #22c55e; font-size: 0.8rem; font-weight: bold; margin-bottom: 4px;">
                ${item.price}
              </div>
              
              <div class="seller-info d-flex align-items-center gap-1 pt-15" style="border-top: 1px solid rgba(240,246,252,0.04); margin-top: auto;">
                <img src="${item.sellerAvatar || "https://ui-avatars.com/api/?name=User"}" class="rounded-circle" style="width:14px; height:14px;" alt="Seller">
                <span class="small text-truncate" style="color: var(--text-muted); font-size: 0.6rem; max-width: 80px;">
                  ${item.sellerName || "Anonymous"}
                </span>
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

// ၂။ WISHLIST FUNCTION (Local Storage ထဲမှာ ID သွားသိမ်းတာ)
function saveForLater(itemId) {
  // Local Storage ထဲမှာ အရင်က သိမ်းထားတဲ့ စာရင်းရှိရင် ယူမယ်၊ မရှိရင် Array အလွတ် [] ဆောက်မယ်
  let wishlist = JSON.parse(localStorage.getItem("market_wishlist") || "[]");

  // အခုနှိပ်တဲ့ ပစ္စည်း ID က စာရင်းထဲမှာ မရှိသေးရင် အသစ်ထည့်မယ်
  if (!wishlist.includes(itemId)) {
    wishlist.push(itemId);
    localStorage.setItem("market_wishlist", JSON.stringify(wishlist)); // Local Storage ထဲ ပြန်သိမ်းမယ်
    alert("❤️ Item added to your Watchlist (Save for later)!");
  } else {
    alert("ℹ️ This item is already in your Watchlist!");
  }
}

// ၃။ INITIALIZATION (စက်နှိုးခြင်း အပိုင်း)
document.addEventListener("DOMContentLoaded", () => {
  loadMarketplaceItems(); // ပင်မ ပစ္စည်းတွေကို API ကနေ ဆွဲတင်မယ်
  loadHeroCards(); // Hero Section က Card ၃ ခုကို ဆွဲတင်မယ်
});
