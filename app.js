
const KEY="verseMemory.v1";
const today=()=>new Date().toISOString().slice(0,10);
const addDays=(n)=>{let d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const seed={settings:{defaultTranslation:"WEBU"},verses:[{
 id:"james121",reference:"James 1:21",translation:"WEBU",
 text:"Therefore, putting away all filthiness and overflowing of wickedness, receive with humility the implanted word, which is able to save your souls.",
 status:"new",due:today(),streak:0,created:new Date().toISOString()
}]};
let state=load(), route={screen:"home",id:null,mode:"learn",level:1,phrase:1,result:null};
function load(){try{return JSON.parse(localStorage.getItem(KEY))||seed}catch(e){return seed}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function esc(s=""){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function app(html){document.querySelector("#app").innerHTML=`<div class="shell">${html}<div class="footer">A quiet place to remember His Word.<br>With love from LumenStance</div></div>`}
function header(back=false){return `<header>${back?`<button class="back" onclick="go('home')">← Home</button>`:`<div class="brand"><h1>Verse Memory</h1><div class="tag">Remember His Word.</div></div>`}<button class="btn small outline" onclick="go('settings')">Settings</button></header>`}
function go(screen,id=null){route={screen,id,mode:"learn",level:1,phrase:1,result:null};render()}
function dueVerses(){return state.verses.filter(v=>!v.due||v.due<=today())}
function render(){
 if(route.screen==="home") return home();
 if(route.screen==="add") return addForm();
 if(route.screen==="verses") return verses();
 if(route.screen==="practice") return practice(route.id);
 if(route.screen==="settings") return settings();
}
function home(){
 const due=dueVerses().length, learning=state.verses.filter(v=>v.status!=="memorized").length, mem=state.verses.filter(v=>v.status==="memorized").length;
 app(`${header()}<section class="card hero"><div class="versemark">V</div><h2>Keep His Word close.</h2><p class="muted">A private, offline place for the Scripture you want to remember.</p>
 <div class="stats"><div class="stat"><b>${due}</b><span>Due today</span></div><div class="stat"><b>${learning}</b><span>Learning</span></div><div class="stat"><b>${mem}</b><span>Memorized</span></div></div>
 <button class="btn primary wide" onclick="practiceDue()">Practice Today's Verses</button>
 <div class="row"><button class="btn wide" onclick="go('verses')">My Verses</button><button class="btn wide" onclick="go('add')">+ Add Passage</button></div></section>
 <div class="notice">Everything you enter is stored in this browser on this device. No account is required.</div>`)
}
function practiceDue(){let v=dueVerses()[0]||state.verses[0]; if(v)go("practice",v.id);else go("add")}
function addForm(){
 app(`${header(true)}<div class="card"><h2>Add a verse or passage</h2><form onsubmit="addVerse(event)">
 <label>Reference</label><input id="ref" placeholder="John 15:5" required>
 <label>Translation</label><input id="trans" value="${esc(state.settings.defaultTranslation)}" placeholder="WEBU">
 <label>Scripture text</label><textarea id="txt" placeholder="Type or paste the exact wording you want to memorize." required></textarea>
 <button class="btn primary wide" type="submit">Save & Start Learning</button></form></div>`)
}
function addVerse(e){e.preventDefault();let v={id:"v"+Date.now(),reference:ref.value.trim(),translation:trans.value.trim(),text:txt.value.trim(),status:"new",due:today(),streak:0,created:new Date().toISOString()};state.verses.push(v);save();go("practice",v.id)}
function verses(){
 let items=state.verses.map(v=>`<div class="listItem" onclick="go('practice','${v.id}')"><div><div class="ref">${esc(v.reference)}</div><div class="tiny">${esc(v.translation||"")} · Due ${esc(v.due||"today")}</div></div><span class="badge">${esc(v.status||"new")}</span></div>`).join("");
 app(`${header(true)}<div class="card"><div class="row"><h2 style="flex:3">My Verses</h2><button class="btn small primary" onclick="go('add')">+ Add</button></div>${items||`<div class="empty">No passages yet.</div>`}</div>`)
}
function words(text){return text.split(/(\s+)/)}
function hideWords(text,level){
 let pct=[0,.25,.5,.75][level]||.25, idx=0;
 return words(text).map(t=>{if(!t.trim())return t;idx++;let clean=t.replace(/[^\p{L}\p{N}']/gu,"");let hide=((idx*37)%100)<pct*100 && clean.length>2;return hide?`<span class="wordblank">${esc(t)}</span>`:esc(t)}).join("");
}
function initials(text){return text.replace(/\b([\p{L}\p{N}])[\p{L}\p{N}'’-]*/gu,"$1")}
function phrases(text){return text.match(/[^,;:.!?]+[,;:.!?]?/g)?.map(x=>x.trim()).filter(Boolean)||[text]}
function practice(id){
 let v=state.verses.find(x=>x.id===id); if(!v)return go("home");
 let body="";
 if(route.mode==="learn") body=`<div class="verseText">${esc(v.text)}</div><button class="btn primary wide" onclick="setMode('phrase')">I'm Ready to Practice</button>`;
 if(route.mode==="phrase"){let p=phrases(v.text);let n=Math.min(route.phrase,p.length);body=`<div class="tiny">Phrase ${n} of ${p.length}</div><div class="verseText">${esc(p.slice(0,n).join(" "))}</div><div class="row"><button class="btn" onclick="route.phrase=Math.max(1,route.phrase-1);render()">− Phrase</button><button class="btn primary" onclick="route.phrase=Math.min(${p.length},route.phrase+1);render()">+ Phrase</button></div>`}
 if(route.mode==="hide") body=`<div class="tiny">Level ${route.level} · ${route.level*25}% hidden</div><div class="verseText">${hideWords(v.text,route.level)}</div><div class="row"><button class="btn" onclick="route.level=Math.max(1,route.level-1);render()">Easier</button><button class="btn primary" onclick="route.level=Math.min(3,route.level+1);render()">Harder</button></div><button class="btn outline wide" onclick="alert(${JSON.stringify(v.text)})">Reveal Verse</button>`;
 if(route.mode==="initials") body=`<div class="verseText">${esc(initials(v.text))}</div><button class="btn outline wide" onclick="alert(${JSON.stringify(v.text)})">Reveal Verse</button>`;
 if(route.mode==="test") body=route.result?testResult(v,route.result):`<p class="muted">Type the passage from memory. Capitalization and punctuation won't count against you.</p><textarea id="attempt" placeholder="Begin typing from memory…"></textarea><button class="btn primary wide" onclick="checkTest('${v.id}')">Check My Answer</button>`;
 app(`${header(true)}<div class="card"><div class="reference">${esc(v.reference)} · ${esc(v.translation||"")}</div>
 <div class="modebar"><button class="btn small ${route.mode==="learn"?"primary":""}" onclick="setMode('learn')">Learn</button><button class="btn small ${route.mode==="phrase"?"primary":""}" onclick="setMode('phrase')">Phrase Builder</button><button class="btn small ${route.mode==="hide"?"primary":""}" onclick="setMode('hide')">Hide Words</button><button class="btn small ${route.mode==="initials"?"primary":""}" onclick="setMode('initials')">First Letters</button><button class="btn small ${route.mode==="test"?"primary":""}" onclick="setMode('test')">Test Me</button></div>${body}</div>
 <div class="card"><h3>How did you do?</h3><div class="row stack"><button class="btn" onclick="rate('${v.id}','again')">Again</button><button class="btn" onclick="rate('${v.id}','almost')">Almost</button><button class="btn primary" onclick="rate('${v.id}','gotit')">Got It</button></div></div>`)
}
function setMode(m){route.mode=m;route.result=null;render()}
function norm(s){return s.toLowerCase().replace(/[^\p{L}\p{N}'\s]/gu,"").replace(/\s+/g," ").trim()}
function checkTest(id){let v=state.verses.find(x=>x.id===id), a=norm(document.querySelector("#attempt").value).split(" ").filter(Boolean), b=norm(v.text).split(" ").filter(Boolean);let correct=0;let shown=b.map((w,i)=>{let ok=a[i]===w;if(ok)correct++;return `<span class="${ok?"ok":"miss"}">${esc(w)}</span>`}).join(" ");route.result={score:Math.round(correct/Math.max(1,b.length)*100),shown};render()}
function testResult(v,r){return `<div class="score">${r.score}%</div><p class="muted" style="text-align:center">Green words matched. Highlighted words need another look.</p><div class="diff">${r.shown}</div><button class="btn outline wide" onclick="route.result=null;render()">Try Again</button>`}
function rate(id,r){let v=state.verses.find(x=>x.id===id);if(r==="again"){v.streak=0;v.status="learning";v.due=today()}if(r==="almost"){v.streak=Math.max(1,v.streak||0);v.status="learning";v.due=addDays(1)}if(r==="gotit"){v.streak=(v.streak||0)+1;let gaps=[3,7,14,30,60];v.due=addDays(gaps[Math.min(v.streak-1,gaps.length-1)]);v.status=v.streak>=4?"memorized":"learning"}save();go("home")}
function settings(){
 app(`${header(true)}<div class="card"><h2>Settings</h2><label>Default translation</label><input id="deftrans" value="${esc(state.settings.defaultTranslation)}" onchange="state.settings.defaultTranslation=this.value;save()">
 <h3 style="margin-top:26px">Backup & restore</h3><p class="muted">Your verses live only on this device. Export a backup before clearing browser data or changing devices.</p>
 <div class="row stack"><button class="btn" onclick="backup()">Backup My Verses</button><label class="btn" style="text-align:center;margin:0">Restore Backup<input type="file" accept=".json,application/json" style="display:none" onchange="restore(this.files[0])"></label></div>
 <h3 style="margin-top:26px">About privacy</h3><p class="muted">Verse Memory does not require an account and this version does not send your verse library or practice history to a server.</p></div>`)
}
function backup(){let blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="verse-memory-backup.json";a.click();URL.revokeObjectURL(u)}
function restore(file){if(!file)return;let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);if(!Array.isArray(x.verses))throw 0;state=x;save();alert("Backup restored.");go("home")}catch(e){alert("That backup file could not be restored.")}};r.readAsText(file)}
render();
