import crypto from "node:crypto";

function json(res,status,body){
  res.status(status).setHeader("Content-Type","application/json");
  res.end(JSON.stringify(body));
}
function sign(payload,secret){
  return crypto.createHmac("sha256",secret).update(payload).digest("base64url");
}
function safeEqual(a,b){
  const aa=Buffer.from(a); const bb=Buffer.from(b);
  return aa.length===bb.length && crypto.timingSafeEqual(aa,bb);
}
function codeHash(email,code,secret){
  return crypto.createHmac("sha256",secret).update(email+"|"+code).digest("hex");
}

export default async function handler(req,res){
  if(req.method!=="POST") return json(res,405,{error:"Method not allowed"});

  const secret=process.env.OTP_SECRET;
  if(!secret) return json(res,500,{error:"Server is not configured yet"});

  const email=String(req.body?.email||"").trim().toLowerCase();
  const code=String(req.body?.code||"").trim();
  const challenge=String(req.body?.challenge||"");

  if(!/^\d{6}$/.test(code)) return json(res,400,{error:"Enter the 6-digit code"});
  const parts=challenge.split(".");
  if(parts.length!==2) return json(res,400,{error:"Invalid verification session"});

  const [payload,sig]=parts;
  const expectedSig=sign(payload,secret);
  if(!safeEqual(sig,expectedSig)) return json(res,401,{error:"Invalid verification session"});

  let data;
  try{ data=JSON.parse(Buffer.from(payload,"base64url").toString("utf8")); }
  catch{ return json(res,400,{error:"Invalid verification session"}); }

  if(Date.now()>Number(data.exp)) return json(res,401,{error:"That code has expired. Request a new one."});
  if(data.email!==email) return json(res,401,{error:"This code was issued for a different email address"});

  const attemptedHash=codeHash(email,code,secret);
  if(!safeEqual(attemptedHash,data.h)) return json(res,401,{error:"Incorrect code"});

  return json(res,200,{ok:true,email});
}