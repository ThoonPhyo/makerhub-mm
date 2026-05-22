// ၁။ MockAPI လမ်းကြောင်းကို သတ်မှတ်ခြင်း
const BASE_URL = "https://6a0e53941736097c3609b735.mockapi.io/api/v1"; 
const apiMarketUrl = `${BASE_URL}/marketplace`;

// -----------------------------------------------------
// ၂။ စကားလုံး ကန့်သတ်ချက် (Word Limit) လုပ်ဆောင်ချက် အပိုင်း
// -----------------------------------------------------

// Textarea (စာရိုက်မယ့်အကွက်), သတိပေးစာသား (Warning) နဲ့ စကားလုံးရေပြမယ့် (Display) တွေကို HTML ထဲကနေ ဆွဲယူခြင်း
const descInput = document.getElementById("itemDesc");
const descWarning = document.getElementById("descWarning");
const wordCountDisplay = document.getElementById("wordCountDisplay");

// အများဆုံး ခွင့်ပြုမယ့် စကားလုံး အရေအတွက် သတ်မှတ်ခြင်း (ဥပမာ - ၅၀)
const MAX_WORDS = 50; 

// User က Textarea ထဲမှာ စာရိုက်လိုက်တိုင်း (input event) ဒီ Function ကို အလုပ်လုပ်ခိုင်းခြင်း
descInput.addEventListener("input", function() {
  
  // ရိုက်ထည့်လိုက်တဲ့ စာသားတွေကို ရယူပြီး၊ ရှေ့နောက် Space တွေကို ဖြတ် (trim) ပါတယ်
  const text = this.value.trim(); 
  
  // စာလုံးတွေကို Space ပေါ်မူတည်ပြီး အပိုင်းပိုင်းဖြတ် (split) လိုက်ပါတယ်။ ပြီးရင် စာလုံးအလွတ်တွေကို ဖယ်ထုတ် (filter) ပါတယ်
  const wordsArray = text.split(/\s+/).filter(word => word.length > 0);
  
  // Array ထဲမှာ စကားလုံး ဘယ်နှလုံး ပါလဲဆိုတာကို ရေတွက်ခြင်း
  const wordCount = wordsArray.length;

  // ရေတွက်ထားတဲ့ အရေအတွက်ကို "12/50 words" ဆိုပြီး HTML ပေါ်မှာ သွားပြခြင်း
  wordCountDisplay.innerText = `${wordCount}/${MAX_WORDS} words`;

  // အကယ်၍ ရိုက်ထားတဲ့ စကားလုံးက ကန့်သတ်ချက် (၅၀) ထက် ကျော်သွားခဲ့လျှင်
  if (wordCount > MAX_WORDS) {
    descWarning.classList.remove("d-none"); // သတိပေးစာသား (Warning) ကို ဖော်ပြမယ် (d-none ကို ဖြုတ်တယ်)
    descInput.classList.add("is-invalid");  // အကွက်ကို အနီရောင်ဘောင် ကွပ်မယ်
  } else {
    // မကျော်ဘူးဆိုရင်
    descWarning.classList.add("d-none");    // သတိပေးစာကို ပြန်ဖျောက်မယ်
    descInput.classList.remove("is-invalid"); // အနီရောင်ဘောင်ကို ပြန်ဖြုတ်မယ်
  }
});


// -----------------------------------------------------
// ၃။ Form Submit လုပ်ပြီး API သို့ ဒေတာပို့မည့် အပိုင်း
// -----------------------------------------------------

document.getElementById("marketPostForm").addEventListener("submit", async function (e) {
  e.preventDefault(); // Submit နှိပ်ရင် Page Reload အလိုအလျောက် ဖြစ်သွားတာကို တားဆီးခြင်း

  // နောက်ဆုံးအနေနဲ့ ပို့ခါနီးမှာ စကားလုံးရေ တကယ်ကျော်မကျော် ထပ်စစ်ဆေးခြင်း
  const currentWords = descInput.value.trim().split(/\s+/).filter(w => w.length > 0).length;
  if (currentWords > MAX_WORDS) {
    alert("Please reduce your description to 50 words or less before submitting.");
    return; // ကျော်နေရင် အောက်က API ပို့တဲ့အလုပ်တွေကို ဆက်မလုပ်ဘဲ ရပ်တန့်လိုက်ခြင်း
  }

  const btnSubmit = document.getElementById("btnSubmitItem");
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `Publishing...`;


  // 💡 ၁။ အကွက် ၃ ခုလုံးက ဓာတ်ပုံလင့်ခ်တွေကို ဆွဲယူပါမယ်
  const img1 = document.getElementById("itemImage1").value.trim();
  const img2 = document.getElementById("itemImage2").value.trim();
  const img3 = document.getElementById("itemImage3").value.trim();

  // 💡 ၂။ ပုံ ၃ ပုံကို Array (အုပ်စု) တစ်ခုဖွဲ့လိုက်ပါတယ်။ filter ကိုသုံးပြီး အလွတ်ဖြစ်နေတဲ့ အကွက်တွေကို ဖယ်ထုတ်ပစ်ပါတယ်။
  const imagesArray = [img1, img2, img3].filter(img => img !== "");

const newItem = {
    itemName: document.getElementById("itemName").value.trim(),
    price: document.getElementById("itemPrice").value.trim() + " MMK",
    condition: document.getElementById("itemCondition").value,
    category: document.getElementById("itemCategory").value,
    image: img1, 
    images: imagesArray, 
    description: descInput.value.trim(),
    
    contactPhone: document.getElementById("contactPhone").value.trim(),
    // 💡 အသစ်ထည့်လိုက်သော Social Media လင့်ခ် ရယူသည့်လိုင်း
    contactSocial: document.getElementById("contactSocial").value.trim(), 
    
    sellerName: "Thoon Phyo Aung", 
    sellerAvatar: "https://ui-avatars.com/api/?name=Thoon+Phyo&background=161b22&color=22c55e&bold=true"
  };

  try {
    // MockAPI သို့ ထုပ်ပိုးထားသော ဒေတာများကို ပို့လွှတ်ခြင်း
    const response = await fetch(apiMarketUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem)
    });

    if (!response.ok) throw new Error("Network error");

    // အောင်မြင်စွာ ပို့ပြီးပါက
    alert("Item posted successfully!");
    window.location.href = "../index.html"; // ပင်မဈေးကွက် စာမျက်နှာသို့ ပြန်ပို့ခြင်း

  } catch (error) {
    // ပို့တဲ့အချိန် အင်တာနက်ပြတ်တာမျိုး Error တက်ခဲ့ပါက
    console.error("Error:", error);
    alert("Failed to post item.");
    btnSubmit.disabled = false; // ခလုတ်ကို ပြန်ဖွင့်ပေးခြင်း
    btnSubmit.innerHTML = `Publish Item`;
  }
});