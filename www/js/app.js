/* ============================= STATE ============================= */
const MEAL_DB = {
  breakfast: [
    {name:"Greek yogurt, berries & granola", cal:380, p:28, c:44, f:10, diet:["none","vegetarian"], allergens:["dairy","gluten"]},
    {name:"Veggie & feta scramble (3 eggs)", cal:420, p:30, c:12, f:28, diet:["none","vegetarian"], allergens:["dairy","eggs"]},
    {name:"Overnight oats, peanut butter & banana", cal:450, p:18, c:58, f:16, diet:["none","vegetarian","vegan"], allergens:["peanut","gluten"]},
    {name:"Smoked salmon & avocado toast", cal:410, p:26, c:34, f:18, diet:["none","pescatarian"], allergens:["fish","gluten"]},
    {name:"Tofu scramble, spinach & sourdough", cal:390, p:22, c:36, f:16, diet:["vegan","vegetarian"], allergens:["soy","gluten"]},
    {name:"Protein smoothie (oat milk, spinach, berries)", cal:340, p:30, c:40, f:8, diet:["none","vegetarian","vegan"], allergens:[]},
  ],
  lunch: [
    {name:"Grilled chicken, quinoa & roasted veg", cal:560, p:44, c:52, f:18, diet:["none"], allergens:[]},
    {name:"Lentil & veggie power bowl", cal:520, p:24, c:70, f:14, diet:["vegan","vegetarian"], allergens:[]},
    {name:"Seared tuna, brown rice & greens", cal:540, p:42, c:48, f:16, diet:["none","pescatarian"], allergens:["fish"]},
    {name:"Chickpea & halloumi salad", cal:530, p:26, c:48, f:24, diet:["vegetarian"], allergens:["dairy"]},
    {name:"Turkey & sweet potato bowl", cal:550, p:40, c:50, f:16, diet:["none"], allergens:[]},
    {name:"Black bean & avocado burrito bowl", cal:560, p:22, c:74, f:18, diet:["vegan","vegetarian"], allergens:[]},
  ],
  dinner: [
    {name:"Baked salmon, asparagus & farro", cal:600, p:40, c:44, f:26, diet:["none","pescatarian"], allergens:["fish","gluten"]},
    {name:"Lean beef stir-fry & jasmine rice", cal:610, p:42, c:58, f:18, diet:["none"], allergens:["soy"]},
    {name:"Stuffed peppers, black beans & rice", cal:540, p:22, c:66, f:16, diet:["vegan","vegetarian"], allergens:[]},
    {name:"Grilled tofu, soba noodles & greens", cal:520, p:26, c:60, f:14, diet:["vegan","vegetarian"], allergens:["soy","gluten"]},
    {name:"Herb chicken thigh, mash & broccoli", cal:590, p:44, c:46, f:22, diet:["none"], allergens:["dairy"]},
    {name:"Shrimp & vegetable curry, rice", cal:560, p:36, c:56, f:16, diet:["none","pescatarian"], allergens:["shellfish"]},
  ],
  snack: [
    {name:"Cottage cheese & pineapple", cal:180, p:18, c:18, f:4, diet:["none","vegetarian"], allergens:["dairy"]},
    {name:"Almonds & apple", cal:210, p:6, c:22, f:13, diet:["none","vegetarian","vegan"], allergens:["tree_nuts"]},
    {name:"Protein shake", cal:160, p:25, c:8, f:3, diet:["none","vegetarian","vegan"], allergens:["dairy"]},
    {name:"Hummus & carrot sticks", cal:170, p:6, c:20, f:8, diet:["none","vegetarian","vegan"], allergens:["sesame"]},
    {name:"Edamame, salted", cal:150, p:13, c:12, f:6, diet:["vegan","vegetarian"], allergens:["soy"]},
    {name:"Hard-boiled eggs (2)", cal:140, p:12, c:1, f:10, diet:["none","vegetarian"], allergens:["eggs"]},
  ]
};
const UNHEALTHY_KEYWORDS = ["chips","soda","candy","fries","cookie","chocolate bar","donut","cake","ice cream","fast food","pizza slice","energy drink"];

const GYM_WORKOUT_TEMPLATES = {
  2: [
    {day:"Day A — Full Body", ex:[["Goblet squats","3x12"],["Push-ups","3x12"],["Bent-over rows","3x12"],["Plank","3x40s"]]},
    {day:"Day B — Full Body", ex:[["Romanian deadlifts","3x10"],["Overhead press","3x10"],["Lat pulldown","3x12"],["Bike sprints","5x30s"]]},
  ],
  3: [
    {day:"Day A — Full Body", ex:[["Goblet squats","3x12"],["Push-ups","3x12"],["Bent-over rows","3x12"],["Plank","3x40s"]]},
    {day:"Day B — Full Body", ex:[["Romanian deadlifts","3x10"],["Overhead press","3x10"],["Lat pulldown","3x12"],["Bike sprints","5x30s"]]},
    {day:"Day C — Full Body", ex:[["Walking lunges","3x12/leg"],["Incline dumbbell press","3x10"],["Seated cable row","3x12"],["Side plank","3x30s/side"]]},
  ],
  4: [
    {day:"Day 1 — Upper", ex:[["Bench press","4x8"],["Row (machine/dumbbell)","4x10"],["Lateral raise","3x15"],["Triceps pushdown","3x12"]]},
    {day:"Day 2 — Lower", ex:[["Back squat","4x8"],["Romanian deadlift","3x10"],["Walking lunges","3x12/leg"],["Calf raises","3x15"]]},
    {day:"Day 3 — Upper", ex:[["Overhead press","4x8"],["Pull-ups / lat pulldown","4x10"],["Chest fly","3x12"],["Biceps curls","3x12"]]},
    {day:"Day 4 — Lower + Core", ex:[["Deadlift","4x6"],["Leg press","3x12"],["Hip thrust","3x12"],["Hanging knee raise","3x15"]]},
  ],
  5: [
    {day:"Day 1 — Push", ex:[["Bench press","4x8"],["Overhead press","3x10"],["Incline dumbbell press","3x10"],["Triceps dips","3x12"]]},
    {day:"Day 2 — Pull", ex:[["Deadlift","4x6"],["Pull-ups","4x8"],["Barbell row","3x10"],["Biceps curls","3x12"]]},
    {day:"Day 3 — Legs", ex:[["Back squat","4x8"],["Walking lunges","3x12/leg"],["Leg curl","3x12"],["Calf raises","3x15"]]},
    {day:"Day 4 — Push", ex:[["Dumbbell shoulder press","4x10"],["Chest fly","3x12"],["Lateral raise","3x15"],["Cable crunch","3x15"]]},
    {day:"Day 5 — Pull + Core", ex:[["Lat pulldown","4x10"],["Seated row","3x12"],["Face pulls","3x15"],["Plank","3x45s"]]},
  ],
  6: [
    {day:"Day 1 — Push", ex:[["Bench press","4x8"],["Overhead press","3x10"],["Incline press","3x10"],["Triceps dips","3x12"]]},
    {day:"Day 2 — Pull", ex:[["Deadlift","4x6"],["Pull-ups","4x8"],["Barbell row","3x10"],["Biceps curls","3x12"]]},
    {day:"Day 3 — Legs", ex:[["Back squat","4x8"],["Walking lunges","3x12/leg"],["Leg curl","3x12"],["Calf raises","3x15"]]},
    {day:"Day 4 — Push", ex:[["Dumbbell shoulder press","4x10"],["Chest fly","3x12"],["Lateral raise","3x15"],["Cable crunch","3x15"]]},
    {day:"Day 5 — Pull", ex:[["Lat pulldown","4x10"],["Seated row","3x12"],["Face pulls","3x15"],["Hyperextensions","3x12"]]},
    {day:"Day 6 — Legs + Core", ex:[["Front squat","4x8"],["Hip thrust","3x12"],["Step-ups","3x12/leg"],["Plank","3x45s"]]},
  ]
};

