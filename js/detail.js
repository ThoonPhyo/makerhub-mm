document.addEventListener("DOMContentLoaded", () => {

  // =====================================================
  // SESSION
  // =====================================================

  const sessionData = localStorage.getItem("userSession");
  const currentUser = sessionData ? JSON.parse(sessionData) : null;

  // =====================================================
  // CREATE POST BUTTON
  // =====================================================

  const createPostBtn = document.getElementById("btnCreatePost");

  if (createPostBtn) {

    createPostBtn.classList.remove("d-none");

    createPostBtn.addEventListener("click", (e) => {

      e.preventDefault();

      if (currentUser) {
        window.location.href = "create-post.html";
      } else {
        window.location.href = "login.html";
      }
    });
  }

  // =====================================================
  // URL PARAMS
  // =====================================================

  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");

  const loadingIndicator = document.getElementById("loadingIndicator");
  const projectContent = document.getElementById("projectContent");

  let currentLikes = 0;
  let isLiked = false;

  if (!projectId) {

    safeSetText("pjTitle", "No Project ID Found");

    if (loadingIndicator)
      loadingIndicator.classList.add("d-none");

    if (projectContent)
      projectContent.classList.remove("d-none");

    return;
  }

  // =====================================================
  // API
  // =====================================================

  const apiUrl =
    `https://6a1144953e35d0f37ee31c1d.mockapi.io/api/accounts/accounts/${projectId}`;

  // =====================================================
  // LOAD PROJECT
  // =====================================================

  async function loadProjectDetails() {

    try {

      if (loadingIndicator)
        loadingIndicator.classList.remove("d-none");

      if (projectContent)
        projectContent.classList.add("d-none");

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch project");
      }

      const project = await response.json();

      // =====================================================
      // LIKES
      // =====================================================

      currentLikes = project.likes || 0;

      const likedProjects = JSON.parse(
        localStorage.getItem("liked_projects") || "[]"
      );

      isLiked = likedProjects.includes(projectId);

      // =====================================================
      // BASIC INFO
      // =====================================================

      safeSetText("pjTitle", project.title || "Untitled Project");

      safeSetText("pjAuthor", project.name || "Anonymous");

      safeSetText("pjCategory", project.category || "General");

      safeSetText("pjLikes", currentLikes);

      safeSetText(
        "pjComments",
        project.comments || 0
      );

      updateLikeUI();

      // =====================================================
      // AVATAR
      // =====================================================

      const avatarEl = document.getElementById("pjAvatar");

      if (avatarEl) {

        avatarEl.src =
          project.avatar ||
          "https://via.placeholder.com/40";
      }

      // =====================================================
      // IMAGE
      // =====================================================

      const imgEl = document.getElementById("pjImage");

      if (imgEl) {

        imgEl.src =
          project.image ||
          "https://via.placeholder.com/800x400";
      }

      // =====================================================
      // DESCRIPTION
      // =====================================================

      const descEl = document.getElementById("pjDescription");

      if (descEl) {

        descEl.innerHTML = project.longDescription
          ? project.longDescription
              .split("\n")
              .map(p => `<p class="mb-3">${p}</p>`)
              .join("")
          : "No description available.";
      }

      // =====================================================
      // WIRING
      // =====================================================

      const wiringEl = document.getElementById("pjWiring");

      if (wiringEl) {

        wiringEl.innerHTML = project.wiringNotes
          ? project.wiringNotes
              .split("\n")
              .map(line => `
                <li class="mb-2">
                  <i class="bi bi-arrow-right-short text-warning me-1"></i>
                  ${line}
                </li>
              `)
              .join("")
          : "<li>No wiring notes provided.</li>";
      }

      // =====================================================
      // CODE
      // =====================================================

      const codeElement = document.getElementById("pjCode");

      if (codeElement) {

        codeElement.textContent =
          project.sourceCode || "// No code available";

        Prism.highlightElement(codeElement);
      }

      // =====================================================
      // LISTS
      // =====================================================

      renderList("pjElectronics", project.electronics);

      renderList("pjHardware", project.hardware);

      renderList("pjSoftware", project.software);

      // =====================================================
      // SHOW CONTENT
      // =====================================================

      if (loadingIndicator)
        loadingIndicator.classList.add("d-none");

      if (projectContent)
        projectContent.classList.remove("d-none");

      setupLikeFeature();

    } catch (error) {

      console.error(error);

      safeSetText("pjTitle", "Error Loading Project");

      if (loadingIndicator)
        loadingIndicator.classList.add("d-none");

      if (projectContent)
        projectContent.classList.remove("d-none");
    }
  }

  // =====================================================
  // LIKE FEATURE
  // =====================================================

  function setupLikeFeature() {

    const btnLike = document.getElementById("btnLike");

    if (!btnLike) return;

    btnLike.onclick = async () => {

      // login required
      if (!currentUser) {

        alert("Please login first!");

        window.location.href = "/login.html";

        return;
      }

      btnLike.disabled = true;

      // toggle
      if (isLiked) {

        currentLikes--;
        isLiked = false;

      } else {

        currentLikes++;
        isLiked = true;
      }

      updateLikeUI();

      safeSetText("pjLikes", currentLikes);

      try {

        // IMPORTANT FIX
        await fetch(apiUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            likes: currentLikes
          })
        });

        let likedProjects = JSON.parse(
          localStorage.getItem("liked_projects") || "[]"
        );

        if (isLiked) {

          likedProjects.push(projectId);

        } else {

          likedProjects =
            likedProjects.filter(id => id !== projectId);
        }

        localStorage.setItem(
          "liked_projects",
          JSON.stringify(likedProjects)
        );

      } catch (err) {

        console.error("Like update failed:", err);

      } finally {

        btnLike.disabled = false;
      }
    };
  }

  // =====================================================
  // LIKE UI
  // =====================================================

  function updateLikeUI() {

    const likeIcon = document.getElementById("likeIcon");
    const btnLike = document.getElementById("btnLike");

    if (!likeIcon || !btnLike) return;

    if (isLiked) {

      likeIcon.className = "bi bi-heart-fill me-2";

      btnLike.style.color = "#ef4444";
      btnLike.style.backgroundColor = "rgba(239,68,68,0.1)";
      btnLike.style.borderColor = "rgba(239,68,68,0.25)";

    } else {

      likeIcon.className = "bi bi-heart me-2";

      btnLike.style.color = "var(--green)";
      btnLike.style.backgroundColor = "var(--green-dim)";
      btnLike.style.borderColor = "var(--border-accent)";
    }
  }

  // =====================================================
  // HELPERS
  // =====================================================

  function safeSetText(id, text) {

    const el = document.getElementById(id);

    if (el)
      el.textContent = text;
  }

  function renderList(id, items) {

    const el = document.getElementById(id);

    if (!el) return;

    if (Array.isArray(items) && items.length > 0) {

      el.innerHTML = items.map(item => `
        <li>
          <i class="bi bi-check2-circle"></i>
          <span>${item}</span>
        </li>
      `).join("");

    } else {

      el.innerHTML =
        `<li class="text-muted small">None</li>`;
    }
  }

  // =====================================================
  // START
  // =====================================================

  loadProjectDetails();

});