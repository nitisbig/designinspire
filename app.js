// ---- Google Fonts (loaded via CDN on demand) ----
const FONTS = [
  "Inter","Roboto","Poppins","Montserrat","Lato","Open Sans","Raleway",
  "Nunito","Work Sans","DM Sans","Playfair Display","Merriweather",
  "Lora","Space Grotesk","Sora","Manrope","Bricolage Grotesque",
  "Archivo","Outfit","Fraunces","Libre Baskerville","JetBrains Mono"
];
const loaded = new Set(["Inter"]);
function loadFont(name){
  if(loaded.has(name)) return;
  loaded.add(name);
  const l=document.createElement("link");
  l.rel="stylesheet";
  l.href=`https://fonts.googleapis.com/css2?family=${name.replace(/ /g,"+")}:wght@400;500;600;700;800&display=swap`;
  document.head.appendChild(l);
}

// ---- Curated color palettes ----
const PALETTES = [
  {name:"Midnight",   bg:"#0f172a",surf:"#1e293b",text:"#e2e8f0",pri:"#6366f1",acc:"#22d3ee"},
  {name:"Sunset",     bg:"#1a1423",surf:"#2d2438",text:"#f5e6e8",pri:"#f97316",acc:"#ec4899"},
  {name:"Forest",     bg:"#0c1a14",surf:"#14281f",text:"#dcede3",pri:"#10b981",acc:"#84cc16"},
  {name:"Clean Light",bg:"#f8fafc",surf:"#ffffff",text:"#0f172a",pri:"#2563eb",acc:"#7c3aed"},
  {name:"Warm Paper", bg:"#faf6f0",surf:"#ffffff",text:"#2b2320",pri:"#c2410c",acc:"#0d9488"},
  {name:"Mono Slate", bg:"#18181b",surf:"#27272a",text:"#e4e4e7",pri:"#a1a1aa",acc:"#facc15"},
  {name:"Ocean",      bg:"#f0f9ff",surf:"#ffffff",text:"#0c3547",pri:"#0891b2",acc:"#f43f5e"},
  {name:"Grape Pop",  bg:"#12091f",surf:"#241435",text:"#ede4f7",pri:"#a855f7",acc:"#f59e0b"}
];

// ---- State ----
const S = {
  headFont:"Poppins", bodyFont:"Inter", fs:16, hw:700, ls:0,
  bg:"#0f172a", surf:"#1e293b", text:"#e2e8f0", pri:"#6366f1", acc:"#22d3ee",
  layout:"hero", align:"left", br:12, sp:1, sh:2, cw:960, pal:0
};

const $=id=>document.getElementById(id);

// ---- Shadow scale ----
const SHADOWS=["none","0 1px 2px rgba(0,0,0,.15)","0 4px 12px rgba(0,0,0,.18)","0 10px 30px rgba(0,0,0,.25)","0 20px 50px rgba(0,0,0,.35)"];

// ---- Helpers ----
function hexToRgb(h){h=h.replace("#","");if(h.length===3)h=h.split("").map(c=>c+c).join("");return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
function lum(h){const[r,g,b]=hexToRgb(h).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);});return .2126*r+.7152*g+.0722*b;}
function contrast(a,b){const l1=lum(a),l2=lum(b);return((Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05));}
function mix(h,pct){const[r,g,b]=hexToRgb(h);const t=pct>0?255:0;const p=Math.abs(pct);return`rgb(${Math.round(r+(t-r)*p)},${Math.round(g+(t-g)*p)},${Math.round(b+(t-b)*p)})`;}
function alpha(h,a){const[r,g,b]=hexToRgb(h);return`rgba(${r},${g},${b},${a})`;}
function onColor(bg){return lum(bg)>.45?"#0b0b0b":"#ffffff";}

// ---- Render preview ----
function render(){
  loadFont(S.headFont); loadFont(S.bodyFont);
  const stage=$("stage");
  stage.style.maxWidth=S.cw+"px";
  stage.style.margin=S.align==="center"?"0 auto":S.align==="right"?"0 0 0 auto":"0";

  const pad=Math.round(28*S.sp);
  const gap=Math.round(18*S.sp);
  const c={
    "--bg":S.bg,"--surf":S.surf,"--text":S.text,"--pri":S.pri,"--acc":S.acc,
    "--muted":alpha(S.text,.62),"--line":alpha(S.text,.12),
    "--onpri":onColor(S.pri),"--onacc":onColor(S.acc),
    "--hf":`'${S.headFont}'`,"--bf":`'${S.bodyFont}'`,
    "--fs":S.fs+"px","--hw":S.hw,"--ls":S.ls+"px",
    "--br":S.br+"px","--sh":SHADOWS[S.sh],"--pad":pad+"px","--gap":gap+"px",
    "--ta":S.align
  };
  const cssVars=Object.entries(c).map(([k,v])=>`${k}:${v}`).join(";");

  stage.innerHTML=`<div class="frame" style="${cssVars}">${LAYOUTS[S.layout]()}</div>`;
  updateTips();
}