const HOME_WORKOUT_TEMPLATES = {
  2: [
    {day:"Day A — Full Body", ex:[["Bodyweight squats","3x15"],["Push-ups","3x12"],["Backpack rows (table/band)","3x12"],["Plank","3x40s"]]},
    {day:"Day B — Full Body", ex:[["Glute bridges","3x15"],["Pike push-ups","3x10"],["Superman raises","3x15"],["Jumping jacks","5x30s"]]},
  ],
  3: [
    {day:"Day A — Full Body", ex:[["Bodyweight squats","3x15"],["Push-ups","3x12"],["Backpack rows (table/band)","3x12"],["Plank","3x40s"]]},
    {day:"Day B — Full Body", ex:[["Glute bridges","3x15"],["Pike push-ups","3x10"],["Superman raises","3x15"],["Jumping jacks","5x30s"]]},
    {day:"Day C — Full Body", ex:[["Walking lunges","3x12/leg"],["Diamond push-ups","3x10"],["Band rows","3x12"],["Side plank","3x30s/side"]]},
  ],
  4: [
    {day:"Day 1 — Upper", ex:[["Push-ups","4x12"],["Band/backpack rows","4x12"],["Pike push-ups","3x10"],["Triceps dips (chair)","3x12"]]},
    {day:"Day 2 — Lower", ex:[["Bodyweight squats","4x15"],["Single-leg glute bridge","3x12/leg"],["Walking lunges","3x12/leg"],["Calf raises","3x20"]]},
    {day:"Day 3 — Upper", ex:[["Incline push-ups","4x12"],["Superman raises","4x15"],["Doorframe rows","3x12"],["Bicep curls (bags/bottles)","3x15"]]},
    {day:"Day 4 — Lower + Core", ex:[["Bulgarian split squats","4x10/leg"],["Hip thrusts","3x15"],["Glute bridge march","3x12"],["Hanging or lying knee raise","3x15"]]},
  ],
  5: [
    {day:"Day 1 — Push", ex:[["Push-ups","4x12"],["Pike push-ups","3x10"],["Incline push-ups","3x12"],["Triceps dips (chair)","3x12"]]},
    {day:"Day 2 — Pull", ex:[["Band/backpack rows","4x12"],["Doorframe rows","4x10"],["Superman raises","3x15"],["Bicep curls (bags/bottles)","3x15"]]},
    {day:"Day 3 — Legs", ex:[["Bodyweight squats","4x15"],["Walking lunges","3x12/leg"],["Single-leg deadlift","3x10/leg"],["Calf raises","3x20"]]},
    {day:"Day 4 — Push", ex:[["Diamond push-ups","4x10"],["Shoulder taps","3x16"],["Wall handstand hold","3x20s"],["Plank to push-up","3x10"]]},
    {day:"Day 5 — Pull + Core", ex:[["Band rows","4x12"],["Reverse snow angels","3x15"],["Face-down Y-raises","3x12"],["Plank","3x45s"]]},
  ],
  6: [
    {day:"Day 1 — Push", ex:[["Push-ups","4x12"],["Pike push-ups","3x10"],["Incline push-ups","3x12"],["Triceps dips (chair)","3x12"]]},
    {day:"Day 2 — Pull", ex:[["Band/backpack rows","4x12"],["Doorframe rows","4x10"],["Superman raises","3x15"],["Bicep curls (bags/bottles)","3x15"]]},
    {day:"Day 3 — Legs", ex:[["Bodyweight squats","4x15"],["Walking lunges","3x12/leg"],["Single-leg deadlift","3x10/leg"],["Calf raises","3x20"]]},
    {day:"Day 4 — Push", ex:[["Diamond push-ups","4x10"],["Shoulder taps","3x16"],["Wall handstand hold","3x20s"],["Plank to push-up","3x10"]]},
    {day:"Day 5 — Pull", ex:[["Band rows","4x12"],["Reverse snow angels","3x15"],["Face-down Y-raises","3x12"],["Hyperextensions (floor)","3x12"]]},
    {day:"Day 6 — Legs + Core", ex:[["Bulgarian split squats","4x10/leg"],["Hip thrusts","3x15"],["Step-ups (stairs/chair)","3x12/leg"],["Plank","3x45s"]]},
  ]
};

function getWorkoutTemplates(){
  return state.profile.location==="home" ? HOME_WORKOUT_TEMPLATES : GYM_WORKOUT_TEMPLATES;
}

