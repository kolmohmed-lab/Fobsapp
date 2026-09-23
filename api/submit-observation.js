export default async function handler(req,res){
  if(req.method!=="POST"){
    res.setHeader("Allow","POST");
    return res.status(405).json({error:"Method not allowed"});
  }

  const flowUrl=process.env.OBSERVATION_POWER_AUTOMATE_URL;
  if(!flowUrl){
    return res.status(500).json({error:"Observation submission is not configured"});
  }

  try{
    const payload=req.body && typeof req.body==="object" ? {...req.body} : {};
    if(!payload.teacher || !payload.observer || !payload.observationDate){
      return res.status(400).json({error:"Teacher, observer and observation date are required"});
    }

    let teacherEmail="";
    try{
      const map=JSON.parse(process.env.OBSERVED_TEACHER_EMAILS_JSON || "{}");
      teacherEmail=map[payload.teacher] || "";
    }catch{}

    const outgoing={...payload,teacherEmail};

    const flowResponse=await fetch(flowUrl,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(outgoing)
    });

    if(!flowResponse.ok){
      const detail=await flowResponse.text().catch(()=>"");
      return res.status(502).json({error:"Power Automate rejected the observation",detail:detail.slice(0,500)});
    }

    res.setHeader("Cache-Control","no-store");
    return res.status(200).json({ok:true});
  }catch(error){
    return res.status(500).json({error:"Could not submit observation"});
  }
}
