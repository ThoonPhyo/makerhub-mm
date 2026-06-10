const ACCOUNTS_API_URL =
  "https://6a1144953e35d0f37ee31c1d.mockapi.io/api/accounts/accounts";

/**
 * 🔐 1. Admin Login Submission Logic (Used by admin/login.html)
 */
async function handleAdminGatewayLogin(event) {
  event.preventDefault();

  const emailInput = document.getElementById("adminEmail").value.trim();
  const passwordInput = document.getElementById("adminPassword").value;
  const loginBtn = document.getElementById("loginBtn");

  // UI Feedback Loading
  loginBtn.disabled = true;
  loginBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Verifying Credentials...`;

  try {
    // API ကနေ Super Admin (ID 1) ရဲ့ ဒေတာရင်းကို သွားဆွဲမယ်
    const response = await fetch(`${ACCOUNTS_API_URL}/1`);
    if (!response.ok) throw new Error("Security Database connection timeout.");

    const superAdmin = await response.json();

    // ချိန်ကိုက်တိုက်စစ်ခြင်း Loop
    if (
      emailInput === superAdmin.email.trim() &&
      passwordInput === superAdmin.password
    ) {
      // 🌟 Public key နဲ့မရောအောင် "adminSession" ဆိုတဲ့ သီးသန့် Key နဲ့ သိမ်းမယ်
      const adminSessionData = {
        id: superAdmin.id,
        email: superAdmin.email,
        password: superAdmin.password, // For continuous verification loop
      };

      localStorage.setItem("adminSession", JSON.stringify(adminSessionData));

      // Success -> Go to Admin Dashboard
      window.location.href = "index.html";
    } else {
      alert("Access Denied: Invalid Administrative credentials.");
      loginBtn.disabled = false;
      loginBtn.innerHTML = `<i class="bi bi-box-arrow-in-right me-2"></i>Verify & Enter`;
    }
  } catch (error) {
    console.error("Gateway Crash:", error);
    alert("Critical: Could not reach authentication server.");
    loginBtn.disabled = false;
    loginBtn.innerHTML = `<i class="bi bi-box-arrow-in-right me-2"></i>Verify & Enter`;
  }
}

/**
 * 🔒 2. Security Guard Loop: Check if adminSession is valid (Used by admin/index.html)
 */
async function verifyAdminAuthentication() {
  // Login page မှာ ရှိနေရင် ဒီ check ကို ကျော်ခဲ့မယ် (form submission က သက်သက်လုပ်မှာမို့လို့)
  if (window.location.pathname.includes("login.html")) return true;

  const adminSession = JSON.parse(localStorage.getItem("adminSession"));

  if (!adminSession || !adminSession.email || !adminSession.password) {
    window.location.href = "./login.html"; // Same folder မို့လို့ တိုက်ရိုက်ညွှန်ရုံပဲ
    return false;
  }

  try {
    const response = await fetch(`${ACCOUNTS_API_URL}/1`);
    if (!response.ok) throw new Error("Database network failure.");

    const superAdmin = await response.json();

    // Session ထဲကဒေတာက ID 1 ရဲ့ ဒေတာအစစ် ဟုတ်မဟုတ် ထပ်မံအတည်ပြုခြင်း
    if (
      adminSession.email.trim() === superAdmin.email.trim() &&
      adminSession.password === superAdmin.password
    ) {
      // Profile Layout ကို ID 1 ရဲ့ အချက်အလက်နဲ့ ဖြည့်ပေးမယ်
      if (document.getElementById("adminSidebarName")) {
        document.getElementById("adminSidebarName").innerText =
          superAdmin.name || "UserOne";
      }
      if (document.getElementById("adminAvatarPlaceholder")) {
        document.getElementById("adminAvatarPlaceholder").innerHTML = `
          <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(superAdmin.name || "UserOne")}&background=dc3545&color=fff&bold=true" 
               alt="Admin Profile" width="28" height="28" class="rounded-circle border border-danger" />
        `;
      }
      return true;
    } else {
      alert("Session Expired or Compromised.");
      localStorage.removeItem("adminSession");
      window.location.href = "login.html";
      return false;
    }
  } catch (error) {
    console.error("Guard Sync Error:", error);
    // Offline ဖြစ်ခဲ့ရင်တောင် safe zone ဖြစ်အောင် လက်ရှိ session ရှိရင် ခဏပေးဝင်ထားမယ်
    return true;
  }
}

/**
 * 🎨 Theme System
 */
function toggleDemoTheme() {
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "dark";
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  // Root Element (<html>) ရဲ့ attribute ကို တိုက်ရိုက်ပြောင်းလဲပေးခြင်း
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeIcons(newTheme === "light");
}

function updateThemeIcons(isLight) {
  document.querySelectorAll(".theme-icon").forEach((icon) => {
    icon.classList.remove("bi-sun-fill", "bi-moon-stars-fill");
    if (isLight) icon.classList.add("bi-moon-stars-fill");
    else icon.classList.add("bi-sun-fill");
  });
}

function highlightUserTab() {
  const userTrigger = document.querySelector('[href="#pane-users"]');
  if (userTrigger) {
    document
      .querySelectorAll(".nav-link-custom")
      .forEach((el) => el.classList.remove("active"));
    userTrigger.classList.add("active");
  }
}

function handleLogout() {
  if (confirm("Are you sure you want to sign out from the Admin Panel?")) {
    localStorage.removeItem("adminSession"); // Admin Session ကိုပဲ သီးသန့်ဖျက်မယ်
    window.location.href = "login.html";
  }
}

/**
 * 🌐 Core Fetch Engine and Multi-Tab Control Engine
 */
async function updateDashboardFromAPI() {
  // Login Page ပေါ်မှာဆိုရင် Dashboard table တွေ ဆွဲစရာမလိုတဲ့အတွက် စစ်ထုတ်ထားမယ်
  if (window.location.pathname.includes("login.html")) return;

  const usersContainer = document.getElementById("usersTableBody");
  const projsContainer = document.getElementById("projectsTableBody");
  const marketContainer = document.getElementById("marketTableBody");

  try {
    const response = await fetch(ACCOUNTS_API_URL);
    if (!response.ok) throw new Error("Database channel handshake refused.");

    const allData = await response.json();

    const projects = allData.filter((item) => item.type === "community");
    const marketItems = allData.filter((item) => item.type === "market");
    const users = allData.filter(
      (item) => item.type !== "community" && item.type !== "market",
    );

    if (document.getElementById("totalUsers"))
      document.getElementById("totalUsers").innerText =
        users.length.toLocaleString();
    if (document.getElementById("totalProjects"))
      document.getElementById("totalProjects").innerText =
        projects.length.toLocaleString();
    if (document.getElementById("saleItems"))
      document.getElementById("saleItems").innerText =
        marketItems.length.toLocaleString();

    // =========================================================================
    // PART 1: Top Active Learners (Leaderboard)
    // =========================================================================
    const topLearnersContainer = document.getElementById("topLearnersList");
    if (topLearnersContainer) {
      topLearnersContainer.innerHTML = "";
      const sortedLearners = [...users]
        .sort(
          (a, b) =>
            parseInt(b.student_total_xp || 0) -
            parseInt(a.student_total_xp || 0),
        )
        .slice(0, 4);

      sortedLearners.forEach((user, index) => {
        let rankBadge = `<span class="badge bg-secondary bg-opacity-25 text-muted">${index + 1}</span>`;
        if (index === 0)
          rankBadge = `<i class="bi bi-award-fill text-warning fs-5"></i>`;
        if (index === 1)
          rankBadge = `<i class="bi bi-award-fill fs-5" style="color: #b4b4b4;"></i>`;
        if (index === 2)
          rankBadge = `<i class="bi bi-award-fill fs-5" style="color: #cd7f32;"></i>`;

        topLearnersContainer.insertAdjacentHTML(
          "beforeend",
          `
          <tr class="border-bottom border-secondary border-opacity-10">
            <td>${rankBadge}</td>
            <td class="fw-semibold text-secondary">${user.name || `Maker #${user.id}`}</td>
            <td class="text-end text-neon-green fw-bold">${parseInt(user.student_total_xp || 0).toLocaleString()} <span class="text-muted fw-normal" style="font-size: 0.65rem">XP</span></td>
          </tr>
        `,
        );
      });
    }

    // =========================================================================
    // PART 2: Featured Projects
    // =========================================================================
    const featuredProjectsContainer = document.getElementById(
      "featuredProjectsList",
    );
    if (featuredProjectsContainer) {
      featuredProjectsContainer.innerHTML = "";
      [...projects]
        .sort((a, b) => parseInt(b.likes || 0) - parseInt(a.likes || 0))
        .slice(0, 3)
        .forEach((proj) => {
          featuredProjectsContainer.insertAdjacentHTML(
            "beforeend",
            `
          <div class="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-10 pb-2 mb-1">
            <div class="text-truncate me-2">
              <span class="d-block fs-7 fw-bold text-secondary">${proj.title || "Untitled Project"}</span>
              <small class="text-muted fs-8">By ${proj.name || "Unknown Model"}</small>
            </div>
            <div class="flex-shrink-0 d-flex align-items-center gap-1 text-danger small bg-danger bg-opacity-10 px-2 py-1 rounded-2">
              <i class="bi bi-heart-fill fs-8"></i><span class="fw-bold">${proj.likes || 0}</span>
            </div>
          </div>
        `,
          );
        });
    }

    // =========================================================================
    // 🌟 PART 3: Latest Logs Activities (FIXED QUOTA: 2 Users, 3 Projects, 2 Items)
    // =========================================================================
    const activitiesContainer = document.getElementById("recentActivitiesList");
    if (activitiesContainer) {
      activitiesContainer.innerHTML = "";

      // ၁။ 👥 Users ထဲက အသစ်ဆုံး ၂ ခုကိုပဲ ဖြတ်ယူပြီး Map လုပ်မယ်
      const latestUsers = [...users]
        .sort((a, b) => parseInt(b.id || 0) - parseInt(a.id || 0)) // ID အကြီးဆုံးကနေ စီမယ်
        .slice(0, 2) // ထိပ်ဆုံးက ၂ ခုပဲ ယူမယ်
        .map((u) => ({
          id: parseInt(u.id || 0),
          type: "user",
          title: "New User Registered",
          desc: u.name || `ID: ${u.id}`,
        }));

      // ၂။ 🛠️ Projects ထဲက အသစ်ဆုံး ၃ ခုကိုပဲ ဖြတ်ယူပြီး Map လုပ်မယ်
      const latestProjects = [...projects]
        .sort((a, b) => parseInt(b.id || 0) - parseInt(a.id || 0))
        .slice(0, 3) // ထိပ်ဆုံးက ၃ ခုပဲ ယူမယ်
        .map((p) => ({
          id: parseInt(p.id || 0),
          type: "project",
          title: "Project Uploaded",
          desc: `By ${p.name || "Maker"}`,
        }));

      // ၃။ 🛒 Market Items ထဲက အသစ်ဆုံး ၂ ခုကိုပဲ ဖြတ်ယူပြီး Map လုပ်မယ်
      const latestItems = [...marketItems]
        .sort((a, b) => parseInt(b.id || 0) - parseInt(a.id || 0))
        .slice(0, 2) // ထိပ်ဆုံးက ၂ ခုပဲ ယူမယ်
        .map((item) => ({
          id: parseInt(item.id || 0),
          type: "item",
          title: "Market Item Listed",
          desc: `${item.itemName || "Component"} — ${item.price || "Contact"}`,
        }));

      // ၄။ သတ်မှတ်ထားတဲ့ Quota အသီးသီး (၂ + ၃ + ၂) ကို Array တစ်ခုတည်းထဲ စုပေါင်းပြီး
      // Timeline အလိုက် ညှိရအောင် ID အသစ်ဆုံးကောင်ကို ထိပ်ဆုံးပို့ပြီး ပြန် Sort စီမယ်
      const unifiedLatestLogs = [
        ...latestUsers,
        ...latestProjects,
        ...latestItems,
      ].sort((a, b) => b.id - a.id); // Combined Chronological Sort

      
      unifiedLatestLogs.forEach((log) => {
        let icon = "";
        if (log.type === "user") icon = "bi-person-circle text-success";
        else if (log.type === "project") icon = "bi-cpu-fill text-info";
        else if (log.type === "item") icon = "bi-cart-fill text-warning";

        activitiesContainer.insertAdjacentHTML(
          "beforeend",
          `
      <div class="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-10 pb-3 mb-1">
        <div class="d-flex align-items-center gap-3">
          <div class="p-2 bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
            <i class="bi ${icon} fs-5"></i>
          </div>
          <div>
            <span class="d-block fs-7 fw-bold text-secondary">${log.title}</span>
            <small class="text-muted fs-8">${log.desc}</small>
          </div>
        </div>
        <span class="badge border bg-secondary bg-opacity-10 text-success border-success border-opacity-25 px-2 py-1" style="font-size: 0.65rem;">NEW</span>
      </div>
    `,
        );
      });
    }

    // =========================================================================
    // 👥 PART 4: USERS DIRECTORY MAPPING
    // =========================================================================
    if (usersContainer) {
      usersContainer.innerHTML = "";
      users.forEach((user) => {
        const isAdmin = user.id === "1";
        const roleBadge = isAdmin
          ? `<span class="badge admin-badge px-2 py-1 fs-8 text-uppercase border border-danger border-opacity-25"><i class="bi bi-shield-fill-check me-1"></i>Admin</span>`
          : `<span class="badge bg-info bg-opacity-10 text-info px-2 py-1 fs-8 fw-semibold text-uppercase">Maker</span>`;

        const actionButton = isAdmin
          ? `<button disabled class="btn btn-sm btn-outline-secondary border-0 p-1 px-2" title="System Super Admin Locked."><i class="bi bi-lock-fill text-muted"></i></button>`
          : `<button onclick="deleteEntity('${user.id}', '${user.name || "Maker"}', 'User')" class="btn btn-sm btn-outline-danger border-0 p-1 px-2"><i class="bi bi-trash3-fill"></i></button>`;

        usersContainer.insertAdjacentHTML(
          "beforeend",
          `
          <tr class="border-bottom border-secondary border-opacity-10">
            <td class="ps-4 fw-mono text-muted">#${user.id}</td>
            <td><span class="fw-bold text-secondary">${user.name || "Anonymous Maker"}</span></td>
            <td>${roleBadge}</td>
            <td><span class="text-neon-green fw-bold">${parseInt(user.student_total_xp || 0).toLocaleString()}</span> <span class="text-muted fs-8">XP</span></td>
            <td class="text-end pe-4">${actionButton}</td>
          </tr>
        `,
        );
      });
    }

    // =========================================================================
    // 🛠️ PART 5: COMMUNITY PROJECTS DYNAMIC MAPPING
    // =========================================================================
    if (projsContainer) {
      projsContainer.innerHTML = "";
      if (projects.length === 0) {
        projsContainer.innerHTML =
          '<tr><td colspan="5" class="text-center py-4 text-muted">No open-source projects hosted yet.</td></tr>';
      } else {
        projects.forEach((proj) => {
          projsContainer.insertAdjacentHTML(
            "beforeend",
            `
            <tr class="border-bottom border-secondary border-opacity-10">
              <td class="ps-4 fw-mono text-muted">#${proj.id}</td>
              <td><span class="fw-bold text-secondary">${proj.title || "Untitled Blueprint"}</span></td>
              <td><span class="text-muted fs-7">${proj.name || "Anonymous Maker"}</span></td>
              <td><span class="text-danger fw-semibold"><i class="bi bi-heart-fill me-1 small"></i>${proj.likes || 0}</span></td>
              <td class="text-end pe-4">
                <button onclick="deleteEntity('${proj.id}', '${proj.title || "Project"}', 'Project')" class="btn btn-sm btn-outline-danger border-0 p-1 px-2"><i class="bi bi-trash3-fill"></i></button>
              </td>
            </tr>
          `,
          );
        });
      }
    }

    // =========================================================================
    // 🛒 PART 6: MARKETPLACE INVENTORY DYNAMIC MAPPING
    // =========================================================================
    if (marketContainer) {
      marketContainer.innerHTML = "";
      if (marketItems.length === 0) {
        marketContainer.innerHTML =
          '<tr><td colspan="4" class="text-center py-4 text-muted">No commercial component stock available.</td></tr>';
      } else {
        marketItems.forEach((item) => {
          marketContainer.insertAdjacentHTML(
            "beforeend",
            `
            <tr class="border-bottom border-secondary border-opacity-10">
              <td class="ps-4 fw-mono text-muted">#${item.id}</td>
              <td><span class="fw-bold text-secondary">${item.itemName || "Unnamed Component"}</span></td>
              <td><span class="text-neon-green fw-bold">${item.price || "Contact"}</span></td>
              <td class="text-end pe-4">
                <button onclick="deleteEntity('${item.id}', '${item.itemName || "Item"}', 'Market Item')" class="btn btn-sm btn-outline-danger border-0 p-1 px-2"><i class="bi bi-trash3-fill"></i></button>
              </td>
            </tr>
          `,
          );
        });
      }
    }
  } catch (error) {
    console.error("Master Sync Failure:", error);
  }
}

/**
 * 🚨 Unified Drop System
 */
async function deleteEntity(id, label, type) {
  if (
    !confirm(
      `Safety Check: Wipe out this entire ${type} record permanently?\nTarget: "${label}" (ID: #${id})`,
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`${ACCOUNTS_API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok)
      throw new Error("Endpoint verification rejected command.");

    alert(`Success: ${type} has been eliminated from the database.`);
    updateDashboardFromAPI();
  } catch (error) {
    console.error("Flush Crash:", error);
    alert("Connection lost. Modification pipeline rejected.");
  }
}

/**
 * 🚀 Bootup Initializer with Isolated Security Gate
 */
(async function () {
  // Step A: လက်ရှိ Session ရှိမရှိနှင့် မှန်မမှန်ကို အရင်စစ်ဆေးမည်
  const isAuthorized = await verifyAdminAuthentication();
  if (!isAuthorized) return; // ခွင့်ပြုချက်မရှိပါက ချက်ချင်းရပ်မည် (Login သို့ ပို့မည်)

  // Step B: HTML Element ပေါ်သို့ Theme တိုကန် သတ်မှတ်မည်
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // Dashboard ထဲက ဒေတာများကို API မှ ဆွဲထုတ်မည့် Function အစုအဝေး
  const initializeDashboardComponents = () => {
    updateThemeIcons(savedTheme === "light");
    updateDashboardFromAPI(); // 👈 ဇယားများနှင့် ဒေတာများအားလုံးကို ယူခိုင်းသည့်နေရာ
  };

  // 🛡️ Race Condition Guard: DOM က ပြီးနှင့်နေပါက Event ကိုမစောင့်ဘဲ တန်းပွင့်ခိုင်းမည်
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initializeDashboardComponents);
  } else {
    initializeDashboardComponents(); // HTML က အဆင်သင့်ဖြစ်နေပါက ချက်ချင်း Run မည်
  }
})();