const GOALS = [
  {id:"lose_fat", label:"Lose fat & get lean", icon:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="2"/><path d="M13 7l-2 5-3 2 1 6"/><path d="M11 12l4 1 3 5"/><path d="M8 14l-4 2"/></svg>'},
  {id:"build_muscle", label:"Build muscle", icon:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 14a4 4 0 0 1 4-4h1V7a2 2 0 1 1 4 0v3l2 1v5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z"/><path d="M13 4l2-2"/></svg>'},
  {id:"maintain", label:"Maintain & recomp", icon:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v14"/><path d="M5 8l-3 4 3 4"/><path d="M19 8l3 4-3 4"/><path d="M2 12h6M16 12h6"/><circle cx="12" cy="20" r="1.5"/></svg>'},
];

const ALLERGENS = [
  ["dairy","Dairy"],
  ["eggs","Eggs"],
  ["peanut","Peanuts"],
  ["tree_nuts","Tree nuts"],
  ["gluten","Gluten"],
  ["soy","Soy"],
  ["fish","Fish"],
  ["shellfish","Shellfish"],
  ["sesame","Sesame"],
];
function toggleAllergy(id){
  state.profile = state.profile || {};
  const list = state.profile.allergies ? state.profile.allergies.slice() : [];
  const idx = list.indexOf(id);
  if(idx>=0) list.splice(idx,1); else list.push(id);
  state.profile.allergies = list;
  state.plan && rebuildMealPlanForAllergies();
  render();
}
function rebuildMealPlanForAllergies(){
  state.plan.meals = buildMealPlan(state.profile, state.plan, null);
}

const EXERCISE_TIPS = {
  "Push-ups":"Keep your core tight and body straight. Lower until your chest is close to the floor.",
  "Goblet squats":"Hold the weight close to your chest and sit back through your heels.",
  "Bent-over rows":"Hinge at the hips, keep your back flat, and pull toward your waist.",
  "Plank":"Squeeze your glutes and keep a straight line from shoulders to ankles.",
  "Bodyweight squats":"Sit back through your heels and keep your chest tall throughout.",
  "Backpack rows (table/band)":"Keep your elbows close and squeeze your shoulder blades together.",
  "Glute bridges":"Drive through your heels and squeeze your glutes at the top.",
  "Pike push-ups":"Keep hips high and lower the crown of your head toward the floor.",
  "Superman raises":"Lift chest and legs together, hold briefly, then lower with control.",
  "Walking lunges":"Keep your front knee tracking over your foot, not caving inward.",
  "Diamond push-ups":"Form a diamond with your hands and keep elbows tucked in.",
  "Romanian deadlifts":"Push hips back, keep a soft knee bend, and feel it in your hamstrings.",
  "Overhead press":"Brace your core and press straight up without arching your back.",
  "Lat pulldown":"Pull to your upper chest and avoid leaning back excessively.",
  "Bench press":"Keep your feet planted and lower the bar under control to your chest.",
  "Back squat":"Keep your chest up and knees tracking over your toes.",
  "Deadlift":"Keep the bar close to your shins and drive through your whole foot.",
};
function getTip(name){ return EXERCISE_TIPS[name] || "Move with control and focus on good form over speed."; }
function setCountFromScheme(scheme){
  const m = scheme.match(/^(\d+)x/);
  return m ? parseInt(m[1],10) : 3;
}

let state = {
  screen: "onboarding", // onboarding | app | session
  tab: "today",
  onboardStep: 0,
  profile: null,
  plan: null, // {calories, protein, carbs, fat, meals:{breakfast,lunch,dinner,snack}, workoutDays}
  today: 1, // simulated day counter
  weightLog: [], // {day, weight}
  logs: {}, // day -> {meals:[{slot,name,cal,extra,unhealthy}], workoutDone:bool, setsDone:{exIdx:[bool,...]}}
  insightShown: false,
  monthlyChecked: [],
  inactivityNudgeShown: false,
  modal: null, // {type,...}
  chat: {
    open: false,
    messages: [
      {role:"bot", text:"Hey! I'm your FitBuddy 👋 Ask me about today's calories, your workout, streak, or progress toward your goal."}
    ]
  },
  session: {expandedIdx:0}, // workout session UI state
};

function todayLog(){
  if(!state.logs[state.today]) state.logs[state.today] = {meals:[], workoutDone:false, setsDone:{}};
  return state.logs[state.today];
}

/* ============================= HELPERS ============================= */
function estimateTargetWeight(goal, weight, height){
  if(!goal || !weight || !height) return null;
  const heightM = height/100;
  const healthyMin = 18.5*heightM*heightM;
  const healthyMax = 24.9*heightM*heightM;
  let target;
  if(goal==="lose_fat"){
    target = Math.max(weight*0.88, healthyMin);
    target = Math.min(target, weight-1);
  } else if(goal==="build_muscle"){
    target = Math.min(weight + Math.max(3, weight*0.06), healthyMax*1.15);
  } else {
    target = weight <= healthyMax ? weight : Math.max(weight*0.95, healthyMax);
  }
  return Math.round(target);
}

function calcPlan(p){
  const bmrBase = 10*p.weight + 6.25*p.height - 5*p.age;
  let bmr;
  if(p.sex==="male") bmr = bmrBase + 5;
  else if(p.sex==="female") bmr = bmrBase - 161;
  else bmr = bmrBase - 78;

  const freqMult = p.workoutDays<=1?1.2 : p.workoutDays<=3?1.375 : p.workoutDays<=5?1.55 : 1.725;
  const tdee = bmr*freqMult;

  const weeklyRate = p.goal==="lose_fat"?0.5:p.goal==="build_muscle"?0.25:0.3;
  let calories;
  if(p.goal==="lose_fat") calories = tdee - (weeklyRate*7700/7);
  else if(p.goal==="build_muscle") calories = tdee + 300;
  else calories = tdee - 150;
  calories = Math.round(calories/10)*10;

  const proteinPerKg = p.goal==="build_muscle"?2.0:p.goal==="lose_fat"?2.2:1.8;
  const protein = Math.round(p.weight*proteinPerKg);
  const fat = Math.round((calories*0.25)/9);
  const carbs = Math.round((calories - protein*4 - fat*9)/4);

  const weeksToGoal = Math.max(1, Math.round(Math.abs(p.targetWeight-p.weight)/weeklyRate));

  return {calories, protein, carbs, fat, tdee:Math.round(tdee), weeklyRate, weeksToGoal, startWeight:p.weight};
}

function pickMeal(slot, dietPref, targetCal, excludeNames, allergies){
  excludeNames = excludeNames||[];
  allergies = allergies||[];
  const safe = m => !m.allergens || !m.allergens.some(a=>allergies.includes(a));
  let pool = MEAL_DB[slot].filter(m=>m.diet.includes(dietPref) && !excludeNames.includes(m.name) && safe(m));
  if(!pool.length) pool = MEAL_DB[slot].filter(m=>m.diet.includes(dietPref) && safe(m));
  if(!pool.length) pool = MEAL_DB[slot].filter(m=>!excludeNames.includes(m.name) && safe(m));
  if(!pool.length) pool = MEAL_DB[slot].filter(safe);
  if(!pool.length) pool = MEAL_DB[slot];
  let best = pool[0], bestDiff = Infinity;
  pool.forEach(m=>{
    const diff = Math.abs(m.cal-targetCal);
    if(diff<bestDiff){bestDiff=diff; best=m;}
  });
  return {...best};
}

function buildMealPlan(p, plan, currentMeals){
  const props = {breakfast:0.25, lunch:0.3, dinner:0.3, snack:0.15};
  const meals = {};
  ["breakfast","lunch","dinner","snack"].forEach(slot=>{
    const target = plan.calories*props[slot];
    const exclude = currentMeals && currentMeals[slot] ? [currentMeals[slot].name] : [];
    meals[slot] = pickMeal(slot, p.dietPref, target, exclude, p.allergies);
  });
  return meals;
}

function fmt(n){ return Math.round(n).toLocaleString(); }

/* ---- meal image library: original flat-illustration icons, one style per dish type ---- */
function svgWrap(inner){
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}
function plateBase(){
  return `<ellipse cx="60" cy="68" rx="48" ry="32" fill="#00000030"/><ellipse cx="60" cy="63" rx="49" ry="33" fill="#F2EEE4"/><ellipse cx="60" cy="63" rx="39" ry="25" fill="none" stroke="#00000012" stroke-width="2"/>`;
}
function bowlIcon(baseColor, toppings){
  toppings = toppings||[];
  const dots = toppings.map((c,i)=>`<circle cx="${45+i*13}" cy="${52-(i%2)*7}" r="5.5" fill="${c}"/>`).join("");
  return svgWrap(`${plateBase()}<ellipse cx="60" cy="66" rx="34" ry="20" fill="${baseColor}"/>${dots}`);
}
function plateFilletIcon(filletColor, sideColor){
  return svgWrap(`${plateBase()}
    <ellipse cx="48" cy="66" rx="20" ry="13" fill="${filletColor}"/>
    <path d="M39 62 L57 62 M39 68 L57 68 M39 74 L57 74" stroke="#00000022" stroke-width="1.5"/>
    <ellipse cx="83" cy="60" rx="12" ry="9" fill="${sideColor}"/>`);
}
function toastIcon(toppingColor, accentColor){
  return svgWrap(`${plateBase()}
    <rect x="32" y="46" width="38" height="27" rx="4" fill="#E3B570"/>
    <rect x="32" y="46" width="38" height="10" rx="4" fill="${toppingColor}"/>
    <circle cx="82" cy="60" r="11" fill="${accentColor}"/>`);
}
function skilletIcon(fillColor, fleckColor){
  return svgWrap(`
    <circle cx="60" cy="63" r="45" fill="#2B2F38"/>
    <circle cx="60" cy="63" r="36" fill="${fillColor}"/>
    <circle cx="50" cy="55" r="9" fill="#F4D35E"/>
    <circle cx="72" cy="70" r="8" fill="#F4D35E"/>
    <circle cx="56" cy="72" r="3" fill="${fleckColor}"/>
    <circle cx="70" cy="52" r="3" fill="${fleckColor}"/>`);
}
function stirFryIcon(meatColor, vegColor){
  return svgWrap(`
    <circle cx="60" cy="63" r="45" fill="#2B2F38"/>
    <circle cx="60" cy="63" r="36" fill="#3A4150"/>
    <rect x="42" y="55" width="16" height="6" rx="3" fill="${meatColor}" transform="rotate(-20 50 58)"/>
    <rect x="55" y="65" width="16" height="6" rx="3" fill="${meatColor}" transform="rotate(15 63 68)"/>
    <circle cx="76" cy="52" r="5" fill="${vegColor}"/>
    <circle cx="48" cy="74" r="5" fill="${vegColor}"/>
    <circle cx="68" cy="76" r="4" fill="#EAD9A0"/>`);
}
function saladBowlIcon(chunkColors){
  const chunks = chunkColors.map((c,i)=>`<circle cx="${44+i*11}" cy="${58+(i%2)*11}" r="6" fill="${c}"/>`).join("");
  return svgWrap(`${plateBase()}<ellipse cx="60" cy="66" rx="34" ry="20" fill="#7BAE63"/>${chunks}`);
}
function parfaitIcon(baseColor, midColor, topColor){
  return svgWrap(`
    <path d="M42 28 L78 28 L72 100 L48 100 Z" fill="#ffffff10" stroke="#ffffff30" stroke-width="1.5"/>
    <path d="M45 80 L75 80 L72 100 L48 100 Z" fill="${midColor}"/>
    <path d="M46 55 L74 55 L75 80 L45 80 Z" fill="${baseColor}"/>
    <path d="M48 30 L72 30 L74 55 L46 55 Z" fill="${midColor}"/>
    <circle cx="55" cy="40" r="4" fill="${topColor}"/>
    <circle cx="65" cy="36" r="3.5" fill="${topColor}"/>
    <circle cx="60" cy="46" r="3" fill="${topColor}"/>`);
}
function cupIcon(liquidColor, accentColor){
  return svgWrap(`
    <path d="M40 25 L80 25 L74 100 L46 100 Z" fill="${liquidColor}" stroke="#ffffff25" stroke-width="1.5"/>
    <ellipse cx="60" cy="25" rx="20" ry="6" fill="${accentColor}"/>
    <rect x="57" y="6" width="6" height="24" rx="3" fill="#ffffffaa" transform="rotate(15 60 18)"/>`);
}
function dipSticksIcon(dipColor, stickColor){
  return svgWrap(`${plateBase()}
    <ellipse cx="50" cy="70" rx="16" ry="11" fill="${dipColor}"/>
    <rect x="68" y="40" width="7" height="34" rx="3" fill="${stickColor}" transform="rotate(12 71 57)"/>
    <rect x="78" y="42" width="7" height="34" rx="3" fill="${stickColor}" transform="rotate(-6 81 59)"/>
    <rect x="60" y="44" width="7" height="30" rx="3" fill="${stickColor}" transform="rotate(24 63 59)"/>`);
}
function snackPlateIcon(itemColors){
  const items = itemColors.map((c,i)=>`<circle cx="${45+i*13}" cy="${62+(i%2)*9}" r="8" fill="${c}"/>`).join("");
  return svgWrap(`${plateBase()}${items}`);
}

const MEAL_ICON_LIBRARY = {
  "Greek yogurt, berries & granola": parfaitIcon("#F5F1E6","#C89B5C","#C6547A"),
  "Veggie & feta scramble (3 eggs)": skilletIcon("#F5F1E6","#5C8A4A"),
  "Overnight oats, peanut butter & banana": bowlIcon("#C89B5C",["#8C6A4E","#F4D35E"]),
  "Smoked salmon & avocado toast": toastIcon("#E8896F","#6B9E5C"),
  "Tofu scramble, spinach & sourdough": skilletIcon("#EDE3C8","#5C8A4A"),
  "Protein smoothie (oat milk, spinach, berries)": cupIcon("#8E6BA8","#C6547A"),

  "Grilled chicken, quinoa & roasted veg": plateFilletIcon("#D9A45E","#C0472B"),
  "Lentil & veggie power bowl": bowlIcon("#8C6A4E",["#5C8A4A","#C0472B"]),
  "Seared tuna, brown rice & greens": plateFilletIcon("#C6547A","#5C8A4A"),
  "Chickpea & halloumi salad": saladBowlIcon(["#EDE3C8","#F5F1E6","#5C8A4A"]),
  "Turkey & sweet potato bowl": bowlIcon("#D9A45E",["#D98A3D","#5C8A4A"]),
  "Black bean & avocado burrito bowl": bowlIcon("#3D2B1F",["#6B9E5C","#EAD9A0"]),

  "Baked salmon, asparagus & farro": plateFilletIcon("#E8896F","#5C8A4A"),
  "Lean beef stir-fry & jasmine rice": stirFryIcon("#7A4B3A","#5C8A4A"),
  "Stuffed peppers, black beans & rice": bowlIcon("#C0472B",["#3D2B1F","#EAD9A0"]),
  "Grilled tofu, soba noodles & greens": bowlIcon("#C89B5C",["#EDE3C8","#5C8A4A"]),
  "Herb chicken thigh, mash & broccoli": plateFilletIcon("#D9A45E","#5C8A4A"),
  "Shrimp & vegetable curry, rice": bowlIcon("#C0472B",["#E8896F","#EAD9A0"]),

  "Cottage cheese & pineapple": snackPlateIcon(["#F5F1E6","#F4D35E","#F5F1E6"]),
  "Almonds & apple": snackPlateIcon(["#B98858","#B98858","#C0472B"]),
  "Protein shake": cupIcon("#C89B5C","#F5F1E6"),
  "Hummus & carrot sticks": dipSticksIcon("#EDE3C8","#D98A3D"),
  "Edamame, salted": snackPlateIcon(["#6B9E5C","#6B9E5C","#6B9E5C"]),
  "Hard-boiled eggs (2)": snackPlateIcon(["#F5F1E6","#F4D35E"]),
};

/* fallback for anything not in the library (logged extras, photo-logged meals) */
function pickProteinColor(name){
  if(/salmon|shrimp|tuna|fish/.test(name)) return "#E8896F";
  if(/beef|steak/.test(name)) return "#7A4B3A";
  if(/egg/.test(name)) return "#F4D35E";
  if(/tofu|tempeh/.test(name)) return "#EDE3C8";
  if(/lentil|bean|chickpea/.test(name)) return "#8C6A4E";
  if(/yogurt|cottage cheese|feta|halloumi/.test(name)) return "#F5F1E6";
  if(/turkey|chicken/.test(name)) return "#D9A45E";
  if(/almond|nut|peanut/.test(name)) return "#B98858";
  return "#C98A5E";
}
function pickCarbColor(name){
  if(/oats|granola/.test(name)) return "#C89B5C";
  if(/toast|bread|sourdough|burrito/.test(name)) return "#D9A45E";
  if(/rice|quinoa|farro/.test(name)) return "#EAD9A0";
  if(/potato/.test(name)) return "#E3B570";
  if(/noodle|soba/.test(name)) return "#E3CE8C";
  return "#E8C46B";
}
function pickVegColor(name){
  if(/berries|banana|pineapple|apple/.test(name)) return "#C6547A";
  if(/spinach|greens|broccoli|asparagus/.test(name)) return "#5C8A4A";
  if(/pepper/.test(name)) return "#C0472B";
  if(/carrot/.test(name)) return "#D98A3D";
  return "#6B9E5C";
}
function genericPlateSVG(meal){
  const name = meal.name.toLowerCase();
  const protein = pickProteinColor(name), carb = pickCarbColor(name), veg = pickVegColor(name);
  return svgWrap(`${plateBase()}
    <ellipse cx="41" cy="70" rx="16" ry="11" fill="${protein}"/>
    <ellipse cx="82" cy="72" rx="14" ry="10" fill="${carb}"/>
    <circle cx="80" cy="70" r="2" fill="#ffffff66"/>
    <circle cx="87" cy="67" r="2" fill="#ffffff66"/>
    <circle cx="75" cy="76" r="2" fill="#ffffff66"/>
    <ellipse cx="55" cy="44" rx="16" ry="10" fill="${veg}"/>
    <circle cx="47" cy="42" r="3" fill="#ffffff40"/>
    <circle cx="60" cy="40" r="3" fill="#ffffff40"/>
    <circle cx="53" cy="48" r="3" fill="#ffffff40"/>`);
}
function mealPlateSVG(meal){
  return MEAL_ICON_LIBRARY[meal.name] || genericPlateSVG(meal);
}

function motivationalMessage(){
  const msgs = [
    "Nice work — that's a full day locked in. Keep the streak alive.",
    "Right on target. This is exactly how goals get hit.",
    "You showed up today. That's the whole game.",
    "Solid session logged — future-you says thanks.",
    "Consistency beats intensity. You're stacking the right days.",
  ];
  return msgs[Math.floor(Math.random()*msgs.length)];
}

/* ============================= PERSISTENCE ============================= */
/* Now that FitBuddy runs as a real packaged app (not a claude.ai chat preview),
   it's safe and appropriate to persist state with localStorage so progress
   survives closing the app. If you wire in @capacitor/preferences later for
   native storage, swap the two functions below for that plugin's API. */
const STORAGE_KEY = "fitbuddy_state_v1";
function saveState(){
  try{
    const persist = {
      screen: state.screen,
      tab: state.tab,
      profile: state.profile,
      plan: state.plan,
      today: state.today,
      weightLog: state.weightLog,
      logs: state.logs,
      insightShown: state.insightShown,
      monthlyChecked: state.monthlyChecked,
      inactivityNudgeShown: state.inactivityNudgeShown,
      chat: state.chat,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
  }catch(e){ /* storage unavailable — app still works, just won't persist */ }
}
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const persist = JSON.parse(raw);
      Object.assign(state, persist);
      if(state.screen==="session") state.screen = "app"; // don't resume mid-session on reload
    }
  }catch(e){ /* corrupt or unavailable storage — start fresh */ }
}

/* ============================= RENDER ROOT ============================= */
function render(){
  const app = document.getElementById("app");
  if(state.screen==="onboarding"){
    app.innerHTML = renderOnboarding();
  } else if(state.screen==="session"){
    app.innerHTML = renderSessionScreen();
  } else {
    app.innerHTML = renderTopbar() + renderNav() + `<main>${renderTab()}</main>` + renderBottomNav();
  }
  const demo = document.getElementById("demo-controls-slot");
  if(demo) demo.outerHTML = renderDemoControls();
  updateChatWidget();
  if(state.modal){
    const holder = document.createElement("div");
    holder.innerHTML = renderModal();
    document.body.appendChild(holder.firstElementChild);
  }
  saveState();
}

/* ============================= ONBOARDING ============================= */
const ONBOARD_STEPS = ["name","goal","stats","workout","diet"];

function renderOnboarding(){
  const step = ONBOARD_STEPS[state.onboardStep];
  const p = state.profile || {};
  let body = "";

  if(step==="name"){
    body = `
      <div class="field">
        <label>What should we call you?</label>
        <input type="text" placeholder="Your name" value="${p.name||''}" oninput="setProfile('name', this.value)">
      </div>`;
  } else if(step==="goal"){
    body = `
      <div class="field">
        <label>What's your main goal?</label>
        ${GOALS.map(g=>`
          <button class="option-card ${p.goal===g.id?'selected':''}" onclick="setProfile('goal','${g.id}')">
            <div class="option-icon">${g.icon}</div>
            <div class="option-label">${g.label}</div>
          </button>`).join("")}
      </div>`;
  } else if(step==="stats"){
    body = `
      <div class="grid-2">
        <div class="field"><label>Sex</label>
          <select onchange="setProfile('sex', this.value)">
            <option value="">Select</option>
            <option value="male" ${p.sex==='male'?'selected':''}>Male</option>
            <option value="female" ${p.sex==='female'?'selected':''}>Female</option>
            <option value="other" ${p.sex==='other'?'selected':''}>Prefer not to say</option>
          </select>
        </div>
        <div class="field"><label>Age</label>
          <input type="number" min="16" max="90" value="${p.age||''}" oninput="setProfile('age', +this.value)">
        </div>
        <div class="field"><label>Height (cm)</label>
          <input type="number" min="120" max="230" value="${p.height||''}" oninput="setProfile('height', +this.value)">
        </div>
        <div class="field"><label>Current weight (kg)</label>
          <input type="number" min="35" max="220" value="${p.weight||''}" oninput="setProfile('weight', +this.value)">
        </div>
        <div class="field"><label>Target weight (kg)</label>
          <input type="number" min="35" max="220" value="${p.targetWeight||''}" oninput="setTargetWeightManual(+this.value)">
          ${(p.goal && p.weight && p.height) ? `<div class="empty-note" style="padding-top:4px;">Estimated for your goal: <span class="mono" style="color:var(--amber)">${estimateTargetWeight(p.goal,p.weight,p.height)}kg</span> — feel free to adjust.</div>` : ""}
        </div>
      </div>`;
  } else if(step==="workout"){
    body = `
      <div class="field">
        <label>How many days a week can you realistically train?</label>
        <div class="pill-group">
          ${[2,3,4,5,6].map(d=>`<button class="pill ${p.workoutDays===d?'selected':''}" onclick="setProfile('workoutDays', ${d})">${d} days</button>`).join("")}
        </div>
      </div>
      <div class="field">
        <label>Where will you train?</label>
        <div class="pill-group">
          <button class="pill ${p.location==='gym'?'selected':''}" onclick="setProfile('location','gym')">Gym</button>
          <button class="pill ${p.location==='home'?'selected':''}" onclick="setProfile('location','home')">Home</button>
        </div>
      </div>`;
  } else if(step==="diet"){
    const diets = [["none","No restrictions"],["vegetarian","Vegetarian"],["vegan","Vegan"],["pescatarian","Pescatarian"]];
    const allergies = p.allergies || [];
    body = `
      <div class="field">
        <label>Any dietary preference?</label>
        <div class="pill-group">
          ${diets.map(([id,l])=>`<button class="pill ${p.dietPref===id?'selected':''}" onclick="setProfile('dietPref','${id}')">${l}</button>`).join("")}
        </div>
      </div>
      <div class="field">
        <label>Any food allergies? (optional)</label>
        <div class="pill-group">
          ${ALLERGENS.map(([id,l])=>`<button class="pill ${allergies.includes(id)?'selected':''}" onclick="toggleAllergy('${id}')">${l}</button>`).join("")}
        </div>
      </div>`;
  }

  const canNext = step==="name" ? !!(p.name && p.name.trim().length>0)
    : step==="goal" ? !!p.goal
    : step==="stats" ? (p.sex&&p.age&&p.height&&p.weight&&p.targetWeight)
    : step==="workout" ? !!(p.workoutDays && p.location)
    : !!p.dietPref;

  return `
  <div class="onboard-wrap">
    <div class="onboard-card">
      ${state.onboardStep>0?`<button class="onboard-back" onclick="onboardBack()">←</button>`:""}
      <div class="step-label">Step ${state.onboardStep+1} of ${ONBOARD_STEPS.length}</div>
      <div class="progress-dots">${ONBOARD_STEPS.map((s,i)=>`<span class="${i<=state.onboardStep?'on':''}"></span>`).join("")}</div>
      <div class="onboard-header">
        <h1>${step==="name"?"Hey there 👋":"Let's build your plan"}</h1>
        <p>${step==="name"?"Let's get to know you a little first.":step==="goal"?"Pick the outcome you actually care about.":step==="stats"?"A few basics so the numbers are right for you.":step==="workout"?"Be honest about your schedule and setup — we'll build the plan around both.":"Last step — we'll build meals around it."}</p>
      </div>
      ${body}
      <div class="step-nav">
        <button class="btn btn-primary btn-round" style="padding:12px 28px;font-size:14.5px;${canNext?'':'opacity:.4;'}" ${canNext?'':'disabled'} onclick="onboardNext()">${state.onboardStep===ONBOARD_STEPS.length-1?"Build my plan":"Continue"}</button>
      </div>
    </div>
  </div>`;
}

function setProfile(key,val){
  state.profile = state.profile || {};
  state.profile[key]=val;
  if((key==="weight"||key==="height"||key==="goal") && !state.profile.targetWeightManual){
    const p = state.profile;
    if(p.goal && p.weight && p.height){
      const suggestion = estimateTargetWeight(p.goal,p.weight,p.height);
      if(suggestion) state.profile.targetWeight = suggestion;
    }
  }
  render();
}
function setTargetWeightManual(val){
  state.profile.targetWeight = val;
  state.profile.targetWeightManual = true;
  render();
}
function onboardBack(){ state.onboardStep=Math.max(0,state.onboardStep-1); render(); }
function onboardNext(){
  if(state.onboardStep < ONBOARD_STEPS.length-1){ state.onboardStep++; render(); return; }
  const p = state.profile;
  p.allergies = p.allergies || [];
  const plan = calcPlan(p);
  plan.meals = buildMealPlan(p, plan, null);
  state.plan = plan;
  state.weightLog.push({day:1, weight:p.weight});
  state.screen="app";
  state.tab="today";
  render();
}

/* ============================= TOPBAR / NAV ============================= */
function renderTopbar(){
  const streak = computeStreak();
  return `
  <div class="topbar">
    <div class="brand"><div class="brand-name"><span class="fit">Fit</span><span class="buddy">Buddy</span></div></div>
    <div class="streak-chip">🔥 <span class="mono">${streak}</span> day streak</div>
  </div>`;
}
function renderNav(){
  const tabs = [["today","Today"],["diet","Diet Plan"],["workout","Workout Plan"],["progress","Progress"]];
  return `<div class="nav-rail">
    ${tabs.map(([id,l])=>`<button class="nav-item ${state.tab===id?'active':''}" onclick="setTab('${id}')">${l}</button>`).join("")}
  </div>`;
}
function renderBottomNav(){
  const tabs = [["today","📋","Today"],["diet","🍽️","Diet"],["workout","🏋️","Workout"],["progress","📈","Progress"]];
  return `<div class="bottom-nav">
    ${tabs.map(([id,icon,l])=>`<button class="${state.tab===id?'active':''}" onclick="setTab('${id}')"><span>${icon}</span>${l}</button>`).join("")}
  </div>`;
}
function setTab(t){ state.tab=t; render(); }

function computeStreak(){
  let streak=0;
  for(let d=state.today; d>=1; d--){
    const log = state.logs[d];
    if(log && (log.workoutDone || log.meals.length>0)) streak++;
    else break;
  }
  return streak;
}

function computeInactivityStreak(){
  let streak=0;
  for(let d=state.today-1; d>=1; d--){
    const log = state.logs[d];
    const active = log && (log.workoutDone || log.meals.length>0);
    if(!active) streak++;
    else break;
  }
  return streak;
}
function markActivityToday(){
  state.inactivityNudgeShown = false;
  scheduleInactivityNotification();
}

/* ---- native platform detection ---- */
function isNativeApp(){
  return !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());
}

