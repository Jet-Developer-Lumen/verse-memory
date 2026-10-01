
const KEY="verseMemory.v1";
const today=()=>new Date().toISOString().slice(0,10);
const addDays=(n)=>{let d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const seed={settings:{defaultTranslation:"WEBU"},verses:[{
 id:"james121",reference:"James 1:21",translation:"WEBU",
 text:"Therefore, putting away all filthiness and overflowing of wickedness, receive with humility the implanted word, which is able to save your souls.",
 status:"new",due:today(),streak:0,created:new Date().toISOString()
}]};
let state=load(), route={screen:"home",id:null,mode:"learn",level:1,phrase:1,flashIndex:0,flashRevealed:false,result:null,reader:null};
state.verses.forEach(v=>{if(v.notes==null)v.notes=""}); save();
function load(){try{return JSON.parse(localStorage.getItem(KEY))||seed}catch(e){return seed}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function esc(s=""){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function app(html){document.querySelector("#app").innerHTML=`<div class="shell">${html}<div class="footer">A quiet place to remember His Word.<br>With love from LumenStance</div></div>`}
function header(back=false){return `<header>${back?`<button class="back" onclick="go('home')">← Home</button>`:`<div class="brand"><img class="brandMark" src="lumenstance-mark.png" alt="LumenStance"><div><h1>Bible Memory App</h1><div class="tag">Remember His Word.</div></div></div>`}<button class="btn small outline" onclick="go('settings')">Settings</button></header>`}
function go(screen,id=null){route={screen,id,mode:"learn",level:1,phrase:1,flashIndex:0,flashRevealed:false,result:null};render()}
function dueVerses(){return state.verses.filter(v=>!v.due||v.due<=today())}
function render(){
 if(route.screen==="home") return home();
 if(route.screen==="add") return addForm();
 if(route.screen==="themes") return suggestedThemes();
 if(route.screen==="search") return bibleSearch();
 if(route.screen==="verses") return verses();
 if(route.screen==="practice") return practice(route.id);
 if(route.screen==="practicePicker") return practicePicker();
 if(route.screen==="settings") return settings();
 if(route.screen==="reader") return bibleReader();
}
function home(){
 const due=dueVerses().length, learning=state.verses.filter(v=>v.status!=="memorized").length, mem=state.verses.filter(v=>v.status==="memorized").length;
 app(`${header()}<section class="card hero"><h2>Keep His Word close.</h2><p class="homeVerse">“This book of the law shall not depart from your mouth, but you shall meditate on it day and night, that you may observe to do according to all that is written in it; for then you shall make your way prosperous, and then you shall have good success.” <span>— Joshua 1:8 WEBU</span></p>
 <div class="stats"><div class="stat"><b>${due}</b><span>Due today</span></div><div class="stat"><b>${learning}</b><span>Learning</span></div><div class="stat"><b>${mem}</b><span>Memorized</span></div></div>
 <button class="btn primary wide" onclick="practiceDue()">Practice Today's Verses</button>
 <div class="row"><button class="btn wide" onclick="go('verses')">My Verses</button><button class="btn wide" onclick="go('add')">+ Add Passage</button></div></section>
 <div class="notice">Everything you enter is stored in this browser on this device. No account is required. No AI.</div>`)
}
function practiceDue(){if(state.verses.length)return go("practicePicker");go("add")}
function practicePicker(){let due=dueVerses(),items=(due.length?due:state.verses).map(v=>`<div class="listItem" onclick="go('practice','${v.id}')"><div><div class="ref">${esc(v.reference)}</div><div class="tiny">${esc(v.translation||"")} · ${due.length?"Due today":"Choose to practice"}</div></div><span class="badge">Practice</span></div>`).join("");app(`${header(true)}<div class="card"><h2>${due.length?"Practice Today’s Verses":"Choose a Passage to Practice"}</h2><p class="muted">Which passage would you like to spend time with today?</p>${items||`<div class="empty">No passages yet.</div>`}</div>`)}
function parseRef(ref){
 const m=ref.trim().match(/^(.+?)\s+(\d+):(\d+)(?:\s*[-–]\s*(\d+))?$/); if(!m)return null;
 return {book:m[1].trim(),chapter:+m[2],start:+m[3],end:+(m[4]||m[3])};
}
function bookMatch(name){let books=Object.keys(window.BIBLE_DATA?.books||{});return books.find(b=>b.toLowerCase()===name.toLowerCase())}
function showBookSuggestions(value){
 const box=document.querySelector("#bookSuggestions"); if(!box)return;
 const typed=value.trim().toLowerCase(); if(!typed||/\d/.test(typed)){box.innerHTML="";return}
 const matches=Object.keys(window.BIBLE_DATA?.books||{}).filter(b=>b.toLowerCase().startsWith(typed)).slice(0,8);
 box.innerHTML=matches.map(b=>`<button type="button" class="bookSuggestion" onclick="chooseBook('${b.replaceAll("'","\\'")}')">${esc(b)}</button>`).join("");
}
function chooseBook(book){let el=document.querySelector("#ref");el.value=book+" ";el.focus();document.querySelector("#bookSuggestions").innerHTML=""}
function passageFromRef(ref){let p=parseRef(ref);if(!p)return null;let b=bookMatch(p.book);if(!b)return null;let ch=window.BIBLE_DATA.books[b].chapters[String(p.chapter)];if(!ch)return null;let a=[];for(let n=p.start;n<=p.end;n++){if(!ch[String(n)])return null;a.push(ch[String(n)])}return {text:a.join(" "),book:b,...p}}
function fillPassage(){let x=passageFromRef(document.querySelector("#ref").value);let box=document.querySelector("#txt"),msg=document.querySelector("#lookupmsg");if(x){box.value=x.text;msg.textContent="WEBU text filled automatically."}else{msg.textContent="That passage is not in the installed Bible data yet. You can still paste the exact text."}}
function addForm(){
 app(`${header(true)}<div class="card"><h2>Add a verse or passage</h2><p class="muted">Know the reference? Start typing a Bible book and we’ll help you find it.</p><form onsubmit="addVerse(event)">
 <label>Verse or passage</label><div class="row"><div class="referenceEntry"><input id="ref" placeholder="Start typing, for example: Joh…" autocomplete="off" oninput="showBookSuggestions(this.value)" required><div id="bookSuggestions" class="bookSuggestions"></div></div><button class="btn" type="button" onclick="fillPassage()">Find This Passage</button></div><div id="lookupmsg" class="tiny">After the book name, enter a chapter and verse, such as John 15:5.</div>
 <label>Translation</label><input id="trans" value="WEBU" readonly>
 <label>Scripture text</label><textarea id="txt" placeholder="The WEBU text will appear here when you find the passage." required></textarea>
 <button class="btn primary wide" type="submit">Add to My Verses & Start Learning</button></form><div class="discover"><h3>Not sure which passage?</h3><p class="muted">Find Scripture by what’s on your heart or search the Bible for your own words.</p><div class="row"><button class="btn" onclick="go('themes')">Find Verses by Theme</button><button class="btn" onclick="go('search')">Search the Bible</button></div></div></div>`)
}

const THEME_VERSES={
 "When You Need Peace":["Philippians 4:6-7","Isaiah 41:10","John 14:27"],
 "Trusting God One Day at a Time":["Proverbs 3:5-6","Psalms 37:5","Romans 8:28"],
 "Finding Strength & Courage":["Joshua 1:9","Isaiah 40:31","Philippians 4:13"],
 "Growing in Faith":["Hebrews 11:1","Mark 11:24","2 Corinthians 5:7"],
 "Resting in God’s Love":["John 3:16","Romans 8:38-39","1 John 4:9-10"],
 "Giving & Receiving Forgiveness":["1 John 1:9","Ephesians 4:32","Colossians 3:13"],
 "Seeking Wisdom & Guidance":["James 1:5","Psalms 119:105","Proverbs 16:9"],
 "When You’re Facing Temptation":["1 Corinthians 10:13","Psalms 119:11","James 1:21"],
 "Growing in Prayer":["Matthew 6:9-13","1 Thessalonians 5:16-18","Jeremiah 33:3"],
 "Holding On to Hope":["Romans 15:13","Jeremiah 29:11","Psalms 42:11"],
 "Living with Gratitude":["1 Thessalonians 5:18","Psalms 100:4-5","Colossians 3:17"],
 "Your Identity in Christ":["2 Corinthians 5:17","Ephesians 2:10","Galatians 2:20"],
 "When Your Heart Is Grieving":["Psalms 34:18","Matthew 5:4","Revelation 21:4"],
 "When You Feel Alone":["Deuteronomy 31:8","Psalms 27:10","Hebrews 13:5"],
 "Finding Rest":["Matthew 11:28-30","Psalms 23:1-3","Exodus 33:14"],
 "Waiting with Patience":["Psalms 27:14","Isaiah 40:31","Romans 12:12"],
 "Choosing Joy":["Psalms 16:11","John 15:11","Philippians 4:4"],
 "Growing in Kindness & Compassion":["Ephesians 4:32","Colossians 3:12","Luke 6:36"],
 "Loving Others Well":["1 Corinthians 13:4-7","Romans 12:10","Ephesians 4:2-3"],
 "Caring for Your Family":["Deuteronomy 6:6-7","Proverbs 22:6","Colossians 3:20-21"],
 "Bringing Faith into Your Work":["Colossians 3:23-24","Proverbs 16:3","Ephesians 2:10"],
 "Learning Contentment":["Philippians 4:11-13","1 Timothy 6:6-8","Hebrews 13:5"],
 "When Life Feels Overwhelming":["Psalms 61:2","Matthew 6:34","1 Peter 5:7"],
 "When You Need Comfort & Healing":["Psalms 147:3","2 Corinthians 1:3-4","Psalms 103:2-3"],
 "When You Have a Decision to Make":["Proverbs 3:5-6","James 1:5","Psalms 32:8"],
 "Speaking with Grace":["Proverbs 15:1","Ephesians 4:29","James 1:19"],
 "Walking Humbly with God":["Philippians 2:3-4","James 4:10","Micah 6:8"],
 "Serving Others with Love":["Mark 10:45","Galatians 5:13","1 Peter 4:10"],
 "Living Generously":["2 Corinthians 9:7","Luke 6:38","Proverbs 19:17"],
 "Remembering God’s Faithfulness":["Lamentations 3:22-23","Deuteronomy 7:9","2 Timothy 2:13"],
 "When You Need God’s Protection":["Psalms 91:1-2","Psalms 121:7-8","2 Thessalonians 3:3"],
 "Beginning Again":["Isaiah 43:18-19","2 Corinthians 5:17","Lamentations 3:22-23"]
};
function suggestedThemes(){
 let html=Object.entries(THEME_VERSES).map(([theme,refs])=>`<div class="themeGroup"><h3>${esc(theme)}</h3>${refs.map(ref=>{let x=passageFromRef(ref);return `<button class="suggestion" onclick="addSuggested('${ref.replaceAll("'","\\'")}')"><b>${esc(ref)}</b>${x?`<span>${esc(x.text)}</span>`:""}</button>`}).join("")}</div>`).join("");
 app(`${header(true)}<div class="card"><h2>Find a Verse for What’s on Your Heart</h2><p class="muted">Browse a theme, then tap any passage you’d like to learn and remember.</p>${html}</div>`)
}
function addSuggested(ref){let x=passageFromRef(ref);if(!x)return alert("That passage could not be found in the installed WEBU Bible.");let existing=state.verses.find(v=>v.reference.toLowerCase()===ref.toLowerCase());if(existing)return go("practice",existing.id);let v={id:"v"+Date.now(),reference:ref,translation:"WEBU",text:x.text,notes:"",status:"new",due:today(),streak:0,created:new Date().toISOString()};state.verses.push(v);save();go("practice",v.id)}
function bibleSearch(){
 let q=route.searchQuery||"",results=route.searchResults||[];
 let body=q?results.length?results.map(r=>`<div class="searchResult"><div class="ref">${esc(r.reference)}</div><p>${highlightTerms(r.text,q)}</p><button class="btn small primary" onclick="addSearchResult('${r.book.replaceAll("'","\\'")}',${r.chapter},${r.verse})">Add to My Verses</button></div>`).join(""):`<div class="empty">No verses found for “${esc(q)}”. Try another word or phrase.</div>`:`<div class="empty">Search all 66 books of the installed WEBU Bible by a word or phrase.</div>`;
 app(`${header(true)}<div class="card"><h2>Search the Bible</h2><p class="muted">Search for a word or phrase that’s on your heart. Everything stays on this device and works offline.</p><form class="searchForm" onsubmit="runBibleSearch(event)"><input id="bibleSearchInput" value="${esc(q)}" placeholder="peace, wisdom, fear, love…" required><button class="btn primary" type="submit">Search</button></form><div class="tiny searchCount">${q?`${results.length}${results.length===100?"+":""} result${results.length===1?"":"s"}`:""}</div>${body}</div>`)
}
function runBibleSearch(e){e.preventDefault();let q=document.querySelector("#bibleSearchInput").value.trim();let terms=norm(q).split(" ").filter(Boolean),out=[];if(!terms.length)return;outer:for(const [book,bv] of Object.entries(window.BIBLE_DATA?.books||{})){for(const [chapter,ch] of Object.entries(bv.chapters||{})){for(const [verse,text] of Object.entries(ch)){let n=norm(text);if(terms.every(t=>n.includes(t))){out.push({book,chapter:+chapter,verse:+verse,reference:`${book} ${chapter}:${verse}`,text});if(out.length>=100)break outer}}}}route.searchQuery=q;route.searchResults=out;render()}
function highlightTerms(text,q){let terms=norm(q).split(" ").filter(Boolean).sort((a,b)=>b.length-a.length);if(!terms.length)return esc(text);let safe=esc(text);for(const t of terms){let re=new RegExp(`(${t.replace(/[.*+?^${}()|[\\]\\]/g,"\\$&")})`,"gi");safe=safe.replace(re,"<mark>$1</mark>")}return safe}
function addSearchResult(book,chapter,verse){let ref=`${book} ${chapter}:${verse}`,text=window.BIBLE_DATA.books[book].chapters[String(chapter)][String(verse)],existing=state.verses.find(v=>v.reference===ref);if(existing)return go("practice",existing.id);let v={id:"v"+Date.now(),reference:ref,translation:"WEBU",text,notes:"",status:"new",due:today(),streak:0,created:new Date().toISOString()};state.verses.push(v);save();go("practice",v.id)}

function addVerse(e){e.preventDefault();let v={id:"v"+Date.now(),reference:ref.value.trim(),translation:trans.value.trim(),text:txt.value.trim(),notes:"",status:"new",due:today(),streak:0,created:new Date().toISOString()};state.verses.push(v);save();go("practice",v.id)}
function verses(){
 let items=state.verses.map(v=>`<div class="listItem" onclick="go('practice','${v.id}')"><div><div class="ref">${esc(v.reference)}</div><div class="tiny">${esc(v.translation||"")} · Due ${esc(v.due||"today")}</div></div><span class="badge">${esc(v.status||"new")}</span></div>`).join("");
 app(`${header(true)}<div class="card"><div class="row"><h2 style="flex:3">My Verses</h2><button class="btn small primary" onclick="go('add')">+ Add</button></div>${items||`<div class="empty">No passages yet.</div>`}</div>`)
}
function words(text){return text.split(/(\s+)/)}
function hideWords(text,level){
 let pct=[0,.25,.5,.75][level]||.25, idx=0;
 return words(text).map(t=>{if(!t.trim())return t;idx++;let clean=t.replace(/[^\p{L}\p{N}']/gu,"");let hide=((idx*37)%100)<pct*100 && clean.length>2;return hide?`<span class="wordblank">${esc(t)}</span>`:esc(t)}).join("");
}
function flashWords(text){return text.match(/[\p{L}\p{N}’'’-]+/gu)||[]}
function initials(text){return text.replace(/\b([\p{L}\p{N}])[\p{L}\p{N}'’-]*/gu,"$1")}
function phrases(text){return text.match(/[^,;:.!?]+[,;:.!?]?/g)?.map(x=>x.trim()).filter(Boolean)||[text]}
function practice(id){
 let v=state.verses.find(x=>x.id===id); if(!v)return go("home");
 let body="";
 if(route.mode==="learn") body=`<div class="verseText">${esc(v.text)}</div><button class="btn primary wide" onclick="setMode('phrase')">I'm Ready to Practice</button>`;
 if(route.mode==="phrase"){let p=phrases(v.text);let n=Math.min(route.phrase,p.length);body=`<div class="tiny">Phrase ${n} of ${p.length}</div><div class="verseText">${esc(p.slice(0,n).join(" "))}</div><div class="row"><button class="btn" onclick="route.phrase=Math.max(1,route.phrase-1);render()">− Phrase</button><button class="btn primary" onclick="route.phrase=Math.min(${p.length},route.phrase+1);render()">+ Phrase</button></div>`}
 if(route.mode==="hide") body=`<div class="tiny">${route.level*25}% hidden</div><div class="verseText">${route.revealed?esc(v.text):hideWords(v.text,route.level)}</div><div class="difficulty"><button class="btn ${route.level===1?"primary":""}" onclick="route.level=1;route.revealed=false;render()">Easier · 25%</button><button class="btn ${route.level===2?"primary":""}" onclick="route.level=2;route.revealed=false;render()">Medium · 50%</button><button class="btn ${route.level===3?"primary":""}" onclick="route.level=3;route.revealed=false;render()">Harder · 75%</button></div><button class="btn outline wide" onclick="route.revealed=!route.revealed;render()">${route.revealed?"Hide Verse":"Reveal Verse"}</button>`;
 if(route.mode==="initials") body=`<div class="verseText">${route.revealed?esc(v.text):esc(initials(v.text))}</div><button class="btn outline wide" onclick="route.revealed=!route.revealed;render()">${route.revealed?"Show First Letters":"Reveal Verse"}</button>`;
 if(route.mode==="flash"){let fw=flashWords(v.text),i=Math.min(route.flashIndex||0,Math.max(0,fw.length-1));route.flashIndex=i;body=`<div class="tiny flashCount">Word ${i+1} of ${fw.length}</div><button class="flashCard" onclick="route.flashRevealed=!route.flashRevealed;render()"><span>${route.flashRevealed?esc(fw[i]||""):"Tap to reveal word"}</span></button><div class="row"><button class="btn" onclick="route.flashIndex=Math.max(0,${i}-1);route.flashRevealed=false;render()" ${i===0?"disabled":""}>← Previous</button><button class="btn primary" onclick="route.flashIndex=Math.min(${fw.length-1},${i}+1);route.flashRevealed=false;render()">Next →</button></div>`;body=body.replace(`Math.min(1,${i}+1)`,`Math.min(${fw.length-1},${i}+1)`).replace('Next →</button>',`${i===fw.length-1?'Start Over ↻':'Next →'}</button>`);if(i===fw.length-1)body=body.replace(`route.flashIndex=Math.min(${fw.length-1},${i}+1)`,`route.flashIndex=0`)}
 if(route.mode==="test") body=route.result?testResult(v,route.result):`<p class="muted">Type the passage from memory. Capitalization and punctuation won't count against you.</p><textarea id="attempt" placeholder="Begin typing from memory…"></textarea><button class="btn primary wide" onclick="checkTest('${v.id}')">Check My Answer</button>`;
 app(`${header(true)}<div class="card"><div class="reference">${esc(v.reference)} · ${esc(v.translation||"")}</div>
 <div class="modebar"><button class="btn small ${route.mode==="learn"?"primary":""}" onclick="setMode('learn')">Learn</button><button class="btn small ${route.mode==="phrase"?"primary":""}" onclick="setMode('phrase')">Phrase Builder</button><button class="btn small ${route.mode==="hide"?"primary":""}" onclick="setMode('hide')">Hide Words</button><button class="btn small ${route.mode==="initials"?"primary":""}" onclick="setMode('initials')">First Letters</button><button class="btn small ${route.mode==="flash"?"primary":""}" onclick="setMode('flash')">Flash Cards</button><button class="btn small ${route.mode==="test"?"primary":""}" onclick="setMode('test')">Test Me</button></div>${body}<button class="btn contextToggle ${route.contextShown?"primary":""}" onclick="route.contextShown=!route.contextShown;render()">${route.contextShown?"Hide Verse in Context":"Show Verse in Context"}</button>${route.contextShown?`<div class="contextBox" onclick="openReader('${v.id}')">${contextHtml(v)}</div>`:""}<div class="notesBox"><h3 class="sectionTitle">My Notes</h3><p class="tiny">Private notes for this passage. Saved automatically on this device.</p><textarea class="noteArea" oninput="saveNote('${v.id}',this.value)" placeholder="Write what you notice, what you want to remember, or how this passage speaks to you…">${esc(v.notes||"")}</textarea></div></div>
 <div class="card"><h3>How did that feel?</h3><div class="row stack"><button class="btn" onclick="rate('${v.id}','again')">Keep Practicing</button><button class="btn" onclick="rate('${v.id}','almost')">Almost There</button><button class="btn primary" onclick="rate('${v.id}','gotit')">I Know It</button></div></div>`)
}
function contextHtml(v){
 let p=parseRef(v.reference); if(!p)return `<h3 class="sectionTitle">Read in Context</h3><p class="muted">Open the Bible reader to read around this passage.</p><div class="contextHint">Tap to open Bible Reader →</div>`;
 let b=bookMatch(p.book),ch=b&&window.BIBLE_DATA?.books?.[b]?.chapters?.[String(p.chapter)];
 if(!ch)return `<h3 class="sectionTitle">Read in Context</h3><p class="muted">Bible text for this book will appear here when the full 66-book WEBU package is installed.</p><div class="contextHint">Tap to open Bible Reader →</div>`;
 let lo=Math.max(1,p.start-3),hi=p.end+3,out=[];for(let n=lo;n<=hi;n++){if(ch[String(n)])out.push(`<div class="contextVerse ${n>=p.start&&n<=p.end?"focus":""}"><span class="verseNum">${n}</span>${esc(ch[String(n)])}</div>`)}
 return `<h3 class="sectionTitle">Read in Context</h3><div class="tiny">${esc(b)} ${p.chapter} · WEBU</div>${out.join("")}<div class="contextHint">Tap here to continue reading →</div>`
}
function saveNote(id,val){let v=state.verses.find(x=>x.id===id);if(v){v.notes=val;save()}}
function openReader(id){let v=state.verses.find(x=>x.id===id),p=parseRef(v?.reference||"");route={screen:"reader",id,reader:p?{book:bookMatch(p.book)||p.book,chapter:p.chapter,selected:p.start}:null};render()}
function bibleReader(){
 let books=Object.keys(window.BIBLE_DATA?.books||{}),r=route.reader||{book:books[0],chapter:1,selected:null};if(!r.book||!window.BIBLE_DATA?.books?.[r.book])return app(`${header(true)}<div class="card"><h2>Bible Reader</h2><p class="muted">The reader is ready. The complete 66-book WEBU text package still needs to be added.</p></div>`);
 let chapters=Object.keys(window.BIBLE_DATA.books[r.book].chapters).map(Number).sort((a,b)=>a-b),ch=window.BIBLE_DATA.books[r.book].chapters[String(r.chapter)]||{};
 let bookOpts=books.map(b=>`<option ${b===r.book?"selected":""}>${esc(b)}</option>`).join(""),chapOpts=chapters.map(c=>`<option ${c===r.chapter?"selected":""}>${c}</option>`).join("");
 let verses=Object.entries(ch).map(([n,t])=>`<div class="readerVerse ${+n===r.selected?"selected":""}" onclick="route.reader.selected=${n};render()"><span class="verseNum">${n}</span>${esc(t)}</div>`).join("");
 app(`${header(true)}<div class="card"><h2>Bible Reader</h2><div class="readerNav"><label>Book<select onchange="changeReaderBook(this.value)">${bookOpts}</select></label><label>Chapter<select onchange="route.reader.chapter=+this.value;route.reader.selected=null;render()">${chapOpts}</select></label></div><div class="readerChapter">${verses}</div>${r.selected?`<button class="btn primary wide" onclick="memorizeSelected()">Memorize ${esc(r.book)} ${r.chapter}:${r.selected}</button>`:""}</div>`)
}
function changeReaderBook(b){route.reader.book=b;route.reader.chapter=Math.min(...Object.keys(window.BIBLE_DATA.books[b].chapters).map(Number));route.reader.selected=null;render()}
function memorizeSelected(){let r=route.reader,t=window.BIBLE_DATA.books[r.book].chapters[String(r.chapter)][String(r.selected)];let existing=state.verses.find(v=>v.reference===`${r.book} ${r.chapter}:${r.selected}`);if(existing)return go("practice",existing.id);let v={id:"v"+Date.now(),reference:`${r.book} ${r.chapter}:${r.selected}`,translation:"WEBU",text:t,notes:"",status:"new",due:today(),streak:0,created:new Date().toISOString()};state.verses.push(v);save();go("practice",v.id)}
function setMode(m){route.mode=m;route.result=null;route.revealed=false;route.flashIndex=0;route.flashRevealed=false;render()}
function norm(s){return s.toLowerCase().replace(/[^\p{L}\p{N}'\s]/gu,"").replace(/\s+/g," ").trim()}
function checkTest(id){let v=state.verses.find(x=>x.id===id), a=norm(document.querySelector("#attempt").value).split(" ").filter(Boolean), b=norm(v.text).split(" ").filter(Boolean);let correct=0;let shown=b.map((w,i)=>{let ok=a[i]===w;if(ok)correct++;return `<span class="${ok?"ok":"miss"}">${esc(w)}</span>`}).join(" ");route.result={score:Math.round(correct/Math.max(1,b.length)*100),shown};render()}
function testResult(v,r){return `<div class="score">${r.score}%</div><p class="muted" style="text-align:center">Green words matched. Highlighted words need another look.</p><div class="diff">${r.shown}</div><button class="btn outline wide" onclick="route.result=null;render()">Try Again</button>`}
function rate(id,r){let v=state.verses.find(x=>x.id===id);if(r==="again"){v.streak=0;v.status="learning";v.due=today()}if(r==="almost"){v.streak=Math.max(1,v.streak||0);v.status="learning";v.due=addDays(1)}if(r==="gotit"){v.streak=(v.streak||0)+1;let gaps=[3,7,14,30,60];v.due=addDays(gaps[Math.min(v.streak-1,gaps.length-1)]);v.status=v.streak>=4?"memorized":"learning"}save();go("home")}
function settings(){
 app(`${header(true)}<div class="card"><h2>Settings</h2><label>Default translation</label><input id="deftrans" value="${esc(state.settings.defaultTranslation)}" onchange="state.settings.defaultTranslation=this.value;save()">
 <h3 style="margin-top:26px">Backup & restore</h3><p class="muted">Your verses live only on this device. Export a backup before clearing browser data or changing devices.</p>
 <div class="row stack"><button class="btn" onclick="backup()">Backup My Verses</button><label class="btn" style="text-align:center;margin:0">Restore Backup<input type="file" accept=".json,application/json" style="display:none" onchange="restore(this.files[0])"></label></div>
 <h3 style="margin-top:26px">About privacy</h3><p class="muted">Bible Memory App does not require an account and this version does not send your verse library or practice history to a server.</p></div>`)
}
function backup(){let blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="bible-memory-app-backup.json";a.click();URL.revokeObjectURL(u)}
function restore(file){if(!file)return;let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);if(!Array.isArray(x.verses))throw 0;state=x;save();alert("Backup restored.");go("home")}catch(e){alert("That backup file could not be restored.")}};r.readAsText(file)}
render();
