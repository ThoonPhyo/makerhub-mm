const BASE_URL = "https://6a0e53941736097c3609b735.mockapi.io/api/v1"; 
const apiMarketUrl = `${BASE_URL}/marketplace`;

// လက်ရှိ App ရဲ့ Login ဖြစ်နေတဲ့ User Name
const CURRENT_LOGGED_USER = "Thoon Phyo Aung";

// 🔍 URL ကနေ ?id=1 စတဲ့ Query Parameter ကို သေချာအောင် ဖမ်းထုတ်ခြင်း
const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get("id") ? urlParams.get("id").trim() : null;

// Console မွာ ID တကယ်မိမမိ ကြည့်ရန် (F12 နှိပ်ပြီး စစ်ဆေးနိုင်သည်)
console.log("Found Item ID from URL:", itemId);

async function loadItemDetail() {
  if (!itemId) {
    alert("❌ Error: Invalid Item ID (URL တွင် id ပါမလာပါ)");
    window.location.href = "/marketplace/index.html"; // Folder နှစ်ဆင့်ကျော်ထွက်၍ Main index သို့သွားရန်
    return;
  }

  try {
    const response = await fetch(`${apiMarketUrl}/${itemId}`);
    
    // API က ဒေတာရှာမတွေ့ရင် 404 ဖမ်းဖို့
    if (!response.ok) {
      throw new Error(`Item ID: ${itemId} ကို MockAPI တွင် ရှာမတွေ့ပါ။ (Status: ${response.status})`);
    }

    const item = await response.json();

    // UI Elements ခေါ်ယူခြင်း
    const carouselInner = document.getElementById("carouselInner");
    const btnPrev = document.getElementById("carouselPrev");
    const btnNext = document.getElementById("carouselNext");

    // 💡 Multiple Images array မရှိလျှင် Single Image ဟောင်းကိုသုံးရန် အဆင့်ဆင့်စစ်ဆေးခြင်း
    let imagesToDisplay = [];
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      imagesToDisplay = item.images;
    } else if (item.image) {
      imagesToDisplay = [item.image];
    } else {
      imagesToDisplay = ["https://via.placeholder.com/400x300?text=No+Image+Available"];
    }

    // အဟောင်းတွေ အရင်ရှင်းထုတ်ခြင်း
    carouselInner.innerHTML = "";

    // Carousel Items များကို Dynamic Render လုပ်ခြင်း
    imagesToDisplay.forEach((imgUrl, index) => {
      const isActive = index === 0 ? "active" : "";
      const imgHtml = `
        <div class="carousel-item ${isActive}" >
          <img src="${imgUrl}" class="detail-img" alt="Item Image">
        </div>
      `;
      carouselInner.insertAdjacentHTML("beforeend", imgHtml);
    });

    // ပုံတစ်ပုံထက် ပိုပါက Next/Prev မြှားများကို ဖော်ပြပေးမည်
    if (imagesToDisplay.length > 1) {
      btnPrev.classList.remove("d-none");
      btnNext.classList.remove("d-none");
      
      // // Bootstrap Carousel Auto-Cycle စတင်ခြင်း
      // new bootstrap.Carousel(document.getElementById('itemImageCarousel'), {
      //   interval: 3000, // ၃ စက္ကန့်လျှင် တစ်ပုံ အလိုအလျောက် ရွေ့မည်
      //   ride: 'carousel'
      // });
    }
    
    // Product Details ဒေတာများ ဖြည့်သွင်းခြင်း
    document.getElementById("itemName").innerText = item.itemName || "No Title";
    document.getElementById("itemPrice").innerText = item.price || "0 MMK";
    document.getElementById("itemCondition").innerText = item.condition || "Used";
    document.getElementById("itemDesc").innerText = item.description || "No description provided.";
    
    document.getElementById("sellerName").innerText = item.sellerName || "Anonymous";
    document.getElementById("sellerAvatar").src = item.sellerAvatar || "https://ui-avatars.com/api/?name=User";
    
    document.getElementById("contactPhone").innerText = item.contactPhone || "No Contact";
    document.getElementById("contactPhone").href = `tel:${item.contactPhone}`;
    document.getElementById("contactSocial").href = item.contactSocial || "#";

    // စစ်ဆေးချက် - ပိုင်ရှင်ဖြစ်ပါက Edit/Delete Dashboard ကို ဖွင့်ပေးရန်
    if (item.sellerName === CURRENT_LOGGED_USER) {
      document.getElementById("authorActions").classList.remove("d-none");
    }

    // Loading Screen ပိတ်၍ Content ပြသခြင်း
    document.getElementById("detailLoading").classList.add("d-none");
    document.getElementById("detailContainer").classList.remove("d-none");

  } catch (error) {
    console.error("Error loading detail:", error);
    alert(`❌ Error: ${error.message}`);
    window.location.href = "/marketplace/index.html"; // Error ဖြစ်ပါက Main သို့ ပြန်မောင်းထုတ်ခြင်း
  }
}

// DELETE FUNCTION IMPLEMENTATION
async function deleteItem() {
  const confirmDelete = confirm("⚠️ Are you sure you want to delete this item? This cannot be undone.");
  if (!confirmDelete) return;

  const btnDelete = document.getElementById("btnDelete");
  btnDelete.disabled = true;
  btnDelete.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

  try {
    const response = await fetch(`${apiMarketUrl}/${itemId}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Delete failed");

    alert("🗑️ Item deleted successfully!");
    window.location.href = "/marketplace/index.html";
  } catch (error) {
    console.error("Error deleting item:", error);
    alert("❌ Failed to delete item.");
    btnDelete.disabled = false;
    btnDelete.innerHTML = `<i class="bi bi-trash3"></i>`;
  }
}

// EDIT FUNCTION IMPLEMENTATION
async function editItem() {
  const newPriceInput = prompt("Enter new price (Numbers only, e.g., 10000):");
  if (newPriceInput === null || newPriceInput.trim() === "") return;

  try {
    const response = await fetch(`${apiMarketUrl}/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: newPriceInput.trim() + " MMK" })
    });

    if (!response.ok) throw new Error("Update failed");

    alert("✏️ Price updated successfully!");
    location.reload();
  } catch (error) {
    console.error("Error updating price:", error);
    alert("❌ Failed to update price.");
  }
}

document.addEventListener("DOMContentLoaded", loadItemDetail);