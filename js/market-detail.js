// ─────────────────────────────────────────────────────────
// 🌐 API CONFIG
// ─────────────────────────────────────────────────────────

const API_BASE_URL =
  "https://6a1144953e35d0f37ee31c1d.mockapi.io/api";

const MARKET_API_URL =
  `${API_BASE_URL}/accounts/accounts`; // 💡 အစ်ကို့ MockAPI URL ထည့်ပါ


// ─────────────────────────────────────────────────────────
// 👤 CURRENT USER
// ─────────────────────────────────────────────────────────

function getCurrentUser() {

  const sessionData =
    localStorage.getItem("userSession");

  return sessionData
    ? JSON.parse(sessionData)
    : null;
}


// ─────────────────────────────────────────────────────────
// 🔍 GET ITEM ID FROM URL
// ─────────────────────────────────────────────────────────

const urlParams =
  new URLSearchParams(window.location.search);

const itemId =
  urlParams.get("id")
    ? urlParams.get("id").trim()
    : null;

console.log(
  "Found Item ID:",
  itemId
);


// ─────────────────────────────────────────────────────────
// 📦 LOAD ITEM DETAIL
// ─────────────────────────────────────────────────────────

async function loadItemDetail() {

  // invalid id
  if (!itemId) {

    alert("❌ Invalid item ID.");

    window.location.href =
      "../index.html";

    return;
  }

  try {

    const response =
      await fetch(
        `${MARKET_API_URL}/${itemId}`
      );

    if (!response.ok) {

      throw new Error(
        `Item not found.`
      );
    }

    const item =
      await response.json();

    // loading
    const loadingEl =
      document.getElementById(
        "detailLoading"
      );

    const detailContainer =
      document.getElementById(
        "detailContainer"
      );

    // carousel
    const carouselInner =
      document.getElementById(
        "carouselInner"
      );

    const btnPrev =
      document.getElementById(
        "carouselPrev"
      );

    const btnNext =
      document.getElementById(
        "carouselNext"
      );

    // category navbar
    const navCategoryEl =
      document.getElementById(
        "detailNavCategory"
      );

    // action buttons
    const authorActions =
      document.getElementById(
        "authorActions"
      );

    // =====================================================
    // IMAGES
    // =====================================================

    let imagesToDisplay = [];

    if (
      item.itemimages &&
      Array.isArray(item.itemimages) &&
      item.itemimages.length > 0
    ) {

      imagesToDisplay =
        item.itemimages;

    } else if (item.itemimage) {

      imagesToDisplay =
        [item.itemimage];

    } else {

      imagesToDisplay = [
        "https://via.placeholder.com/600x400?text=No+Image"
      ];
    }

    // clear old
    if (carouselInner) {
      carouselInner.innerHTML = "";
    }

    // render images
    imagesToDisplay.forEach(
      (imgUrl, index) => {

        const activeClass =
          index === 0
            ? "active"
            : "";

        const imageHtml = `

          <div class="carousel-item ${activeClass}">

            <img
              src="${imgUrl}"

              class="detail-img"

              alt="Item Image"

              onerror="
                this.onerror=null;
                this.src='https://via.placeholder.com/600x400?text=Image+Error';
              "
            >

          </div>
        `;

        carouselInner.insertAdjacentHTML(
          "beforeend",
          imageHtml
        );
      }
    );

    // show controls if multiple images
    if (
      imagesToDisplay.length > 1
    ) {

      btnPrev?.classList.remove(
        "d-none"
      );

      btnNext?.classList.remove(
        "d-none"
      );

    } else {

      btnPrev?.classList.add(
        "d-none"
      );

      btnNext?.classList.add(
        "d-none"
      );
    }

    // =====================================================
    // CATEGORY
    // =====================================================

    if (
      navCategoryEl &&
      item.itemcategory
    ) {

      navCategoryEl.innerHTML = `
        <i class="bi bi-tag-fill me-1 text-success"></i>
        ${item.itemcategory}
      `;
    }

    // =====================================================
    // PRODUCT DETAILS
    // =====================================================

    document.getElementById(
      "itemName"
    ).innerText =
      item.itemName ||
      "Untitled Item";

    document.getElementById(
      "itemPrice"
    ).innerText =
      item.price ||
      "0 MMK";

    document.getElementById(
      "itemCondition"
    ).innerText =
      item.condition ||
      "Used";

    document.getElementById(
      "itemDesc"
    ).innerText =
      item.itemdescription ||
      "No description provided.";

    // =====================================================
    // SELLER
    // =====================================================

    document.getElementById(
      "sellerName"
    ).innerText =
      item.sellerName ||
      "Anonymous";

    document.getElementById(
      "sellerAvatar"
    ).src =
      item.sellerAvatar ||
      "https://ui-avatars.com/api/?name=User";

    // =====================================================
    // CONTACT
    // =====================================================

    const contactPhoneEl =
      document.getElementById(
        "contactPhone"
      );

    const contactSocialEl =
      document.getElementById(
        "contactSocial"
      );

    // phone
    if (contactPhoneEl) {

      contactPhoneEl.innerText =
        item.contactPhone ||
        "No Contact";

      contactPhoneEl.href =
        item.contactPhone
          ? `tel:${item.contactPhone}`
          : "#";
    }

    // social
    if (contactSocialEl) {

      contactSocialEl.href =
        item.contactSocial || "#";
    }

    // =====================================================
    // AUTHOR CHECK
    // =====================================================

    const currentUser =
      getCurrentUser();

    const isOwner =
      currentUser &&
      String(currentUser.id) ===
      String(item.sellerId);

    // only owner can edit/delete
    if (
      isOwner &&
      authorActions
    ) {

      authorActions.classList.remove(
        "d-none"
      );
    }

    // =====================================================
    // SHOW CONTENT
    // =====================================================

    loadingEl?.classList.add(
      "d-none"
    );

    detailContainer?.classList.remove(
      "d-none"
    );

  } catch (error) {

    console.error(
      "Detail Loading Error:",
      error
    );

    alert(
      "❌ Failed to load item details."
    );

    window.location.href =
      "../index.html";
  }
}


