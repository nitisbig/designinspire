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
  layout:"hero", align:"left", br:12, sp:1, sh:2, cw:960, pal:0,
  device:"desktop"
};

// ---- Device presets (viewport widths) ----
const DEVICES = {
  desktop:{label:"Desktop", w:null},
  tablet: {label:"Tablet",  w:768},
  mobile: {label:"Mobile",  w:390}
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

// ---- Compute CSS custom properties from state ----
function computeVars(){
  const pad=Math.round(28*S.sp);
  const gap=Math.round(18*S.sp);
  return {
    "--bg":S.bg,"--surf":S.surf,"--text":S.text,"--pri":S.pri,"--acc":S.acc,
    "--muted":alpha(S.text,.62),"--line":alpha(S.text,.12),
    "--onpri":onColor(S.pri),"--onacc":onColor(S.acc),
    "--hf":`'${S.headFont}'`,"--bf":`'${S.bodyFont}'`,
    "--fs":S.fs+"px","--hw":String(S.hw),"--ls":S.ls+"px",
    "--br":S.br+"px","--sh":SHADOWS[S.sh],"--pad":pad+"px","--gap":gap+"px",
    "--ta":S.align
  };
}

// ---- Canvas width bounds (shared by slider + drag-resize) ----
const CW_MIN = 360, CW_MAX = 1400;

// ---- Drag-to-resize handles ----
// Handles live as children of #stage. render() rewrites stage.innerHTML each
// time, so we rebuild + remount them after every render (desktop only).
let handleL, handleR;
function buildHandles(){
  const mk = side=>{
    const h=document.createElement("div");
    h.className="resize-handle "+side;
    h.title="Drag to resize canvas";
    h.innerHTML='<div class="grip"></div>';
    h.addEventListener("pointerdown",e=>startResize(e,side));
    return h;
  };
  handleL=mk("left"); handleR=mk("right");
}
function mountHandles(){
  // Only meaningful on desktop where width is free to change.
  if(S.device!=="desktop") return;
  const stage=$("stage");
  // Show the handle(s) on the edge(s) that are actually free to move given
  // the current alignment: left→right edge, right→left edge, center→both.
  if(S.align==="left"||S.align==="center") stage.appendChild(handleR);
  if(S.align==="right"||S.align==="center") stage.appendChild(handleL);
}
function startResize(e,side){
  if(S.device!=="desktop") return;
  e.preventDefault();
  const stage=$("stage");
  const startX=e.clientX, startW=S.cw;
  const mult=S.align==="center"?2:1;      // both edges move when centered
  const dir=side==="right"?1:-1;
  stage.classList.add("resizing");
  try{ e.target.setPointerCapture(e.pointerId); }catch(_){}
  const move=ev=>{
    let w=startW + dir*mult*(ev.clientX-startX);
    w=Math.max(CW_MIN,Math.min(CW_MAX,Math.round(w)));
    S.cw=w;
    stage.style.width=w+"px"; stage.style.maxWidth=w+"px";
    $("cw").value=w; $("cwV").textContent=w+"px";
  };
  const up=()=>{
    stage.classList.remove("resizing");
    window.removeEventListener("pointermove",move);
    window.removeEventListener("pointerup",up);
    render();
  };
  window.addEventListener("pointermove",move);
  window.addEventListener("pointerup",up);
}

// ---- Render preview ----
function render(){
  loadFont(S.headFont); loadFont(S.bodyFont);
  const stage=$("stage");
  const dev=DEVICES[S.device];

  stage.classList.remove("dev-desktop","dev-tablet","dev-mobile");
  stage.classList.add("dev-"+S.device);

  if(dev.w){
    // Fixed device viewport: exact width, always centered.
    stage.style.width=dev.w+"px";
    stage.style.maxWidth=dev.w+"px";
    stage.style.minWidth="";
    stage.style.margin="0 auto";
  }else{
    // Desktop: honor the container-width control and alignment.
    // Set width explicitly (and drop the CSS min-width) so drag-resize can
    // go below the default 640px floor down to CW_MIN.
    stage.style.width=S.cw+"px";
    stage.style.maxWidth=S.cw+"px";
    stage.style.minWidth="0";
    stage.style.margin=S.align==="center"?"0 auto":S.align==="right"?"0 0 0 auto":"0";
  }

  const info=$("deviceInfo");
  if(info) info.textContent=`${dev.label} · ${dev.w||S.cw}px`;

  const cssVars=Object.entries(computeVars()).map(([k,v])=>`${k}:${v}`).join(";");

  stage.innerHTML=`<div class="frame" style="${cssVars}">${LAYOUTS[S.layout]()}</div>`;
  mountHandles();
  updateTips();
  if(document.getElementById("expPreview")) updateExportPreview();
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
    </div>`,
  features:()=>`
    <section class="hero" style="padding-bottom:calc(var(--pad)*.6)">
      <span class="pill">Why teams choose us</span>
      <h1>Everything you need, nothing you don't.</h1>
      <p class="lead">A focused toolkit that keeps your workflow fast and your design consistent.</p>
    </section>
    <div class="feat-grid">
      ${[["⚡","Blazing fast","Instant previews with zero build step so you iterate at the speed of thought."],
         ["🎨","Design tokens","Every color, font and spacing value flows from a single source of truth."],
         ["🔒","Secure by default","Your work stays local. No accounts, no tracking, no surprises."],
         ["📐","Pixel precise","Fine-grained controls for radius, shadow and density down to the pixel."],
         ["♿","Accessible","Live WCAG contrast checks keep your palettes readable for everyone."],
         ["📦","Export ready","Copy clean CSS variables straight into your codebase when you're done."]].map(([ic,t,d])=>
        `<div class="feat"><div class="feat-ic">${ic}</div><h3>${t}</h3><p>${d}</p></div>`).join("")}
    </div>`,
  blog:()=>`
    <article class="article">
      <span class="pill">Design</span>
      <h1>Building a design system that actually scales</h1>
      <div class="meta"><div class="avatar sm">N</div><b>Nitesh Kumar</b><span class="muted">· Jul 25, 2026 · 6 min read</span></div>
      <div class="cover"></div>
      <p class="lead">A design system is only as good as the decisions it makes easy. Here's how we cut our component count in half while shipping faster.</p>
      <p>When we started, every screen reinvented its own spacing, color and type. The result was a product that felt subtly inconsistent everywhere you looked. The fix wasn't more components, it was fewer, sharper primitives.</p>
      <blockquote>Constraints don't limit creativity, they focus it. A tight token set forces better decisions.</blockquote>
      <h3>Start with the tokens</h3>
      <p>Colors, type scale and spacing come first. Once those are locked, components almost design themselves because every value already has a home.</p>
    </article>`,
  login:()=>`
    <div class="auth-wrap">
      <div class="auth">
        <h2>Welcome back</h2>
        <div class="sub">Sign in to your Nimbus account</div>
        <div class="field"><label>Email</label><div class="inp">you@example.com</div></div>
        <div class="field"><label>Password</label><div class="inp">••••••••••</div></div>
        <button class="btn">Sign in</button>
        <div class="alt">New here? <a>Create an account</a></div>
      </div>
    </div>`,
  testimonials:()=>`
    <section class="hero" style="padding-bottom:calc(var(--pad)*.6)">
      <h1>Loved by design teams everywhere.</h1>
      <p class="lead">Thousands of designers ship better UI with less back-and-forth.</p>
    </section>
    <div class="quotes">
      ${[["This replaced three tools in our workflow. We prototype visual direction in minutes now.","Ava Chen","Design Lead, Northwind"],
         ["The live contrast checks alone saved us an entire accessibility audit cycle.","Marco Ruiz","PM, Loop"],
         ["Fonts, color, spacing all in one place. Our handoffs are finally consistent.","Priya Nair","UI Engineer, Vela"]].map(([q,n,r])=>
        `<div class="quote"><p>"${q}"</p><div class="who"><div class="avatar sm">${n[0]}</div><div><b>${n}</b><br><span class="muted">${r}</span></div></div></div>`).join("")}
    </div>
    <div class="logos">${["Northwind","Loop","Vela","Cirrus","Basalt","Quill"].map(l=>`<span class="logo">${l}</span>`).join("")}</div>`,
  gallery:()=>{
    const grads=[["--pri","--acc"],["--acc","--pri"],["--pri","--surf"],["--acc","--text"],["--pri","--acc"],["--surf","--acc"]];
    const names=["Aurora","Drift","Momentum","Prism","Cascade","Ember"];
    return `
    <section class="hero" style="padding-bottom:calc(var(--pad)*.6)">
      <span class="pill">Selected work</span>
      <h1>Recent projects</h1>
    </section>
    <div class="gal-grid">
      ${grads.map((g,i)=>
        `<div class="tile"><div class="art" style="background:linear-gradient(135deg,var(${g[0]}),var(${g[1]}))"></div><div class="cap">${names[i]}</div></div>`).join("")}
    </div>`;
  },
  contact:()=>`
    <div class="contact">
      <div class="contact-info">
        <h2>Let's talk</h2>
        <p class="muted">Have a project in mind? We usually reply within a day.</p>
        <div class="line"><div class="ico">✉</div>hello@nimbus.design</div>
        <div class="line"><div class="ico">☎</div>+1 (555) 012-3456</div>
        <div class="line"><div class="ico">📍</div>San Francisco, CA</div>
      </div>
      <div class="contact-form">
        <div class="field"><label>Name</label><div class="inp">Jane Doe</div></div>
        <div class="field"><label>Email</label><div class="inp">jane@example.com</div></div>
        <div class="field"><label>Message</label><div class="inp" style="min-height:5em">Tell us about your project...</div></div>
        <button class="btn">Send message</button>
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

function randomHex(){return"#"+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,"0");}
function mixHex(h,pct){const[r,g,b]=hexToRgb(h);const t=pct>0?255:0;const p=Math.abs(pct);const to=v=>Math.round(v).toString(16).padStart(2,"0");return"#"+to(r+(t-r)*p)+to(g+(t-g)*p)+to(b+(t-b)*p);}
function randomSurprise(){
  const hf=FONTS[Math.floor(Math.random()*FONTS.length)];
  const bf=FONTS[Math.floor(Math.random()*FONTS.length)];
  const bg=randomHex(),pri=randomHex(),acc=randomHex();
  const dark=lum(bg)<=.45;
  const surf=mixHex(bg,dark?.08:-.05);
  const text=dark?"#f0f0f0":"#0b0b0b";
  return{headFont:hf,bodyFont:bf,bg,surf,text,pri,acc,
    br:Math.floor(Math.random()*29),sh:Math.floor(Math.random()*5),
    sp:Math.round((0.6+Math.random()*1.2)*10)/10};
}

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

  $("random").addEventListener("click",()=>{
    Object.assign(S,randomSurprise(),{pal:-1});
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

// ---- Device switcher & mobile menu ----
function wireDevices(){
  document.querySelectorAll("#devices button").forEach(b=>{
    b.addEventListener("click",()=>{
      S.device=b.dataset.d;
      document.querySelectorAll("#devices button").forEach(x=>x.classList.remove("on"));
      b.classList.add("on");
      render();
    });
  });

  const sidebar=$("sidebar"), backdrop=$("backdrop"), toggle=$("menuToggle");
  const closeMenu=()=>{sidebar.classList.remove("open"); backdrop.classList.remove("show");};
  if(toggle){
    toggle.addEventListener("click",()=>{
      const open=sidebar.classList.toggle("open");
      backdrop.classList.toggle("show",open);
    });
    backdrop.addEventListener("click",closeMenu);
  }
}

// ---- Export ----
let expFmt="json";

function buildJSON(){
  return JSON.stringify({
    _tool:"UI Design Sandbox",
    _schema:1,
    exportedAt:new Date().toISOString(),
    typography:{headFont:S.headFont,bodyFont:S.bodyFont,baseSize:S.fs,headingWeight:S.hw,letterSpacing:S.ls},
    colors:{bg:S.bg,surface:S.surf,text:S.text,primary:S.pri,accent:S.acc},
    layout:{template:S.layout,align:S.align,radius:S.br,spacing:S.sp,shadow:S.sh,containerWidth:S.cw}
  },null,2);
}

function buildCSS(){
  const v=computeVars();
  const body=Object.entries(v).map(([k,val])=>`  ${k}: ${val};`).join("\n");
  const fonts=[...new Set([S.headFont,S.bodyFont])].map(f=>f.replace(/ /g,"+")+":wght@400;500;600;700;800").join("&family=");
  return `/* UI Design Sandbox — exported ${new Date().toISOString().slice(0,10)} */\n`+
    `@import url('https://fonts.googleapis.com/css2?family=${fonts}&display=swap');\n\n`+
    `:root {\n${body}\n}`;
}

function buildTokens(){
  return JSON.stringify({
    color:{
      background:{value:S.bg},surface:{value:S.surf},text:{value:S.text},
      primary:{value:S.pri},accent:{value:S.acc},
      muted:{value:alpha(S.text,.62)},line:{value:alpha(S.text,.12)},
      "on-primary":{value:onColor(S.pri)},"on-accent":{value:onColor(S.acc)}
    },
    font:{heading:{value:S.headFont},body:{value:S.bodyFont}},
    fontSize:{base:{value:S.fs+"px"}},
    fontWeight:{heading:{value:S.hw}},
    letterSpacing:{heading:{value:S.ls+"px"}},
    radius:{base:{value:S.br+"px"}},
    spacing:{pad:{value:Math.round(28*S.sp)+"px"},gap:{value:Math.round(18*S.sp)+"px"}},
    shadow:{base:{value:SHADOWS[S.sh]}}
  },null,2);
}

function exportContent(){
  return expFmt==="css"?buildCSS():expFmt==="tokens"?buildTokens():buildJSON();
}
function exportFilename(){
  const ext=expFmt==="css"?"css":"json";
  const name=expFmt==="tokens"?"design-tokens":"design";
  return `${name}.${ext}`;
}

function updateExportPreview(){
  const el=$("expPreview");
  if(el) el.textContent=exportContent();
}

function toast(msg){
  const t=$("toast");
  t.textContent=msg; t.classList.add("show");
  clearTimeout(toast._t);
  toast._t=setTimeout(()=>t.classList.remove("show"),1800);
}

async function copyExport(){
  const text=exportContent();
  try{
    await navigator.clipboard.writeText(text);
  }catch{
    const ta=document.createElement("textarea");
    ta.value=text; document.body.appendChild(ta); ta.select();
    document.execCommand("copy"); ta.remove();
  }
  toast(`Copied ${expFmt.toUpperCase()} to clipboard`);
}

function downloadExport(){
  const blob=new Blob([exportContent()],{type:expFmt==="css"?"text/css":"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url; a.download=exportFilename();
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  toast(`Downloaded ${exportFilename()}`);
}

function wireExport(){
  document.querySelectorAll("#expFmt button").forEach(b=>{
    b.addEventListener("click",()=>{
      expFmt=b.dataset.f;
      document.querySelectorAll("#expFmt button").forEach(x=>x.classList.remove("on"));
      b.classList.add("on");
      updateExportPreview();
    });
  });
  $("expCopy").addEventListener("click",copyExport);
  $("expDownload").addEventListener("click",downloadExport);
}

// ---- App theme toggle (light/dark chrome — independent of the preview) ----
const THEME_KEY="ui-sandbox-theme";
function wireTheme(){
  const btn=$("themeToggle");
  if(!btn) return;
  const apply=t=>{
    if(t==="dark") document.documentElement.setAttribute("data-theme","dark");
    else document.documentElement.removeAttribute("data-theme");
    btn.title=t==="dark"?"Switch to light theme":"Switch to dark theme";
  };
  let cur;
  try{ cur=localStorage.getItem(THEME_KEY); }catch(e){}
  cur = cur==="dark" ? "dark" : "light";   // default light
  apply(cur);
  btn.addEventListener("click",()=>{
    cur = cur==="dark" ? "light" : "dark";
    apply(cur);
    try{ localStorage.setItem(THEME_KEY,cur); }catch(e){}
  });
}

// ---- Init ----
buildPalettes(); buildFonts(); buildHandles(); wire(); wireExport(); wireDevices(); wireTheme();
Object.assign(S,PALETTES[0]);
syncUI(); render();
updateExportPreview();


