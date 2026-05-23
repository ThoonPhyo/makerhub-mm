const API_BASE_URL =
  "https://6a1144953e35d0f37ee31c1d.mockapi.io/api";

const USERS_API_URL =
  `${API_BASE_URL}/accounts/accounts`; // 💡 အစ်ကို့ MockAPI URL ထည့်ပါ

const MARKET_API_URL =
  `${API_BASE_URL}/accounts/accounts`; // 💡 အစ်ကို့ MockAPI URL ထည့်ပါ

const LOGIN_PAGE = "/login.html";

const descInput = document.getElementById("itemDesc");

const descWarning =
  document.getElementById("descWarning");

const wordCountDisplay =
  document.getElementById("wordCountDisplay");

const marketPostForm =
  document.getElementById("marketPostForm");

const MAX_WORDS = 50;

// =====================================================
// CURRENT USER
// =====================================================

function getCurrentUser() {

  const sessionData =
    localStorage.getItem("userSession");

  return sessionData
    ? JSON.parse(sessionData)
    : null;
}

// =====================================================
// WORD COUNT
// =====================================================

function countWords(text) {

  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length;
}

function updateWordCountState() {

  if (!descInput ||
      !descWarning ||
      !wordCountDisplay) return;

  const wordCount =
    countWords(descInput.value || "");

  wordCountDisplay.innerText =
    `${wordCount}/${MAX_WORDS} words`;

  if (wordCount > MAX_WORDS) {

    descWarning.classList.remove("d-none");

    descInput.classList.add("is-invalid");

  } else {

    descWarning.classList.add("d-none");

    descInput.classList.remove("is-invalid");
  }
}

// =====================================================
// SUBMIT BUTTON
// =====================================================

function setSubmitState(isSubmitting) {

  const btnSubmit =
    document.getElementById("btnSubmitItem");

  if (!btnSubmit) return;

  btnSubmit.disabled = isSubmitting;

  btnSubmit.innerHTML = isSubmitting
    ? "Publishing..."
    : "Publish Item";
}

// =====================================================
// AVATAR
// =====================================================

function createSellerAvatar(name) {

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=161b22&color=22c55e&bold=true`;
}

// =====================================================
// LOGIN CHECK
// =====================================================

function requireCurrentUserForPost() {

  const user = getCurrentUser();

  if (user) return user;

  alert("Please login first.");

  window.location.href = LOGIN_PAGE;

  return null;
}

// =====================================================
// SUBMIT
// =====================================================

async function handleSubmit(event) {

  event.preventDefault();

  if (!descInput) return;

  const currentWords =
    countWords(descInput.value || "");

  if (currentWords > MAX_WORDS) {

    alert("Description must be under 50 words.");

    return;
  }

  const currentUser =
    requireCurrentUserForPost();

  if (!currentUser) return;

  setSubmitState(true);

  // images
  const img1 =
    document.getElementById("itemImage1")
      ?.value.trim() || "";

  const img2 =
    document.getElementById("itemImage2")
      ?.value.trim() || "";

  const img3 =
    document.getElementById("itemImage3")
      ?.value.trim() || "";

  const imagesArray =
    [img1, img2, img3]
      .filter(img => img !== "");

  // seller
  const sellerName =
    currentUser.name || "Unknown Seller";

  const sellerAvatar =
    currentUser.avatar ||
    createSellerAvatar(sellerName);

  // =====================================================
  // ITEM DATA
  // =====================================================

  // =====================================================
  // ITEM DATA (Updated with type)
  // =====================================================

  const newItem = {
    type: "market", // 🚀 Identify this row as a market item
    createdAt: new Date().toISOString(),
    itemName: document.getElementById("itemName")?.value.trim() || "",
    price: `${document.getElementById("itemPrice")?.value.trim() || "0"} MMK`,
    condition: document.getElementById("itemCondition")?.value || "",
    itemcategory: document.getElementById("itemCategory")?.value || "",
    itemimage: img1,
    itemimages: imagesArray,
    itemdescription: descInput.value.trim(),
    contactPhone: document.getElementById("contactPhone")?.value.trim() || "",
    contactSocial: document.getElementById("contactSocial")?.value.trim() || "",
    sellerId: String(currentUser.id || ""),
    sellerName: sellerName,
    sellerAvatar: sellerAvatar
  };

  // =====================================================
  // POST
  // =====================================================

  try {

    const response =
      await fetch(MARKET_API_URL, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(newItem)
      });

    if (!response.ok) {
      throw new Error("Failed");
    }

    alert("Item posted successfully!");

    window.location.href = "../index.html";

  } catch (error) {

    console.error(error);

    alert("Failed to post item.");

    setSubmitState(false);
  }
}

// =====================================================
// INIT
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

  // login check
  const user = getCurrentUser();

  if (!user && marketPostForm) {

    alert("Please login first.");

    window.location.href = LOGIN_PAGE;

    return;
  }

  // word counter
  if (descInput) {

    descInput.addEventListener(
      "input",
      updateWordCountState
    );

    updateWordCountState();
  }

  // form
  if (marketPostForm) {

    marketPostForm.addEventListener(
      "submit",
      handleSubmit
    );
  }
});