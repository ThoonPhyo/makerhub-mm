// ── CONFIGURATION ────────────────────────────────────
const API_URL =
  "https://6a1144953e35d0f37ee31c1d.mockapi.io/api/accounts/accounts"; // 💡 အစ်ကို့ MockAPI URL ထည့်ပါ

// ── DOM ELEMENTS ─────────────────────────────────────
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const errorAlert = document.getElementById("auth-error");

// Navbar UI Elements
const authButtons = document.getElementById("nav-auth-buttons");
const profileDropdown = document.getElementById("nav-profile-dropdown");

// ── 💡 NAVBAR UI STATE TOGGLE (အကောင့် ဝင်/မဝင် စစ်ပြီး UI ပြောင်းလဲခြင်း) ──
// ── NAVBAR UI STATE TOGGLE (Desktop + Mobile Support) ──
function updateNavbarUI() {
  const sessionData = localStorage.getItem("userSession");

  // Desktop Elements
  const authButtons = document.getElementById("nav-auth-buttons");
  const profileDropdown = document.getElementById("nav-profile-dropdown");

  // Mobile Elements
  const mobileAuthButtons = document.getElementById("mobile-nav-auth-buttons");
  const mobileProfileDropdown = document.getElementById(
    "mobile-nav-profile-dropdown",
  );

  if (sessionData) {
    const user = JSON.parse(sessionData);
    const avatarUrl =
      user.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=161b22&color=22c55e&bold=true`;

    // ၁။ Desktop UI ကို Update လုပ်ခြင်း
    if (authButtons) authButtons.classList.add("d-none");
    if (profileDropdown) {
      profileDropdown.classList.remove("d-none");
      profileDropdown.querySelector(".profile-wrapper img").src = avatarUrl;
      profileDropdown.querySelector(".dropdown-header").textContent = user.name;
    }

    // ၂။ Mobile UI ကို Update လုပ်ခြင်း
    if (mobileAuthButtons) mobileAuthButtons.classList.add("d-none");
    if (mobileProfileDropdown) {
      mobileProfileDropdown.classList.remove("d-none");
      mobileProfileDropdown.querySelector(".profile-wrapper img").src =
        avatarUrl;
      mobileProfileDropdown.querySelector(".dropdown-header").textContent =
        user.name;
    }
  } else {
    // အကောင့်မဝင်ထားလျှင် (ဧည့်သည်များကို ခလုတ်ပြန်ပြရန်)
    if (authButtons) authButtons.classList.remove("d-none");
    if (profileDropdown) profileDropdown.classList.add("d-none");

    if (mobileAuthButtons) mobileAuthButtons.classList.remove("d-none");
    if (mobileProfileDropdown) mobileProfileDropdown.classList.add("d-none");
  }
}

// စာမျက်နှာစဖွင့်ကတည်းက ချက်ချင်း Navbar UI ကို စစ်ဆေးမည်
document.addEventListener("DOMContentLoaded", updateNavbarUI);

// ── ULTIMATE LOGOUT LOGIC ─────────────────────────────────────
document.addEventListener("click", function (e) {
  // Logout ခလုတ်ကို ဘယ်နေရာကပဲ နှိပ်နှိပ် ဖမ်းယူမည်
  const logoutBtn =
    e.target.closest("#nav-logout-btn") ||
    e.target.closest(".desktop-logout-btn") ||
    e.target.closest(".mobile-logout-btn");

  if (logoutBtn) {
    e.preventDefault();

    // ၁။ LocalStorage ဖျက်ခြင်း
    localStorage.removeItem("userSession");

    // ၂။ UI ကို ချက်ချင်း Update လုပ်ခြင်း
    if (typeof updateNavbarUI === "function") {
      updateNavbarUI();
    }

    // ၃။ ပင်မစာမျက်နှာသို့ ပြန်သွားခြင်း
    window.location.href = "/index.html";
  }
});

// ── HELPER FUNCTIONS ─────────────────────────────────
function showError(message) {
  if (!errorAlert) return;
  errorAlert.textContent = message;
  errorAlert.classList.remove("d-none");
}

function setSubmitting(formElement, isSubmitting) {
  const submitBtn = formElement.querySelector('button[type="submit"]');
  if (!submitBtn) return;
  submitBtn.disabled = isSubmitting;
  submitBtn.innerHTML = isSubmitting
    ? `<span class="spinner-border spinner-border-sm me-2"></span> Processing...`
    : formElement.id === "login-form"
      ? "Sign In"
      : "Get Started";
}

// ── SIGN UP PROCESS ──────────────────────────────────
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (errorAlert) errorAlert.classList.add("d-none");

    const name = document.getElementById("signup-name").value.trim();
    const email = document
      .getElementById("signup-email")
      .value.trim()
      .toLowerCase();
    const password = document.getElementById("signup-password").value;

    setSubmitting(signupForm, true);

    try {
      // get all users first
      const checkRes = await fetch(API_URL);

      const allUsers = await checkRes.json();

      // check manually
      const existingUser = allUsers.find(
        (user) =>
          user.email && user.email.toLowerCase() === email.toLowerCase(),
      );

      if (existingUser) {
        showError("This email is already registered.");

        setSubmitting(signupForm, false);

        return;
      }

      // 2. အကောင့်အသစ်ဆောက်မယ် (အစ်ကို့ Schema အတိုင်း)
      // 2. အကောင့်အသစ်ဆောက်မယ် (All Community & Market Fields Explicitly Cleared)
      const newUser = {
        name: name,
        email: email,
        password: password,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=161b22&color=22c55e&bold=true`,
        createdAt: new Date().toISOString(),

        // ── LEARNING PROGRESS FIELDS ─────────────────
        student_total_xp: 0,
        arduino_progress: "{}",
        esp32_progress: "{}",
        esp8266_progress: "{}",
        raspberry_progress: "{}",
        community_progress: "{}",
        market_progress: "{}",

        // ── COMMUNITY POST FIELDS (CLEARED) ──────────
        title: "",
        category: "",
        image: "",
        description: "",
        longDescription: "",
        wiringNotes: "",
        sourceCode: "",
        electronics: [],
        hardware: [],
        software: [],
        likes: 0,

        // ── MARKET ITEM FIELDS (CLEARED) ─────────────
        itemName: "",
        price: "0 MMK",
        condition: "",
        images: [],
        contactPhone: "",
        contactSocial: "",
        sellerId: "",
        sellerName: "",
        sellerAvatar: "",
      };

      const registerRes = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!registerRes.ok) throw new Error("Registration failed.");

      const createdUser = await registerRes.json();
      localStorage.setItem("userSession", JSON.stringify(createdUser)); // Session သိမ်းမယ်

      window.location.href = "index.html"; // Home ကို သွားမယ်
    } catch (error) {
      showError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(signupForm, false);
    }
  });
}

// ── LOG IN PROCESS ───────────────────────────────────
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (errorAlert) errorAlert.classList.add("d-none");

    const email = document
      .getElementById("login-email")
      .value.trim()
      .toLowerCase();
    const password = document.getElementById("login-password").value;

    setSubmitting(loginForm, true);

    try {
      // 🚀 ADDED: ?type=user query to ensure you ONLY fetch real account rows
      // (This assumes you will add 'type: "user"' to your newUser object in signup)
      const response = await fetch(
        `${API_URL}?email=${encodeURIComponent(email)}`,
      );
      const users = await response.json();

      // Filter locally for type "user" just to be safe
      const user = users.find(
        (u) => u.email.toLowerCase() === email && u.password === password,
      );

      if (!user) {
        showError("Invalid email or password.");
        setSubmitting(loginForm, false);
        return;
      }

      localStorage.setItem("userSession", JSON.stringify(user));
      window.location.href = "index.html";
    } catch (error) {
      showError("Connection error. Please try again.");
    } finally {
      setSubmitting(loginForm, false);
    }
  });
}
