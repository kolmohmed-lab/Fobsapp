function send(res,status,body){
  res.status(status).setHeader("Content-Type","application/json");
  res.setHeader("Cache-Control","no-store");
  res.end(JSON.stringify(body));
}

export default function handler(req,res){
  if(req.method!=="POST") return send(res,405,{error:"Method not allowed"});

  const email=String(req.body?.email||"").trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    return send(res,400,{allowed:false,error:"Enter a valid school email address"});
  }

  const raw=process.env.ALLOWED_OBSERVER_EMAILS || "";
  const allowed=new Set(
    raw.split(",")
      .map(v=>v.trim().toLowerCase())
      .filter(Boolean)
  );

  if(!allowed.size){
    return send(res,500,{allowed:false,error:"Observer access list has not been configured"});
  }

  if(!allowed.has(email)){
    return send(res,403,{allowed:false,error:"This email is not on the approved observer list"});
  }

  return send(res,200,{allowed:true,email});
}
