document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // CHECK LOGIN SESSION
    // =====================================================

    const sessionData = localStorage.getItem("userSession");

    // login မဝင်ထားရင်
    if (!sessionData) {
        alert("Please login first.");
        window.location.href = "/login.html";
        return;
    }

    // Logged-in user object
    const currentUser = JSON.parse(sessionData);

    // =====================================================
    // FORM
    // =====================================================

    const form = document.getElementById("createPostForm");
    const btnSubmit = document.getElementById("btnSubmitPost");

    if (!form) return;

    // =====================================================
    // SUBMIT
    // =====================================================

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        btnSubmit.disabled = true;

        btnSubmit.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2"></span>
            Publishing...
        `;

        // helper
        const parseCommaInput = (id) => {
            const val = document.getElementById(id).value.trim();

            return val
                ? val
                    .split(",")
                    .map(item => item.trim())
                    .filter(item => item !== "")
                : [];
        };

        // =====================================================
        // POST DATA
        // =====================================================

        // =====================================================
        // POST DATA (Updated with type)
        // =====================================================

        const newProjectData = {
            type: "community", // 🚀 Identify this row as a community post
            createdAt: new Date().toISOString(),
            userId: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
            email: currentUser.email,
            title: document.getElementById("title").value.trim(),
            category: document.getElementById("category").value,
            image: document.getElementById("image").value.trim(),
            description: document.getElementById("description").value.trim(),
            longDescription: document.getElementById("longDescription").value.trim(),
            wiringNotes: document.getElementById("wiringNotes").value.trim(),
            sourceCode: document.getElementById("sourceCode").value.trim(),
            electronics: parseCommaInput("electronics"),
            hardware: parseCommaInput("hardware"),
            software: parseCommaInput("software"),
            likes: 0
        };

        // =====================================================
        // YOUR API LINK
        // =====================================================

        const apiUrl =
            "https://6a1144953e35d0f37ee31c1d.mockapi.io/api/accounts/accounts";

        try {

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newProjectData)
            });

            if (!response.ok) {
                throw new Error("Failed to create post");
            }

            alert("🎉 Your project has been published successfully!");

            window.location.href = "index.html";

        } catch (error) {

            console.error("Error creating post:", error);

            alert("❌ Something went wrong while publishing.");

            btnSubmit.disabled = false;

            btnSubmit.innerHTML = `
                <i class="bi bi-cloud-arrow-up-fill me-2"></i>
                Publish to Community
            `;
        }
    });
});