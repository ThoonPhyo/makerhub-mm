// ── CONFIGURATION ────────────────────────────────────
const API_URL = "https://6a1144953e35d0f37ee31c1d.mockapi.io/api/accounts/accounts"; 

// ── DOM ELEMENTS ─────────────────────────────────────
const editProfileForm = document.getElementById("editProfileForm");
const nameInput = document.getElementById("profile-name");
const emailInput = document.getElementById("profile-email");
const passwordInput = document.getElementById("profile-password");
const avatarImg = document.getElementById("profile-avatar");

// ── SUBMITTING SPINNER HELPER ────────────────────────
function setSubmitting(formElement, isSubmitting) {
  const submitBtn = formElement.querySelector('button[type="submit"]');
  if (!submitBtn) return;
  submitBtn.disabled = isSubmitting;
  submitBtn.innerHTML = isSubmitting
    ? `<span class="spinner-border spinner-border-sm me-2"></span> Saving & Syncing...`
    : `<i class="fa-solid fa-floppy-disk me-2"></i> Save Changes`;
}

// ── 1. SHOW CURRENT PROFILE DATA ─────────────────────
function loadUserProfile() {
  const sessionData = localStorage.getItem("userSession");
  
  if (!sessionData) {
    alert("Please sign in to access this page.");
    window.location.href = "/login.html";
    return;
  }

  const user = JSON.parse(sessionData);

  if (nameInput) nameInput.value = user.name || "";
  if (emailInput) emailInput.value = user.email || "";
  if (passwordInput) passwordInput.value = user.password || "";
  
  if (avatarImg) {
    avatarImg.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=161b22&color=22c55e&bold=true`;
  }
}

// ── 2. SAVE & UPDATE PROFILE PROCESS ─────────────────
if (editProfileForm) {
  editProfileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const sessionData = localStorage.getItem("userSession");
    if (!sessionData) return;
    
    const loggedInUser = JSON.parse(sessionData);
    const userId = loggedInUser.id;

    const updatedName = nameInput.value.trim();
    const updatedEmail = emailInput.value.trim().toLowerCase();
    const updatedPassword = passwordInput.value;

    // ─────────────────────────────────────────────────────────
    // 💡 REALITY CHECK: Checking if any data actually changed
    // ─────────────────────────────────────────────────────────
    const isNameSame = updatedName === loggedInUser.name;
    const isEmailSame = updatedEmail === (loggedInUser.email || "").toLowerCase();
    const isPasswordSame = updatedPassword === loggedInUser.password;

    if (isNameSame && isEmailSame && isPasswordSame) {
      alert("No changes detected. Please modify your information before saving.");
      return;
    }

    setSubmitting(editProfileForm, true);

    try {
      // 💡 Check email duplication only if the user changed their email
      if (!isEmailSame) {
        const checkRes = await fetch(API_URL);
        const allUsers = await checkRes.json();

        const isEmailTaken = allUsers.find(
          (u) => u.email && u.email.toLowerCase() === updatedEmail && u.id !== userId
        );

        if (isEmailTaken) {
          alert("This email address is already registered by another account.");
          setSubmitting(editProfileForm, false);
          return;
        }
      }

      // Generate New Avatar URL
      const newAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedName)}&background=161b22&color=22c55e&bold=true`;

      // Reconstruct updated user account data
      const updatedData = {
        ...loggedInUser, 
        name: updatedName,
        email: updatedEmail,
        password: updatedPassword,
        avatar: newAvatarUrl
      };

      // ၁။ ပထမဦးဆုံး User ရဲ့ ပင်မ Account Row ကို PUT Method နဲ့ ပြင်မယ်
      const updateRes = await fetch(`${API_URL}/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!updateRes.ok) throw new Error("Main profile update failed.");

      const finalUserData = await updateRes.json();

      // ─────────────────────────────────────────────────────────
      // 🔥 METHOD 2: DB SYNC - ၎င်း User တင်ထားခဲ့သော Cards များကို လိုက်ပြင်ခြင်း
      // ─────────────────────────────────────────────────────────
      try {
        const dbResponse = await fetch(API_URL);
        const allRows = await dbResponse.json();

        // (က) မိမိ တင်ထားခဲ့သော Marketplace Items များကို ရှာပြီး နာမည်နှင့် ပုံ လိုက်ပြင်ခြင်း
        const myMarketItems = allRows.filter(item => item.type === "market" && String(item.sellerId) === String(userId));
        
        for (const item of myMarketItems) {
          await fetch(`${API_URL}/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...item,
              sellerName: updatedName,
              sellerAvatar: newAvatarUrl
            })
          });
        }

        // (ခ) မိမိ တင်ထားခဲ့သော Community Projects များကို ရှာပြီး နာမည်နှင့် ပုံ လိုက်ပြင်ခြင်း
        const myProjects = allRows.filter(item => item.type === "community" && String(item.userId) === String(userId));
        
        for (const project of myProjects) {
          await fetch(`${API_URL}/${project.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...project,
              name: updatedName,
              avatar: newAvatarUrl
            })
          });
        }

      } catch (syncError) {
        // တစ်ခုခုကြောင့် Card တွေ လိုက်ပြင်တာ Error တက်ခဲ့ရင်တောင် Main Account မပျက်သွားအောင် console မှာပဲ ပြထားမယ်
        console.error("Cards synchronization background error:", syncError);
      }
      // ─────────────────────────────────────────────────────────

      // ၃။ LocalStorage ထဲက Session ကို Fresh Data နဲ့ အစားထိုးမယ်
      localStorage.setItem("userSession", JSON.stringify(finalUserData));
      
      if (typeof updateNavbarUI === "function") {
        updateNavbarUI();
      }

      alert("Profile and all published items updated successfully!");
      window.location.href = "/profile/index.html";

    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again later.");
    } finally {
      setSubmitting(editProfileForm, false);
    }
  });
}

// Initializing
document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
});