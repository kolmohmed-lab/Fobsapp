// Fobs observer access gate
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
  if(observer && !observer.value) observer.value=email;
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



initObserverAccess();
