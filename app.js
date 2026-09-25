const form = document.getElementById("observationForm");
const STORAGE_KEY = "fobs_session_draft_v1";

// Observer access gate — approved emails stay server-side in Vercel.
const ACCESS_SESSION_KEY = "fobs_observer_email";

async function checkObserverAccess(email){
  const response = await fetch("/api/check-observer",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({email})
  });
  const data = await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.error || "Access could not be checked");
  return data;
}

function unlockFobs(email){
  sessionStorage.setItem(ACCESS_SESSION_KEY,email);
  document.getElementById("accessGate")?.classList.add("is-hidden");
  document.getElementById("mainApp")?.classList.remove("access-locked");
  const active=document.getElementById("activeObserver");
  if(active) active.textContent=email;
  const observer=form?.elements?.observer;
  if(observer) observer.value=email;
  defaultObservationDate();
}

function initObserverAccess(){
  const saved=sessionStorage.getItem(ACCESS_SESSION_KEY);
  if(saved){
    checkObserverAccess(saved).then(()=>unlockFobs(saved)).catch(()=>sessionStorage.removeItem(ACCESS_SESSION_KEY));
  }

  const button=document.getElementById("observerAccessBtn");
  const input=document.getElementById("observerAccessEmail");
  const message=document.getElementById("observerAccessMessage");
  if(!button || !input) return;

  const submit=async()=>{
    const email=input.value.trim().toLowerCase();
    message.textContent="Checking access…";
    message.className="access-message";
    button.disabled=true;
    try{
      const data=await checkObserverAccess(email);
      message.textContent="";
      startFreshObservation(data.email);
      unlockFobs(data.email);
    }catch(err){
      message.textContent=err.message;
      message.className="access-message error";
    }finally{
      button.disabled=false;
    }
  };

  button.addEventListener("click",submit);
  input.addEventListener("keydown",e=>{if(e.key==="Enter") submit();});
}

// Public dropdown contains names only. Staff email addresses are intentionally not embedded here.
const observedTeachers = [
  "Alexandra Arnhold",
  "Angelia Guan",
  "Ayman Massoud",
  "Cameron Benson",
  "Carlo Moldes",
  "Carlos Duque",
  "Chelsea Picco",
  "Cicily Coney",
  "Claudia Arboleda",
  "David Cong",
  "Eduardo Bandeira",
  "Fabian Sanchez",
  "Faicel Abderrahmen",
  "Fay Gao",
  "Haeshin Han",
  "Iris Jia",
  "Jacob Singleton",
  "Joanna Palle",
  "John Nuevas",
  "Jordan Reed",
  "Julie Yue",
  "Juvilyn Yonting",
  "Katherine Cooper",
  "Kiko Tang",
  "Lara Potter",
  "Logan Bryant",
  "Michael Kuropatwinski",
  "Mike Ng",
  "Nicholas Wong",
  "Nomthandazo Nyambosi",
  "Peter Waldvogel",
  "Petros Libingi",
  "Phillip Olivier",
  "Robert Flanagan",
  "Ronald Diarez",
  "Ryan Valdez",
  "Serina Cui",
  "Shine Huang",
  "Shirley Wang",
  "Sonya Boufath",
  "Stephen Cairns",
  "Tarek Fouad",
  "Xiaoming Liu",
  "Yuxin Fan"
];

