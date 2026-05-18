// data.js
const arduinoJourneyData = [
  {
    id: 1,
    title: "Programming မိတ်ဆက်",
    time: "8 min",
    img: "bulb.png",
    lessons: [
      {
        id: 1,
        title: "Microcontroller ဆိုတာဘာလဲ?",
        xp: "50",
        text: "Microcontroller ဆိုတာ ကွန်ပျူတာတစ်လုံးရဲ့ အလုပ်လုပ်ပုံကို Chip အသေးလေးတစ်ခုထဲမှာ ထည့်သွင်းတည်ဆောက်ထားတာ ဖြစ်ပါတယ်။ Arduino ဟာ လေ့လာရလွယ်ကူတဲ့ Open-source Microcontroller ဘုတ်တစ်ခု ဖြစ်ပါတယ်။",
        code: "",
      },
      {
        id: 2,
        title: "Arduino IDE နှင့် မိတ်ဆက်",
        xp: "50",
        text: "Arduino ဘုတ်ထဲကို ကုဒ်တွေ ရေးသားထည့်သွင်းဖို့ Arduino IDE Software ကို အသုံးပြုရပါမယ်။ အဓိကအားဖြင့် setup() နှင့် loop() ဆိုပြီး အပိုင်းနှစ်ပိုင်း ပါဝင်ပါတယ်။",
        code: `void setup() {\n  // စဖွင့်ချင်း တစ်ကြိမ်သာ အလုပ်လုပ်မည်\n}\nvoid loop() {\n  // ထာဝရ ပတ်မောင်းနေမည်\n}`,
      },
      {
        id: 3,
        title: "ပထမဆုံး ပရောဂျက် (Blinking LED)",
        xp: "100",
        text: "Arduino ဘုတ်ပေါ်က Pin 13 မှာ ရှိတဲ့ LED မီးသီးလေးကို အဖွင့်အပိတ် ပုံမှန် လုပ်ဆောင်ပေးမယ့် အခြေခံအကျဆုံး သင်ခန်းစာ ဖြစ်ပါတယ်။",
        code: `void setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}`,
      },
    ],
  },
  {
    id: 2,
    title: "Number System",
    time: "10 min",
    img: "numbers.png",
    lessons: [
      {
        id: 1,
        title: "Decimal နှင့် Binary စနစ်",
        xp: "50",
        text: "လူတွေသုံးတဲ့ အခြေခံ ၁၀ (Decimal) စနစ်နဲ့ ကွန်ပျူတာ ဟာ့ဒ်ဝဲလ်တွေ နားလည်တဲ့ သုညနှင့်တစ် အခြေခံ ၂ (Binary) စနစ်အကြောင်း ဖြစ်ပါတယ်။",
        code: "",
      },
      {
        id: 2,
        title: "Hexadecimal နှင့် Octal စနစ်",
        xp: "50",
        text: "Memory address တွေနဲ့ အရောင်ကုဒ်တွေမှာ အသုံးများတဲ့ အခြေခံ ၁၆ (Hexadecimal) စနစ်အကြောင်း လေ့လာရမှာ ဖြစ်ပါတယ်။",
        code: "",
      },
      {
        id: 3,
        title: "Serial Monitor စမ်းသပ်ခြင်း",
        xp: "100",
        text: "Arduino ရဲ့ Serial Monitor ကို သုံးပြီး ကိန်းဂဏန်းတစ်ခုတည်းကိုပဲ Binary, Hexadecimal ပုံစံမျိုးစုံ ပြောင်းလဲထုတ်ပြကြည့်ပါမယ်။",
        code: `void setup() {\n  Serial.begin(9600);\n  int num = 42;\n  Serial.println(num, BIN); // 101010\n  Serial.println(num, HEX); // 2A\n}\nvoid loop() {}`,
      },
    ],
  },
  {
    id: 3,
    title: "Data Types",
    time: "12 min",
    img: "box.png",
    lessons: [
      {
        id: 1,
        title: "Integer နှင့် Float ဒေတာ",
        xp: "50",
        text: "ကိန်းပြည့်တန်ဖိုးတွေ သိမ်းဆည်းဖို့ int (2 bytes) ကို သုံးပြီး၊ ဒသမကိန်းတွေ သိမ်းဆည်းဖို့အတွက် float (4 bytes) ကို အသုံးပြုပါတယ်။",
        code: `int count = 10;\nfloat temperature = 28.5;`,
      },
      {
        id: 2,
        title: "Char နှင့် Boolean ဒေတာ",
        xp: "50",
        text: "စာလုံးတစ်လုံးတည်း သိမ်းဖို့ char ('A') ကို သုံးပြီး၊ မှန်/မှား (True/False) အခြေအနေ သိမ်းဖို့ boolean ကို သုံးပါတယ်။",
        code: `char grade = 'A';\nboolean isLightOn = true;`,
      },
      {
        id: 3,
        title: "String နှင့် ၎င်း၏ ကန့်သတ်ချက်များ",
        xp: "100",
        text: "စာသားအရှည်ကြီးတွေကို သိမ်းဆည်းဖို့ String ကို သုံးနိုင်ပေမယ့် မိုက်ခရိုကွန်ထရိုလာရဲ့ RAM Memory ကို အစားများစေတဲ့အကြောင်း လေ့လာရပါမယ်။",
        code: `String message = "Welcome to Arduino";`,
      },
    ],
  },
  {
    id: 4,
    title: "Variables",
    time: "10 min",
    img: "pencil.png",
    lessons: [
      {
        id: 1,
        title: "Variables ကိန်းရှင် တည်ဆောက်ပုံ",
        xp: "50",
        text: "ဒေတာတွေကို သိမ်းဆည်းဖို့ Memory ပေါ်မှာ သေတ္တာလေးတွေ ဆောက်တာကို Variable ကြေညာတယ်လို့ ခေါ်ပါတယ်။ [Data_Type] [Name] = [Value]; ပုံစံ ရေးရပါတယ်။",
        code: `int ledPin = 9;`,
      },
      {
        id: 2,
        title: "Global Variables သဘောတရား",
        xp: "50",
        text: "ပရိုဂရမ်ရဲ့ အပြင်ဘက်ဆုံး ထိပ်ဆုံးမှာ ကြေညာထားတဲ့ ကိန်းရှင်ဖြစ်ပြီး setup() ကော loop() ထဲကပါ လှမ်းသုံးလို့ ရပါတယ်။",
        code: `int sensorValue = 0;\nvoid setup() {}\nvoid loop() { sensorValue = analogRead(A0); }`,
      },
      {
        id: 3,
        title: "Local Variables စည်းကမ်းချက်များ",
        xp: "100",
        text: "Function တစ်ခုခုအတွင်းထဲမှာပဲ ဆောက်ထားပြီး ၎င်းအတွင်းထဲမှာပဲ အလုပ်လုပ်ကာ အပြင်က လှမ်းသုံးရင် Error တက်မယ့် ကိန်းရှင် ဖြစ်ပါတယ်။",
        code: `void setup() {\n  int backupValue = 100;\n}`,
      },
    ],
  },
  {
    id: 5,
    title: "Operators",
    time: "14 min",
    img: "settings.png",
    lessons: [
      {
        id: 1,
        title: "Arithmetic Operators",
        xp: "50",
        text: "အပေါင်း (+ )၊ အနုတ် (-)၊ အမြှောက် (*)၊ အစား (/) နဲ့ အကြွင်းရှာခြင်း (%) တို ဖြစ်ပါတယ်။",
        code: `int remainder = 11 % 3; // ရလဒ် ၂ ရမည်`,
      },
      {
        id: 2,
        title: "Relational Operators",
        xp: "50",
        text: "Tတန်ဖိုးနှစ်ခု ညီမညီ (==)၊ ကြီးသလား (>)၊ Ngငယ်သလား (<)၊ မညီဘူးလား (!=) စတာတွေကို နှိုင်းယှဉ်ပြီး true သို့မဟုတ် false ထုတ်ပေးပါတယ်။",
        code: `boolean result = (5 > 3);`,
      },
      {
        id: 3,
        title: "Logical Operators",
        xp: "100",
        text: "အခြေအနေတွေ အများကြီးကို ပေါင်းစပ်စစ်ဆေးဖို့ AND (&&)၊ OR (||) နဲ့ ပြောင်းပြန်လှန်တဲ့ NOT (!) အော်ပရေတာများအကြောင်း ဖြစ်ပါတယ်။",
        code: `if (digitalRead(2) == HIGH && analogRead(A0) > 500) {\n  // အလုပ်လုပ်မည်\n}`,
      },
    ],
  },
  {
    id: 6,
    title: "Control Statements",
    time: "15 min",
    img: "shuffle.png",
    lessons: [
      {
        id: 1,
        title: "if - else အခြေအနေ ခွဲခြားခြင်း",
        xp: "50",
        text: "သတ်မှတ်ချက် ကိုက်ညီရင် တစ်မျိုး၊ မကိုက်ညီရင် နောက်တစ်မျိုး ပရိုဂရမ်ကို လမ်းခွဲမောင်းနှင်တဲ့ စနစ်ဖြစ်ပါတယ်။",
        code: `if (light < 300) {\n  digitalWrite(13, HIGH);\n} else {\n  digitalWrite(13, LOW);\n}`,
      },
      {
        id: 2,
        title: "switch - case အသုံးပြုပုံ",
        xp: "50",
        text: "စစ်ဆေးရမယ့် အခြေအနေ လမ်းကြောင်းတွေ (Cases) အများကြီး ရှိလာတဲ့အခါ သပ်သပ်ရပ်ရပ် ရေးနိုင်တဲ့ စနစ်ဖြစ်ပါတယ်။",
        code: `switch (mode) {\n  case 1: start(); break;\n  case 2: stop(); break;\n}`,
      },
      {
        id: 3,
        title: "for loop အကြိမ်ကြိမ် ပတ်မောင်းခြင်း",
        xp: "100",
        text: "လုပ်ဆောင်ချက်တစ်ခုကို ကိုယ်လိုချင်တဲ့ အကြိမ်အရေအတွက်အတိုင်း တိတိကျကျ ပတ်မောင်းပေးတဲ့ စနစ်ဖြစ်ပါတယ်။",
        code: `for (int i = 2; i <= 6; i++) {\n  pinMode(i, OUTPUT);\n}`,
      },
    ],
  },
  {
    id: 7,
    title: "Arrays",
    time: "12 min",
    img: "clipboard.png",
    lessons: [
      {
        id: 1,
        title: "Array အခြေခံ တည်ဆောက်ပုံ",
        xp: "50",
        text: "တူညီတဲ့ ဒေတာအမျိုးအစားတွေကို list အစုအဝေးလိုက် Matrix ပုံစံ သိမ်းတာဖြစ်ပြီး အခန်းအညွှန်း (Index) ကို သုည (0) ကနေ စတင်ရေတွက်ပါတယ်။",
        code: `int ledPins[] = {2, 3, 4, 5, 6};`,
      },
      {
        id: 2,
        title: "Array အခန်းများကို ဆွဲထုတ်သုံးစွဲခြင်း",
        xp: "50",
        text: "Array ထဲက ဒေတာတွေကို index နံပါတ် ခေါ်ပြီး လှမ်းကိုင်တာ ဖြစ်ပါတယ်။ ဥပမာ ledPins[0] ဆိုရင် ၂ ကို ဆိုလိုတာ ဖြစ်ပါတယ်။",
        code: `digitalWrite(ledPins[0], HIGH);`,
      },
      {
        id: 3,
        title: "Array နှင့် Loop ပေါင်းစပ်အသုံးချခြင်း",
        xp: "100",
        text: "Array ထဲက မီးသီး Pin နံပါတ်တွေအကုန်လုံးကို for loop သုံးပြီး ရေလှိုင်းစီးသလို တစ်လုံးပြီးတစ်လုံး အစီအရင်အတိုင်း လင်းသွားစေမယ့် သင်ခန်းစာ ဖြစ်ပါတယ်။",
        code: `void setup() {\n  for(int i=0; i<5; i++) pinMode(ledPins[i], OUTPUT);\n}\nvoid loop() {\n  for(int i=0; i<5; i++) {\n    digitalWrite(ledPins[i], HIGH);\n    delay(200);\n    digitalWrite(ledPins[i], LOW);\n  }\n}`,
      },
    ],
  },
];

// 🔄 Progress ကို ထိန်းချုပ်မည့် Helper Functions (Local Storage စနစ်)
function getCardStatus(cardId) {
  const progress = JSON.parse(localStorage.getItem("arduino_progress")) || {};
  return progress[cardId] || false; // true = completed, false = incomplete
}

function saveCardComplete(cardId) {
  const progress = JSON.parse(localStorage.getItem("arduino_progress")) || {};
  progress[cardId] = true;
  localStorage.setItem("arduino_progress", JSON.stringify(progress));
}


