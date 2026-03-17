import { useState, useEffect, useCallback } from "react";

// ============================================================
//  ⚙️  CONFIG SUPABASE
//  1. Créer compte gratuit → https://supabase.com
//  2. Nouveau projet → Settings > API
//  3. Copier "Project URL" et "anon public key" ci-dessous
//  4. Dans SQL Editor, exécuter ce script :
// ------------------------------------------------------------
//  CREATE TABLE rdv (
//    id bigint primary key generated always as identity,
//    service jsonb, date text, hour text,
//    name text, phone text, email text,
//    created_at timestamptz default now()
//  );
//  CREATE TABLE blocked_days (day text primary key);
//  CREATE TABLE active_slots (hour text primary key);
//  CREATE TABLE services (
//    id text primary key, label text, duration int,
//    price text, icon text, position int default 0
//  );
//  ALTER TABLE rdv ENABLE ROW LEVEL SECURITY;
//  ALTER TABLE blocked_days ENABLE ROW LEVEL SECURITY;
//  ALTER TABLE active_slots ENABLE ROW LEVEL SECURITY;
//  ALTER TABLE services ENABLE ROW LEVEL SECURITY;
//  CREATE POLICY "pub" ON rdv FOR ALL USING (true) WITH CHECK (true);
//  CREATE POLICY "pub" ON blocked_days FOR ALL USING (true) WITH CHECK (true);
//  CREATE POLICY "pub" ON active_slots FOR ALL USING (true) WITH CHECK (true);
//  CREATE POLICY "pub" ON services FOR ALL USING (true) WITH CHECK (true);
//  INSERT INTO services VALUES
//    ('coupe','Coupe Homme',30,'15€','✂️',0),
//    ('degrade','Dégradé',45,'20€','⚡',1),
//    ('barbe','Barbe',20,'10€','🪒',2);
//  INSERT INTO active_slots VALUES
//    ('09:00'),('09:30'),('10:00'),('10:30'),('11:00'),('11:30'),('12:00'),
//    ('14:00'),('14:30'),('15:00'),('15:30'),('16:00'),('16:30'),('17:00'),('17:30'),('18:00');
// ============================================================
const SUPABASE_URL = "https://jdougyltrwvnhicjyyfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_mfeiz_Zh_JmkHKotF2r9Xg_kaplDs6S";

// ============================================================
//  ⚙️  CONFIG EMAILJS  → https://emailjs.com
//  Template variables : {{to_email}} {{to_name}} {{service}}
//                       {{date}} {{hour}} {{price}} {{type}}
// ============================================================
const EMAILJS_SERVICE_ID  = "VOTRE_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "VOTRE_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY  = "VOTRE_PUBLIC_KEY";

const ADMIN_CODE = "1234";

// ── Supabase fetch helpers ───────────────────────────────────
const SB_HEADERS = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};
async function sbGet(table, qs = "") {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, { headers: SB_HEADERS });
    return r.ok ? r.json() : [];
  } catch { return []; }
}
async function sbInsert(table, data) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST", headers: { ...SB_HEADERS, "Prefer": "return=representation" },
      body: JSON.stringify(data),
    });
    const arr = await r.json();
    return Array.isArray(arr) ? arr[0] : arr;
  } catch { return null; }
}
async function sbDelete(table, qs) {
  try { await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, { method: "DELETE", headers: SB_HEADERS }); } catch {}
}
async function sbUpsert(table, data) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST", headers: { ...SB_HEADERS, "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify(data),
    });
  } catch {}
}
async function sbUpdate(table, qs, data) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, {
      method: "PATCH", headers: { ...SB_HEADERS, "Prefer": "return=representation" },
      body: JSON.stringify(data),
    });
  } catch {}
}

// ── Constantes ───────────────────────────────────────────────
const ALL_SLOTS = [
  "07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00"
];
const ICONS = ["✂️","⚡","🪒","💈","🧴","🧖","👑","🔥","💎","🌿","⭐","🎯"];

// ── Helpers date ─────────────────────────────────────────────
function getDays(y,m){const a=[],d=new Date(y,m,1);while(d.getMonth()===m){a.push(new Date(d));d.setDate(d.getDate()+1);}return a;}
function fmt(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function fmtS(d){const j=["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"],m=["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Aoû","Sep","Oct","Nov","Déc"];return `${j[d.getDay()]} ${d.getDate()} ${m[d.getMonth()]}`;}
function fmtL(ds){const[y,m,d]=ds.split("-").map(Number),o=new Date(y,m-1,d);const j=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],mo=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];return `${j[o.getDay()]} ${d} ${mo[m-1]} ${y}`;}