function renderObservedTeachers(){
  const select=document.getElementById("observedTeacher");
  if(!select) return;
  const current=select.value;
  select.innerHTML='<option value="">Select teacher</option>' +
    observedTeachers.map(name=>'<option value="'+name.replace(/"/g,"&quot;")+'">'+name+'</option>').join("");
  if(current && observedTeachers.includes(current)) select.value=current;
}


const teacherCourses = {
  "Alexandra Arnhold": [
    "HS Intermediate Orchestra + MS Intermediate Orchestra",
    "HS Advanced Orchestra + MS Advanced Orchestra",
    "HS Beginning Orchestra + MS Beginning Orchestra",
    "HS Intermediate Band + MS Intermediate Band",
    "HS Advanced Band + MS Advanced Band"
  ],
  "Angelia Guan": [
    "MS Chinese Foundation",
    "HS Chinese Foundation High",
    "HS Chinese Foundation",
    "AP Chinese Language and Culture + HS Chinese Intermediate High",
    "HS Chinese Advanced"
  ],
  "Ayman Massoud": ["Math","Science"],
  "Cameron Benson": ["AP Psychology","American Literature","Psychology"],
  "Carlo Moldes": ["HM Science 8","AP Biology","Science"],
  "Carlos Duque": ["Health Education: Grade 8","Lifelong Fitness","MS Physical Education","Team Sports"],
  "Chelsea Picco": ["English 9","Speech and Debate","Ancient World Literature and Composition","Journalism"],
  "Cicily Coney": ["Pre-AP English II","English 10","Modern World Literature and Composition","AP English Language and Composition"],
  "Claudia Arboleda": ["English 7","MS Cambridge English Reaching","English 8"],
  "David Cong": ["Physics","AP Physics 1"],
  "Eduardo Bandeira": [
    "MS Art II + Studio Support and Leadership",
    "2D Art & Design",
    "MS Art III + Studio Support and Leadership",
    "Foundation Art + Studio Support and Leadership",
    "Foundation Art"
  ],
  "Fabian Sanchez": ["HM Life Science","Life Science","AP Chemistry"],
  "Faicel Abderrahmen": ["HM Social Studies 7","HM Social Studies 8","Applied Studies: MUN","Applied Studies: MS MUN"],
  "Fay Gao": ["Cambridge English"],
  "Haeshin Han": ["MS Cambridge English Developing"],
  "Iris Jia": ["Chinese for Literacy Development I","Chinese for Literacy Development II"],
  "Jacob Singleton": ["SOC 101 Introduction to Sociology","AP World History","Social Studies 9","Asian Studies"],
  "Joanna Palle": ["Physical Science","HM Physical Science","A Level Physics"],
  "John Nuevas": ["Integrated Mathematics II","Precalculus and an Introduction to Statistics","Precalculus and Intro to Statistics"],
  "Jordan Reed": ["Asian Literature","WRT 105: Practices of Academic Writing","AP English Literature"],
  "Julie Yue": ["Chinese for Literacy Development II","A-Level Language & Literature","Chinese for Literacy Development IV","Applied Studies: Yearbook"],
  "Juvilyn Yonting": ["Integrated Math III","Integrated Math I"],
  "Katherine Cooper": ["Choir","Musical Theatre"],
  "Kiko Tang": ["HS Chinese Advanced High","MS Chinese Advanced High","MS Chinese Advanced","HS Chinese Intermediate"],
  "Lara Potter": ["HS Cambridge English Developing"],
  "Logan Bryant": ["EAL collaboration","APST: English for University Access","Applied Studies: Drama for Musical Theatre","Applied Studies: Drama"],
  "Michael Kuropatwinski": ["AP Macro-Economics","Applied Studies: Government","Advanced Placement Business and Finance","AP Micro-Economics","A Level Economics"],
  "Mike Ng": ["Integrated Math I","Pre-Algebra","HM Pre-Algebra"],
  "Nicholas Wong": ["HM Science 7","DAIS Science 7","Environmental Science"],
  "Nomthandazo Nyambosi": ["Social Science","Language Arts"],
  "Peter Waldvogel": ["AP US History","Social Studies 10","US History","A Level Business"],
  "Petros Libingi": ["AP Pre-Calculus","Transition to College Math and Stat","A Level Mathematics","AP Calculus AB"],
  "Phillip Olivier": ["Social Science","Language Arts"],
  "Robert Flanagan": ["Ancient World Studies","Modern World Studies","Applied Studies: MUN","AP Human Geography"],
  "Ronald Diarez": ["Applied Studies: Engr and Product Dsgn","STEAM","APST Robotics","Applied Studies: Product Design"],
  "Ryan Valdez": ["Applied Studies: Coding and Digital Mgmt","AP Computer Science A","Applied Studies: Coding and Game Design"],
  "Serina Cui": ["HM Mandarin 8","MS Chinese Foundation High","HM Mandarin 7","MS Chinese Intermediate + MS Chinese Intermediate High"],
  "Shine Huang": ["Cambridge English"],
  "Shirley Wang": ["Chinese for Literacy Development III","Chinese for Literacy Development II"],
  "Sonya Boufath": ["MS Physical Education","Health Education","Health Education: Grade 7"],
  "Stephen Cairns": ["MS Cambridge English Expanding"],
  "Tarek Fouad": ["Team Sports","Health Education: Grade 7"],
  "Xiaoming Liu": ["AP Calculus BC","AP Physics C - Electricity/M","MAT 397 Calculus III","AP Statistics"],
  "Yuxin Fan": ["MS Art I","Pre-AP Studio Art","Digital Photography","AP Studio Art: 2D + AP Studio Art: 3D","APST Digital Art","3D Art and Design"]
};

function updateCourseOptions(){
  const teacherSelect=document.getElementById("observedTeacher");
  const courseSelect=document.getElementById("courseSelect");
  if(!teacherSelect || !courseSelect) return;

  const teacher=teacherSelect.value;
  const previous=courseSelect.value;
  const courses=teacherCourses[teacher] || [];

  if(!teacher){
    courseSelect.innerHTML='<option value="">Select a teacher first</option>';
    courseSelect.disabled=true;
    return;
  }

  if(!courses.length){
    courseSelect.innerHTML='<option value="">No timetable courses found for this teacher</option>';
    courseSelect.disabled=true;
    return;
  }

  courseSelect.disabled=false;
  courseSelect.innerHTML='<option value="">Select course / subject</option>' +
    courses.map(name=>'<option value="'+name.replace(/"/g,"&quot;")+'">'+name+'</option>').join("");

  if(previous && courses.includes(previous)) courseSelect.value=previous;
}


function defaultObservationDate(){
  const date=document.getElementById("observationDate");
  if(date && !date.value){
    const now=new Date();
    const local=new Date(now.getTime()-now.getTimezoneOffset()*60000);
    date.value=local.toISOString().slice(0,10);
  }
}


const facultyCriteria = [
  ["subjectKnowledge","Is subject knowledge and knowledge of how students learn secure?"],
  ["lessonPlanning","Is lesson planning effective?"],
  ["timeResources","Are time and resources used effectively?"],
  ["learningEnvironment","Is the class environment conducive to learning?"],
  ["interactions","Do the teachers’ interactions with students (including questioning) effectively promote student progress?"],
  ["criticalThinking","Is the teacher promoting critical thinking, problem-solving, and independent learning?"],
  ["expectations","Does the teacher hold high scaffolded expectations of all students regardless of level?"],
  ["assessmentAdaptation","Do teachers use assessment information to adapt teaching?"],
  ["challengeGroups","Are different groups of students being challenged at an appropriate level?"]
];

const learningCriteria = [
  ["responsibility","Are students taking responsibility for their own learning?"],
  ["writtenFeedback","Do students receive and engage with written feedback about their work from teachers?"],
  ["strengthsWeaknesses","Do students know their strengths and weaknesses?"],
  ["peerAssessment","Do students assess their own, and each other’s work?"],
  ["collaboration","Do students interact, collaborate and communicate their learning effectively?"],
  ["connections","Do students make connections between what they are learning and other learning / the real world?"],
  ["innovationResearch","Are students engaged in innovation, independent learning, enquiry & research?"],
  ["technology","Are resources, including technology, used purposefully to enhance learning?"],
  ["studentCriticalThinking","Are students developing critical thinking & problem solving in the lesson?"]
];

const attainmentItems = [
  ["att1","Most, if not all students demonstrated levels of knowledge, skills & understanding that are above curriculum standards.","green"],
  ["att2","A large majority of students demonstrated levels of knowledge, skills & understanding that are above curriculum standards.","green"],
  ["att3","The majority of students demonstrated levels of knowledge, skills & understanding that are above curriculum standards.","yellow"],
  ["att4","Most, if not all students demonstrated levels of knowledge, skills & understanding that are in line with curriculum standards.","yellow"],
  ["att5","Less than 75% of students demonstrated levels of knowledge, skills & understanding that are in line with curriculum standards.","red"],
  ["att6","Only a few students demonstrated levels of knowledge, skills & understanding that are in line with curriculum standards.","red"]
];

const progressItems = [
  ["prog1","Most, if not all students made better than expected progress","green"],
  ["prog2","The majority of students made better than expected progress","green"],
  ["prog3","Most, if not all students made expected progress and a few made better than expected progress.","yellow"],
  ["prog4","A majority of students made expected progress.","yellow"],
  ["prog5","Only a few students made expected progress","red"]
];

const facultyRubric = [
  ["Subject knowledge / how students learn","Effectively applies knowledge","Secure in knowledge & applies it","Insecure knowledge"],
  ["How good is lesson planning / use of time and resources?","Plans engaging lessons and uses time and resources skilfully.","Plans purposeful lessons and uses time and resources effectively.","Planning, time management and use of resources are not sufficiently effective."],
  ["Learning environment","Inspiring","Interesting","Does NOT encourage learning."],
  ["Interactions, use of questioning & dialogue","Promotes active and focused learning. Questioning challenges thinking & leads to insightful discussions and reflection.","Promotes engagement. Questioning promotes thought. Engages students in meaningful discussions and reflection.","Promotes disinterest. Questioning does not engage students effectively."],
  ["Meeting students’ individual needs","Very successful","Effective","Not meeting the needs."],
  ["How high are teacher’s expectations?","High expectations of all groups. Provides challenging work and excellent support.","Provides appropriate levels of challenge and support.","Does not provide appropriate challenge and support."],
  ["Use of assessment information to influence teaching, the curriculum and students’ progress","Used skilfully and effectively to optimise the progress of all groups of students.","Used effectively to enhance the progress of all groups of students.","Not used adequately to meet the needs of groups of students."],
  ["Development of critical thinking, problem-solving, innovation and independent learning skills?","Skilfully develops these skills.","Purposefully develops these skills.","Rarely develops these skills."]
];

const learningRubric = [
  ["Students take responsibility for their own learning","Enthusiastic and take responsibility for their own learning in sustained ways.","Have positive attitudes & can work for short periods without teachers’ intervention.","Easily distracted and work only with their teachers’ direction."],
  ["Student’s knowledge of their strengths and weaknesses","Evaluate their strengths and weaknesses accurately. Take targeted actions to improve.","Passive learners. Know how to improve their work in general terms.","Rarely reflect on their learning and are unsure how to improve their work."],
  ["Students’ interaction and collaboration","Interact, collaborate very effectively to achieve goals.","Can work in groups but limited collaboration.","Work together only with teacher supervision."],
  ["Students’ communication of their learning","Communicate their learning very clearly.","Communicate their learning adequately.","Find it difficult to communicate their learning."],
  ["Students making connections with other learning & the real world","Consistent meaningful connections made & used to deepen world understanding.","Few connections made & related to understanding of the world in simple ways.","Find it difficult to make connections and relate them to understanding of the world."],
  ["Innovation & enterprise, enquiry & research","Innovative and enterprising. Independent learners. Can find things out for themselves from multiple sources.","Can do basic research with teachers’ direction.","Find it difficult to do basic, independent research."],
  ["Students’ use of technology","Use independently and very effectively.","Use to support learning in limited ways.","Find it difficult to use effectively."],
  ["Critical thinking & problem solving skills","Intrinsic features.","Developing features.","Underdeveloped features."]
];

const evaluationWeights = {
  faculty: 0.2166666667,
  learning: 0.2166666667,
  attainment: 0.2166666667,
  progress: 0.35
};

function ratingLabel(v){
  return v === "OUTSTANDING" ? "Outstanding" : v === "ACCEPTABLE" ? "Acceptable" : v === "INCOMPLETE" ? "Incomplete" : "Not rated";
}
function ratingClass(v){
  return v ? "rating-" + v.toLowerCase() : "";
}
function score(v){
  return v === "OUTSTANDING" ? 3 : v === "ACCEPTABLE" ? 2 : v === "INCOMPLETE" ? 1 : null;
}
function classify(avg){
  if(avg == null || Number.isNaN(avg)) return "";
  if(avg >= 2.5) return "OUTSTANDING";
  if(avg >= 1.5) return "ACCEPTABLE";
  return "INCOMPLETE";
}
function selected(name){
  return form.querySelector(`[name="${name}"]:checked`)?.value || "";
}

function renderCriteria(targetId,prefix,items){
  document.getElementById(targetId).innerHTML = items.map(([key,q]) => `
    <div class="criterion-row">
      <div class="criterion-question">${q}</div>
      <div class="rating-buttons">
        <label class="rate-choice outstanding"><input type="radio" name="${prefix}_${key}" value="OUTSTANDING"><span>Outstanding</span></label>
        <label class="rate-choice acceptable"><input type="radio" name="${prefix}_${key}" value="ACCEPTABLE"><span>Acceptable</span></label>
        <label class="rate-choice incomplete"><input type="radio" name="${prefix}_${key}" value="INCOMPLETE"><span>Incomplete</span></label>
      </div>
      <label class="evidence-input"><textarea name="${prefix}_${key}_notes" rows="2" placeholder="Evidence / notes"></textarea></label>
    </div>`).join("");
}

function renderStatements(targetId,name,items){
  document.getElementById(targetId).innerHTML = items.map(([value,text,band]) => `
    <label class="statement-card ${band}">
      <input type="radio" name="${name}" value="${value}">
      <div class="statement-copy">${text}</div>
      <div class="statement-select"><span class="check"></span></div>
      <div class="statement-footer"><span>${band}</span></div>
    </label>`).join("");
}

function renderRubric(targetId,rows){
  document.getElementById(targetId).innerHTML = `
    <table class="rubric-table">
      <thead><tr><th>Skill</th><th class="out">Outstanding</th><th class="acc">Acceptable</th><th class="inc">Incomplete</th></tr></thead>
      <tbody>${rows.map(row => `<tr>${row.map(cell=>`<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>`;
}

renderCriteria("facultyCriteria","faculty",facultyCriteria);
renderCriteria("learningCriteria","learning",learningCriteria);
renderStatements("attainmentOptions","studentAttainment",attainmentItems);
renderStatements("progressOptions","studentProgress",progressItems);
renderRubric("facultyRubric",facultyRubric);
renderRubric("learningRubric",learningRubric);

function average(prefix,items){
  const values = items.map(([key])=>score(selected(`${prefix}_${key}`))).filter(v=>v!==null);
  if(!values.length) return null;
  return values.reduce((a,b)=>a+b,0)/values.length;
}

function attainmentRating(){
  const v = selected("studentAttainment");
  const n = Number(v.replace("att",""));
  if(!n) return "";
  return n <= 2 ? "OUTSTANDING" : n <= 4 ? "ACCEPTABLE" : "INCOMPLETE";
}
function progressRating(){
  const v = selected("studentProgress");
  const n = Number(v.replace("prog",""));
  if(!n) return "";
  return n <= 2 ? "OUTSTANDING" : n <= 4 ? "ACCEPTABLE" : "INCOMPLETE";
}
function effective(auto,overrideName){
  return form.elements[overrideName]?.value || auto || "";
}
function paint(el,value){
  el.textContent = ratingLabel(value);
  el.classList.remove("rating-outstanding","rating-acceptable","rating-incomplete");
  if(value) el.classList.add(ratingClass(value));
}
function recalc(){
  const facultyAuto = classify(average("faculty",facultyCriteria));
  const learningAuto = classify(average("learning",learningCriteria));
  const attainmentAuto = attainmentRating();
  const progressAuto = progressRating();

  const facultyFinal = effective(facultyAuto,"evaluationFacultyOverride");
  const learningFinal = effective(learningAuto,"evaluationLearningOverride");
  const attainmentFinal = effective(attainmentAuto,"evaluationAttainmentOverride");
  const progressFinal = effective(progressAuto,"evaluationProgressOverride");

  paint(document.getElementById("facultySummary"),facultyFinal);
  paint(document.getElementById("learningSummary"),learningFinal);
  paint(document.getElementById("attainmentSummary"),attainmentFinal);
  paint(document.getElementById("progressSummary"),progressFinal);

  const weightedParts = [
    [facultyFinal, evaluationWeights.faculty],
    [learningFinal, evaluationWeights.learning],
    [attainmentFinal, evaluationWeights.attainment],
    [progressFinal, evaluationWeights.progress]
  ].map(([rating,weight])=>[score(rating),weight]).filter(([value])=>value!==null);

  const overallAuto = weightedParts.length
    ? classify(
        weightedParts.reduce((sum,[value,weight])=>sum + value * weight,0) /
        weightedParts.reduce((sum,[,weight])=>sum + weight,0)
      )
    : "";
  const overallFinal=effective(overallAuto,"evaluationOverallOverride");
  paint(document.getElementById("finalOverall"),overallFinal);
  paint(document.getElementById("heroOverall"),overallFinal);
}

function serialize(){
  const out={};
  new FormData(form).forEach((v,k)=>out[k]=v);
  return out;
}
function restore(data){
  const values=data||{};
  const teacher=form.elements.teacher;
  if(teacher && values.teacher) teacher.value=values.teacher;
  updateCourseOptions();

  Object.entries(values).forEach(([name,value])=>{
    if(name==="teacher") return;
    form.querySelectorAll(`[name="${CSS.escape(name)}"]`).forEach(el=>{
      if(el.type==="radio"||el.type==="checkbox") el.checked=el.value===value;
      else el.value=value;
    });
  });
}
function setSaveState(text){document.getElementById("saveState").textContent=text}
function saveDraft(){
  sessionStorage.setItem(STORAGE_KEY,JSON.stringify(serialize()));
  setSaveState("Draft saved for this session");
}
function loadDraft(){
  try{
    const raw=sessionStorage.getItem(STORAGE_KEY);
    if(raw){restore(JSON.parse(raw));setSaveState("Session draft restored");}
  }catch(e){console.warn("Could not restore draft",e)}
}
function startFreshObservation(observerEmail=""){
  form.reset();
  sessionStorage.removeItem(STORAGE_KEY);
  renderObservedTeachers();
  updateCourseOptions();
  if(form.elements.observer) form.elements.observer.value=observerEmail;
  defaultObservationDate();
  recalc();
  setSaveState("New observation");
}
function clearForm(){
  if(!confirm("Clear this observation and remove the current session draft?")) return;
  const observerEmail=sessionStorage.getItem(ACCESS_SESSION_KEY) || "";
  startFreshObservation(observerEmail);
}
function signOut(){
  sessionStorage.removeItem(ACCESS_SESSION_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  form.reset();
  document.getElementById("mainApp")?.classList.add("access-locked");
  document.getElementById("accessGate")?.classList.remove("is-hidden");
  const active=document.getElementById("activeObserver");
  if(active) active.textContent="";
  const input=document.getElementById("observerAccessEmail");
  if(input){input.value=""; input.focus();}
  setSaveState("New observation");
}
function summaryValue(id){
  return document.getElementById(id)?.textContent?.trim() || "Not rated";
}
function makeObservationID(){
  if(globalThis.crypto?.randomUUID) return "OBS-" + crypto.randomUUID();
  return "OBS-" + Date.now() + "-" + Math.random().toString(36).slice(2,10);
}
function buildSubmissionPayload(){
  const fields=serialize();
  return {
    ...fields,
    observationID: fields.observationID || makeObservationID(),
    course: fields.course,
    facultySummary: summaryValue("facultySummary"),
    learningSummary: summaryValue("learningSummary"),
    attainmentSummary: summaryValue("attainmentSummary"),
    progressSummary: summaryValue("progressSummary"),
    finalOverall: summaryValue("finalOverall"),
    teacherSelfFaculty: "",
    teacherSelfLearning: "",
    teacherSelfAttainment: "",
    teacherSelfProgress: "",
    teacherSelfOverall: "",
    teacherSelfComments: "",
    teacherSelfCompleted: false,
    teacherSelfCompletedAt: "",
    status: "Awaiting Teacher Self-Appraisal",
    weights: {
      faculty: evaluationWeights.faculty,
      learning: evaluationWeights.learning,
      attainment: evaluationWeights.attainment,
      progress: evaluationWeights.progress
    },
    submittedAt: new Date().toISOString()
  };
}
async function submitObservation(){
  const status=document.getElementById("submitStatus");
  const buttons=[document.getElementById("submitBtn"),document.getElementById("mobileSubmitBtn")].filter(Boolean);
  if(!form.reportValidity()) return;
  buttons.forEach(b=>b.disabled=true);
  if(status) status.textContent="Submitting observation…";
  try{
    recalc();
    const response=await fetch("/api/submit-observation",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(buildSubmissionPayload())
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error || "Could not submit observation");
    if(status) status.textContent="Observation submitted successfully.";
    sessionStorage.removeItem(STORAGE_KEY);
    setSaveState("Submitted");
  }catch(err){
    if(status) status.textContent=err.message;
  }finally{
    buttons.forEach(b=>b.disabled=false);
  }
}
function prepPrint(){
  document.querySelectorAll("textarea").forEach(el=>{
    el.dataset.oldHeight=el.style.height||"";
    el.style.height="auto";
    // Add breathing room because browser print engines can round line-height
    // differently from the on-screen layout, which can clip the final line.
    const safeHeight = el.scrollHeight + 24;
    el.style.height=safeHeight+"px";
  });
  document.querySelectorAll(".rubric-panel details").forEach(d=>d.open=true);
}
function resetAfterPrint(){
  document.querySelectorAll("textarea").forEach(el=>el.style.height=el.dataset.oldHeight||"");
}

let dirtyTimer;
form.addEventListener("input",()=>{
  recalc();
  setSaveState("Unsaved changes");
  clearTimeout(dirtyTimer);
  dirtyTimer=setTimeout(saveDraft,1200);
});
form.addEventListener("change",()=>{recalc();saveDraft()});

document.getElementById("saveBtn").addEventListener("click",saveDraft);
document.getElementById("mobileSaveBtn").addEventListener("click",saveDraft);
document.getElementById("submitBtn").addEventListener("click",submitObservation);
document.getElementById("mobileSubmitBtn").addEventListener("click",submitObservation);
document.getElementById("signOutBtn").addEventListener("click",signOut);
document.getElementById("clearBtn").addEventListener("click",clearForm);
document.getElementById("printBtn").addEventListener("click",()=>{saveDraft();window.print()});
document.getElementById("mobilePrintBtn").addEventListener("click",()=>{saveDraft();window.print()});
window.addEventListener("beforeprint",prepPrint);
window.addEventListener("afterprint",resetAfterPrint);

renderObservedTeachers();
updateCourseOptions();
loadDraft();
defaultObservationDate();
document.getElementById("observedTeacher")?.addEventListener("change",()=>{
  updateCourseOptions();
  saveDraft();
});
recalc();
initObserverAccess();