/* ---- local notifications ----
   On native (iOS/Android via @capacitor/local-notifications), we schedule a real
   OS-level notification a few days out so it fires even if the app isn't open,
   and reschedule it every time the user logs activity. In the browser (no native
   runtime), we fall back to the Web Notification API, fired reactively by the
   in-app "day" simulation in checkInactivityNudge. */
const INACTIVITY_NOTIF_ID = 4200;
const INACTIVITY_NOTIF_DAYS = 3;
async function scheduleInactivityNotification(){
  if(!isNativeApp() || !Capacitor.Plugins.LocalNotifications) return;
  const LN = Capacitor.Plugins.LocalNotifications;
  try{
    const perm = await LN.checkPermissions();
    if(perm.display!=="granted"){
      const req = await LN.requestPermissions();
      if(req.display!=="granted") return;
    }
    await LN.cancel({notifications:[{id:INACTIVITY_NOTIF_ID}]});
    await LN.schedule({notifications:[{
      id: INACTIVITY_NOTIF_ID,
      title: "FitBuddy",
      body: "We haven't seen a check-in from you in a few days. Life gets busy — but your goal's still there whenever you're ready to jump back in.",
      schedule: {at: new Date(Date.now() + INACTIVITY_NOTIF_DAYS*24*60*60*1000)},
    }]});
  }catch(e){ /* native scheduling unavailable — in-app modal still covers it */ }
}
function maybeSendBrowserNotification(days){
  if(isNativeApp()) return; // native gets the real OS-scheduled notification instead
  const title = "FitBuddy";
  const body = `We haven't seen a check-in from you in ${days} days. Life gets busy — but your goal's still there whenever you're ready to jump back in.`;
  try{
    if(typeof Notification!=="undefined"){
      if(Notification.permission==="granted"){
        new Notification(title,{body});
      } else if(Notification.permission!=="denied"){
        Notification.requestPermission().then(p=>{ if(p==="granted") new Notification(title,{body}); });
      }
    }
  }catch(e){ /* browser notifications unavailable in this environment — in-app modal still covers it */ }
}
function checkInactivityNudge(){
  const streak = computeInactivityStreak();
  if(streak>=3 && !state.inactivityNudgeShown){
    state.inactivityNudgeShown = true;
    state.modal = {type:"inactivityNudge", days:streak};
    maybeSendBrowserNotification(streak);
  }
}

