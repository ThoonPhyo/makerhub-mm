const BASE_URL = "https://6a0e53941736097c3609b735.mockapi.io/api/v1"; 
const apiMarketUrl = `${BASE_URL}/marketplace`;

// လက်ရှိ App ရဲ့ Login ဖြစ်နေတဲ့ User Name ( market-post.js က နာမည်နဲ့ တူရပါမယ် )
const CURRENT_LOGGED_USER = "Thoon Phyo Aung";

// URL ကနေ ?id=1 စတဲ့ Query Parameter ကို ဖမ်းထုတ်ခြင်း
const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get("id");

async function loadItemDetail() {
  if (!itemId) {
    alert("Invalid Item ID");
    window.location.href = "../index.html";
    return;
  }

  try {
    const response = await fetch(`${apiMarketUrl}/${itemId}`);
    if (!response.ok) throw new Error("Item not found");

    const item = await response.json();

    // UI Elements ထဲသို့ ဒေတာများ ထည့်သွင်းခြင်း
    const carouselInner = document.getElementById("carouselInner");
    const btnPrev = document.getElementById("carouselPrev");
    const btnNext = document.getElementById("carouselNext");

    // 💡 အရင်ကတင်ထားတဲ့ ပစ္စည်းတွေမှာ "images" array မပါရင် ပုံအဟောင်း (item.image) ကိုပဲ အသုံးပြုရန် စစ်ဆေးခြင်း
    const imagesToDisplay = (item.images && item.images.length > 0) ? item.images : [item.image || "https://via.placeholder.com/400x300"];

    // အဟောင်းတွေ ရှင်းထုတ်ခြင်း
    carouselInner.innerHTML = "";

    // 💡 ပုံတွေကို တစ်ပုံချင်းစီ Carousel ထဲ ထည့်သွင်းခြင်း
    imagesToDisplay.forEach((imgUrl, index) => {
      // Bootstrap Carousel မှာ ပထမဆုံးပုံက "active" ဖြစ်နေမှ ပုံပေါ်ပါတယ်
      const isActive = index === 0 ? "active" : "";
      
      const imgHtml = `
        <div class="carousel-item ${isActive}">
          <img src="${imgUrl}" class="detail-img w-100" alt="Item Image" style="object-fit: contain; max-height: 400px;">
        </div>
      `;
      // carousel ထဲကို ပုံတွေ လှမ်းထည့်ခြင်း
      carouselInner.insertAdjacentHTML("beforeend", imgHtml);
    });

    // 💡 ပုံ (၁) ပုံထက် များမှသာ အရှေ့/အနောက် သွားတဲ့ မြှားခလုတ်လေးတွေကို ဖော်ပြပေးပါမယ်
    if (imagesToDisplay.length > 1) {
      btnPrev.classList.remove("d-none");
      btnNext.classList.remove("d-none");
    }
    
    document.getElementById("itemName").innerText = item.itemName;
    document.getElementById("itemPrice").innerText = item.price;
    document.getElementById("itemCondition").innerText = item.condition;
    document.getElementById("itemDesc").innerText = item.description || "No description provided.";
    
    document.getElementById("sellerName").innerText = item.sellerName || "Anonymous";
    document.getElementById("sellerAvatar").src = item.sellerAvatar || "https://ui-avatars.com/api/?name=User";
    
    document.getElementById("contactPhone").innerText = item.contactPhone;
    document.getElementById("contactPhone").href = `tel:${item.contactPhone}`;
    document.getElementById("contactSocial").href = item.contactSocial;

    // 💡 စစ်ဆေးချက် - တင်ထားတဲ့သူနဲ့ လက်ရှိကြည့်နေသူ တူညီပါက Edit/Delete ခလုတ်ကို ဖော်ပေးရန်
    if (item.sellerName === CURRENT_LOGGED_USER) {
      document.getElementById("authorActions").classList.remove("d-none");
    }

    // Loading ပိတ်ပြီး UI ပြသခြင်း
    document.getElementById("detailLoading").classList.add("d-none");
    document.getElementById("detailContainer").classList.remove("d-none");

  } catch (error) {
    console.error("Error loading detail:", error);
    alert("❌ Error: Could not find this item.");
    window.location.href = "../index.html";
  }
}

// 🗑️ ၁။ DELETE FEATURE IMPLEMENTATION
async function deleteItem() {
  const confirmDelete = confirm("⚠️ Are you sure you want to delete this item? This cannot be undone.");
  if (!confirmDelete) return;

  const btnDelete = document.getElementById("btnDelete");
  btnDelete.disabled = true;
  btnDelete.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span>`;

  try {
    const response = await fetch(`${apiMarketUrl}/${itemId}`, {
      method: "DELETE"
    });

    if (!response.ok) throw new Error("Delete failed");

    alert("🗑️ Item deleted successfully from marketplace!");
    window.location.href = "../index.html"; // ပင်မစာမျက်နှာသို့ ပြန်ပို့ခြင်း

  } catch (error) {
    console.error("Error deleting item:", error);
    alert("❌ Failed to delete item. Please try again.");
    btnDelete.disabled = false;
    btnDelete.innerHTML = `<i class="bi bi-trash3"></i> Delete`;
  }
}

// ✏️ ၂။ EDIT FEATURE IMPLEMENTATION (Prompt အသုံးပြု၍ အလွယ်ပြင်ဆင်နည်း)
async function editItem() {
  const newPriceInput = prompt("Enter new price (Numbers only, e.g., 10000):");
  if (newPriceInput === null) return; // Cancel နှိပ်ရင် ဘာမှမလုပ်ပါ
  
  if (newPriceInput.trim() === "") {
    alert("Price cannot be empty!");
    return;
  }

  try {
    // ဈေးနှုန်းအသစ်ကို ဒေတာဘေ့စ်ထဲ PATCH Method နဲ့ လှမ်းပြင်ခိုင်းခြင်း
    const response = await fetch(`${apiMarketUrl}/${itemId}`, {
      method: "PUT", // ဒေတာတစ်ခုလုံး သို့မဟုတ် တစ်စိတ်တစ်ပိုင်းကို overwrite လုပ်ရန် PUT ကို သုံးပါတယ်
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: newPriceInput.trim() + " MMK"
      })
    });

    if (!response.ok) throw new Error("Update failed");

    alert("✏️ Price updated successfully!");
    location.reload(); // စာမျက်နှာကို refresh လုပ်ပြီး ဈေးနှုန်းအသစ်ကို ပြပေးခြင်း

  } catch (error) {
    console.error("Error updating price:", error);
    alert("❌ Failed to update price.");
  }
}

document.addEventListener("DOMContentLoaded", loadItemDetail);