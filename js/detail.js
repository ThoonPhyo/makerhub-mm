document.addEventListener("DOMContentLoaded", async () => {
  const detailContainer = document.getElementById('detailContainer');
  
  // 🔗 ၁။ လက်ရှိ URL ထဲကနေ ?id=X ဆိုတဲ့ ကောင်ကို ဆွဲထုတ်ခြင်း
  const urlParams = new URLSearchParams(window.location.search);
  let projectId = urlParams.get('id');

  // Console မှာ ID တကယ်ပါမပါ စစ်ဆေးရန် ထုတ်ကြည့်ခြင်း
  console.log("Current Project ID from URL:", projectId);

  if (!projectId) {
    detailContainer.innerHTML = `<div class="alert alert-danger">No project ID found in URL!</div>`;
    return;
  }

  // MockAPI အတွက် ID ကို သန့်စင်ပေးခြင်း (Spaces များကို ဖယ်ထုတ်ခြင်း)
  projectId = projectId.trim();

  try {
    // 🌐 ၂။ အစ်ကို့ရဲ့ MockAPI Endpoint အစစ်အမှန်ဆီကို လှမ်းတောင်းခြင်း
    // (လင့်ခ်ကို သေချာ စိစစ်ပြီး အမှန်ကန်ဆုံး ပုံစံ ပြင်ပေးထားပါတယ်)
    const apiUrl = `https://6a0e53941736097c3609b735.mockapi.io/api/v1/projects/${projectId}`;
    console.log("Fetching from API URL:", apiUrl); // ခေါ်မည့် URL ကို Console တွင် ပြသရန်
    
    const response = await fetch(apiUrl);
    
    // တကယ်လို့ 404 သို့မဟုတ် အခြား Error တက်ရင် ဖမ်းရန်
    if (!response.ok) {
       throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const project = await response.json();

    // 🎯 ၃။ ရလာတဲ့ ဒေတာကို စာမျက်နှာပေါ် နေရာချပြီး ပြသခြင်း
    detailContainer.innerHTML = `
      <div class="col-md-10">
        <div class="card shadow-sm border-0 overflow-hidden mb-5">
          <img src="${project.image}" class="img-fluid w-100" style="max-height: 450px; object-fit: cover;" alt="Project Image">
          <div class="card-body p-4">
            <span class="badge bg-primary mb-3 text-uppercase">${project.category}</span>
            <h1 class="card-title fw-bold mb-3">${project.title}</h1>
            
            <div class="d-flex align-items-center mb-4 pb-3 border-bottom">
              <img src="${project.userAvatar}" class="rounded-circle me-2" width="40" height="40" alt="Avatar">
              <div>
                <strong class="d-block">${project.userName}</strong>
                <small class="text-muted">Project Developer</small>
              </div>
            </div>

            <h4 class="fw-semibold mb-3">Project Description</h4>
            <p class="lead text-secondary" style="line-height: 1.8;">${project.description}</p>
            
            <div class="mt-4 pt-3 border-top d-flex gap-4 text-muted">
              <span><i class="fa-regular fa-heart text-danger"></i> ${project.likes} Likes</span>
              <span><i class="fa-regular fa-comment"></i> ${project.comments} Comments</span>
            </div>
          </div>
        </div>
      </div>
    `;

  } catch (error) {
    console.error("Detail Fetch Error:", error);
    detailContainer.innerHTML = `
      <div class="col-md-8 text-center py-5">
        <div class="alert alert-danger p-4">
          <h4 class="alert-heading fw-bold">Project Not Found!</h4>
          <p class="mb-0">Failed to load project details from API (Status 404).</p>
          <hr>
          <p class="small mb-0 text-muted">Requested Project ID: <strong>${projectId}</strong></p>
        </div>
      </div>`;
  }
});