/* ============================= TAB ROUTER ============================= */
function renderTab(){
  if(state.tab==="today") return renderToday();
  if(state.tab==="diet") return renderDietTab();
  if(state.tab==="workout") return renderWorkoutTab();
  if(state.tab==="progress") return renderProgressTab();
  return "";
}

/* ============================= TODAY ============================= */
function renderToday(){
  const log = todayLog();
  const plan = state.plan;
  const loggedCal = log.meals.reduce((s,m)=>s+m.cal,0);

  const insight = maybeInsight();

  const workoutIdx = (state.today-1) % state.profile.workoutDays;
  const todaysWorkout = getWorkoutTemplates()[state.profile.workoutDays][workoutIdx];

  const order = ["breakfast","lunch","dinner","snack"];
  const nextSlot = order.find(slot=>!log.meals.find(m=>m.slot===slot && !m.extra));

  return `
    <div class="card" style="display:flex;align-items:center;gap:12px;padding:16px 20px;">
      <div style="font-size:22px;">👋</div>
      <div style="font-weight:700;font-size:16px;">Welcome, ${state.profile.name}!</div>
    </div>
    ${insight?renderInsightBanner(insight):""}
    <div class="grid-3">
      <div class="card">
        <div class="card-title">Calories today</div>
        ${renderCalorieRing(loggedCal, plan.calories)}
      </div>
      <div class="card">
        <div class="card-title">Protein target</div>
        <div class="stat-num">${plan.protein}<span style="font-size:14px;color:var(--text-dim)">g</span></div>
        <div class="stat-label">Carbs ${plan.carbs}g · Fat ${plan.fat}g</div>
      </div>
      <div class="card">
        <div class="card-title">Day</div>
        <div class="stat-num">#${state.today}</div>
        <div class="stat-label">${plan.weeksToGoal} wk estimate to goal</div>
      </div>
    </div>

    <div class="card-title" style="margin:4px 0 10px;">Today's meals</div>
    ${order.map(slot=>renderTodayMealRow(slot, slot===nextSlot)).join("")}
    <div style="margin:2px 0 20px;display:flex;gap:8px;flex-wrap:wrap;">
      <button class="btn btn-sm btn-round" onclick="openModal('logExtra')">+ Log something else I ate</button>
      <button class="btn btn-sm btn-round" onclick="openModal('snapPhoto')">📷 Snap a meal photo</button>
    </div>

    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <div class="card-title" style="margin-bottom:0;">${todaysWorkout.day}</div>
        <button class="btn btn-sm btn-round" onclick="openSession()">Start session ▸</button>
      </div>
      ${todaysWorkout.ex.map(([name,scheme],idx)=>{
        const done = isExerciseDone(idx);
        return `
        <div class="ledger-row">
          <div class="ledger-main">
            <span class="ledger-check ${done?'done':''}" style="pointer-events:none;">${done?'✓':''}</span>
            <span class="ledger-name">${name}</span>
          </div>
          <div class="ledger-meta">${scheme}</div>
        </div>`;
      }).join("")}
      <div style="margin-top:12px;">
        <button class="btn btn-round btn-block ${log.workoutDone?'':'btn-primary'}" onclick="toggleWorkoutDone()">${log.workoutDone?"✓ Workout logged":"Mark workout complete"}</button>
      </div>
    </div>
  `;
}

function renderCalorieRing(loggedCal, targetCal){
  const pct = Math.min(100, Math.round((loggedCal/targetCal)*100));
  const r=40, c=2*Math.PI*r;
  const offset = c - (pct/100)*c;
  return `
    <div class="ring-wrap"><div class="ring-center">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="${r}" fill="none" stroke="var(--panel-2)" stroke-width="8"/>
        <circle cx="48" cy="48" r="${r}" fill="none" stroke="var(--amber)" stroke-width="8" stroke-linecap="round"
          stroke-dasharray="${c}" stroke-dashoffset="${offset}" style="transition:stroke-dashoffset .4s;"/>
      </svg>
      <div class="ring-label">
        <div class="num">${fmt(loggedCal)}</div>
        <div class="sub">/ ${fmt(targetCal)} kcal</div>
      </div>
    </div></div>`;
}

