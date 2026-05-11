// Example function to fetch dynamic data for the cards later
document.addEventListener("DOMContentLoaded", () => {
  console.log("MakerHub MM Initialized!");

  // Future API call example:
  // fetch('https://api.yourbackend.com/v1/user/streak')
  //   .then(response => response.json())
  //   .then(data => updateStreakUI(data))
  //   .catch(error => console.error('Error fetching data:', error));
});

// Search icon ကို နှိပ်ရင် အလုပ်လုပ်ဖို့ simple logic
const searchBtn = document.querySelector(".search-link");

searchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  // ဥပမာ - Search box တစ်ခု ပေါ်လာအောင်လုပ်တာမျိုး ဒါမှမဟုတ် prompt တောင်းတာမျိုး
  const searchQuery = prompt("ဘာကို ရှာဖွေချင်ပါသလဲ?");
  if (searchQuery) {
    console.log("Searching for:", searchQuery);
    // ဒီနေရာမှာ မင်းရဲ့ API နဲ့ ချိတ်ပြီး ရှာခိုင်းလို့ရပါတယ်။
  }
});









