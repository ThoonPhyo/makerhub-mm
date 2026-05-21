document.addEventListener("DOMContentLoaded", () => {
    // ပထမဆုံး အသုံးပြုသူ တကယ် login ဝင်ထားရဲ့လား ထပ်မံအတည်ပြုခြင်း
    const userName = localStorage.getItem("userName") || "Anonymous Maker";
    const userAvatar = localStorage.getItem("userAvatar") || "https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/40.jpg";

    const form = document.getElementById("createPostForm");
    const btnSubmit = document.getElementById("btnSubmitPost");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // Page Refresh မဖြစ်အောင် ကာကွယ်ခြင်း

        // Submit ခလုတ်ကို ထပ်ခါတလဲလဲ မနှိပ်နိုင်အောင် ပိတ်ခြင်း
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Publishing...`;

        // ကော်မာ (,) ခံပြီး ရေးထားသော စာသားများကို Array ပုံစံသို့ ပြောင်းလဲပေးသည့် helper
        const parseCommaInput = (id) => {
            const val = document.getElementById(id).value.trim();
            return val ? val.split(",").map(item => item.trim()).filter(item => item !== "") : [];
        };

        // API တောင်းဆိုသော ပုံစံအတိုင်း JSON Data Object ဆောက်ခြင်း
        const newProjectData = {
            createdAt: new Date().toISOString(),
            userName: userName,            // LocalStorage မှ ရယူသည်
            userAvatar: userAvatar,        // LocalStorage မှ ရယူသည်
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
            likes: 0 // Post အသစ်ဖြစ်၍ Like ကို သုည ပုံသေထားမည်
        };

        const apiUrl = "https://6a0e53941736097c3609b735.mockapi.io/api/v1/projects";

        try {
            // MockAPI ဆီသို့ POST Method ဖြင့် ပေးပို့ခြင်း
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newProjectData)
            });

            if (!response.ok) throw new Error("Failed to create new project post");

            alert("🎉 Your project has been published successfully!");
            
            // Post တင်ပြီးပါက ပင်မစာမျက်နှာ (သို့မဟုတ် Dashboard) သို့ ပြန်ခေါ်သွားမည်
            window.location.href = "index.html"; 

        } catch (error) {
            console.error("Error creating post:", error);
            alert("❌ Something went wrong while publishing. Please try again.");
            
            // Error တက်ပါက ခလုတ်ကို ပြန်ဖွင့်ပေးခြင်း
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `<i class="bi bi-cloud-arrow-up-fill me-2"></i>Publish to Community`;
        }
    });
});