function isExerciseDone(idx){
  const sets = todayLog().setsDone && todayLog().setsDone[idx];
  return !!(sets && sets.length && sets.every(Boolean));
}

function renderTodayMealRow(slot, isNext){
  const log = todayLog();
  const entry = log.meals.find(m=>m.slot===slot && !m.extra);
  const meal = state.plan.meals[slot];
  const done = !!entry;
  return `
    <div class="meal-card ${isNext && !done ? 'highlight':''}" onclick="toggleMealDone('${slot}')" style="cursor:pointer;${done?'opacity:.6;':''}">
      ${isNext && !done ? `<div class="refresh-badge">↻</div>` : ""}
      <div class="meal-main">
        <div class="meal-thumb">${mealPlateSVG(meal)}</div>
        <div>
          <div class="meal-name">${done?'✓ ':''}${meal.name}</div>
          <div class="meal-sub">${slot.charAt(0).toUpperCase()+slot.slice(1)} · ${meal.cal} kcal · P${meal.p}/C${meal.c}/F${meal.f}</div>
        </div>
      </div>
      <button class="pill-btn" onclick="event.stopPropagation();openModal('swap','${slot}')">Swap</button>
    </div>`;
}

function toggleMealDone(slot){
  const log = todayLog();
  const idx = log.meals.findIndex(m=>m.slot===slot && !m.extra);
  if(idx>=0){ log.meals.splice(idx,1); }
  else {
    const meal = state.plan.meals[slot];
    log.meals.push({slot, name:meal.name, cal:meal.cal, extra:false, unhealthy:false});
    markActivityToday();
  }
  render();
}
function toggleWorkoutDone(){
  const log = todayLog();
  log.workoutDone = !log.workoutDone;
  if(log.workoutDone) markActivityToday();
  render();
  if(log.workoutDone){
    setTimeout(()=>{ openModal('motivation'); }, 150);
  }
}

/* ============================= WORKOUT SESSION SCREEN ============================= */
function openSession(){
  state.session = {expandedIdx:0};
  state.screen = "session";
  render();
}
function closeSession(){
  state.screen = "app";
  render();
}
function toggleExpand(idx){
  state.session.expandedIdx = state.session.expandedIdx===idx ? -1 : idx;
  render();
}
function toggleSet(exIdx, setIdx){
  const log = todayLog();
  if(!log.setsDone[exIdx]) log.setsDone[exIdx] = [];
  log.setsDone[exIdx][setIdx] = !log.setsDone[exIdx][setIdx];
  render();
}
function finishSession(){
  todayLog().workoutDone = true;
  markActivityToday();
  closeSession();
  setTimeout(()=>{ openModal('motivation'); }, 150);
}

function renderSessionScreen(){
  const workoutIdx = (state.today-1) % state.profile.workoutDays;
  const day = getWorkoutTemplates()[state.profile.workoutDays][workoutIdx];
  const log = todayLog();

  let totalSets=0, doneSets=0;
  day.ex.forEach(([name,scheme],idx)=>{
    const count = setCountFromScheme(scheme);
    totalSets += count;
    const arr = log.setsDone[idx]||[];
    doneSets += arr.filter(Boolean).length;
  });
  const pct = totalSets? Math.round((doneSets/totalSets)*100) : 0;

  return `
  <div class="session-wrap">
    <div class="session-top">
      <button class="icon-btn" onclick="closeSession()">←</button>
      <div class="session-title">Workout Session</div>
      <button class="icon-btn" aria-label="Profile">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
      </button>
    </div>
    <div class="session-progress-track"><div class="session-progress-fill" style="width:${pct}%"></div></div>
    <div class="session-progress-label">Workout Progress: <b>${pct}%</b></div>
    <div class="session-day-title">${day.day}</div>
    <div class="session-body">
      ${day.ex.map(([name,scheme],idx)=>renderAccordionRow(name,scheme,idx)).join("")}
    </div>
    <div class="session-cta">
      <button class="btn btn-primary btn-round btn-block" onclick="finishSession()">Mark Workout Complete</button>
    </div>
  </div>`;
}

function renderAccordionRow(name, scheme, idx){
  const expanded = state.session.expandedIdx===idx;
  const setCount = setCountFromScheme(scheme);
  const log = todayLog();
  const doneArr = log.setsDone[idx]||[];
  return `
    <div class="accordion-row ${expanded?'expanded':''}">
      <div class="accordion-head" style="cursor:pointer;" onclick="toggleExpand(${idx})">
        <span>${name}</span>
        <span><span class="scheme-chip">${scheme}</span>${expanded?'▲':'▼'}</span>
      </div>
      ${expanded?`
        <div class="accordion-panel">
          <div class="thumb">
            ${exerciseThumbSVG()}
            <div class="play-btn">▶</div>
          </div>
          <div class="exercise-tip">${getTip(name)}</div>
          <div class="set-row">
            ${Array.from({length:setCount}).map((_,i)=>{
              const done = !!doneArr[i];
              return `<button class="set-pill ${done?'done':''}" onclick="toggleSet(${idx},${i})"><span class="dot"></span>Set ${i+1}</button>`;
            }).join("")}
          </div>
        </div>` : ""}
    </div>`;
}

function exerciseThumbSVG(){
  return `
  <svg viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="125" fill="#1c2130"/>
    <circle cx="160" cy="20" r="30" fill="rgba(255,107,61,0.12)"/>
    <circle cx="20" cy="110" r="40" fill="rgba(255,107,61,0.08)"/>
    <g stroke="#E9EAF0" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.85">
      <circle cx="70" cy="55" r="8" fill="#E9EAF0" stroke="none"/>
      <path d="M78 60 L120 68 L150 55"/>
      <path d="M78 60 L60 90 L40 100"/>
      <path d="M120 68 L128 100 L110 108"/>
      <path d="M78 60 L95 92 L115 96"/>
    </g>
  </svg>`;
}

