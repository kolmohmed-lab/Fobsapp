export default async function handler(req,res){
  if(req.method!=="POST"){
    res.setHeader("Allow","POST");
    return res.status(405).json({error:"Method not allowed"});
  }

  try{
    const {teacher,observer}=req.body || {};
    if(!teacher || !observer){
      return res.status(400).json({error:"Teacher and observer are required"});
    }

    const allowed=(process.env.ALLOWED_OBSERVER_EMAILS || "")
      .split(",")
      .map(v=>v.trim().toLowerCase())
      .filter(Boolean);

    if(!allowed.includes(String(observer).trim().toLowerCase())){
      return res.status(403).json({error:"Observer access is not approved"});
    }

    let email="";
    try{
      const map=JSON.parse(process.env.OBSERVED_TEACHER_EMAILS_JSON || "{}");
      email=map[teacher] || "";
    }catch{
      return res.status(500).json({error:"Teacher email mapping is not configured correctly"});
    }

    res.setHeader("Cache-Control","no-store");
    return res.status(200).json({teacher,email});
  }catch{
    return res.status(500).json({error:"Could not load teacher email"});
  }
}
