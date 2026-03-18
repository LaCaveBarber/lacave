import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://jdougyltrwvnhicjyyfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_mfeiz_Zh_JmkHKotF2r9Xg_kaplDs6S";
const EMAILJS_SERVICE_ID  = "service_8ykrgpf";
const EMAILJS_TEMPLATE_ID = "template_sj06z7n";
const EMAILJS_PUBLIC_KEY  = "3rLebn0oZixvP6zWG";
const ADMIN_CODE = "0192";

const SB_H = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };
async function sbGet(t,q=""){try{const r=await fetch(`${SUPABASE_URL}/rest/v1/${t}?${q}`,{headers:SB_H});return r.ok?r.json():[]}catch{return[]}}
async function sbInsert(t,d){try{const r=await fetch(`${SUPABASE_URL}/rest/v1/${t}`,{method:"POST",headers:{...SB_H,"Prefer":"return=representation"},body:JSON.stringify(d)});const a=await r.json();return Array.isArray(a)?a[0]:a}catch{return null}}
async function sbDelete(t,q){try{await fetch(`${SUPABASE_URL}/rest/v1/${t}?${q}`,{method:"DELETE",headers:SB_H})}catch{}}
async function sbUpsert(t,d){try{await fetch(`${SUPABASE_URL}/rest/v1/${t}`,{method:"POST",headers:{...SB_H,"Prefer":"resolution=merge-duplicates"},body:JSON.stringify(d)})}catch{}}
async function sbUpdate(t,q,d){try{await fetch(`${SUPABASE_URL}/rest/v1/${t}?${q}`,{method:"PATCH",headers:{...SB_H,"Prefer":"return=representation"},body:JSON.stringify(d)})}catch{}}

const ALL_SLOTS=["07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00"];
const DEFAULT_SLOTS=["09:00","09:30","10:00","10:30","11:00","11:30","12:00","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00"];
const ICONS=["✂️","⚡","🪒","💈","🧴","🧖","👑","🔥","💎","🌿","⭐","🎯"];

function getDays(y,m){const a=[],d=new Date(y,m,1);while(d.getMonth()===m){a.push(new Date(d));d.setDate(d.getDate()+1);}return a;}
function fmt(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function fmtS(d){const j=["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"],m=["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Aoû","Sep","Oct","Nov","Déc"];return `${j[d.getDay()]} ${d.getDate()} ${m[d.getMonth()]}`;}
function fmtL(ds){const[y,m,d]=ds.split("-").map(Number),o=new Date(y,m-1,d);const j=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],mo=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];return `${j[o.getDay()]} ${d} ${mo[m-1]} ${y}`;}