// ---- Layout templates ----
const LAYOUTS={
  hero:()=>`
    <nav class="nav">
      <div class="brand">◆ Nimbus</div>
      <div class="nav-links"><span>Product</span><span>Pricing</span><span>Docs</span><button class="btn ghost">Sign in</button></div>
    </nav>
    <section class="hero">
      <span class="pill">✨ New in 2026</span>
      <h1>Design faster with a canvas that thinks.</h1>
      <p class="lead">Test fonts, colors and layout combinations in real time. Find the look that fits your product before you write a line of CSS.</p>
      <div class="cta"><button class="btn">Get started</button><button class="btn ghost">Watch demo</button></div>
      <div class="stats">
        <div><b>12k+</b><span>designers</span></div>
        <div><b>98%</b><span>satisfaction</span></div>
        <div><b>4.9★</b><span>rating</span></div>
      </div>
    </section>`,
  dashboard:()=>`
    <div class="dash">
      <aside class="side">
        <div class="brand">◆ Nimbus</div>
        ${["Overview","Analytics","Reports","Settings"].map((x,i)=>`<div class="side-i${i===0?" act":""}">${x}</div>`).join("")}
      </aside>
      <main class="dash-main">
        <h2>Overview</h2>
        <div class="cards">
          ${[["Revenue","$48.2k","+12%"],["Users","8,914","+4%"],["Churn","1.9%","-0.3%"],["Sessions","23.1k","+8%"]].map(([t,v,d])=>
            `<div class="card"><span class="ct">${t}</span><b class="cv">${v}</b><span class="cd">${d}</span></div>`).join("")}
        </div>
        <div class="card wide"><span class="ct">Weekly traffic</span><div class="bars">${[40,65,52,80,60,90,72].map(h=>`<i style="height:${h}%"></i>`).join("")}</div></div>
      </main>
    </div>`,
  pricing:()=>`
    <section class="hero" style="padding-bottom:0"><h1>Simple, honest pricing</h1><p class="lead">Pick the plan that scales with you.</p></section>
    <div class="price-grid">
      ${[["Starter","$0",["1 project","Community support","Basic exports"],false],
         ["Pro","$19",["Unlimited projects","Priority support","Team library","Advanced exports"],true],
         ["Team","$49",["Everything in Pro","SSO & roles","Audit logs"],false]].map(([n,p,f,hot])=>
        `<div class="price ${hot?"hot":""}">${hot?'<span class="pill">Popular</span>':""}<h3>${n}</h3><div class="amt">${p}<small>/mo</small></div>
         <ul>${f.map(x=>`<li>✓ ${x}</li>`).join("")}</ul><button class="btn ${hot?"":"ghost"}">Choose</button></div>`).join("")}
    </div>`,
  profile:()=>`
    <div class="prof">
      <div class="banner"></div>
      <div class="prof-hd"><div class="avatar">N</div><div><h2>Nitesh Kumar</h2><span class="muted">Product Designer · San Francisco</span></div><button class="btn">Follow</button></div>
      <div class="feed">
        ${[["Shipped a new design system 🎉","2h"],["Exploring color theory for dark UIs","1d"],["3 layout patterns every SaaS needs","3d"]].map(([t,tm])=>
          `<div class="post"><div class="post-hd"><div class="avatar sm">N</div><b>Nitesh</b><span class="muted">· ${tm}</span></div><p>${t}</p><div class="post-act"><span>♡ 24</span><span>💬 6</span><span>↗ share</span></div></div>`).join("")}
      </div>
    </div>`
};

// ---- Tips engine ----
const TIPS_DB = [
  ()=> contrast(S.text,S.bg)<4.5 ? "⚠️ Text contrast is below 4.5:1 — try a lighter text or darker background." : "✅ Text contrast passes WCAG AA.",
  ()=> contrast(S.pri,S.bg)<3 ? "⚠️ Primary color is hard to read on your background." : null,
  ()=>`💡 ${S.headFont} pairs well with ${["Playfair Display","Merriweather","Lora","Fraunces","Libre Baskerville"].includes(S.headFont)?"Inter or DM Sans for body text.":"a serif like Lora or Fraunces for body text."}`,
  ()=> S.br===0 ? "💡 Zero radius gives a sharp, editorial feel — great for news or finance." : S.br>18 ? "💡 High radius feels friendly and modern — popular in consumer apps." : null,
  ()=> S.sh===0 ? "💡 Flat design with no shadows works well with bold color palettes." : null,
  ()=>`💡 Spacing density ${S.sp.toFixed(1)} — ${S.sp<0.8?"tight spacing suits data-dense dashboards.":S.sp>1.4?"generous spacing feels premium and editorial.":"balanced spacing works for most products."}`,
];
function updateTips(){
  const msgs = TIPS_DB.map(f=>f()).filter(Boolean).slice(0,3);
  $("tips").innerHTML = msgs.join("<br><br>") || "Looking good! Tweak colors or fonts for more suggestions.";
}

