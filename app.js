const PROGRAM = [
  {week:1, desc:"Lær kroppen at løbe", sessions:[
    {name:"Pas 1", warm:300, run:60, walk:120, reps:6, cool:300},
    {name:"Pas 2", warm:300, run:120, walk:120, reps:6, cool:300},
    {name:"Pas 3", warm:300, run:180, walk:120, reps:5, cool:300}
  ]},
  {week:2, desc:"Byg videre", sessions:[
    {name:"Pas 1", warm:300, run:180, walk:120, reps:5, cool:300},
    {name:"Pas 2", warm:300, run:240, walk:120, reps:5, cool:300},
    {name:"Pas 3", warm:300, run:300, walk:120, reps:4, cool:300}
  ]},
  {week:3, desc:"Lidt længere løb", sessions:[
    {name:"Pas 1", warm:300, run:300, walk:120, reps:4, cool:300},
    {name:"Pas 2", warm:300, run:360, walk:120, reps:4, cool:300},
    {name:"Pas 3", warm:300, run:420, walk:120, reps:3, cool:300}
  ]},
  {week:4, desc:"Klarere til næste fase", sessions:[
    {name:"Pas 1", warm:300, run:420, walk:120, reps:3, cool:300},
    {name:"Pas 2", warm:300, run:480, walk:120, reps:3, cool:300},
    {name:"Pas 3", warm:300, run:600, walk:120, reps:2, cool:300}
  ]}
];

const state = {week:1, session:0, steps:[], stepIndex:0, remaining:0, timer:null, paused:false, elapsed:0, sound:true};
const $ = id => document.getElementById(id);
const key = (w,s) => `run-${w}-${s}`;
const completed = () => JSON.parse(localStorage.getItem("completedRuns") || "[]");
const isDone = (w,s) => completed().includes(key(w,s));
const saveDone = (w,s) => { const a=completed(); if(!a.includes(key(w,s))){a.push(key(w,s));localStorage.setItem("completedRuns",JSON.stringify(a));} };

function fmt(sec){const m=Math.floor(sec/60).toString().padStart(2,"0"),s=Math.floor(sec%60).toString().padStart(2,"0");return `${m}:${s}`}
function show(id){
  document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));
  $(id).classList.add("active");
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.screen===id));
  window.scrollTo(0,0);
}
function currentSession(){return PROGRAM[state.week-1].sessions[state.session]}

