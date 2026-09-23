import crypto from "node:crypto";

function json(res,status,body){
  res.status(status).setHeader("Content-Type","application/json");
  res.end(JSON.stringify(body));
}
function b64url(input){
  return Buffer.from(input).toString("base64url");
}
function sign(payload,secret){
  return crypto.createHmac("sha256",secret).update(payload).digest("base64url");
}
function codeHash(email,code,secret){
  return crypto.createHmac("sha256",secret).update(email+"|"+code).digest("hex");
}

export default async function handler(req,res){
  if(req.method!=="POST") return json(res,405,{error:"Method not allowed"});

  const secret=process.env.OTP_SECRET;
  const flowUrl=process.env.POWER_AUTOMATE_URL;
  if(!secret || !flowUrl) return json(res,500,{error:"Server is not configured yet"});

  const email=String(req.body?.email||"").trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res,400,{error:"Enter a valid email address"});

  // For this prototype, only DAIS China accounts are allowed.
  if(!email.endsWith("@daischina.net")) return json(res,403,{error:"Use your @daischina.net school email"});

  const code=String(crypto.randomInt(0,1000000)).padStart(6,"0");
  const expiresAt=Date.now()+10*60*1000;
  const payloadObj={
    email,
    exp:expiresAt,
    h:codeHash(email,code,secret),
    n:crypto.randomBytes(10).toString("hex")
  };
  const payload=b64url(JSON.stringify(payloadObj));
  const signature=sign(payload,secret);
  const challenge=payload+"."+signature;

  const flowResponse=await fetch(flowUrl,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      recipientEmail:email,
      code,
      purpose:"Fobs sign-in",
      expiresMinutes:10
    })
  });

  if(!flowResponse.ok){
    const detail=await flowResponse.text().catch(()=>"");
    console.error("Power Automate error",flowResponse.status,detail);
    return json(res,502,{error:"Microsoft email flow did not accept the request"});
  }

  return json(res,200,{ok:true,challenge});
}