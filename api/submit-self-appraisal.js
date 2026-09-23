export default async function handler(req,res){
  if(req.method!=="POST"){
    res.setHeader("Allow","POST");
    return res.status(405).json({error:"Method not allowed"});
  }

  const flowUrl=process.env.SELF_APPRAISAL_POWER_AUTOMATE_URL;
  if(!flowUrl){
    return res.status(500).json({error:"Self-appraisal submission is not configured"});
  }

  const body=req.body && typeof req.body==="object" ? req.body : {};
  const required=[
    "observationID","teacherSelfFaculty","teacherSelfLearning",
    "teacherSelfAttainment","teacherSelfProgress","teacherSelfOverall"
  ];
  if(required.some(key=>!body[key])){
    return res.status(400).json({error:"Self-appraisal is incomplete"});
  }

  try{
    const flowResponse=await fetch(flowUrl,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        observationID:String(body.observationID),
        teacherSelfFaculty:String(body.teacherSelfFaculty),
        teacherSelfLearning:String(body.teacherSelfLearning),
        teacherSelfAttainment:String(body.teacherSelfAttainment),
        teacherSelfProgress:String(body.teacherSelfProgress),
        teacherSelfOverall:String(body.teacherSelfOverall),
        teacherSelfComments:String(body.teacherSelfComments||""),
        teacherSelfCompleted:true,
        teacherSelfCompletedAt:String(body.teacherSelfCompletedAt||new Date().toISOString()),
        status:"Teacher Self-Appraisal Complete"
      })
    });

    if(!flowResponse.ok){
      const detail=await flowResponse.text().catch(()=>"");
      return res.status(502).json({error:"Power Automate rejected the self-appraisal",detail:detail.slice(0,500)});
    }

    res.setHeader("Cache-Control","no-store");
    return res.status(200).json({ok:true});
  }catch{
    return res.status(500).json({error:"Could not submit self-appraisal"});
  }
}