async function loadEJS(){if(window.emailjs)return;await new Promise((r,j)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";s.onload=r;s.onerror=j;document.head.appendChild(s);});window.emailjs.init({publicKey:EMAILJS_PUBLIC_KEY});}
async function sendMail(p){try{await loadEJS();await window.emailjs.send(EMAILJS_SERVICE_ID,EMAILJS_TEMPLATE_ID,p);return true;}catch{return false;}}
const TM={};
function schedRem(rdv){const[y,m,d]=rdv.date.split("-").map(Number),[hh,mm]=rdv.hour.split(":").map(Number);const appt=new Date(y,m-1,d,hh,mm),now=Date.now();[{t:new Date(appt-86400000),l:"rappel veille"},{t:new Date(y,m-1,d,8,0),l:"rappel matin"}].forEach(({t,l})=>{const delay=t-now;if(delay<=0)return;const k=`${rdv.id}_${l}`;if(TM[k])clearTimeout(TM[k]);TM[k]=setTimeout(()=>sendMail({to_email:rdv.email,to_name:rdv.name,service:rdv.service?.label,date:fmtL(rdv.date),hour:rdv.hour,price:rdv.service?.price,type:l}),delay);});}
function cancelRem(id){Object.keys(TM).filter(k=>k.startsWith(`${id}_`)).forEach(k=>{clearTimeout(TM[k]);delete TM[k];});}

const css=`
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');

:root {
  --black: #080808;
  --dark: #111111;
  --card: #161616;
  --border: #2a2a2a;
  --white: #f5f5f5;
  --muted: rgba(245,245,245,0.4);
  --red: #ff2d2d;
  --red-dim: rgba(255,45,45,0.15);
  --red-glow: rgba(255,45,45,0.4);
  --gold: #ffd700;
  --gold-dim: rgba(255,215,0,0.12);
}

*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--black);color:var(--white);font-family:'Rajdhani',sans-serif;min-height:100vh;overflow-x:hidden}

/* NOISE TEXTURE */
body::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");pointer-events:none;z-index:0;opacity:.4}

.app{position:relative;z-index:1;min-height:100vh}

/* SCANLINE EFFECT */
.app::after{content:'';position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px);pointer-events:none;z-index:0}

/* HEADER */
.hdr{position:sticky;top:0;z-index:200;background:rgba(8,8,8,0.92);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:0 1.5rem;display:flex;align-items:center;justify-content:space-between}
.logo{padding:1rem 0;display:flex;flex-direction:column;gap:1px}
.logo-t{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:.08em;line-height:1;background:linear-gradient(135deg,#fff 0%,var(--gold) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.logo-s{font-family:'Share Tech Mono',monospace;font-size:.55rem;letter-spacing:.4em;color:var(--red);text-transform:uppercase}
.hdr-btn{background:none;border:1px solid var(--border);color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:.7rem;font-weight:600;letter-spacing:.25em;text-transform:uppercase;padding:.5rem 1.2rem;cursor:pointer;transition:all .2s;position:relative;overflow:hidden}
.hdr-btn::before{content:'';position:absolute;inset:0;background:var(--red);transform:translateX(-100%);transition:transform .25s;z-index:-1}
.hdr-btn:hover{color:var(--white);border-color:var(--red)}
.hdr-btn:hover::before{transform:translateX(0)}

/* HERO */
.hero{padding:4rem 1.5rem 3rem;position:relative;overflow:hidden}
.hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(255,45,45,0.08) 0%,transparent 70%);pointer-events:none}
.hero-tag{display:inline-flex;align-items:center;gap:.5rem;font-family:'Share Tech Mono',monospace;font-size:.6rem;letter-spacing:.3em;color:var(--red);text-transform:uppercase;margin-bottom:1.5rem;border:1px solid rgba(255,45,45,0.3);padding:.3rem .8rem}
.hero-tag::before{content:'';width:6px;height:6px;background:var(--red);border-radius:50%;animation:blink 1.2s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
.hero-h{font-family:'Bebas Neue',sans-serif;font-size:clamp(3.5rem,10vw,7rem);line-height:.9;letter-spacing:.03em;margin-bottom:1rem}
.hero-h .line1{display:block;color:var(--white)}
.hero-h .line2{display:block;color:var(--red);text-shadow:0 0 40px var(--red-glow)}
.hero-sub{font-size:1rem;font-weight:500;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-bottom:2rem}
.hero-stats{display:flex;gap:2rem;flex-wrap:wrap}
.stat{display:flex;flex-direction:column}
.stat-n{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;color:var(--gold);line-height:1}
.stat-l{font-size:.65rem;letter-spacing:.2em;color:var(--muted);text-transform:uppercase}

/* WRAP */
.wrap{max-width:600px;margin:0 auto;padding:0 1.5rem 6rem}

/* PROGRESS */
.progress{display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:2.5rem;padding:1.5rem 0}
.prog-step{display:flex;flex-direction:column;align-items:center;gap:.4rem}
.prog-dot{width:36px;height:36px;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:1rem;color:rgba(245,245,245,0.25);transition:all .3s;position:relative}
.prog-dot.active{border-color:var(--red);color:var(--white);background:var(--red);box-shadow:0 0 20px var(--red-glow)}
.prog-dot.done{border-color:rgba(255,215,0,0.5);color:var(--gold)}
.prog-label{font-size:.55rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);font-family:'Share Tech Mono',monospace}
.prog-label.active{color:var(--red)}
.prog-line{width:50px;height:1px;background:var(--border);margin-bottom:1.2rem}
.prog-line.done{background:rgba(255,215,0,0.4)}

/* SECTION LABEL */
.slbl{font-family:'Share Tech Mono',monospace;font-size:.6rem;letter-spacing:.3em;text-transform:uppercase;color:var(--red);margin-bottom:1rem;display:flex;align-items:center;gap:.6rem}
.slbl::after{content:'';flex:1;height:1px;background:var(--border)}

/* SERVICE CARDS */
.svc-grid{display:grid;gap:.6rem;margin-bottom:1.5rem}
.svc{border:1px solid var(--border);background:var(--card);padding:1.1rem 1.3rem;cursor:pointer;display:flex;align-items:center;gap:1rem;transition:all .22s;position:relative;overflow:hidden}
.svc::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--red);transform:scaleX(0);transition:transform .22s;transform-origin:left}
.svc:hover{border-color:rgba(255,45,45,0.4);background:rgba(22,22,22,0.8);transform:translateX(4px)}
.svc:hover::after{transform:scaleX(1)}
.svc.sel{border-color:var(--red);background:var(--red-dim)}
.svc.sel::after{transform:scaleX(1)}
.svc-ico{font-size:1.6rem;width:40px;text-align:center;flex-shrink:0}
.svc-inf{flex:1}
.svc-n{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:.05em;color:var(--white);line-height:1}
.svc-d{font-family:'Share Tech Mono',monospace;font-size:.62rem;color:var(--muted);margin-top:2px}
.svc-p{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;color:var(--gold)}

/* CALENDAR */
.cal{margin-bottom:1.5rem}
.cal-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem}
.cal-m{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:.08em;color:var(--white)}
.cal-nav{background:none;border:1px solid var(--border);color:var(--muted);width:32px;height:32px;cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center;transition:all .2s}
.cal-nav:hover{border-color:var(--red);color:var(--red)}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.cal-dl{text-align:center;font-family:'Share Tech Mono',monospace;font-size:.55rem;letter-spacing:.1em;color:var(--muted);text-transform:uppercase;padding:4px 0}
.cal-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:600;color:rgba(245,245,245,0.4);cursor:pointer;border:1px solid transparent;transition:all .18s;position:relative}
.cal-day:hover:not(.past):not(.empty):not(.blocked){border-color:rgba(255,45,45,0.4);color:var(--white);background:rgba(255,45,45,0.08)}
.cal-day.sel{background:var(--red);color:var(--white);font-weight:700;border-color:var(--red);box-shadow:0 0 15px var(--red-glow)}
.cal-day.past{opacity:.18;cursor:not-allowed}
.cal-day.empty{cursor:default}
.cal-day.today-cl:not(.sel){color:var(--gold)}
.cal-day.blocked{opacity:.2;cursor:not-allowed;background:rgba(255,45,45,0.05)}

/* SLOTS */
.slots-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.4rem;margin-bottom:1.5rem}
.slot{padding:.55rem 0;text-align:center;font-family:'Share Tech Mono',monospace;font-size:.72rem;border:1px solid var(--border);cursor:pointer;color:var(--muted);transition:all .18s}
.slot:hover:not(.taken){border-color:rgba(255,45,45,0.4);color:var(--white);background:rgba(255,45,45,0.06)}
.slot.sel-h{background:var(--red);border-color:var(--red);color:var(--white);box-shadow:0 0 12px var(--red-glow)}
.slot.taken{opacity:.18;cursor:not-allowed;text-decoration:line-through}

/* FORM */
.fg{margin-bottom:1rem}
.fl{display:block;font-family:'Share Tech Mono',monospace;font-size:.6rem;letter-spacing:.25em;text-transform:uppercase;color:var(--muted);margin-bottom:.4rem}
.fi{width:100%;background:var(--card);border:1px solid var(--border);color:var(--white);font-family:'Rajdhani',sans-serif;font-size:1rem;font-weight:500;padding:.8rem 1rem;outline:none;transition:all .2s}
.fi:focus{border-color:var(--red);background:rgba(255,45,45,0.04)}
.fi::placeholder{color:rgba(245,245,245,0.15)}
.fi-sm{width:100%;background:var(--card);border:1px solid var(--border);color:var(--white);font-family:'Rajdhani',sans-serif;font-size:.9rem;padding:.55rem .8rem;outline:none;transition:all .2s}
.fi-sm:focus{border-color:var(--red)}
.fi-sm::placeholder{color:rgba(245,245,245,0.15)}

/* RECAP */
.recap{border:1px solid var(--border);background:var(--card);padding:1.2rem;margin-bottom:1.2rem;position:relative;overflow:hidden}
.recap::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:var(--red)}
.recap-row{display:flex;justify-content:space-between;align-items:center;padding:.3rem 0;font-size:.9rem;border-bottom:1px solid rgba(255,255,255,0.04)}
.recap-row:last-child{border-bottom:none}
.recap-k{font-family:'Share Tech Mono',monospace;font-size:.6rem;letter-spacing:.15em;color:var(--muted);text-transform:uppercase}
.recap-v{font-weight:600;color:var(--white)}
.recap-v.gold{color:var(--gold);font-family:'Bebas Neue',sans-serif;font-size:1.1rem}

/* BUTTONS */
.btn{width:100%;background:var(--red);border:none;color:var(--white);font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:.15em;text-transform:uppercase;padding:1rem;cursor:pointer;transition:all .2s;margin-top:.4rem;display:flex;align-items:center;justify-content:center;gap:.5rem;box-shadow:0 4px 20px var(--red-glow)}
.btn:hover{background:#ff1a1a;box-shadow:0 4px 30px var(--red-glow),0 0 60px rgba(255,45,45,0.2)}
.btn:disabled{opacity:.3;cursor:not-allowed;box-shadow:none}
.btn-ghost{background:none;border:1px solid var(--border);color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:.8rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;padding:.7rem;cursor:pointer;transition:all .2s;margin-top:.6rem;display:block;width:100%;text-align:center}
.btn-ghost:hover{border-color:var(--muted);color:var(--white)}
.btn-sm{background:none;border:1px solid var(--border);color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:.7rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;padding:.3rem .8rem;cursor:pointer;transition:all .2s;white-space:nowrap}
.btn-sm:hover{border-color:var(--red);color:var(--red)}
.btn-sm.red{border-color:rgba(255,45,45,0.3);color:rgba(255,45,45,0.6)}
.btn-sm.red:hover{border-color:var(--red);color:var(--red)}
.btn-icon{background:none;border:none;cursor:pointer;color:var(--muted);font-size:1rem;padding:.2rem .4rem;transition:color .2s}
.btn-icon:hover{color:var(--gold)}
.btn-icon.red:hover{color:var(--red)}

/* CONFIRMATION */
.conf{text-align:center;padding:3rem 1rem}
.conf-ico{width:80px;height:80px;border:2px solid var(--red);display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 1.5rem;background:var(--red-dim);animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 20px var(--red-glow)}50%{box-shadow:0 0 40px var(--red-glow),0 0 60px rgba(255,45,45,0.2)}}
.conf-t{font-family:'Bebas Neue',sans-serif;font-size:2.5rem;letter-spacing:.05em;color:var(--white);margin-bottom:.4rem}
.conf-sub{color:var(--muted);font-size:.95rem;font-weight:500;margin-bottom:2rem;line-height:1.6;letter-spacing:.05em}
.es{font-family:'Share Tech Mono',monospace;font-size:.68rem;margin-top:.7rem;letter-spacing:.05em;padding:.4rem .9rem;border:1px solid;display:inline-block}
.es.ok{color:#4ade80;border-color:rgba(74,222,128,.3);background:rgba(74,222,128,.05)}
.es.err{color:var(--red);border-color:rgba(255,45,45,.3);background:var(--red-dim)}
.es.sending{color:var(--gold);border-color:rgba(255,215,0,.3);background:var(--gold-dim)}

/* ADMIN LOGIN */
.alog{max-width:360px;margin:5rem auto;padding:0 1.5rem;text-align:center}
.alog-ico{font-size:3rem;margin-bottom:1rem}
.alog-t{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:.08em;color:var(--white);margin-bottom:.3rem}
.alog-s{font-family:'Share Tech Mono',monospace;font-size:.6rem;letter-spacing:.2em;color:var(--muted);margin-bottom:2rem}
.cin{width:100%;background:var(--card);border:1px solid var(--border);border-bottom:2px solid var(--red);color:var(--red);font-family:'Bebas Neue',sans-serif;font-size:2.5rem;letter-spacing:.6em;text-align:center;padding:1rem;outline:none}
.cin:focus{border-color:var(--red);box-shadow:0 4px 20px var(--red-glow)}
.errmsg{font-family:'Share Tech Mono',monospace;color:var(--red);font-size:.7rem;margin-top:.4rem;letter-spacing:.1em}

/* ADMIN */
.aw{max-width:720px;margin:0 auto;padding:2rem 1.5rem 6rem}
.tabs{display:flex;border-bottom:1px solid var(--border);margin-bottom:2rem;overflow-x:auto;gap:0}
.tab{padding:.8rem 1.3rem;font-family:'Bebas Neue',sans-serif;font-size:.85rem;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;margin-bottom:-1px;white-space:nowrap}
.tab:hover{color:var(--white)}
.tab.on{color:var(--red);border-bottom-color:var(--red)}
.badge{background:var(--red-dim);border:1px solid rgba(255,45,45,0.3);color:var(--red);font-family:'Share Tech Mono',monospace;font-size:.55rem;letter-spacing:.1em;padding:.15rem .5rem;margin-left:.5rem}
.badge.gold{border-color:rgba(255,215,0,.3);color:var(--gold);background:var(--gold-dim)}

/* RDV */
.rgt{font-family:'Share Tech Mono',monospace;font-size:.58rem;letter-spacing:.3em;text-transform:uppercase;color:var(--muted);margin:1.5rem 0 .7rem;padding-bottom:.4rem;border-bottom:1px solid var(--border)}
.rc{border:1px solid var(--border);background:var(--card);padding:.9rem 1.1rem;margin-bottom:.5rem;display:flex;align-items:center;gap:.85rem;transition:all .2s;position:relative;overflow:hidden}
.rc::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--red);transform:scaleY(0);transition:transform .2s}
.rc:hover{background:#1a1a1a}
.rc:hover::before{transform:scaleY(1)}
.rt{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;color:var(--red);min-width:58px;text-align:center;line-height:1}
.rdivider{width:1px;height:36px;background:var(--border)}
.ri{flex:1}
.rn{font-size:.95rem;font-weight:700;color:var(--white);letter-spacing:.03em}
.rm{font-family:'Share Tech Mono',monospace;font-size:.62rem;color:var(--muted);margin-top:2px}
.rtag{font-family:'Share Tech Mono',monospace;font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;border:1px solid var(--border);color:var(--muted);padding:.15rem .5rem;flex-shrink:0}
.delbtn{background:none;border:1px solid rgba(255,45,45,0.2);color:rgba(255,45,45,0.4);width:26px;height:26px;cursor:pointer;font-size:.72rem;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
.delbtn:hover{background:var(--red-dim);border-color:var(--red);color:var(--red)}
.empty-st{text-align:center;padding:4rem 0;color:var(--muted);font-family:'Share Tech Mono',monospace;font-size:.75rem;letter-spacing:.2em}

/* DISPO */
.dp-wrap{display:flex;flex-direction:column;gap:1.5rem}
.dp-card{border:1px solid var(--border);background:var(--card);padding:1.3rem}
.dp-title{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:.08em;color:var(--white);margin-bottom:.2rem}
.dp-sub{font-family:'Share Tech Mono',monospace;font-size:.62rem;color:var(--muted);margin-bottom:1.1rem;line-height:1.6;letter-spacing:.05em}
.row-bw{display:flex;align-items:center;justify-content:space-between;gap:.8rem;flex-wrap:wrap;margin-bottom:.2rem}
.ac-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:.7rem}
.acd{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,0.06);transition:all .18s;color:rgba(245,245,245,0.4);position:relative}
.acd:hover:not(.ap):not(.ae){border-color:rgba(255,45,45,0.4);color:var(--white);background:rgba(255,45,45,0.06)}
.acd.ab{background:rgba(255,45,45,0.1);border-color:rgba(255,45,45,0.3);color:rgba(255,45,45,0.6)}
.acd.ap{opacity:.15;cursor:not-allowed}
.acd.ae{cursor:default}
.acd.atd{color:var(--gold)}
.dot{position:absolute;bottom:2px;right:2px;width:4px;height:4px;border-radius:50%;background:var(--red)}
.st-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.4rem}
.st{padding:.5rem 0;text-align:center;font-family:'Share Tech Mono',monospace;font-size:.68rem;border:1px solid rgba(255,255,255,0.06);cursor:pointer;color:rgba(245,245,245,0.28);transition:all .18s}
.st.on{border-color:rgba(255,45,45,0.4);background:rgba(255,45,45,0.08);color:var(--white)}
.st:hover{border-color:rgba(255,45,45,0.3);color:rgba(245,245,245,0.7)}
.hint{font-family:'Share Tech Mono',monospace;font-size:.62rem;color:var(--muted);letter-spacing:.05em;margin-top:.8rem}

/* PRESTATIONS ADMIN */
.svc-admin-list{display:flex;flex-direction:column;gap:.5rem;margin-bottom:1.2rem}
.svc-admin-row{border:1px solid var(--border);background:var(--card);padding:.85rem 1rem;display:flex;align-items:center;gap:.8rem;transition:background .2s}
.svc-admin-row:hover{background:#1a1a1a}
.svc-edit-form{border:1px solid rgba(255,45,45,0.3);background:rgba(255,45,45,0.04);padding:1.2rem;margin-bottom:.8rem;display:flex;flex-direction:column;gap:.8rem}
.svc-edit-form .row{display:flex;gap:.7rem;flex-wrap:wrap}
.svc-edit-form .row>*{flex:1;min-width:110px}
.icon-picker{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.2rem}
.icon-opt{width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;border:1px solid var(--border);cursor:pointer;transition:all .18s}
.icon-opt:hover{border-color:rgba(255,45,45,0.4);background:var(--red-dim)}
.icon-opt.sel{border-color:var(--red);background:var(--red-dim)}
.add-svc-btn{border:1px dashed var(--border);background:none;color:var(--muted);font-family:'Rajdhani',sans-serif;font-weight:600;font-size:.78rem;letter-spacing:.2em;text-transform:uppercase;padding:.8rem;cursor:pointer;width:100%;transition:all .2s;text-align:center}
.add-svc-btn:hover{border-color:rgba(255,45,45,0.4);color:var(--red)}

/* LOADING */
.loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5rem 0;gap:1rem}
.spinner{width:32px;height:32px;border:2px solid var(--border);border-top-color:var(--red);border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.loading-t{font-family:'Share Tech Mono',monospace;font-size:.65rem;letter-spacing:.25em;color:var(--muted);text-transform:uppercase}

/* IBOX */
.ibox{border:1px solid rgba(255,215,0,.2);background:var(--gold-dim);padding:.9rem 1.1rem;margin-bottom:1.2rem;font-family:'Share Tech Mono',monospace;font-size:.7rem;color:rgba(245,245,245,0.5);line-height:1.75}
.ibox a{color:var(--gold);text-decoration:none}
.ibox a:hover{text-decoration:underline}
.ibox code{color:var(--gold)}

/* ANIMATIONS */
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.fade-up{animation:fadeUp .4s ease forwards}

@media(max-width:480px){
  .slots-grid,.st-grid{grid-template-columns:repeat(3,1fr)}
  .logo-t{font-size:1.6rem}
  .rc{flex-wrap:wrap}
  .tab{padding:.6rem .9rem;font-size:.75rem}
  .hero-h{font-size:3rem}
  .hero-stats{gap:1.5rem}
}
`;

export default function App() {
  const today=new Date();
  const MONTHS=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const CAL_LBL=["Lu","Ma","Me","Je","Ve","Sa","Di"];

  const [view,setView]=useState("client");
  const [adminTab,setAdminTab]=useState("rdv");
  const [loading,setLoading]=useState(true);
  const [rdvList,setRdvList]=useState([]);
  const [blockedDays,setBlockedDays]=useState(new Set());
  const [activeSlots,setActiveSlots]=useState(new Set());
  const [services,setServices]=useState([]);
  const [aCode,setACode]=useState("");
  const [aErr,setAErr]=useState(false);

  const [step,setStep]=useState(1);
  const [svc,setSvc]=useState(null);
  const [sDate,setSDate]=useState(null);
  const [sHour,setSHour]=useState(null);
  const [nom,setNom]=useState("");
  const [tel,setTel]=useState("");
  const [mail,setMail]=useState("");
  const [done,setDone]=useState(false);
  const [eSt,setESt]=useState(null);

  const [cM,setCM]=useState(today.getMonth());
  const [cY,setCY]=useState(today.getFullYear());
  const [dM,setDM]=useState(today.getMonth());
  const [dY,setDY]=useState(today.getFullYear());

  const [editingId,setEditingId]=useState(null);
  const [editForm,setEditForm]=useState({});
  const [addingNew,setAddingNew]=useState(false);
  const [newForm,setNewForm]=useState({id:"",label:"",duration:"30",price:"",icon:"✂️"});
  const [svcSaving,setSvcSaving]=useState(false);

  const sbOk=SUPABASE_URL!=="VOTRE_SUPABASE_URL";

  const loadAll=useCallback(async()=>{
    setLoading(true);
    if(!sbOk){
      try{const raw=localStorage.getItem("lc2");if(raw){const p=JSON.parse(raw);if(p.rdv){setRdvList(p.rdv);p.rdv.forEach(schedRem);}if(p.bd)setBlockedDays(new Set(p.bd));if(p.as)setActiveSlots(new Set(p.as));if(p.services)setServices(p.services);else setServices([{id:"coupe",label:"Coupe Homme",duration:30,price:"15€",icon:"✂️",position:0},{id:"degrade",label:"Dégradé",duration:45,price:"20€",icon:"⚡",position:1},{id:"barbe",label:"Barbe",duration:20,price:"10€",icon:"🪒",position:2}]);}else{setServices([{id:"coupe",label:"Coupe Homme",duration:30,price:"15€",icon:"✂️",position:0},{id:"degrade",label:"Dégradé",duration:45,price:"20€",icon:"⚡",position:1},{id:"barbe",label:"Barbe",duration:20,price:"10€",icon:"🪒",position:2}]);setActiveSlots(new Set(DEFAULT_SLOTS));}}catch{}
      setLoading(false);return;
    }
    const[rdv,bd,as_,svc_]=await Promise.all([sbGet("rdv","order=date.asc,hour.asc"),sbGet("blocked_days"),sbGet("active_slots"),sbGet("services","order=position.asc")]);
    setRdvList(rdv||[]);(rdv||[]).forEach(schedRem);
    setBlockedDays(new Set((bd||[]).map(r=>r.day)));
    setActiveSlots(new Set((as_||[]).map(r=>r.hour)));
    setServices(svc_||[]);
    setLoading(false);
  },[sbOk]);

  useEffect(()=>{loadAll();},[loadAll]);

  function fallback(rdv,bd,as_,svcs){if(sbOk)return;try{localStorage.setItem("lc2",JSON.stringify({rdv,bd:[...bd],as:[...as_],services:svcs}));}catch{}}

  async function book(){
    if(!nom.trim()||!tel.trim()||!mail.trim())return;
    const payload={service:svc,date:fmt(sDate),hour:sHour,name:nom.trim(),phone:tel.trim(),email:mail.trim()};
    let saved;
    if(sbOk){saved=await sbInsert("rdv",payload);}
    else{saved={...payload,id:Date.now()};const nl=[...rdvList,saved];setRdvList(nl);fallback(nl,blockedDays,activeSlots,services);}
    if(saved){schedRem(saved);if(sbOk)setRdvList(l=>[...l,saved]);}
    setDone(true);setESt("sending");
    const ok=await sendMail({to_email:mail,to_name:nom,service:svc?.label,date:fmtL(fmt(sDate)),hour:sHour,price:svc?.price,type:"confirmation"});
    setESt(ok?"ok":"err");
  }

  async function delRdv(id){cancelRem(id);const nl=rdvList.filter(r=>r.id!==id);setRdvList(nl);if(sbOk)await sbDelete("rdv",`id=eq.${id}`);else fallback(nl,blockedDays,activeSlots,services);}
  async function toggleBlock(ds){const nb=new Set(blockedDays);if(nb.has(ds)){nb.delete(ds);if(sbOk)await sbDelete("blocked_days",`day=eq.${ds}`);}else{nb.add(ds);if(sbOk)await sbUpsert("blocked_days",{day:ds});}setBlockedDays(nb);if(!sbOk)fallback(rdvList,nb,activeSlots,services);}
  async function clearAllBlocked(){setBlockedDays(new Set());if(sbOk){for(const d of blockedDays)await sbDelete("blocked_days",`day=eq.${d}`);}else fallback(rdvList,new Set(),activeSlots,services);}
  async function toggleSlot(h){const ns=new Set(activeSlots);if(ns.has(h)){ns.delete(h);if(sbOk)await sbDelete("active_slots",`hour=eq.${h}`);}else{ns.add(h);if(sbOk)await sbUpsert("active_slots",{hour:h});}setActiveSlots(ns);if(!sbOk)fallback(rdvList,blockedDays,ns,services);}
  async function setAllSlots(slots){const ns=new Set(slots);setActiveSlots(ns);if(sbOk){for(const h of ALL_SLOTS)await sbDelete("active_slots",`hour=eq.${h}`);for(const h of ns)await sbUpsert("active_slots",{hour:h});}else fallback(rdvList,blockedDays,ns,services);}

  function startEdit(s){setEditingId(s.id);setEditForm({label:s.label,duration:String(s.duration),price:s.price,icon:s.icon});setAddingNew(false);}
  async function saveEdit(id){setSvcSaving(true);const u={label:editForm.label,duration:parseInt(editForm.duration)||30,price:editForm.price,icon:editForm.icon};if(sbOk)await sbUpdate("services",`id=eq.${id}`,u);const ns=services.map(s=>s.id===id?{...s,...u}:s);setServices(ns);if(!sbOk)fallback(rdvList,blockedDays,activeSlots,ns);setEditingId(null);setSvcSaving(false);}
  async function deleteService(id){if(sbOk)await sbDelete("services",`id=eq.${id}`);const ns=services.filter(s=>s.id!==id);setServices(ns);if(!sbOk)fallback(rdvList,blockedDays,activeSlots,ns);}
  async function saveNew(){if(!newForm.label.trim()||!newForm.price.trim())return;setSvcSaving(true);const p={id:newForm.id.trim()||`svc_${Date.now()}`,label:newForm.label.trim(),duration:parseInt(newForm.duration)||30,price:newForm.price.trim(),icon:newForm.icon,position:services.length};if(sbOk)await sbUpsert("services",p);const ns=[...services,p];setServices(ns);if(!sbOk)fallback(rdvList,blockedDays,activeSlots,ns);setNewForm({id:"",label:"",duration:"30",price:"",icon:"✂️"});setAddingNew(false);setSvcSaving(false);}

  function resetBooking(){setStep(1);setSvc(null);setSDate(null);setSHour(null);setNom("");setTel("");setMail("");setDone(false);setESt(null);}

  const cDays=getDays(cY,cM),cFirst=(new Date(cY,cM,1).getDay()+6)%7;
  const dDays=getDays(dY,dM),dFirst=(new Date(dY,dM,1).getDay()+6)%7;
  const taken=sDate?rdvList.filter(r=>r.date===fmt(sDate)).map(r=>r.hour):[];
  const avail=ALL_SLOTS.filter(h=>activeSlots.has(h));
  const grouped=rdvList.reduce((a,r)=>{(a[r.date]=a[r.date]||[]).push(r);return a;},{});
  const sDates=Object.keys(grouped).sort();
  const ejsOk=EMAILJS_SERVICE_ID!=="VOTRE_SERVICE_ID";

  function CalNav({m,y,setM,setY}){return(<div className="cal-hdr"><button className="cal-nav" onClick={()=>{if(m===0){setM(11);setY(v=>v-1);}else setM(v=>v-1);}}>‹</button><div className="cal-m">{MONTHS[m]} {y}</div><button className="cal-nav" onClick={()=>{if(m===11){setM(0);setY(v=>v+1);}else setM(v=>v+1);}}>›</button></div>);}

  return(
    <>
      <style>{css}</style>
      <div className="app">

        {/* HEADER */}
        <header className="hdr">
          <div className="logo">
            <div className="logo-t">La Cave</div>
            <div className="logo-s">// Barber's</div>
          </div>
          {view==="client"
            ?<button className="hdr-btn" onClick={()=>{setView("adminLogin");setACode("");setAErr(false);}}>Pro Access</button>
            :<button className="hdr-btn" onClick={()=>setView("client")}>← Back</button>
          }
        </header>

        {/* CLIENT */}
        {view==="client"&&(
          <>
            <div className="hero">
              <div className="hero-bg"/>
              <div className="hero-tag">Réservation en ligne</div>
              <h1 className="hero-h">
                <span className="line1">Prends ton</span>
                <span className="line2">Rendez-vous</span>
              </h1>
              <p className="hero-sub">Choisis ta coupe. Choisis ton créneau. C'est tout.</p>
              <div className="hero-stats">
                <div className="stat"><span className="stat-n">100%</span><span className="stat-l">En ligne</span></div>
                <div className="stat"><span className="stat-n">0</span><span className="stat-l">Attente</span></div>
                <div className="stat"><span className="stat-n">24/7</span><span className="stat-l">Dispo</span></div>
              </div>
            </div>

            <div className="wrap">
              {loading?(
                <div className="loading"><div className="spinner"/><div className="loading-t">Chargement...</div></div>
              ):!done?(
                <>
                  {/* PROGRESS */}
                  <div className="progress">
                    {[{l:"Coupe"},{l:"Date"},{l:"Infos"}].map((s,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center"}}>
                        <div className="prog-step">
                          <div className={`prog-dot ${step===i+1?"active":step>i+1?"done":""}`}>{step>i+1?"✓":i+1}</div>
                          <div className={`prog-label ${step===i+1?"active":""}`}>{s.l}</div>
                        </div>
                        {i<2&&<div className={`prog-line ${step>i+1?"done":""}`}/>}
                      </div>
                    ))}
                  </div>

                  {/* STEP 1 */}
                  {step===1&&(
                    <div className="fade-up">
                      <div className="slbl">Choisis ta prestation</div>
                      {services.length===0
                        ?<div style={{color:"var(--muted)",fontSize:".85rem",marginBottom:"2rem",textAlign:"center",fontFamily:"Share Tech Mono,monospace",letterSpacing:".1em"}}>Aucune prestation disponible.</div>
                        :<div className="svc-grid">
                          {[...services].sort((a,b)=>(a.position||0)-(b.position||0)).map(s=>(
                            <div key={s.id} className={`svc ${svc?.id===s.id?"sel":""}`} onClick={()=>setSvc(s)}>
                              <div className="svc-ico">{s.icon}</div>
                              <div className="svc-inf"><div className="svc-n">{s.label}</div><div className="svc-d">{s.duration} min</div></div>
                              <div className="svc-p">{s.price}</div>
                            </div>
                          ))}
                        </div>
                      }
                      <button className="btn" disabled={!svc} onClick={()=>setStep(2)}>Valider la prestation →</button>
                    </div>
                  )}

                  {/* STEP 2 */}
                  {step===2&&(
                    <div className="fade-up">
                      <div className="slbl">Choisis ta date</div>
                      <div className="cal">
                        <CalNav m={cM} y={cY} setM={setCM} setY={setCY}/>
                        <div className="cal-grid">
                          {CAL_LBL.map(d=><div key={d} className="cal-dl">{d}</div>)}
                          {Array(cFirst).fill(null).map((_,i)=><div key={`e${i}`} className="cal-day empty"/>)}
                          {cDays.map(day=>{const ds=fmt(day);const isPast=day<new Date(today.getFullYear(),today.getMonth(),today.getDate());const isBlk=blockedDays.has(ds);const isSel=sDate&&ds===fmt(sDate);const isT=ds===fmt(today);return(<div key={ds} className={`cal-day ${isPast?"past":""} ${isBlk?"blocked":""} ${isSel?"sel":""} ${isT&&!isSel?"today-cl":""}`} onClick={()=>!isPast&&!isBlk&&setSDate(day)} title={isBlk?"Fermé ce jour":""}>{day.getDate()}</div>);})}
                        </div>
                      </div>
                      {sDate&&(
                        <>
                          <div className="slbl">Choisis ton heure — {fmtS(sDate)}</div>
                          {avail.length===0
                            ?<div style={{color:"var(--muted)",fontSize:".8rem",marginBottom:"1.5rem",fontFamily:"Share Tech Mono,monospace"}}>Aucun créneau dispo.</div>
                            :<div className="slots-grid">{avail.map(h=><div key={h} className={`slot ${taken.includes(h)?"taken":""} ${sHour===h?"sel-h":""}`} onClick={()=>!taken.includes(h)&&setSHour(h)}>{h}</div>)}</div>
                          }
                        </>
                      )}
                      <button className="btn" disabled={!sDate||!sHour} onClick={()=>setStep(3)}>Valider le créneau →</button>
                      <button className="btn-ghost" onClick={()=>setStep(1)}>← Retour</button>
                    </div>
                  )}

                  {/* STEP 3 */}
                  {step===3&&(
                    <div className="fade-up">
                      <div className="slbl">Tes infos</div>
                      <div className="recap">
                        <div className="recap-row"><span className="recap-k">Prestation</span><span className="recap-v">{svc?.label}</span></div>
                        <div className="recap-row"><span className="recap-k">Date</span><span className="recap-v">{sDate&&fmtS(sDate)}</span></div>
                        <div className="recap-row"><span className="recap-k">Heure</span><span className="recap-v">{sHour}</span></div>
                        <div className="recap-row"><span className="recap-k">Prix</span><span className="recap-v gold">{svc?.price}</span></div>
                      </div>
                      <div className="fg"><label className="fl">Ton prénom</label><input className="fi" placeholder="Prénom Nom" value={nom} onChange={e=>setNom(e.target.value)}/></div>
                      <div className="fg"><label className="fl">Ton téléphone</label><input className="fi" placeholder="06 00 00 00 00" value={tel} onChange={e=>setTel(e.target.value)}/></div>
                      <div className="fg">
                        <label className="fl">Ton email <span style={{color:"var(--red)"}}>*</span></label>
                        <input className="fi" type="email" placeholder="ton@email.com" value={mail} onChange={e=>setMail(e.target.value)}/>
                        <div style={{fontFamily:"Share Tech Mono,monospace",fontSize:".6rem",color:"var(--muted)",marginTop:".35rem",letterSpacing:".05em"}}>Pour recevoir ta confirmation</div>
                      </div>
                      <button className="btn" disabled={!nom.trim()||!tel.trim()||!mail.trim()} onClick={book}>Confirmer le RDV 🔥</button>
                      <button className="btn-ghost" onClick={()=>setStep(2)}>← Retour</button>
                    </div>
                  )}
                </>
              ):(
                <div className="conf fade-up">
                  <div className="conf-ico">✓</div>
                  <div className="conf-t">C'est validé !</div>
                  <div className="conf-sub">On t'attend le {sDate&&fmtS(sDate)} à {sHour}.<br/>À tout à l'heure chez La Cave. 💈</div>
                  <div className="recap" style={{textAlign:"left",maxWidth:300,margin:"0 auto 1.2rem"}}>
                    <div className="recap-row"><span className="recap-k">Prestation</span><span className="recap-v">{svc?.label}</span></div>
                    <div className="recap-row"><span className="recap-k">Prix</span><span className="recap-v gold">{svc?.price}</span></div>
                    <div className="recap-row"><span className="recap-k">Nom</span><span className="recap-v">{nom}</span></div>
                    <div className="recap-row"><span className="recap-k">Email</span><span className="recap-v">{mail}</span></div>
                  </div>
                  {eSt==="sending"&&<div className="es sending">// envoi confirmation...</div>}
                  {eSt==="ok"&&<div className="es ok">✓ Confirmation envoyée à {mail}</div>}
                  {eSt==="err"&&<div className="es err">⚠ Email non envoyé — config EmailJS</div>}
                  <button className="btn" style={{maxWidth:300,margin:"1.4rem auto 0"}} onClick={resetBooking}>Nouveau RDV</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ADMIN LOGIN */}
        {view==="adminLogin"&&(
          <div className="alog">
            <div className="alog-ico">🔐</div>
            <div className="alog-t">Pro Access</div>
            <div className="alog-s">// entrez votre code</div>
            <input className="cin" type="password" maxLength={4} placeholder="/////" value={aCode} onChange={e=>{setACode(e.target.value);setAErr(false);}} onKeyDown={e=>{if(e.key==="Enter"){if(aCode===ADMIN_CODE)setView("admin");else setAErr(true);}}}/>
            {aErr&&<div className="errmsg">// code incorrect</div>}
            <button className="btn" style={{marginTop:"1.4rem"}} onClick={()=>{if(aCode===ADMIN_CODE)setView("admin");else setAErr(true);}}>Accéder →</button>
          </div>
        )}

        {/* ADMIN */}
        {view==="admin"&&(
          <div className="aw">
            <div className="tabs">
              <div className={`tab ${adminTab==="rdv"?"on":""}`} onClick={()=>setAdminTab("rdv")}>Rendez-vous {rdvList.length>0&&<span className="badge">{rdvList.length}</span>}</div>
              <div className={`tab ${adminTab==="dispo"?"on":""}`} onClick={()=>setAdminTab("dispo")}>Disponibilités {blockedDays.size>0&&<span className="badge">{blockedDays.size} bloqué{blockedDays.size>1?"s":""}</span>}</div>
              <div className={`tab ${adminTab==="svc"?"on":""}`} onClick={()=>setAdminTab("svc")}>Prestations <span className="badge gold">{services.length}</span></div>
            </div>

            {/* RDV */}
            {adminTab==="rdv"&&(
              <>
                {!ejsOk&&<div className="ibox">⚠ EmailJS non configuré — <a href="https://emailjs.com" target="_blank">emailjs.com</a> — variables : <code>to_email, to_name, service, date, hour, price, type</code></div>}
                {loading?<div className="loading"><div className="spinner"/></div>
                  :rdvList.length===0?<div className="empty-st">// aucun rdv pour le moment</div>
                  :sDates.map(ds=>{const[y,m,d]=ds.split("-").map(Number);const sorted=[...grouped[ds]].sort((a,b)=>a.hour.localeCompare(b.hour));return(<div key={ds}><div className="rgt">{fmtS(new Date(y,m-1,d))}</div>{sorted.map(r=>(<div key={r.id} className="rc"><div className="rt">{r.hour}</div><div className="rdivider"/><div className="ri"><div className="rn">{r.name}</div><div className="rm">{r.phone} · {r.email}</div></div><div className="rtag">{r.service?.label}</div><button className="delbtn" onClick={()=>delRdv(r.id)}>✕</button></div>))}</div>);})}
              </>
            )}

            {/* DISPO */}
            {adminTab==="dispo"&&(
              <div className="dp-wrap">
                <div className="dp-card">
                  <div className="row-bw"><div className="dp-title">🗓 Jours bloqués</div>{blockedDays.size>0&&<button className="btn-sm red" onClick={clearAllBlocked}>Tout débloquer</button>}</div>
                  <div className="dp-sub">// cliquez sur un jour pour bloquer ou débloquer. rouge = fermé.</div>
                  <div className="cal"><CalNav m={dM} y={dY} setM={setDM} setY={setDY}/><div className="ac-grid">{CAL_LBL.map(d=><div key={d} className="cal-dl">{d}</div>)}{Array(dFirst).fill(null).map((_,i)=><div key={`e${i}`} className="acd ae"/>)}{dDays.map(day=>{const ds=fmt(day);const isPast=day<new Date(today.getFullYear(),today.getMonth(),today.getDate());const isBlk=blockedDays.has(ds);const isT=ds===fmt(today);const nb=(grouped[ds]||[]).length;return(<div key={ds} className={`acd ${isPast?"ap":""} ${isBlk?"ab":""} ${isT?"atd":""}`} onClick={()=>!isPast&&toggleBlock(ds)} title={isBlk?"Débloquer":isPast?"Passé":nb>0?`${nb} RDV`:"Bloquer"}>{day.getDate()}{nb>0&&!isBlk&&<span className="dot"/>}</div>);})}</div></div>
                  {blockedDays.size>0&&<div className="hint">// {blockedDays.size} jour{blockedDays.size>1?"s":""} bloqué{blockedDays.size>1?"s":""}</div>}
                </div>
                <div className="dp-card">
                  <div className="row-bw"><div className="dp-title">🕐 Créneaux horaires</div><div style={{display:"flex",gap:".5rem"}}><button className="btn-sm" onClick={()=>setAllSlots(ALL_SLOTS)}>Tout activer</button><button className="btn-sm" onClick={()=>setAllSlots(DEFAULT_SLOTS)}>Reset</button></div></div>
                  <div className="dp-sub">// rouge = ouvert. cliquez pour activer/désactiver.</div>
                  <div className="st-grid">{ALL_SLOTS.map(h=><div key={h} className={`st ${activeSlots.has(h)?"on":""}`} onClick={()=>toggleSlot(h)}>{h}</div>)}</div>
                  <div className="hint">// {activeSlots.size} créneau{activeSlots.size>1?"x":""} actif{activeSlots.size>1?"s":""}</div>
                </div>
              </div>
            )}

            {/* PRESTATIONS */}
            {adminTab==="svc"&&(
              <div>
                <div className="dp-card" style={{marginBottom:"1.2rem"}}>
                  <div className="dp-title">💈 Gérer les prestations</div>
                  <div className="dp-sub">// modifiez nom, durée, prix, icône. Les clients voient les changements en temps réel.</div>
                </div>
                <div className="svc-admin-list">
                  {[...services].sort((a,b)=>(a.position||0)-(b.position||0)).map(s=>(
                    <div key={s.id}>
                      {editingId===s.id?(
                        <div className="svc-edit-form">
                          <div className="row">
                            <div><div className="fl">Nom</div><input className="fi-sm" value={editForm.label} onChange={e=>setEditForm(f=>({...f,label:e.target.value}))} placeholder="Ex: Coupe"/></div>
                            <div><div className="fl">Durée (min)</div><input className="fi-sm" type="number" min="5" value={editForm.duration} onChange={e=>setEditForm(f=>({...f,duration:e.target.value}))}/></div>
                            <div><div className="fl">Prix</div><input className="fi-sm" value={editForm.price} onChange={e=>setEditForm(f=>({...f,price:e.target.value}))} placeholder="Ex: 15€"/></div>
                          </div>
                          <div><div className="fl">Icône</div><div className="icon-picker">{ICONS.map(ic=><div key={ic} className={`icon-opt ${editForm.icon===ic?"sel":""}`} onClick={()=>setEditForm(f=>({...f,icon:ic}))}>{ic}</div>)}</div></div>
                          <div style={{display:"flex",gap:".6rem"}}><button className="btn-sm" style={{flex:1}} onClick={()=>saveEdit(s.id)} disabled={svcSaving}>{svcSaving?"...":"✓ Enregistrer"}</button><button className="btn-sm red" onClick={()=>setEditingId(null)}>Annuler</button></div>
                        </div>
                      ):(
                        <div className="svc-admin-row">
                          <div className="svc-ico">{s.icon}</div>
                          <div className="svc-inf"><div className="svc-n">{s.label}</div><div className="svc-d">{s.duration} min</div></div>
                          <div className="svc-p" style={{marginRight:".8rem"}}>{s.price}</div>
                          <button className="btn-icon" onClick={()=>startEdit(s)}>✏️</button>
                          <button className="btn-icon red" onClick={()=>deleteService(s.id)}>🗑️</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {addingNew?(
                  <div className="svc-edit-form">
                    <div style={{fontFamily:"Share Tech Mono,monospace",fontSize:".65rem",letterSpacing:".15em",color:"var(--red)",textTransform:"uppercase",marginBottom:".2rem"}}>// nouvelle prestation</div>
                    <div className="row">
                      <div><div className="fl">Nom</div><input className="fi-sm" value={newForm.label} onChange={e=>setNewForm(f=>({...f,label:e.target.value}))} placeholder="Ex: Coloration"/></div>
                      <div><div className="fl">Durée (min)</div><input className="fi-sm" type="number" min="5" value={newForm.duration} onChange={e=>setNewForm(f=>({...f,duration:e.target.value}))}/></div>
                      <div><div className="fl">Prix</div><input className="fi-sm" value={newForm.price} onChange={e=>setNewForm(f=>({...f,price:e.target.value}))} placeholder="Ex: 25€"/></div>
                    </div>
                    <div><div className="fl">Icône</div><div className="icon-picker">{ICONS.map(ic=><div key={ic} className={`icon-opt ${newForm.icon===ic?"sel":""}`} onClick={()=>setNewForm(f=>({...f,icon:ic}))}>{ic}</div>)}</div></div>
                    <div style={{display:"flex",gap:".6rem"}}><button className="btn-sm" style={{flex:1}} onClick={saveNew} disabled={svcSaving||!newForm.label.trim()||!newForm.price.trim()}>{svcSaving?"...":"✓ Ajouter"}</button><button className="btn-sm red" onClick={()=>setAddingNew(false)}>Annuler</button></div>
                  </div>
                ):(
                  <button className="add-svc-btn" onClick={()=>{setAddingNew(true);setEditingId(null);}}>+ Ajouter une prestation</button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