/* ============================= SPEAK TO YOUR FITBUDDY (chat widget) ============================= */
function escapeHtml(str){
  return str.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function toggleChat(){
  state.chat.open = !state.chat.open;
  updateChatWidget();
}

function updateChatWidget(){
  const el = document.getElementById("chat-widget-slot");
  if(!el) return;
  el.outerHTML = renderChatWidget();
  if(state.chat.open){
    const box = document.getElementById("chat-messages");
    if(box) box.scrollTop = box.scrollHeight;
    const input = document.getElementById("chat-input");
    if(input) input.focus();
  }
}

function renderChatWidget(){
  if(!state.chat.open){
    return `<button id="chat-widget-slot" class="chat-fab" onclick="toggleChat()" aria-label="Speak to your FitBuddy">💬</button>`;
  }
  return `
    <div id="chat-widget-slot" class="chat-panel">
      <div class="chat-head">
        <div class="chat-head-title">💬 Speak to your FitBuddy</div>
        <button class="x-btn" onclick="toggleChat()" aria-label="Close chat">✕</button>
      </div>
      <div class="chat-messages" id="chat-messages">
        ${state.chat.messages.map(m=>`<div class="chat-msg ${m.role}">${escapeHtml(m.text)}</div>`).join("")}
      </div>
      <div class="chat-input-row">
        <input id="chat-input" type="text" placeholder="Ask your FitBuddy..." onkeydown="if(event.key==='Enter'){sendChat();}">
        <button class="chat-send" onclick="sendChat()" aria-label="Send">➤</button>
      </div>
    </div>`;
}

function sendChat(){
  const input = document.getElementById("chat-input");
  if(!input) return;
  const text = input.value.trim();
  if(!text) return;
  state.chat.messages.push({role:"user", text});
  input.value = "";
  const reply = generateBotReply(text);
  state.chat.messages.push({role:"bot", text:reply});
  updateChatWidget();
}

function generateBotReply(raw){
  const text = raw.toLowerCase();
  if(!state.profile || !state.plan){
    return "Once you finish setting up your plan, I'll be able to answer questions about your calories, workouts, and progress. Excited to get started? 💪";
  }
  const plan = state.plan;
  const log = todayLog();
  const loggedCal = log.meals.reduce((s,m)=>s+m.cal,0);
  const remaining = Math.max(0, plan.calories - loggedCal);
  const workoutIdx = (state.today-1) % state.profile.workoutDays;
  const todaysWorkout = getWorkoutTemplates()[state.profile.workoutDays][workoutIdx];
  const streak = computeStreak();

  if(/\b(hi|hello|hey)\b/.test(text)){
    return `Hey! Day ${state.today}${streak>0?`, ${streak}-day streak going`:""} — what can I help with?`;
  }
  if(/calor/.test(text) || /(how much).*(eat|left)/.test(text)){
    return `You've logged ${fmt(loggedCal)} of your ${fmt(plan.calories)} kcal target today — about ${fmt(remaining)} kcal left.`;
  }
  if(/protein|macro|carb|fat/.test(text)){
    return `Your daily targets are ${plan.protein}g protein, ${plan.carbs}g carbs, and ${plan.fat}g fat.`;
  }
  if(/workout|exercise|train|session/.test(text)){
    return log.workoutDone
      ? `You already crushed ${todaysWorkout.day} today. Nice work!`
      : `Today's session is ${todaysWorkout.day}. Tap "Start session" on your Today tab whenever you're ready.`;
  }
  if(/streak/.test(text)){
    return streak>0 ? `You're on a ${streak}-day streak — keep it going!` : `No streak yet today — log a meal or workout to start one.`;
  }
  if(/goal|progress|(target.*weight)/.test(text)){
    return `You're on track for roughly ${plan.weeksToGoal} weeks to reach ${state.profile.targetWeight}kg. Check the Progress tab for your full trend.`;
  }
  if(/meal|food|eat|hungry|snack/.test(text)){
    const order = ["breakfast","lunch","dinner","snack"];
    const next = order.find(slot=>!log.meals.find(m=>m.slot===slot && !m.extra));
    if(next) return `Your next planned meal is ${plan.meals[next].name} (${plan.meals[next].cal} kcal). Not feeling it? Tap Swap for an alternative.`;
    return `Looks like you've logged all your planned meals today. Nice work staying on track!`;
  }
  if(/tired|hard|give up|can.?t|discourag|struggl|stress/.test(text)){
    return `Tough days happen to everyone. ${motivationalMessage()}`;
  }
  return `Got it! I can help most with questions about your calories, macros, today's workout, streak, or progress toward your goal — try asking me one of those.`;
}

/* ---- swap ---- */
function doSwap(slot){
  const current = state.plan.meals[slot];
  const target = state.plan.calories*({breakfast:0.25,lunch:0.3,dinner:0.3,snack:0.15}[slot]);
  const next = pickMeal(slot, state.profile.dietPref, target, [current.name], state.profile.allergies);
  state.plan.meals[slot] = next;
  closeModal();
  render();
}

/* ---- extra/log something else ---- */
function submitExtra(name, cal){
  if(!name || !cal) return;
  const lower = name.toLowerCase();
  const unhealthy = UNHEALTHY_KEYWORDS.some(k=>lower.includes(k));
  const log = todayLog();
  log.meals.push({slot:"extra", name, cal:+cal, extra:true, unhealthy});
  markActivityToday();
  closeModal();
  render();
}

/* ---- snap photo (mock estimate) ---- */
function estimateCaloriesFromSeed(str){
  // deterministic mock estimate seeded by some string tied to the photo
  let seed = 0;
  for(const ch of str) seed += ch.charCodeAt(0);
  return 280 + (seed % 420); // 280-700 kcal mock range
}
function applyMealPhoto(dataUrl, seedStr){
  state.modal.preview = dataUrl;
  state.modal.estimate = estimateCaloriesFromSeed(seedStr);
  render();
}
function handlePhotoUpload(input){
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (e)=> applyMealPhoto(e.target.result, file.name + (file.size % 500));
  reader.readAsDataURL(file);
}
/* native camera capture via @capacitor/camera, when running in the packaged app */
async function takeMealPhoto(){
  if(!isNativeApp() || !Capacitor.Plugins.Camera) return;
  try{
    const photo = await Capacitor.Plugins.Camera.getPhoto({
      quality: 70,
      resultType: "dataUrl",
      source: "CAMERA",
      saveToGallery: false,
    });
    applyMealPhoto(photo.dataUrl, String(photo.dataUrl.length));
  }catch(e){ /* user cancelled the camera — no-op */ }
}
function confirmPhotoLog(cal){
  const log = todayLog();
  log.meals.push({slot:"extra", name:"Photo-logged meal", cal:+cal, extra:true, unhealthy:false});
  markActivityToday();
  closeModal();
  render();
}

/* ---- adaptive insight ---- */
function maybeInsight(){
  const days = Object.keys(state.logs).map(Number).filter(d=>d>=Math.max(1,state.today-6));
  if(days.length<3 || state.insightShown) return null;
  let underEatingDays=0, unhealthyExtras=0;
  days.forEach(d=>{
    const log = state.logs[d];
    const total = log.meals.reduce((s,m)=>s+m.cal,0);
    if(total>0 && total < state.plan.calories*0.85) underEatingDays++;
    log.meals.forEach(m=>{ if(m.unhealthy) unhealthyExtras++; });
  });
  if(underEatingDays>=2 && unhealthyExtras>=2){
    return {underEatingDays, unhealthyExtras};
  }
  return null;
}
function renderInsightBanner(){
  return `
    <div class="banner">
      <div class="banner-icon">💡</div>
      <div>
        <div class="banner-title">We noticed a pattern</div>
        <div class="banner-text">You've been under your calorie target on several days, then reaching for less filling snacks later on. Here's a revised plan with more protein and fiber up front, so you stay satisfied longer.</div>
        <div style="margin-top:10px;display:flex;gap:8px;">
          <button class="btn btn-primary btn-sm" onclick="applyRevisedPlan()">Apply revised plan</button>
          <button class="btn btn-sm" onclick="dismissInsight()">Not now</button>
        </div>
      </div>
    </div>`;
}
function applyRevisedPlan(){
  // bias toward higher-protein snack + slightly larger breakfast allocation
  const snackPool = MEAL_DB.snack.filter(m=>m.diet.includes(state.profile.dietPref) && m.p>=12);
  if(snackPool.length) state.plan.meals.snack = {...snackPool[0]};
  const bfPool = MEAL_DB.breakfast.filter(m=>m.diet.includes(state.profile.dietPref) && m.p>=25);
  if(bfPool.length) state.plan.meals.breakfast = {...bfPool[0]};
  state.insightShown = true;
  render();
}
function dismissInsight(){ state.insightShown = true; render(); }

/* ============================= DIET TAB ============================= */
function renderDietTab(){
  const plan = state.plan;
  return `
    <div class="grid-3">
      <div class="card"><div class="card-title">Daily calories</div><div class="stat-num">${fmt(plan.calories)}</div></div>
      <div class="card"><div class="card-title">Protein / Carbs / Fat</div><div class="stat-num" style="font-size:20px">${plan.protein}g / ${plan.carbs}g / ${plan.fat}g</div></div>
      <div class="card"><div class="card-title">Maintenance (TDEE)</div><div class="stat-num">${fmt(plan.tdee)}</div></div>
    </div>
    <div class="card">
      <div class="card-title">This week's meal plan</div>
      ${["breakfast","lunch","dinner","snack"].map(slot=>{
        const m = plan.meals[slot];
        return `
        <div class="ledger-row">
          <div class="ledger-main">
            <div class="meal-thumb sm">${mealPlateSVG(m)}</div>
            <div>
              <div class="ledger-name">${m.name}</div>
              <div class="ledger-sub">${slot.charAt(0).toUpperCase()+slot.slice(1)} · ${m.cal} kcal · P${m.p}/C${m.c}/F${m.f}</div>
            </div>
          </div>
          <div class="ledger-actions"><button class="btn btn-sm btn-round" onclick="openModal('swap','${slot}')">Swap</button></div>
        </div>`;
      }).join("")}
      <div class="empty-note">Don't like something? Tap Swap and we'll pick a nutritionally similar alternative.</div>
    </div>
  `;
}

/* ============================= WORKOUT TAB ============================= */
function renderWorkoutTab(){
  const days = getWorkoutTemplates()[state.profile.workoutDays];
  const locLabel = state.profile.location==="home" ? "At-home" : "Gym";
  return `
    <div class="card">
      <div class="card-title">${locLabel} · ${state.profile.workoutDays}-day split · ${GOALS.find(g=>g.id===state.profile.goal).label}</div>
      ${days.map(d=>`
        <h3 style="font-size:15px;margin:14px 0 4px;">${d.day}</h3>
        ${d.ex.map(([name,scheme])=>`
          <div class="ledger-row">
            <div class="ledger-name">${name}</div>
            <div class="ledger-meta">${scheme}</div>
          </div>`).join("")}
      `).join("")}
    </div>
  `;
}

/* ============================= PROGRESS TAB ============================= */
function renderProgressTab(){
  const p = state.profile, plan = state.plan;
  const log = state.weightLog;
  const startW = plan.startWeight, targetW = p.targetWeight, curW = log[log.length-1].weight;
  const totalDelta = Math.abs(targetW-startW) || 1;
  const doneDelta = Math.abs(startW-curW);
  const progressFrac = Math.min(1, doneDelta/totalDelta);

  const elapsedWeeks = Math.floor((state.today-1)/7);
  const weeksLeft = Math.max(0, plan.weeksToGoal - elapsedWeeks);

  return `
    <div class="card">
      <div class="card-title">Body progress</div>
      <div class="silhouette-wrap">${renderSilhouette(progressFrac, p.goal)}</div>
      <div style="text-align:center;color:var(--text-dim);font-size:13px;margin-top:6px;">
        ${Math.round(progressFrac*100)}% of the way to your goal shape
      </div>
      <div class="weeks-line">
        <div class="weeks-track"></div>
        <div class="weeks-fill" style="width:${Math.round(progressFrac*100)}%"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-dim);">
        <span>Start: ${startW}kg</span>
        <span class="mono" style="color:var(--amber)">${weeksLeft} wk left (est.)</span>
        <span>Goal: ${targetW}kg</span>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-title">Current weight</div>
        <div class="stat-num">${curW}<span style="font-size:14px;color:var(--text-dim)">kg</span></div>
        <div class="stat-label">Logged on day ${log[log.length-1].day}</div>
      </div>
      <div class="card">
        <div class="card-title">Estimated pace</div>
        <div class="stat-num">${plan.weeklyRate}<span style="font-size:14px;color:var(--text-dim)">kg/wk</span></div>
        <div class="stat-label">Target trajectory</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Weight log</div>
      ${log.slice().reverse().map(e=>`
        <div class="ledger-row">
          <div class="ledger-name">Day ${e.day}</div>
          <div class="ledger-meta">${e.weight} kg</div>
        </div>`).join("")}
      <button class="btn btn-primary" style="margin-top:10px;" onclick="openModal('logWeight')">Log weight / monthly check-in</button>
    </div>
  `;
}

function renderSilhouette(frac, goal){
  const leaner = goal!=="build_muscle";
  // width scales from 1 (start) toward target shape as frac increases
  const startWidthScale = 1;
  const endWidthScale = leaner ? 0.78 : 1.16;
  const scale = startWidthScale + (endWidthScale-startWidthScale)*frac;
  const opacityAfter = frac;
  return `
  <svg width="180" height="240" viewBox="0 0 180 240" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(90,10)">
      <g opacity="${1-opacityAfter*0.55}">
        <ellipse cx="0" cy="18" rx="20" ry="22" fill="var(--line)"/>
        <path d="M -34 50 Q 0 30 34 50 L 40 150 Q 0 170 -40 150 Z" fill="var(--line)"/>
        <rect x="-40" y="150" width="26" height="70" rx="10" fill="var(--line)"/>
        <rect x="14" y="150" width="26" height="70" rx="10" fill="var(--line)"/>
      </g>
      <g style="transform:scaleX(${scale});transform-origin:center;transition:transform .6s;" opacity="${0.4+opacityAfter*0.6}">
        <ellipse cx="0" cy="18" rx="20" ry="22" fill="var(--amber)"/>
        <path d="M -30 50 Q 0 34 30 50 L 34 148 Q 0 166 -34 148 Z" fill="var(--amber)"/>
        <rect x="-34" y="148" width="24" height="72" rx="10" fill="var(--amber)"/>
        <rect x="10" y="148" width="24" height="72" rx="10" fill="var(--amber)"/>
      </g>
    </g>
  </svg>`;
}

/* ---- weight logging / monthly check-in ---- */
function submitWeightLog(weight){
  if(!weight) return;
  state.weightLog.push({day: state.today, weight:+weight});
  // check if off track vs expected pace
  const p = state.profile, plan = state.plan;
  const first = state.weightLog[0], last = {day:state.today, weight:+weight};
  const weeksElapsed = Math.max(0.5,(last.day-first.day)/7);
  const actualRate = Math.abs(first.weight-last.weight)/weeksElapsed;
  closeModal();
  if(weeksElapsed>=1 && actualRate < plan.weeklyRate*0.5){
    state.modal = {type:"offTrack", actualRate:actualRate.toFixed(2)};
  }
  render();
}
function adjustPlanForOffTrack(){
  const plan = state.plan;
  if(state.profile.goal==="lose_fat") plan.calories -= 150;
  else if(state.profile.goal==="build_muscle") plan.calories += 150;
  plan.meals = buildMealPlan(state.profile, plan, plan.meals);
  closeModal();
  render();
}

/* ============================= MODALS ============================= */
function openModal(type, arg){
  state.modal = {type, arg};
  render();
}
function closeModal(){
  document.querySelectorAll(".modal-overlay").forEach(el=>el.remove());
  state.modal = null;
}

function renderModal(){
  const m = state.modal;
  if(!m) return "";
  let inner = "";
  if(m.type==="swap"){
    const slot = m.arg;
    const current = state.plan.meals[slot];
    const allergies = state.profile.allergies || [];
    const alts = MEAL_DB[slot].filter(x=>x.diet.includes(state.profile.dietPref) && x.name!==current.name && (!x.allergens || !x.allergens.some(a=>allergies.includes(a))));
    inner = `
      <div class="modal-head"><h3>Swap ${slot}</h3><button class="x-btn" onclick="closeModal();render()">✕</button></div>
      <div class="empty-note">Currently: ${current.name} (${current.cal} kcal)</div>
      ${alts.map(a=>`
        <div class="ledger-row">
          <div class="ledger-main">
            <div class="meal-thumb sm">${mealPlateSVG(a)}</div>
            <div>
              <div class="ledger-name">${a.name}</div>
              <div class="ledger-sub">${a.cal} kcal · P${a.p}/C${a.c}/F${a.f}</div>
            </div>
          </div>
          <button class="btn btn-sm btn-primary" onclick="doSwap('${slot}');setTimeout(()=>closeModal(),0)">Choose</button>
        </div>`).join("")}
    `;
  } else if(m.type==="logExtra"){
    inner = `
      <div class="modal-head"><h3>Log something else</h3><button class="x-btn" onclick="closeModal();render()">✕</button></div>
      <div class="field"><label>What did you have?</label><input id="extra-name" type="text" placeholder="e.g. bag of chips"></div>
      <div class="field"><label>Estimated calories</label><input id="extra-cal" type="number" placeholder="e.g. 250"></div>
      <button class="btn btn-primary btn-block" onclick="submitExtra(document.getElementById('extra-name').value, document.getElementById('extra-cal').value)">Log it</button>
    `;
  } else if(m.type==="snapPhoto"){
    const nativeCamera = isNativeApp() && !!(window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.Camera);
    inner = `
      <div class="modal-head"><h3>Snap your meal</h3><button class="x-btn" onclick="closeModal();render()">✕</button></div>
      ${nativeCamera
        ? `<button class="btn btn-primary btn-block" onclick="takeMealPhoto()">📷 Open camera</button>`
        : `<div class="field"><input type="file" accept="image/*" onchange="handlePhotoUpload(this)"></div>`}
      ${m.preview?`<img src="${m.preview}" style="width:100%;border-radius:10px;margin:10px 0;">
        <div class="empty-note">Estimated: <span class="mono" style="color:var(--amber)">${m.estimate} kcal</span> (auto-estimate — feel free to adjust)</div>
        <div class="field"><input id="photo-cal" type="number" value="${m.estimate}"></div>
        <button class="btn btn-primary btn-block" onclick="confirmPhotoLog(document.getElementById('photo-cal').value)">Log this meal</button>`
        : `<div class="empty-note">${nativeCamera?"Tap above to take a photo and we'll estimate the calories.":"Upload a photo and we'll estimate the calories for you."}</div>`}
    `;
  } else if(m.type==="motivation"){
    inner = `
      <div class="modal-head"><h3>🔥 Nice.</h3><button class="x-btn" onclick="closeModal();render()">✕</button></div>
      <div class="banner success" style="margin:0;"><div class="banner-icon">✅</div><div><div class="banner-text">${motivationalMessage()}</div></div></div>
      <button class="btn btn-primary btn-block" style="margin-top:14px;" onclick="closeModal();render()">Keep going</button>
    `;
  } else if(m.type==="logWeight"){
    inner = `
      <div class="modal-head"><h3>Log weight</h3><button class="x-btn" onclick="closeModal();render()">✕</button></div>
      <div class="field"><label>Current weight (kg)</label><input id="w-input" type="number" value="${state.weightLog[state.weightLog.length-1].weight}"></div>
      <div class="field"><label>Progress photo (optional)</label><input type="file" accept="image/*"></div>
      <button class="btn btn-primary btn-block" onclick="submitWeightLog(document.getElementById('w-input').value)">Save check-in</button>
    `;
  } else if(m.type==="offTrack"){
    inner = `
      <div class="modal-head"><h3>You're a bit off pace</h3><button class="x-btn" onclick="closeModal();render()">✕</button></div>
      <div class="banner" style="margin:0;"><div class="banner-icon">📉</div><div>
        <div class="banner-text">Your actual rate of change (~${m.actualRate}kg/wk) is slower than the ${state.plan.weeklyRate}kg/wk target. We can tighten up your calorie target to get back on trajectory.</div>
      </div></div>
      <div style="display:flex;gap:8px;margin-top:14px;">
        <button class="btn btn-primary" onclick="adjustPlanForOffTrack()">Adjust my plan</button>
        <button class="btn" onclick="closeModal();render()">Keep as is</button>
      </div>
    `;
  } else if(m.type==="inactivityNudge"){
    inner = `
      <div class="modal-head"><h3>👋 We miss you</h3><button class="x-btn" onclick="closeModal();render()">✕</button></div>
      <div class="banner" style="margin:0;">
        <div class="banner-icon">💛</div>
        <div>
          <div class="banner-title">It's been ${m.days} days since your last check-in</div>
          <div class="banner-text">Life gets busy — that's normal, and there's no judgment here. But your goal hasn't gone anywhere, and neither have we. Even one small win today, a logged meal or a quick workout, is enough to get your momentum back.</div>
        </div>
      </div>
      <button class="btn btn-primary btn-round btn-block" style="margin-top:14px;" onclick="closeModal();render()">Let's get back on track</button>
    `;
  }
  return `<div class="modal-overlay" onclick="if(event.target===this){closeModal();render();}"><div class="modal">${inner}</div></div>`;
}

/* ============================= DEMO CONTROLS ============================= */
function renderDemoControls(){
  if(state.screen!=="app") return `<div id="demo-controls-slot"></div>`;
  return `
    <div class="demo-controls" id="demo-controls-slot">
      <span>Demo controls:</span>
      <button class="btn btn-sm" ${state.today<=1?'disabled style="opacity:.4"':''} onclick="backDay()">← Back 1 day</button>
      <button class="btn btn-sm" onclick="advanceDay()">Advance 1 day →</button>
      <span>currently day ${state.today}</span>
    </div>`;
}
function advanceDay(){
  state.today += 1;
  state.insightShown = false;
  checkInactivityNudge();
  render();
}
function backDay(){
  if(state.today<=1) return;
  state.today -= 1;
  state.insightShown = false;
  render();
}

/* ============================= INIT ============================= */
loadState();
render();
if(state.screen==="app") scheduleInactivityNotification();