// ── EmailJS ──────────────────────────────────────────────────
async function loadEJS(){if(window.emailjs)return;await new Promise((r,j)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";s.onload=r;s.onerror=j;document.head.appendChild(s);});window.emailjs.init({publicKey:EMAILJS_PUBLIC_KEY});}
async function sendMail(p){try{await loadEJS();await window.emailjs.send(EMAILJS_SERVICE_ID,EMAILJS_TEMPLATE_ID,p);return true;}catch{return false;}}
const TM={};
function schedRem(rdv){
  const[y,m,d]=rdv.date.split("-").map(Number),[hh,mm]=rdv.hour.split(":").map(Number);
  const appt=new Date(y,m-1,d,hh,mm),now=Date.now();
  [{t:new Date(appt-86400000),l:"rappel veille"},{t:new Date(y,m-1,d,8,0),l:"rappel matin"}].forEach(({t,l})=>{
    const delay=t-now;if(delay<=0)return;
    const k=`${rdv.id}_${l}`;if(TM[k])clearTimeout(TM[k]);
    TM[k]=setTimeout(()=>sendMail({to_email:rdv.email,to_name:rdv.name,service:rdv.service?.label,date:fmtL(rdv.date),hour:rdv.hour,price:rdv.service?.price,type:l}),delay);
  });
}
function cancelRem(id){Object.keys(TM).filter(k=>k.startsWith(`${id}_`)).forEach(k=>{clearTimeout(TM[k]);delete TM[k];});}

// ── CSS ──────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Barlow:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0f0c09;color:#f0e6d3;font-family:'Barlow',sans-serif;min-height:100vh}
.app{min-height:100vh;background:#0f0c09;background-image:radial-gradient(ellipse at 15% 15%,rgba(180,140,80,.08) 0%,transparent 55%),radial-gradient(ellipse at 85% 85%,rgba(120,80,30,.06) 0%,transparent 55%)}

/* HEADER */
.hdr{border-bottom:1px solid rgba(180,140,80,.2);padding:0 2rem;display:flex;align-items:center;justify-content:space-between;background:rgba(15,12,9,.96);position:sticky;top:0;z-index:200;backdrop-filter:blur(12px)}
.logo{display:flex;flex-direction:column;padding:1.1rem 0}
.logo-t{font-family:'Playfair Display',serif;font-size:1.75rem;font-weight:900;color:#c9a84c;letter-spacing:.05em;line-height:1}
.logo-s{font-size:.6rem;letter-spacing:.38em;color:rgba(201,168,76,.55);text-transform:uppercase;margin-top:3px}
.hdr-btn{background:none;border:1px solid rgba(201,168,76,.3);color:#c9a84c;font-family:'Barlow',sans-serif;font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;padding:.45rem 1.1rem;cursor:pointer;transition:all .2s}
.hdr-btn:hover{background:rgba(201,168,76,.1);border-color:#c9a84c}

/* HERO */
.hero{text-align:center;padding:3.5rem 2rem 2.5rem}
.hero-ey{font-size:.68rem;letter-spacing:.4em;color:#c9a84c;text-transform:uppercase;margin-bottom:.9rem;opacity:.75}
.hero-h{font-family:'Playfair Display',serif;font-size:clamp(2.2rem,5.5vw,4rem);font-weight:900;color:#f0e6d3;line-height:1.05;margin-bottom:.8rem}
.hero-h span{color:#c9a84c;font-style:italic}
.hero-div{width:50px;height:1px;background:linear-gradient(90deg,transparent,#c9a84c,transparent);margin:1.2rem auto}
.hero-d{color:rgba(240,230,211,.45);font-size:.88rem;letter-spacing:.04em;font-weight:300}

/* WRAP */
.wrap{max-width:640px;margin:0 auto;padding:0 1.5rem 6rem}

/* LOADING */
.loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5rem 0;gap:1rem}
.spinner{width:32px;height:32px;border:2px solid rgba(201,168,76,.2);border-top-color:#c9a84c;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.loading-t{font-size:.75rem;letter-spacing:.2em;color:rgba(201,168,76,.5);text-transform:uppercase}

/* STEPS */
.steps{display:flex;align-items:center;justify-content:center;margin-bottom:2.5rem}
.sdot{width:30px;height:30px;border-radius:50%;border:1px solid rgba(201,168,76,.3);display:flex;align-items:center;justify-content:center;font-size:.72rem;color:rgba(201,168,76,.4);font-family:'Playfair Display',serif;transition:all .3s}
.sdot.active{border-color:#c9a84c;background:#c9a84c;color:#0f0c09;font-weight:700}
.sdot.done{border-color:rgba(201,168,76,.55);color:#c9a84c}
.sline{width:38px;height:1px;background:rgba(201,168,76,.18)}

/* LABELS */
.lbl{font-size:.62rem;letter-spacing:.35em;text-transform:uppercase;color:#c9a84c;margin-bottom:1.1rem;opacity:.7}

/* SERVICES */
.svc-grid{display:grid;gap:.75rem;margin-bottom:2rem}
.svc{border:1px solid rgba(201,168,76,.15);background:rgba(201,168,76,.03);padding:1.15rem 1.4rem;cursor:pointer;display:flex;align-items:center;gap:1.1rem;transition:all .22s;position:relative;overflow:hidden}
.svc::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:#c9a84c;transform:scaleY(0);transition:transform .22s}
.svc:hover,.svc.sel{border-color:rgba(201,168,76,.45);background:rgba(201,168,76,.07)}
.svc.sel::before{transform:scaleY(1)}
.svc-ico{font-size:1.4rem;width:36px;text-align:center}
.svc-inf{flex:1}
.svc-n{font-family:'Playfair Display',serif;font-size:.98rem;color:#f0e6d3;margin-bottom:1px}
.svc-d{font-size:.72rem;color:rgba(240,230,211,.38);letter-spacing:.04em}
.svc-p{font-family:'Playfair Display',serif;font-size:1.05rem;color:#c9a84c}

/* CALENDAR */
.cal{margin-bottom:2rem}
.cal-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:.9rem}
.cal-m{font-family:'Playfair Display',serif;font-size:.98rem;color:#f0e6d3;letter-spacing:.04em}
.cal-nav{background:none;border:1px solid rgba(201,168,76,.2);color:#c9a84c;width:28px;height:28px;cursor:pointer;font-size:.8rem;display:flex;align-items:center;justify-content:center;transition:all .2s}
.cal-nav:hover{background:rgba(201,168,76,.1)}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.cal-dl{text-align:center;font-size:.58rem;letter-spacing:.1em;color:rgba(201,168,76,.45);text-transform:uppercase;padding:4px 0}
.cal-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:.78rem;color:rgba(240,230,211,.5);cursor:pointer;border:1px solid transparent;transition:all .18s;border-radius:2px;position:relative}
.cal-day:hover:not(.past):not(.empty):not(.blocked){border-color:rgba(201,168,76,.28);color:#f0e6d3;background:rgba(201,168,76,.05)}
.cal-day.sel{background:#c9a84c;color:#0f0c09;font-weight:700;border-color:#c9a84c}
.cal-day.past{opacity:.18;cursor:not-allowed}
.cal-day.empty{cursor:default}
.cal-day.today-cl:not(.sel){color:#c9a84c}
.cal-day.blocked{opacity:.28;cursor:not-allowed;background:rgba(200,80,80,.06);border-color:rgba(200,80,80,.15);color:rgba(200,80,80,.5)}

/* SLOTS */
.slots-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.45rem;margin-bottom:2rem}
.slot{padding:.55rem 0;text-align:center;font-size:.78rem;border:1px solid rgba(201,168,76,.15);cursor:pointer;color:rgba(240,230,211,.65);transition:all .18s;letter-spacing:.04em}
.slot:hover:not(.taken){border-color:rgba(201,168,76,.38);background:rgba(201,168,76,.05);color:#f0e6d3}
.slot.sel-h{background:#c9a84c;border-color:#c9a84c;color:#0f0c09;font-weight:600}
.slot.taken{opacity:.22;cursor:not-allowed;text-decoration:line-through}

/* FORM */
.fg{margin-bottom:1.15rem}
.fl{display:block;font-size:.62rem;letter-spacing:.28em;text-transform:uppercase;color:rgba(201,168,76,.68);margin-bottom:.45rem}
.fi{width:100%;background:rgba(201,168,76,.04);border:1px solid rgba(201,168,76,.2);color:#f0e6d3;font-family:'Barlow',sans-serif;font-size:1rem;padding:.82rem 1rem;outline:none;transition:border-color .2s}
.fi:focus{border-color:rgba(201,168,76,.58);background:rgba(201,168,76,.07)}
.fi::placeholder{color:rgba(240,230,211,.18)}
.fi-sm{width:100%;background:rgba(201,168,76,.04);border:1px solid rgba(201,168,76,.2);color:#f0e6d3;font-family:'Barlow',sans-serif;font-size:.88rem;padding:.6rem .8rem;outline:none;transition:border-color .2s}
.fi-sm:focus{border-color:rgba(201,168,76,.5)}
.fi-sm::placeholder{color:rgba(240,230,211,.18)}

/* SUMMARY */
.sum{border:1px solid rgba(201,168,76,.2);background:rgba(201,168,76,.04);padding:1.15rem 1.4rem;margin-bottom:1.4rem}
.sr{display:flex;justify-content:space-between;align-items:center;padding:.32rem 0;font-size:.83rem;border-bottom:1px solid rgba(201,168,76,.08)}
.sr:last-child{border-bottom:none}
.sk{color:rgba(240,230,211,.42);font-size:.68rem;letter-spacing:.14em;text-transform:uppercase}
.sv{color:#f0e6d3}
.sv.g{color:#c9a84c;font-family:'Playfair Display',serif}

/* BUTTONS */
.btn{width:100%;background:#c9a84c;border:none;color:#0f0c09;font-family:'Barlow',sans-serif;font-weight:700;font-size:.78rem;letter-spacing:.28em;text-transform:uppercase;padding:.95rem;cursor:pointer;transition:all .2s;margin-top:.4rem;display:flex;align-items:center;justify-content:center;gap:.5rem}
.btn:hover{background:#dab85a}
.btn:disabled{opacity:.35;cursor:not-allowed}
.btn-g{background:none;border:1px solid rgba(201,168,76,.2);color:rgba(240,230,211,.45);font-family:'Barlow',sans-serif;font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;padding:.65rem 1.4rem;cursor:pointer;transition:all .2s;margin-top:.75rem;display:block;width:100%;text-align:center}
.btn-g:hover{border-color:rgba(201,168,76,.38);color:#f0e6d3}
.btn-sm{background:none;border:1px solid rgba(201,168,76,.22);color:rgba(201,168,76,.75);font-family:'Barlow',sans-serif;font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;padding:.35rem .85rem;cursor:pointer;transition:all .2s;white-space:nowrap}
.btn-sm:hover{background:rgba(201,168,76,.08);border-color:#c9a84c;color:#c9a84c}
.btn-sm.red{border-color:rgba(200,80,80,.22);color:rgba(200,80,80,.6)}
.btn-sm.red:hover{background:rgba(200,80,80,.08);border-color:rgba(200,80,80,.5);color:#e07070}
.btn-icon{background:none;border:none;cursor:pointer;color:rgba(240,230,211,.4);font-size:1rem;padding:.2rem .4rem;transition:color .2s;line-height:1}
.btn-icon:hover{color:#c9a84c}
.btn-icon.red:hover{color:#e07070}

/* CONFIRM */
.conf{text-align:center;padding:3rem 1rem}
.conf-ico{width:68px;height:68px;border:1px solid #c9a84c;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.7rem;margin:0 auto 1.4rem;background:rgba(201,168,76,.08)}
.conf-t{font-family:'Playfair Display',serif;font-size:1.75rem;color:#f0e6d3;margin-bottom:.45rem}
.conf-s{color:rgba(240,230,211,.42);font-size:.84rem;font-weight:300;margin-bottom:1.8rem;line-height:1.7}
.es{font-size:.73rem;margin-top:.7rem;letter-spacing:.05em;padding:.45rem .9rem;border:1px solid;display:inline-block}
.es.ok{color:#7ec8a0;border-color:rgba(126,200,160,.28);background:rgba(126,200,160,.05)}
.es.err{color:#e07070;border-color:rgba(224,112,112,.28);background:rgba(224,112,112,.05)}
.es.sending{color:#c9a84c;border-color:rgba(201,168,76,.28);background:rgba(201,168,76,.05)}

/* ADMIN LOGIN */
.alog{max-width:340px;margin:5rem auto;padding:0 1.5rem;text-align:center}
.at{font-family:'Playfair Display',serif;font-size:1.55rem;color:#f0e6d3;margin-bottom:.45rem}
.as{color:rgba(240,230,211,.32);font-size:.78rem;letter-spacing:.1em;margin-bottom:1.8rem}
.cin{width:100%;background:rgba(201,168,76,.04);border:1px solid rgba(201,168,76,.2);border-bottom:2px solid rgba(201,168,76,.45);color:#c9a84c;font-family:'Playfair Display',serif;font-size:2rem;letter-spacing:.5em;text-align:center;padding:1rem;outline:none}
.cin:focus{border-color:#c9a84c}
.errmsg{color:#e07070;font-size:.73rem;margin-top:.45rem;letter-spacing:.1em}

/* ADMIN WRAP */
.aw{max-width:720px;margin:0 auto;padding:2rem 1.5rem 6rem}
.tabs{display:flex;border-bottom:1px solid rgba(201,168,76,.15);margin-bottom:2rem;overflow-x:auto}
.tab{padding:.75rem 1.2rem;font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(240,230,211,.35);cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;margin-bottom:-1px;font-family:'Barlow',sans-serif;white-space:nowrap}
.tab:hover{color:rgba(240,230,211,.65)}
.tab.on{color:#c9a84c;border-bottom-color:#c9a84c}
.badge{background:rgba(201,168,76,.13);border:1px solid rgba(201,168,76,.28);color:#c9a84c;font-size:.65rem;letter-spacing:.12em;padding:.15rem .55rem;margin-left:.6rem}
.badge.red{border-color:rgba(200,80,80,.28);color:#e07070;background:rgba(200,80,80,.06)}

/* RDV CARDS */
.rgt{font-size:.6rem;letter-spacing:.3em;text-transform:uppercase;color:rgba(201,168,76,.45);margin:1.4rem 0 .7rem;padding-bottom:.4rem;border-bottom:1px solid rgba(201,168,76,.1)}
.rc{border:1px solid rgba(201,168,76,.12);background:rgba(201,168,76,.03);padding:.9rem 1.1rem;margin-bottom:.5rem;display:flex;align-items:center;gap:.85rem;transition:background .2s}
.rc:hover{background:rgba(201,168,76,.06)}
.rt{font-family:'Playfair Display',serif;font-size:1.2rem;color:#c9a84c;min-width:55px;text-align:center}
.rdivider{width:1px;height:36px;background:rgba(201,168,76,.14)}
.ri{flex:1}
.rn{font-size:.9rem;color:#f0e6d3;margin-bottom:2px}
.rm{font-size:.68rem;color:rgba(240,230,211,.36);letter-spacing:.04em}
.rtag{font-size:.6rem;letter-spacing:.13em;text-transform:uppercase;border:1px solid rgba(201,168,76,.2);color:rgba(201,168,76,.6);padding:.16rem .5rem;flex-shrink:0}
.delbtn{background:none;border:1px solid rgba(200,80,80,.18);color:rgba(200,80,80,.42);width:26px;height:26px;cursor:pointer;font-size:.72rem;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
.delbtn:hover{background:rgba(200,80,80,.1);border-color:rgba(200,80,80,.42);color:#e07070}
.empty{text-align:center;padding:3.5rem 0;color:rgba(240,230,211,.2);font-size:.86rem;letter-spacing:.1em}

/* DISPO */
.dp-wrap{display:flex;flex-direction:column;gap:1.8rem}
.dp-card{border:1px solid rgba(201,168,76,.15);background:rgba(201,168,76,.03);padding:1.4rem}
.dp-title{font-family:'Playfair Display',serif;font-size:1.05rem;color:#f0e6d3;margin-bottom:.25rem}
.dp-sub{font-size:.74rem;color:rgba(240,230,211,.36);margin-bottom:1.2rem;line-height:1.55}
.row-bw{display:flex;align-items:center;justify-content:space-between;gap:.8rem;flex-wrap:wrap;margin-bottom:.25rem}
.ac-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:.8rem}
.acd{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:.76rem;cursor:pointer;border:1px solid rgba(201,168,76,.1);transition:all .18s;border-radius:2px;color:rgba(240,230,211,.48);position:relative}
.acd:hover:not(.ap):not(.ae){border-color:rgba(201,168,76,.28);color:#f0e6d3;background:rgba(201,168,76,.04)}
.acd.ab{background:rgba(200,80,80,.1);border-color:rgba(200,80,80,.28);color:rgba(200,80,80,.65)}
.acd.ab:hover{background:rgba(200,80,80,.16)}
.acd.ap{opacity:.18;cursor:not-allowed}
.acd.ae{cursor:default}
.acd.atd{color:#c9a84c}
.dot{position:absolute;bottom:2px;right:2px;width:4px;height:4px;border-radius:50%;background:#c9a84c}
.st-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.4rem}
.st{padding:.5rem 0;text-align:center;font-size:.75rem;border:1px solid rgba(201,168,76,.12);cursor:pointer;color:rgba(240,230,211,.32);transition:all .18s;border-radius:1px}
.st.on{border-color:rgba(201,168,76,.42);background:rgba(201,168,76,.08);color:#f0e6d3}
.st:hover{border-color:rgba(201,168,76,.28);color:rgba(240,230,211,.7)}
.hint{font-size:.7rem;color:rgba(240,230,211,.32);letter-spacing:.04em;margin-top:.9rem}

/* PRESTATIONS */
.svc-admin-list{display:flex;flex-direction:column;gap:.6rem;margin-bottom:1.4rem}
.svc-admin-row{border:1px solid rgba(201,168,76,.15);background:rgba(201,168,76,.03);padding:.9rem 1rem;display:flex;align-items:center;gap:.8rem;transition:background .2s}
.svc-admin-row:hover{background:rgba(201,168,76,.06)}
.svc-edit-form{border:1px solid rgba(201,168,76,.25);background:rgba(201,168,76,.06);padding:1.2rem;margin-bottom:1rem;display:flex;flex-direction:column;gap:.8rem}
.svc-edit-form .row{display:flex;gap:.7rem;flex-wrap:wrap}
.svc-edit-form .row > *{flex:1;min-width:120px}
.icon-picker{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.2rem}
.icon-opt{width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;border:1px solid rgba(201,168,76,.15);cursor:pointer;transition:all .18s;border-radius:2px}
.icon-opt:hover{border-color:rgba(201,168,76,.4);background:rgba(201,168,76,.08)}
.icon-opt.sel{border-color:#c9a84c;background:rgba(201,168,76,.15)}
.add-svc-btn{border:1px dashed rgba(201,168,76,.25);background:none;color:rgba(201,168,76,.6);font-family:'Barlow',sans-serif;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;padding:.8rem;cursor:pointer;width:100%;transition:all .2s;text-align:center}
.add-svc-btn:hover{border-color:rgba(201,168,76,.5);color:#c9a84c;background:rgba(201,168,76,.04)}

/* INFO BOX */
.ibox{border:1px solid rgba(201,168,76,.18);background:rgba(201,168,76,.04);padding:.9rem 1.1rem;margin-bottom:1.3rem;font-size:.78rem;color:rgba(240,230,211,.48);line-height:1.75}
.ibox a{color:#c9a84c;text-decoration:none}
.ibox a:hover{text-decoration:underline}
.ibox code{color:#c9a84c;font-size:.82em}

@media(max-width:480px){
  .slots-grid,.st-grid{grid-template-columns:repeat(3,1fr)}
  .logo-t{font-size:1.4rem}
  .rc{flex-wrap:wrap}
  .tab{padding:.6rem .8rem;font-size:.62rem}
  .svc-edit-form .row{flex-direction:column}
}
`;

// ════════════════════════════════════════════════════════════
//  APP
// ════════════════════════════════════════════════════════════
export default function App() {
  const today   = new Date();
  const MONTHS  = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const CAL_LBL = ["Lu","Ma","Me","Je","Ve","Sa","Di"];

  // ── State ──
  const [view, setView]         = useState("client");
  const [adminTab, setAdminTab] = useState("rdv");
  const [loading, setLoading]   = useState(true);

  const [rdvList, setRdvList]         = useState([]);
  const [blockedDays, setBlockedDays] = useState(new Set());
  const [activeSlots, setActiveSlots] = useState(new Set());
  const [services, setServices]       = useState([]);

  const [aCode, setACode] = useState("");
  const [aErr, setAErr]   = useState(false);

  // Booking
  const [step, setStep]   = useState(1);
  const [svc, setSvc]     = useState(null);
  const [sDate, setSDate] = useState(null);
  const [sHour, setSHour] = useState(null);
  const [nom, setNom]     = useState("");
  const [tel, setTel]     = useState("");
  const [mail, setMail]   = useState("");
  const [done, setDone]   = useState(false);
  const [eSt, setESt]     = useState(null);

  const [cM, setCM] = useState(today.getMonth());
  const [cY, setCY] = useState(today.getFullYear());
  const [dM, setDM] = useState(today.getMonth());
  const [dY, setDY] = useState(today.getFullYear());

  // Prestation editor
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm]   = useState({});
  const [addingNew, setAddingNew] = useState(false);
  const [newForm, setNewForm]     = useState({ id:"", label:"", duration:"30", price:"", icon:"✂️" });
  const [svcSaving, setSvcSaving] = useState(false);

  const sbOk = SUPABASE_URL !== "VOTRE_SUPABASE_URL";

  // ── Load all data ──────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    if (!sbOk) {
      // Fallback localStorage si Supabase pas encore configuré
      try {
        const raw = localStorage.getItem("lc_fallback");
        if (raw) {
          const p = JSON.parse(raw);
          if (p.rdv)      { setRdvList(p.rdv); p.rdv.forEach(schedRem); }
          if (p.bd)       setBlockedDays(new Set(p.bd));
          if (p.as)       setActiveSlots(new Set(p.as));
          if (p.services) setServices(p.services);
          else setServices([
            {id:"coupe",label:"Coupe Homme",duration:30,price:"15€",icon:"✂️",position:0},
            {id:"degrade",label:"Dégradé",duration:45,price:"20€",icon:"⚡",position:1},
            {id:"barbe",label:"Barbe",duration:20,price:"10€",icon:"🪒",position:2},
          ]);
        } else {
          setServices([
            {id:"coupe",label:"Coupe Homme",duration:30,price:"15€",icon:"✂️",position:0},
            {id:"degrade",label:"Dégradé",duration:45,price:"20€",icon:"⚡",position:1},
            {id:"barbe",label:"Barbe",duration:20,price:"10€",icon:"🪒",position:2},
          ]);
          setActiveSlots(new Set(["09:00","09:30","10:00","10:30","11:00","11:30","12:00","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00"]));
        }
      } catch {}
      setLoading(false);
      return;
    }
    const [rdv, bd, as_, svc_] = await Promise.all([
      sbGet("rdv", "order=date.asc,hour.asc"),
      sbGet("blocked_days"),
      sbGet("active_slots"),
      sbGet("services", "order=position.asc"),
    ]);
    setRdvList(rdv || []);
    (rdv || []).forEach(schedRem);
    setBlockedDays(new Set((bd||[]).map(r=>r.day)));
    setActiveSlots(new Set((as_||[]).map(r=>r.hour)));
    setServices(svc_ || []);
    setLoading(false);
  }, [sbOk]);

  useEffect(() => { loadAll(); }, [loadAll]);

  function fallbackSave(rdv, bd, as_, svcs) {
    if (sbOk) return;
    try { localStorage.setItem("lc_fallback", JSON.stringify({rdv, bd:[...bd], as:[...as_], services:svcs})); } catch {}
  }

  // ── RDV ───────────────────────────────────────────────────
  async function book() {
    if (!nom.trim()||!tel.trim()||!mail.trim()) return;
    const payload = { service:svc, date:fmt(sDate), hour:sHour, name:nom.trim(), phone:tel.trim(), email:mail.trim() };
    let saved;
    if (sbOk) {
      saved = await sbInsert("rdv", payload);
    } else {
      saved = { ...payload, id: Date.now() };
      const nl = [...rdvList, saved];
      setRdvList(nl);
      fallbackSave(nl, blockedDays, activeSlots, services);
    }
    if (saved) { schedRem(saved); if (sbOk) setRdvList(l=>[...l, saved]); }
    setDone(true); setESt("sending");
    const ok = await sendMail({to_email:mail,to_name:nom,service:svc?.label,date:fmtL(fmt(sDate)),hour:sHour,price:svc?.price,type:"confirmation"});
    setESt(ok?"ok":"err");
  }

  async function delRdv(id) {
    cancelRem(id);
    const nl = rdvList.filter(r=>r.id!==id);
    setRdvList(nl);
    if (sbOk) await sbDelete("rdv", `id=eq.${id}`);
    else fallbackSave(nl, blockedDays, activeSlots, services);
  }

  // ── Blocked days ──────────────────────────────────────────
  async function toggleBlock(ds) {
    const nb = new Set(blockedDays);
    if (nb.has(ds)) {
      nb.delete(ds);
      if (sbOk) await sbDelete("blocked_days", `day=eq.${ds}`);
    } else {
      nb.add(ds);
      if (sbOk) await sbUpsert("blocked_days", { day: ds });
    }
    setBlockedDays(nb);
    if (!sbOk) fallbackSave(rdvList, nb, activeSlots, services);
  }

  async function clearAllBlocked() {
    setBlockedDays(new Set());
    if (sbOk) { for (const d of blockedDays) await sbDelete("blocked_days", `day=eq.${d}`); }
    else fallbackSave(rdvList, new Set(), activeSlots, services);
  }

  // ── Active slots ──────────────────────────────────────────
  async function toggleSlot(h) {
    const ns = new Set(activeSlots);
    if (ns.has(h)) {
      ns.delete(h);
      if (sbOk) await sbDelete("active_slots", `hour=eq.${h}`);
    } else {
      ns.add(h);
      if (sbOk) await sbUpsert("active_slots", { hour: h });
    }
    setActiveSlots(ns);
    if (!sbOk) fallbackSave(rdvList, blockedDays, ns, services);
  }

  async function setAllSlots(slots) {
    const ns = new Set(slots);
    setActiveSlots(ns);
    if (sbOk) {
      for (const h of ALL_SLOTS) await sbDelete("active_slots", `hour=eq.${h}`);
      for (const h of ns) await sbUpsert("active_slots", { hour: h });
    } else fallbackSave(rdvList, blockedDays, ns, services);
  }

  // ── Services CRUD ─────────────────────────────────────────
  function startEdit(s) {
    setEditingId(s.id);
    setEditForm({ label: s.label, duration: String(s.duration), price: s.price, icon: s.icon });
    setAddingNew(false);
  }

  async function saveEdit(id) {
    setSvcSaving(true);
    const updated = { label: editForm.label, duration: parseInt(editForm.duration)||30, price: editForm.price, icon: editForm.icon };
    if (sbOk) {
      await sbUpdate("services", `id=eq.${id}`, updated);
    }
    const ns = services.map(s => s.id===id ? {...s,...updated} : s);
    setServices(ns);
    if (!sbOk) fallbackSave(rdvList, blockedDays, activeSlots, ns);
    setEditingId(null);
    setSvcSaving(false);
  }

  async function deleteService(id) {
    if (sbOk) await sbDelete("services", `id=eq.${id}`);
    const ns = services.filter(s=>s.id!==id);
    setServices(ns);
    if (!sbOk) fallbackSave(rdvList, blockedDays, activeSlots, ns);
  }

  async function saveNewService() {
    if (!newForm.label.trim()||!newForm.price.trim()) return;
    setSvcSaving(true);
    const payload = {
      id: newForm.id.trim() || `svc_${Date.now()}`,
      label: newForm.label.trim(),
      duration: parseInt(newForm.duration)||30,
      price: newForm.price.trim(),
      icon: newForm.icon,
      position: services.length,
    };
    if (sbOk) await sbUpsert("services", payload);
    const ns = [...services, payload];
    setServices(ns);
    if (!sbOk) fallbackSave(rdvList, blockedDays, activeSlots, ns);
    setNewForm({id:"",label:"",duration:"30",price:"",icon:"✂️"});
    setAddingNew(false);
    setSvcSaving(false);
  }

  function resetBooking() {
    setStep(1);setSvc(null);setSDate(null);setSHour(null);
    setNom("");setTel("");setMail("");setDone(false);setESt(null);
  }

  // ── Derived ───────────────────────────────────────────────
  const cDays  = getDays(cY, cM);
  const cFirst = (new Date(cY,cM,1).getDay()+6)%7;
  const dDays  = getDays(dY, dM);
  const dFirst = (new Date(dY,dM,1).getDay()+6)%7;
  const taken  = sDate ? rdvList.filter(r=>r.date===fmt(sDate)).map(r=>r.hour) : [];
  const avail  = ALL_SLOTS.filter(h=>activeSlots.has(h));
  const grouped = rdvList.reduce((a,r)=>{ (a[r.date]=a[r.date]||[]).push(r); return a; },{});
  const sDates  = Object.keys(grouped).sort();

  function CalNav({m,y,setM,setY}) {
    return (
      <div className="cal-hdr">
        <button className="cal-nav" onClick={()=>{if(m===0){setM(11);setY(v=>v-1);}else setM(v=>v-1);}}>‹</button>
        <div className="cal-m">{MONTHS[m]} {y}</div>
        <button className="cal-nav" onClick={()=>{if(m===11){setM(0);setY(v=>v+1);}else setM(v=>v+1);}}>›</button>
      </div>
    );
  }

  // ════════════ RENDER ════════════════════════════════════════
  return (
    <>
      <style>{css}</style>
      <div className="app">

        {/* HEADER */}
        <header className="hdr">
          <div className="logo">
            <div className="logo-t">La Cave</div>
            <div className="logo-s">Barbershop</div>
          </div>
          {view==="client"
            ? <button className="hdr-btn" onClick={()=>{setView("adminLogin");setACode("");setAErr(false);}}>Espace Pro</button>
            : <button className="hdr-btn" onClick={()=>setView("client")}>← Retour</button>
          }
        </header>

        {/* ═══ CLIENT ═══════════════════════════════════════ */}
        {view==="client" && (
          <>
            <div className="hero">
              <div className="hero-ey">Réservation en ligne</div>
              <h1 className="hero-h">Prenez <span>rendez-vous</span></h1>
              <div className="hero-div"/>
              <p className="hero-d">Choisissez votre prestation, votre créneau, c'est tout.</p>
            </div>
            <div className="wrap">
              {loading ? (
                <div className="loading"><div className="spinner"/><div className="loading-t">Chargement…</div></div>
              ) : !done ? (
                <>
                  <div className="steps">
                    {[1,2,3].map((s,i)=>(
                      <div key={s} style={{display:"flex",alignItems:"center"}}>
                        <div className={`sdot ${step===s?"active":step>s?"done":""}`}>{step>s?"✓":s}</div>
                        {i<2&&<div className="sline"/>}
                      </div>
                    ))}
                  </div>

                  {/* STEP 1 — Prestation */}
                  {step===1 && (
                    <>
                      <div className="lbl">Prestation</div>
                      {services.length===0
                        ? <div style={{color:"rgba(240,230,211,.3)",fontSize:".85rem",marginBottom:"2rem",textAlign:"center",letterSpacing:".05em"}}>Aucune prestation disponible pour le moment.</div>
                        : <div className="svc-grid">
                            {[...services].sort((a,b)=>(a.position||0)-(b.position||0)).map(s=>(
                              <div key={s.id} className={`svc ${svc?.id===s.id?"sel":""}`} onClick={()=>setSvc(s)}>
                                <div className="svc-ico">{s.icon}</div>
                                <div className="svc-inf"><div className="svc-n">{s.label}</div><div className="svc-d">{s.duration} min</div></div>
                                <div className="svc-p">{s.price}</div>
                              </div>
                            ))}
                          </div>
                      }
                      <button className="btn" disabled={!svc} onClick={()=>setStep(2)}>Continuer</button>
                    </>
                  )}

                  {/* STEP 2 — Date & Heure */}
                  {step===2 && (
                    <>
                      <div className="lbl">Date & Heure</div>
                      <div className="cal">
                        <CalNav m={cM} y={cY} setM={setCM} setY={setCY}/>
                        <div className="cal-grid">
                          {CAL_LBL.map(d=><div key={d} className="cal-dl">{d}</div>)}
                          {Array(cFirst).fill(null).map((_,i)=><div key={`e${i}`} className="cal-day empty"/>)}
                          {cDays.map(day=>{
                            const ds=fmt(day);
                            const isPast=day<new Date(today.getFullYear(),today.getMonth(),today.getDate());
                            const isBlk=blockedDays.has(ds);
                            const isSel=sDate&&ds===fmt(sDate);
                            const isT=ds===fmt(today);
                            return (
                              <div key={ds} className={`cal-day ${isPast?"past":""} ${isBlk?"blocked":""} ${isSel?"sel":""} ${isT&&!isSel?"today-cl":""}`}
                                onClick={()=>!isPast&&!isBlk&&setSDate(day)} title={isBlk?"Fermé ce jour":""}>
                                {day.getDate()}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {sDate && (
                        <>
                          <div className="lbl" style={{marginBottom:".7rem"}}>Créneaux — {fmtS(sDate)}</div>
                          {avail.length===0
                            ? <div style={{color:"rgba(240,230,211,.3)",fontSize:".82rem",marginBottom:"1.5rem"}}>Aucun créneau disponible.</div>
                            : <div className="slots-grid">
                                {avail.map(h=>(
                                  <div key={h} className={`slot ${taken.includes(h)?"taken":""} ${sHour===h?"sel-h":""}`}
                                    onClick={()=>!taken.includes(h)&&setSHour(h)}>{h}</div>
                                ))}
                              </div>
                          }
                        </>
                      )}
                      <button className="btn" disabled={!sDate||!sHour} onClick={()=>setStep(3)}>Continuer</button>
                      <button className="btn-g" onClick={()=>setStep(1)}>← Retour</button>
                    </>
                  )}

                  {/* STEP 3 — Infos */}
                  {step===3 && (
                    <>
                      <div className="lbl">Vos informations</div>
                      <div className="sum">
                        <div className="sr"><span className="sk">Prestation</span><span className="sv">{svc?.label}</span></div>
                        <div className="sr"><span className="sk">Date</span><span className="sv">{sDate&&fmtS(sDate)}</span></div>
                        <div className="sr"><span className="sk">Heure</span><span className="sv">{sHour}</span></div>
                        <div className="sr"><span className="sk">Prix</span><span className="sv g">{svc?.price}</span></div>
                      </div>
                      <div className="fg"><label className="fl">Votre nom</label><input className="fi" placeholder="Prénom Nom" value={nom} onChange={e=>setNom(e.target.value)}/></div>
                      <div className="fg"><label className="fl">Téléphone</label><input className="fi" placeholder="06 00 00 00 00" value={tel} onChange={e=>setTel(e.target.value)}/></div>
                      <div className="fg">
                        <label className="fl">Email <span style={{color:"#c9a84c"}}>*</span></label>
                        <input className="fi" type="email" placeholder="votre@email.com" value={mail} onChange={e=>setMail(e.target.value)}/>
                        <div style={{fontSize:".67rem",color:"rgba(240,230,211,.26)",marginTop:".35rem"}}>Pour recevoir votre confirmation et rappels</div>
                      </div>
                      <button className="btn" disabled={!nom.trim()||!tel.trim()||!mail.trim()} onClick={book}>Confirmer le rendez-vous</button>
                      <button className="btn-g" onClick={()=>setStep(2)}>← Retour</button>
                    </>
                  )}
                </>
              ) : (
                <div className="conf">
                  <div className="conf-ico">✓</div>
                  <div className="conf-t">C'est confirmé !</div>
                  <div className="conf-s">On vous attend le {sDate&&fmtS(sDate)} à {sHour}.<br/>À très bientôt chez La Cave. 🪒</div>
                  <div className="sum" style={{textAlign:"left",maxWidth:300,margin:"0 auto 1.2rem"}}>
                    <div className="sr"><span className="sk">Prestation</span><span className="sv">{svc?.label}</span></div>
                    <div className="sr"><span className="sk">Prix</span><span className="sv g">{svc?.price}</span></div>
                    <div className="sr"><span className="sk">Nom</span><span className="sv">{nom}</span></div>
                    <div className="sr"><span className="sk">Email</span><span className="sv">{mail}</span></div>
                  </div>
                  {eSt==="sending"&&<div className="es sending">📨 Envoi de la confirmation…</div>}
                  {eSt==="ok"&&<div className="es ok">✉️ Confirmation envoyée à {mail}</div>}
                  {eSt==="err"&&<div className="es err">⚠️ Email non envoyé — vérifiez la config EmailJS</div>}
                  <button className="btn" style={{maxWidth:300,margin:"1.4rem auto 0"}} onClick={resetBooking}>Nouveau rendez-vous</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══ ADMIN LOGIN ══════════════════════════════════ */}
        {view==="adminLogin" && (
          <div className="alog">
            <div style={{fontSize:"1.8rem",marginBottom:"1rem"}}>🔐</div>
            <div className="at">Espace Pro</div>
            <div className="as">Code d'accès</div>
            <input className="cin" type="password" maxLength={4} placeholder="••••" value={aCode}
              onChange={e=>{setACode(e.target.value);setAErr(false);}}
              onKeyDown={e=>{if(e.key==="Enter"){if(aCode===ADMIN_CODE)setView("admin");else setAErr(true);}}}/>
            {aErr&&<div className="errmsg">Code incorrect</div>}
            <button className="btn" style={{marginTop:"1.4rem"}} onClick={()=>{if(aCode===ADMIN_CODE)setView("admin");else setAErr(true);}}>Accéder</button>
          </div>
        )}

        {/* ═══ ADMIN ════════════════════════════════════════ */}
        {view==="admin" && (
          <div className="aw">
            {/* Tabs */}
            <div className="tabs">
              <div className={`tab ${adminTab==="rdv"?"on":""}`} onClick={()=>setAdminTab("rdv")}>
                Rendez-vous {rdvList.length>0&&<span className="badge">{rdvList.length}</span>}
              </div>
              <div className={`tab ${adminTab==="dispo"?"on":""}`} onClick={()=>setAdminTab("dispo")}>
                Disponibilités {blockedDays.size>0&&<span className="badge red">{blockedDays.size} bloqué{blockedDays.size>1?"s":""}</span>}
              </div>
              <div className={`tab ${adminTab==="svc"?"on":""}`} onClick={()=>setAdminTab("svc")}>
                Prestations <span className="badge">{services.length}</span>
              </div>
            </div>

            {/* ─── RDV ─── */}
            {adminTab==="rdv" && (
              <>
                {!sbOk&&(
                  <div className="ibox">
                    ⚠️ <strong style={{color:"#c9a84c"}}>Supabase non configuré</strong> — les données sont sauvegardées localement pour l'instant.<br/>
                    Configurez Supabase pour avoir accès depuis n'importe quel appareil → <a href="https://supabase.com" target="_blank">supabase.com</a>
                  </div>
                )}
                {loading
                  ? <div className="loading"><div className="spinner"/></div>
                  : rdvList.length===0
                    ? <div className="empty">Aucun rendez-vous pour le moment.</div>
                    : sDates.map(ds=>{
                        const [y,m,d]=ds.split("-").map(Number);
                        const sorted=[...grouped[ds]].sort((a,b)=>a.hour.localeCompare(b.hour));
                        return (
                          <div key={ds}>
                            <div className="rgt">{fmtS(new Date(y,m-1,d))}</div>
                            {sorted.map(r=>(
                              <div key={r.id} className="rc">
                                <div className="rt">{r.hour}</div>
                                <div className="rdivider"/>
                                <div className="ri">
                                  <div className="rn">{r.name}</div>
                                  <div className="rm">{r.phone} · {r.email}</div>
                                </div>
                                <div className="rtag">{r.service?.label}</div>
                                <button className="delbtn" onClick={()=>delRdv(r.id)} title="Supprimer">✕</button>
                              </div>
                            ))}
                          </div>
                        );
                      })
                }
              </>
            )}

            {/* ─── DISPONIBILITÉS ─── */}
            {adminTab==="dispo" && (
              <div className="dp-wrap">
                {/* Jours */}
                <div className="dp-card">
                  <div className="row-bw">
                    <div className="dp-title">🗓 Jours bloqués</div>
                    {blockedDays.size>0&&<button className="btn-sm red" onClick={clearAllBlocked}>Tout débloquer</button>}
                  </div>
                  <div className="dp-sub">Cliquez sur un jour pour le bloquer (rouge) ou débloquer. Les jours avec un point doré ont des RDV.</div>
                  <div className="cal">
                    <CalNav m={dM} y={dY} setM={setDM} setY={setDY}/>
                    <div className="ac-grid">
                      {CAL_LBL.map(d=><div key={d} className="cal-dl">{d}</div>)}
                      {Array(dFirst).fill(null).map((_,i)=><div key={`e${i}`} className="acd ae"/>)}
                      {dDays.map(day=>{
                        const ds=fmt(day);
                        const isPast=day<new Date(today.getFullYear(),today.getMonth(),today.getDate());
                        const isBlk=blockedDays.has(ds);
                        const isT=ds===fmt(today);
                        const nb=(grouped[ds]||[]).length;
                        return (
                          <div key={ds} className={`acd ${isPast?"ap":""} ${isBlk?"ab":""} ${isT?"atd":""}`}
                            onClick={()=>!isPast&&toggleBlock(ds)}
                            title={isBlk?"Cliquer pour débloquer":isPast?"Passé":nb>0?`${nb} RDV`:"Cliquer pour bloquer"}>
                            {day.getDate()}
                            {nb>0&&!isBlk&&<span className="dot"/>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {blockedDays.size>0&&<div className="hint">{blockedDays.size} jour{blockedDays.size>1?"s":""} bloqué{blockedDays.size>1?"s":""}</div>}
                </div>
                {/* Créneaux */}
                <div className="dp-card">
                  <div className="row-bw">
                    <div className="dp-title">🕐 Créneaux horaires</div>
                    <div style={{display:"flex",gap:".5rem"}}>
                      <button className="btn-sm" onClick={()=>setAllSlots(ALL_SLOTS)}>Tout activer</button>
                      <button className="btn-sm" onClick={()=>setAllSlots(["09:00","09:30","10:00","10:30","11:00","11:30","12:00","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00"])}>Réinitialiser</button>
                    </div>
                  </div>
                  <div className="dp-sub">Doré = ouvert. Cliquez pour activer ou désactiver un créneau.</div>
                  <div className="st-grid">
                    {ALL_SLOTS.map(h=>(
                      <div key={h} className={`st ${activeSlots.has(h)?"on":""}`} onClick={()=>toggleSlot(h)}>{h}</div>
                    ))}
                  </div>
                  <div className="hint">{activeSlots.size} créneau{activeSlots.size>1?"x":""} actif{activeSlots.size>1?"s":""}</div>
                </div>
              </div>
            )}

            {/* ─── PRESTATIONS ─── */}
            {adminTab==="svc" && (
              <div>
                <div className="dp-card" style={{marginBottom:"1.5rem"}}>
                  <div className="dp-title" style={{marginBottom:".25rem"}}>💈 Gérer les prestations</div>
                  <div className="dp-sub">Modifiez le nom, la durée, le prix et l'icône de chaque prestation. Les changements s'affichent immédiatement côté client.</div>
                </div>

                <div className="svc-admin-list">
                  {[...services].sort((a,b)=>(a.position||0)-(b.position||0)).map(s=>(
                    <div key={s.id}>
                      {editingId===s.id ? (
                        <div className="svc-edit-form">
                          <div className="row">
                            <div>
                              <div className="fl">Nom</div>
                              <input className="fi-sm" value={editForm.label} onChange={e=>setEditForm(f=>({...f,label:e.target.value}))} placeholder="Ex: Coupe Homme"/>
                            </div>
                            <div>
                              <div className="fl">Durée (min)</div>
                              <input className="fi-sm" type="number" min="5" max="180" value={editForm.duration} onChange={e=>setEditForm(f=>({...f,duration:e.target.value}))}/>
                            </div>
                            <div>
                              <div className="fl">Prix</div>
                              <input className="fi-sm" value={editForm.price} onChange={e=>setEditForm(f=>({...f,price:e.target.value}))} placeholder="Ex: 15€"/>
                            </div>
                          </div>
                          <div>
                            <div className="fl">Icône</div>
                            <div className="icon-picker">
                              {ICONS.map(ic=>(
                                <div key={ic} className={`icon-opt ${editForm.icon===ic?"sel":""}`} onClick={()=>setEditForm(f=>({...f,icon:ic}))}>{ic}</div>
                              ))}
                            </div>
                          </div>
                          <div style={{display:"flex",gap:".6rem",marginTop:".4rem"}}>
                            <button className="btn-sm" style={{flex:1}} onClick={()=>saveEdit(s.id)} disabled={svcSaving}>
                              {svcSaving?"…":"✓ Enregistrer"}
                            </button>
                            <button className="btn-sm red" onClick={()=>setEditingId(null)}>Annuler</button>
                          </div>
                        </div>
                      ) : (
                        <div className="svc-admin-row">
                          <div className="svc-ico">{s.icon}</div>
                          <div className="svc-inf">
                            <div className="svc-n">{s.label}</div>
                            <div className="svc-d">{s.duration} min</div>
                          </div>
                          <div className="svc-p" style={{marginRight:".8rem"}}>{s.price}</div>
                          <button className="btn-icon" title="Modifier" onClick={()=>startEdit(s)}>✏️</button>
                          <button className="btn-icon red" title="Supprimer" onClick={()=>deleteService(s.id)}>🗑️</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Ajout nouvelle prestation */}
                {addingNew ? (
                  <div className="svc-edit-form">
                    <div style={{fontSize:".75rem",letterSpacing:".15em",color:"#c9a84c",textTransform:"uppercase",marginBottom:".2rem"}}>Nouvelle prestation</div>
                    <div className="row">
                      <div>
                        <div className="fl">Nom</div>
                        <input className="fi-sm" value={newForm.label} onChange={e=>setNewForm(f=>({...f,label:e.target.value}))} placeholder="Ex: Coloration"/>
                      </div>
                      <div>
                        <div className="fl">Durée (min)</div>
                        <input className="fi-sm" type="number" min="5" value={newForm.duration} onChange={e=>setNewForm(f=>({...f,duration:e.target.value}))}/>
                      </div>
                      <div>
                        <div className="fl">Prix</div>
                        <input className="fi-sm" value={newForm.price} onChange={e=>setNewForm(f=>({...f,price:e.target.value}))} placeholder="Ex: 25€"/>
                      </div>
                    </div>
                    <div>
                      <div className="fl">Icône</div>
                      <div className="icon-picker">
                        {ICONS.map(ic=>(
                          <div key={ic} className={`icon-opt ${newForm.icon===ic?"sel":""}`} onClick={()=>setNewForm(f=>({...f,icon:ic}))}>{ic}</div>
                        ))}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:".6rem",marginTop:".4rem"}}>
                      <button className="btn-sm" style={{flex:1}} onClick={saveNewService} disabled={svcSaving||!newForm.label.trim()||!newForm.price.trim()}>
                        {svcSaving?"…":"✓ Ajouter"}
                      </button>
                      <button className="btn-sm red" onClick={()=>setAddingNew(false)}>Annuler</button>
                    </div>
                  </div>
                ) : (
                  <button className="add-svc-btn" onClick={()=>{setAddingNew(true);setEditingId(null);}}>
                    + Ajouter une prestation
                  </button>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </>
  );
}
