const form=document.getElementById("selfAppraisalForm");
const params=new URLSearchParams(location.search);
const observationID=(params.get("observationID")||"").trim();
const idLabel=document.getElementById("observationIdLabel");
const statusEl=document.getElementById("selfStatus");
const submitBtn=document.getElementById("selfSubmitBtn");

if(observationID){
  idLabel.textContent="Observation: "+observationID;
}else{
  idLabel.textContent="Missing observation ID";
  statusEl.textContent="This self-appraisal link is incomplete. Please use the link from your observation email.";
  statusEl.classList.add("self-error");
  submitBtn.disabled=true;
}

const weights={faculty:0.2166666667,learning:0.2166666667,attainment:0.2166666667,progress:0.35};

function score(v){
  return v==="Outstanding"?3:v==="Acceptable"?2:v==="Incomplete"?1:null;
}
function classify(avg){
  if(avg==null || Number.isNaN(avg)) return "Not rated";
  if(avg>=2.5) return "Outstanding";
  if(avg>=1.5) return "Acceptable";
  return "Incomplete";
}
function selected(name){
  return form.querySelector('[name="'+name+'"]:checked')?.value || "";
}
function recalc(){
  const parts=[
    [selected("teacherSelfFaculty"),weights.faculty],
    [selected("teacherSelfLearning"),weights.learning],
    [selected("teacherSelfAttainment"),weights.attainment],
    [selected("teacherSelfProgress"),weights.progress]
  ].map(([rating,weight])=>[score(rating),weight]).filter(([value])=>value!==null);

  if(parts.length!==4){
    document.getElementById("selfOverall").textContent="Not rated";
    return "Not rated";
  }

  const avg=parts.reduce((s,[v,w])=>s+v*w,0)/parts.reduce((s,[,w])=>s+w,0);
  const result=classify(avg);
  document.getElementById("selfOverall").textContent=result;
  return result;
}

form.addEventListener("change",recalc);

form.addEventListener("submit",async e=>{
  e.preventDefault();
  if(!observationID || !form.reportValidity()) return;

  const teacherSelfOverall=recalc();
  submitBtn.disabled=true;
  statusEl.textContent="Submitting self-appraisal…";
  statusEl.className="self-status";

  try{
    const body={
      observationID,
      teacherSelfFaculty:selected("teacherSelfFaculty"),
      teacherSelfLearning:selected("teacherSelfLearning"),
      teacherSelfAttainment:selected("teacherSelfAttainment"),
      teacherSelfProgress:selected("teacherSelfProgress"),
      teacherSelfOverall,
      teacherSelfComments:form.elements.teacherSelfComments.value.trim(),
      teacherSelfCompleted:true,
      teacherSelfCompletedAt:new Date().toISOString(),
      status:"Teacher Self-Appraisal Complete"
    };

    const response=await fetch("/api/submit-self-appraisal",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(body)
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error||"Could not submit self-appraisal");

    statusEl.textContent="Self-appraisal submitted successfully. You may close this page.";
    statusEl.className="self-status self-success";
    form.querySelectorAll("input,textarea,button").forEach(el=>el.disabled=true);
  }catch(err){
    statusEl.textContent=err.message;
    statusEl.className="self-status self-error";
    submitBtn.disabled=false;
  }
});