function buildSteps(w,s){
  const p=PROGRAM[w-1].sessions[s], a=[];
  a.push({type:"walk",label:"GANG",seconds:p.warm,repeat:"Opvarmning"});
  for(let i=0;i<p.reps;i++){
    a.push({type:"run",label:"LØB",seconds:p.run,repeat:`${i+1} / ${p.reps}`});
    a.push({type:"walk",label:"GANG",seconds:p.walk,repeat:`${i+1} / ${p.reps}`});
  }
  a.push({type:"walk",label:"GANG",seconds:p.cool,repeat:"Nedkøling"});
  return a;
}
function renderProgram(){
  $("programList").innerHTML=PROGRAM.map((w,wi)=>`
    <div class="program-week">
      <div class="week-top"><div><div class="week-name">Uge ${w.week}</div><div class="week-desc">${w.desc}</div></div>
      <div class="pills">${w.sessions.map((_,si)=>`<button class="pill ${isDone(w.week,si)?"done":""} ${w.week===state.week&&si===state.session?"current":""}" data-open="${wi}-${si}">${isDone(w.week,si)?"✓":si+1}</button>`).join("")}</div></div>
    </div>`).join("");
  document.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>openDetail(...b.dataset.open.split("-").map(Number)));
}
function openDetail(wi,si){
  state.week=wi+1;state.session=si;const w=PROGRAM[wi],p=w.sessions[si];
  $("detailTitle").textContent=`Uge ${w.week} · Pas ${si+1}`;$("detailSubtitle").textContent=w.desc;
  $("detailContent").innerHTML=`
    <div class="detail-row"><span class="emoji">🏃</span><strong>${fmt(p.warm)}</strong><span>Gang (opvarmning)</span></div>
    <div class="detail-row"><span class="emoji">🏃</span><strong>${fmt(p.run)}</strong><span>Løb</span></div>
    <div class="detail-row"><span class="emoji">🚶</span><strong>${fmt(p.walk)}</strong><span>Gang</span></div>
    <div class="detail-row"><span class="emoji">↻</span><strong>× ${p.reps}</strong><span>Gentag ${p.reps} gange</span></div>
    <div class="detail-row"><span class="emoji">🚶</span><strong>${fmt(p.cool)}</strong><span>Gang (nedkøling)</span></div>`;
  show("detailScreen");
}
function startWorkout(){
  state.steps=buildSteps(state.week,state.session);state.stepIndex=0;state.remaining=state.steps[0].seconds;state.elapsed=0;state.paused=false;
  $("workoutTitle").textContent=`Uge ${state.week} · Pas ${state.session+1}`;show("workoutScreen");updateWorkout();clearInterval(state.timer);state.timer=setInterval(tick,1000);
}
function tick(){
  if(state.paused)return;
  state.elapsed++;state.remaining--;
  if(state.remaining<=0){
    beep();state.stepIndex++;
    if(state.stepIndex>=state.steps.length){finishWorkout();return}
    state.remaining=state.steps[state.stepIndex].seconds;
  }
  updateWorkout();
}
function beep(){if(!state.sound)return;try{const C=window.AudioContext||window.webkitAudioContext,c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=720;g.gain.value=.08;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.15)}catch(e){}}
function updateWorkout(){
  const step=state.steps[state.stepIndex], next=state.steps[state.stepIndex+1];
  $("phaseLabel").textContent=step.label;$("timer").textContent=fmt(state.remaining);$("repeatLabel").textContent=step.repeat;
  $("intervalPanel").style.background=step.type==="run"?"#d9f5e6":"#e2f2fb";
  $("nextLabel").textContent=next?`${next.label} · ${fmt(next.seconds)}`:"Færdig";
  $("progressFill").style.width=`${Math.min(100,(state.elapsed/(state.steps.reduce((a,x)=>a+x.seconds,0)))*100)}%`;
  $("pauseBtn").textContent=state.paused?"▶":"Ⅱ";$("pauseLabel").textContent=state.paused?"Fortsæt":"Pause";
}
function finishWorkout(){
  clearInterval(state.timer);saveDone(state.week,state.session);
  const p=currentSession(), runMin=Math.round((p.run*p.reps)/60);
  $("completeText").textContent=`Du har gennemført Uge ${state.week} · ${p.name}`;
  $("stats").innerHTML=`<div class="stat-row"><span>⏱ Tid i alt</span><strong>${fmt(state.steps.reduce((a,x)=>a+x.seconds,0))}</strong></div><div class="stat-row"><span>🏃 Løb</span><strong>${runMin} min</strong></div><div class="stat-row"><span>🚶 Gang</span><strong>${Math.round((p.walk*p.reps+p.warm+p.cool)/60)} min</strong></div>`;
  show("completeScreen");renderProgram();updateStats();
}
function updateStats(){
  const a=completed();$("completedCount").textContent=a.length;
  let mins=0;a.forEach(k=>{const [_,w,s]=k.split("-").map(Number),p=PROGRAM[w-1]?.sessions[s];if(p)mins+=p.run*p.reps/60});
  $("totalRunMinutes").textContent=Math.round(mins);
}
function nextWorkout(){
  for(let w=1;w<=4;w++)for(let s=0;s<3;s++)if(!isDone(w,s))return [w,s];
  return [1,0];
}

$("homeStart").onclick=startWorkout;$("detailStart").onclick=startWorkout;
$("pauseBtn").onclick=()=>{state.paused=!state.paused;updateWorkout()};
$("soundToggle").onclick=()=>{state.sound=!state.sound;$("soundToggle").textContent=state.sound?"🔊":"🔇"};
$("stopWorkout").onclick=()=>{clearInterval(state.timer);show("homeScreen")};
$("finishBtn").onclick=()=>show("homeScreen");
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{show(t.dataset.screen);if(t.dataset.screen==="programScreen")renderProgram();if(t.dataset.screen==="statsScreen")updateStats()});
document.querySelectorAll("[data-back]").forEach(b=>b.onclick=()=>show(b.dataset.back));

const [nw,ns]=nextWorkout();state.week=nw;state.session=ns;
$("homeWorkoutTitle").textContent=`Uge ${nw} · Pas ${ns+1}`;
const hp=PROGRAM[nw-1].sessions[ns];$("homeWorkoutSummary").textContent=`${Math.round(hp.warm/60)} min gang · ${Math.round(hp.run/60)} min løb / ${Math.round(hp.walk/60)} min gang × ${hp.reps} · ${Math.round(hp.cool/60)} min gang`;
renderProgram();updateStats();

if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js"));
