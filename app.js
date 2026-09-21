const FRIENDS=["Asunoo","Waynn","Falkoo","Sloom","Yukoo","Ragnar","Nidiru","Zeeway"];
const QUESTIONS=["Qui est le plus gros Tryharder ?","Qui est le plus susceptible ?","Qui est le plus raciste ?","Qui est le plus gay ?","Qui est le plus drôle ?","Qui est le plus absent ?","Qui s'endort en voc ?","Qui est le plus guezzzzz au jeux ?","Qui se fait boost le plus ?","Qui est le plus gros toxico ?","Qui est le plus alcoolique ?","Qui bz le plus ?","Qui a le plus gros bodycount ?","Qui est le plus con ?","Qui est le plus brainrot ?","Qui se fait ragebait ?","Qui est trop 1er degrés ?","Qui est le plus susceptible de devenir riche ?","Qui est le plus susceptible de finir streamer ?","Qui survivrait le plus longtemps dans une apocalypse ?","Qui répond le plus vite aux messages ?","Qui répond le moins aux messages ?","Qui pourrait disparaître 6 mois sans prévenir ?","Qui serait le pire colocataire ?","Qui est le plus bordélique ?","Qui est le plus gros menteur ?","Qui est le plus susceptible de créer un drama ?","Qui est le plus susceptible de se faire bannir d'un serveur ?","Qui est le plus susceptible de devenir célèbre ?","Qui ferait le meilleur chef de groupe ?","Qui est le plus imprévisible ?","Qui est le plus susceptible de faire une dinguerie à 3h du matin ?","Qui est le plus susceptible d'oublier son propre anniversaire ?","Qui est le plus susceptible de ragequit ?","Qui est le plus compétitif pour absolument rien ?","Qui est le plus susceptible de changer de pseudo tous les mois ?","Qui est le plus gros procrastinateur ?","Qui a le plus de chances de se faire arnaquer par un scam évident ?","Qui est le plus susceptible de devenir un meme du groupe ?"];

const id=document.querySelector('#identity'),app=document.querySelector('#voteApp'),res=document.querySelector('#resultsApp');
let current=null, db=null, questionRows=[];
const configured=window.SUPABASE_URL && window.SUPABASE_ANON_KEY && !window.SUPABASE_URL.includes('TON-PROJET') && !window.SUPABASE_ANON_KEY.includes('TA_CLE');

function go(section){document.getElementById(section).scrollIntoView({behavior:'smooth'});}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function showStatus(message,type='info'){const el=document.querySelector('#connectionStatus');if(el){el.textContent=message;el.dataset.type=type;}}

async function init(){
  if(!configured){
    showStatus('CONFIGURATION REQUISE — Supabase n’est pas encore connecté.','warn');
    renderIdentity();
    res.innerHTML='<div class="empty"><strong>Vote partagé non activé.</strong><br>Il faut connecter ce site à Supabase. Le fichier README explique les 3 étapes.</div>';
    return;
  }
  try{
    db=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
    const {data,error}=await db.from('questions').select('id,question,position').order('position');
    if(error) throw error;
    questionRows=data||[];
    if(questionRows.length!==QUESTIONS.length) throw new Error(`La base contient ${questionRows.length} questions au lieu de ${QUESTIONS.length}.`);
    showStatus('SERVEUR CONNECTÉ — votes partagés en temps réel','ok');
    renderIdentity();
    await renderResults();
    setInterval(renderResults,5000);
  }catch(e){
    console.error(e);
    showStatus('ERREUR DE CONNEXION — vérifie Supabase et le SQL.','error');
    renderIdentity();
    res.innerHTML='<div class="empty"><strong>Impossible de joindre la base de votes.</strong><br>Ouvre la console du navigateur si tu veux voir le détail technique.</div>';
  }
}

function renderIdentity(){
  const saved=localStorage.getItem('rawsfynzVoter')||'';
  id.innerHTML=`<label>QUI ES-TU ?</label><select class="select" id="who"><option value="">— sélectionner ton pseudo —</option>${FRIENDS.map(x=>`<option ${x===saved?'selected':''}>${esc(x)}</option>`).join('')}</select>`;
  document.querySelector('#who').onchange=e=>{current=e.target.value;localStorage.setItem('rawsfynzVoter',current);if(current)renderVote()};
  if(saved && FRIENDS.includes(saved)){current=saved;renderVote();}
}