// ---- Surprise me ----
const SURPRISES = [
  {headFont:"Playfair Display",bodyFont:"Lato",pal:4,br:4,sh:3,sp:1.2},
  {headFont:"Space Grotesk",bodyFont:"Inter",pal:0,br:16,sh:2,sp:1},
  {headFont:"Fraunces",bodyFont:"Nunito",pal:1,br:20,sh:2,sp:1.3},
  {headFont:"Sora",bodyFont:"DM Sans",pal:2,br:10,sh:1,sp:0.9},
  {headFont:"Bricolage Grotesque",bodyFont:"Manrope",pal:7,br:8,sh:3,sp:1.1},
  {headFont:"Archivo",bodyFont:"Work Sans",pal:6,br:14,sh:2,sp:1},
];
let surpriseIdx=0;

// ---- Palette grid ----
function buildPalettes(){
  const g=$("palettes");
  PALETTES.forEach((p,i)=>{
    const d=document.createElement("div");
    d.className="pal"+(i===0?" on":"");
    d.innerHTML=`<div class="pal-dots">${[p.bg,p.surf,p.pri,p.acc].map(c=>`<div class="dot" style="background:${c}"></div>`).join("")}</div><div class="pal-name">${p.name}</div>`;
    d.addEventListener("click",()=>{
      S.pal=i; Object.assign(S,{bg:p.bg,surf:p.surf,text:p.text,pri:p.pri,acc:p.acc});
      document.querySelectorAll(".pal").forEach(x=>x.classList.remove("on"));
      d.classList.add("on");
      syncColors(); render();
    });
    g.appendChild(d);
  });
}

// ---- Font selects ----
function buildFonts(){
  ["headFont","bodyFont"].forEach(id=>{
    const sel=$(id);
    FONTS.forEach(f=>{
      const o=document.createElement("option");
      o.value=f; o.textContent=f;
      if(f===S[id]) o.selected=true;
      sel.appendChild(o);
    });
    sel.addEventListener("change",e=>{S[id]=e.target.value; render();});
  });
}

// ---- Sync helpers ----
function syncColors(){
  $("cBg").value=S.bg; $("cSurf").value=S.surf;
  $("cText").value=S.text; $("cPri").value=S.pri; $("cAcc").value=S.acc;
}
function syncUI(){
  $("headFont").value=S.headFont; $("bodyFont").value=S.bodyFont;
  $("fs").value=S.fs; $("fsV").textContent=S.fs+"px";
  $("hw").value=S.hw; $("hwV").textContent=S.hw;
  $("ls").value=S.ls; $("lsV").textContent=S.ls;
  $("br").value=S.br; $("brV").textContent=S.br+"px";
  $("sp").value=S.sp; $("spV").textContent=S.sp.toFixed(1);
  $("sh").value=S.sh; $("shV").textContent=S.sh;
  $("cw").value=S.cw; $("cwV").textContent=S.cw+"px";
  $("layout").value=S.layout;
  document.querySelectorAll("#align button").forEach(b=>b.classList.toggle("on",b.dataset.v===S.align));
  syncColors();
  document.querySelectorAll(".pal").forEach((el,i)=>el.classList.toggle("on",i===S.pal));
}

// ---- Wire controls ----
function wire(){
  const range=(id,key,suffix,dec=0)=>{
    $(id).addEventListener("input",e=>{
      S[key]=dec?parseFloat(e.target.value):parseInt(e.target.value);
      $(id+"V").textContent=(dec?S[key].toFixed(dec):S[key])+suffix; render();
    });
  };
  range("fs","fs","px"); range("hw","hw",""); range("ls","ls","",1);
  range("br","br","px"); range("sp","sp","",1); range("sh","sh",""); range("cw","cw","px");

  const map={cBg:"bg",cSurf:"surf",cText:"text",cPri:"pri",cAcc:"acc"};
  Object.keys(map).forEach(id=>{
    $(id).addEventListener("input",e=>{S[map[id]]=e.target.value; render();});
  });

  $("layout").addEventListener("change",e=>{S.layout=e.target.value; render();});

  document.querySelectorAll("#align button").forEach(b=>{
    b.addEventListener("click",()=>{
      S.align=b.dataset.v;
      document.querySelectorAll("#align button").forEach(x=>x.classList.remove("on"));
      b.classList.add("on"); render();
    });
  });

  $("surprise").addEventListener("click",()=>{
    const s=SURPRISES[surpriseIdx++ % SURPRISES.length];
    Object.assign(S,s,PALETTES[s.pal]);
    syncUI(); render();
  });

  document.querySelectorAll("[data-t]").forEach(hd=>{
    hd.addEventListener("click",()=>{
      const bd=hd.nextElementSibling;
      const open=!bd.classList.contains("hide");
      bd.classList.toggle("hide",open);
      hd.querySelector("span").textContent=open?"+":"−";
    });
  });
}

// ---- Init ----
buildPalettes(); buildFonts(); wire();
Object.assign(S,PALETTES[0]);
syncUI(); render();