// ─────────────────────────────────────────────────────────
// 🗑️ DELETE ITEM
// ─────────────────────────────────────────────────────────

async function deleteItem() {

  const currentUser =
    getCurrentUser();

  // must login
  if (!currentUser) {

    alert(
      "Please login first."
    );

    return;
  }

  try {

    // get latest item data
    const response =
      await fetch(
        `${MARKET_API_URL}/${itemId}`
      );

    if (!response.ok) {
      throw new Error(
        "Item not found"
      );
    }

    const item =
      await response.json();

    // owner check
    const isOwner =
      String(currentUser.id) ===
      String(item.sellerId);

    if (!isOwner) {

      alert(
        "❌ You can only delete your own item."
      );

      return;
    }

    // confirm
    const confirmDelete =
      confirm(
        "⚠️ Are you sure you want to delete this item?"
      );

    if (!confirmDelete) return;

    // button
    const btnDelete =
      document.getElementById(
        "btnDelete"
      );

    if (btnDelete) {

      btnDelete.disabled = true;

      btnDelete.innerHTML = `
        <span class="spinner-border spinner-border-sm"></span>
      `;
    }

    // delete
    const deleteResponse =
      await fetch(
        `${MARKET_API_URL}/${itemId}`,
        {
          method: "DELETE"
        }
      );

    if (!deleteResponse.ok) {

      throw new Error(
        "Delete failed"
      );
    }

    alert(
      "🗑️ Item deleted successfully!"
    );

    window.location.href =
      "../index.html";

  } catch (error) {

    console.error(
      "Delete Error:",
      error
    );

    alert(
      "❌ Failed to delete item."
    );

    const btnDelete =
      document.getElementById(
        "btnDelete"
      );

    if (btnDelete) {

      btnDelete.disabled = false;

      btnDelete.innerHTML = `
        <i class="bi bi-trash3"></i>
      `;
    }
  }
}


// ─────────────────────────────────────────────────────────
// ✏️ EDIT ITEM
// ─────────────────────────────────────────────────────────

async function editItem() {

  const currentUser =
    getCurrentUser();

  // must login
  if (!currentUser) {

    alert(
      "Please login first."
    );

    return;
  }

  try {

    // get latest item
    const response =
      await fetch(
        `${MARKET_API_URL}/${itemId}`
      );

    if (!response.ok) {

      throw new Error(
        "Item not found"
      );
    }

    const item =
      await response.json();

    // owner check
    const isOwner =
      String(currentUser.id) ===
      String(item.sellerId);

    if (!isOwner) {

      alert(
        "❌ You can only edit your own item."
      );

      return;
    }

    // prompt
    const newPriceInput =
      prompt(
        "Enter new price:",
        item.price
      );

    if (
      newPriceInput === null ||
      newPriceInput.trim() === ""
    ) {
      return;
    }

    // update
    const updateResponse =
      await fetch(
        `${MARKET_API_URL}/${itemId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            price:
              newPriceInput.trim()
          })
        }
      );

    if (!updateResponse.ok) {

      throw new Error(
        "Update failed"
      );
    }

    alert(
      "✏️ Item updated successfully!"
    );

    location.reload();

  } catch (error) {

    console.error(
      "Edit Error:",
      error
    );

    alert(
      "❌ Failed to update item."
    );
  }
}


// ─────────────────────────────────────────────────────────
// 🚀 INIT
// ─────────────────────────────────────────────────────────

document.addEventListener(
  "DOMContentLoaded",
  loadItemDetail
);