function renderVote(){
  app.classList.remove('hidden');
  app.innerHTML=`<div class="vote-head"><div><div class="counter" id="counter">0 / ${QUESTIONS.length} répondues</div><div class="bar"><span id="bar"></span></div></div><button class="btn" onclick="resetVote()">CHANGER DE PSEUDO</button></div><div class="questions">${QUESTIONS.map((q,i)=>`<article class="q"><div class="qnum">${String(i+1).padStart(2,'0')}</div><h3>${esc(q)}</h3><div class="opts">${FRIENDS.filter(x=>x!==current).map((x,j)=>`<div><input id="q${i}-${j}" type="radio" name="q${i}" value="${esc(x)}"><label for="q${i}-${j}">${esc(x)}</label></div>`).join('')}</div></article>`).join('')}</div><div class="actions"><button class="btn" id="submitBtn" onclick="submitVote()">ENVOYER MES VOTES →</button></div>`;
  app.querySelectorAll('input').forEach(x=>x.onchange=update);
  loadMyVotes();
}

async function loadMyVotes(){
  if(!db||!current||!questionRows.length)return;
  const {data,error}=await db.from('votes').select('question_id,target').eq('voter',current);
  if(error){console.error(error);return;}
  (data||[]).forEach(v=>{
    const i=questionRows.findIndex(q=>q.id===v.question_id);
    if(i<0)return;
    const input=[...app.querySelectorAll(`input[name=q${i}]`)].find(x=>x.value===v.target);
    if(input)input.checked=true;
  });
  update();
}

function update(){
  const n=QUESTIONS.filter((_,i)=>app.querySelector(`input[name=q${i}]:checked`)).length;
  const counter=document.querySelector('#counter'),bar=document.querySelector('#bar');
  if(counter)counter.textContent=`${n} / ${QUESTIONS.length} répondues`;
  if(bar)bar.style.width=(n/QUESTIONS.length*100)+'%';
}

async function submitVote(){
  if(!db){alert('La connexion Supabase n’est pas configurée.');return;}
  const answers=QUESTIONS.map((_,i)=>app.querySelector(`input[name=q${i}]:checked`)?.value);
  if(answers.includes(undefined)){alert('Toutes les questions doivent être répondues.');return;}
  const btn=document.querySelector('#submitBtn');
  btn.disabled=true;btn.textContent='ENVOI EN COURS...';
  const rows=answers.map((target,i)=>({voter:current,question_id:questionRows[i].id,target}));
  const {error}=await db.from('votes').upsert(rows,{onConflict:'voter,question_id'});
  btn.disabled=false;btn.textContent='ENVOYER MES VOTES →';
  if(error){console.error(error);alert('Erreur lors de l’envoi des votes. Vérifie la configuration Supabase.');return;}
  showStatus(`VOTES ENREGISTRÉS — ${current} a envoyé ses ${QUESTIONS.length} réponses`,'ok');
  await renderResults();
  go('results');
  alert(`Votes enregistrés pour ${current} !`);
}

function resetVote(){current=null;localStorage.removeItem('rawsfynzVoter');app.classList.add('hidden');renderIdentity();go('vote');}

async function renderResults(){
  if(!db)return;
  const {data,error}=await db.from('votes').select('voter,question_id,target');
  if(error){console.error(error);return;}
  const votes=data||[];
  const completeVoters=FRIENDS.filter(name=>new Set(votes.filter(v=>v.voter===name).map(v=>v.question_id)).size===QUESTIONS.length);
  let counts=Object.fromEntries(FRIENDS.map(x=>[x,0]));
  votes.forEach(v=>{if(counts[v.target]!==undefined)counts[v.target]++;});
  const rows=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  res.innerHTML=`<div class="live-summary"><strong>${completeVoters.length} / ${FRIENDS.length}</strong> participants ont terminé leurs votes.<br><span>${votes.length} réponses enregistrées sur ${FRIENDS.length*QUESTIONS.length}.</span></div>`+rows.map((r,i)=>`<div class="rank"><span>#${i+1} — ${esc(r[0])}</span><strong>${r[1]} vote(s)</strong></div>`).join('');
}

window.go=go;window.resetVote=resetVote;window.submitVote=submitVote;
init();
