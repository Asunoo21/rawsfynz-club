const FRIENDS=["Asunoo","Waynn","Falkoo","Sloom","Yukoo","Ragnar","Nidiru","Zeeway"];
let QUESTIONS=["Qui est le plus gros Tryharder ?","Qui est le plus susceptible ?","Qui est le plus raciste ?","Qui est le plus gay ?","Qui est le plus drôle ?","Qui est le plus absent ?","Qui s'endort en voc ?","Qui est le plus guezzzzz au jeux ?","Qui se fait boost le plus ?","Qui est le plus gros toxico ?","Qui est le plus alcoolique ?","Qui bz le plus ?","Qui a le plus gros bodycount ?","Qui est le plus con ?","Qui est le plus brainrot ?","Qui se fait ragebait ?","Qui est trop 1er degrés ?","Qui est le plus susceptible de devenir riche ?","Qui est le plus susceptible de finir streamer ?","Qui survivrait le plus longtemps dans une apocalypse ?","Qui répond le plus vite aux messages ?","Qui répond le moins aux messages ?","Qui pourrait disparaître 6 mois sans prévenir ?","Qui serait le pire colocataire ?","Qui est le plus bordélique ?","Qui est le plus gros menteur ?","Qui est le plus susceptible de créer un drama ?","Qui est le plus susceptible de se faire bannir d'un serveur ?","Qui est le plus susceptible de devenir célèbre ?","Qui ferait le meilleur chef de groupe ?","Qui est le plus imprévisible ?","Qui est le plus susceptible de faire une dinguerie à 3h du matin ?","Qui est le plus susceptible d'oublier son propre anniversaire ?","Qui est le plus susceptible de ragequit ?","Qui est le plus compétitif pour absolument rien ?","Qui est le plus susceptible de changer de pseudo tous les mois ?","Qui est le plus gros procrastinateur ?","Qui a le plus de chances de se faire arnaquer par un scam évident ?","Qui est le plus susceptible de devenir un meme du groupe ?"];
const id=document.querySelector('#identity'),app=document.querySelector('#voteApp'),res=document.querySelector('#resultsApp');
let current=null,db=null,questionRows=[],allVotes=[],completeVoters=[];
let organizerPin='';
let ceremony={unlocked:false,started:false,index:0,revealed:false,titles:Object.fromEntries(FRIENDS.map(x=>[x,0])),finished:false};
const configured=window.SUPABASE_URL&&window.SUPABASE_ANON_KEY;
function go(s){document.getElementById(s).scrollIntoView({behavior:'smooth'});}function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function showStatus(m,t='info'){const e=document.querySelector('#connectionStatus');if(e){e.textContent=m;e.dataset.type=t;}}
async function init(){try{db=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);const {data,error}=await db.from('questions').select('id,question,position').order('position');if(error)throw error;questionRows=data||[];QUESTIONS = questionRows.map(q => q.question);showStatus('SERVEUR CONNECTÉ — votes partagés','ok');renderIdentity();await renderResults();await renderArchives();setInterval(()=>{if(!ceremony.started&&!ceremony.unlocked)renderResults()},4000);}catch(e){console.error(e);showStatus('ERREUR DE CONNEXION','error');}}
function renderIdentity(){
  const saved=localStorage.getItem('rawsfynzVoter')||'';
  if(saved&&FRIENDS.includes(saved)){ current=saved; id.innerHTML=`<div class="locked-id"><label>TON PSEUDO</label><strong>${esc(saved)}</strong><small>Pseudo verrouillé sur ce PC pour garder les votes secrets.</small></div>`; renderVote(); return; }
  id.innerHTML=`<label>QUI ES-TU ?</label><select class="select" id="who"><option value="">— sélectionner ton pseudo —</option>${FRIENDS.map(x=>`<option>${esc(x)}</option>`).join('')}</select>`;
  document.querySelector('#who').onchange=e=>{ if(!e.target.value)return; current=e.target.value; localStorage.setItem('rawsfynzVoter',current); renderIdentity(); };
}
function renderVote(){
  app.classList.remove('hidden');
  const done=localStorage.getItem('rawsfynzSubmitted')===current;
  if(done){ app.innerHTML=`<div class="secret-card"><div class="lock">✓</div><p class="eyebrow">/// VOTE SOUS SCELLÉS ///</p><h3>VOTE ENREGISTRÉ</h3><p>Merci ${esc(current)}. Tes choix ne sont plus affichés et les votes des autres restent secrets.</p></div>`; return; }
  app.innerHTML=`<div class="vote-head"><div><div class="counter" id="counter">0 / ${QUESTIONS.length} répondues</div><div class="bar"><span id="bar"></span></div></div><div class="ready">PSEUDO VERROUILLÉ : ${esc(current)}</div></div><div class="questions">${QUESTIONS.map((q,i)=>`<article class="q"><div class="qnum">${String(i+1).padStart(2,'0')}</div><h3>${esc(q)}</h3><div class="opts">${FRIENDS.filter(x=>x!==current).map((x,j)=>`<div><input id="q${i}-${j}" type="radio" name="q${i}" value="${esc(x)}"><label for="q${i}-${j}">${esc(x)}</label></div>`).join('')}</div></article>`).join('')}</div><div class="actions"><button class="btn" id="submitBtn" onclick="submitVote()">SCELLER MES VOTES →</button></div>`;
  app.querySelectorAll('input').forEach(x=>x.onchange=update); update();
}
function update(){const n=QUESTIONS.filter((_,i)=>app.querySelector(`input[name=q${i}]:checked`)).length;document.querySelector('#counter').textContent=`${n} / ${QUESTIONS.length} répondues`;document.querySelector('#bar').style.width=(n/QUESTIONS.length*100)+'%';}
async function submitVote(){
  const answers=QUESTIONS.map((_,i)=>app.querySelector(`input[name=q${i}]:checked`)?.value);
  if(answers.includes(undefined)){alert('Toutes les questions doivent être répondues.');return;}
  if(!confirm('Une fois scellés, tes votes ne seront plus affichés sur ce PC. Confirmer ?'))return;
  const btn=document.querySelector('#submitBtn');btn.disabled=true;btn.textContent='SCELLAGE EN COURS...';
  const payload=answers.map((target,i)=>({question_id:questionRows[i].id,target}));
  const {error}=await db.rpc('submit_ballot',{p_voter:current,p_answers:payload});
  btn.disabled=false;btn.textContent='SCELLER MES VOTES →';
  if(error){console.error(error);alert('Erreur lors de l’envoi : '+error.message);return;}
  localStorage.setItem('rawsfynzSubmitted',current); renderVote(); await renderResults(); go('results');
}
async function fetchProgress(){
  const {data,error}=await db.rpc('get_vote_progress'); if(error)throw error;
  const row=Array.isArray(data)?data[0]:data;
  return {complete:Number(row?.completed_participants||0), total:Number(row?.total_responses||0)};
}
async function fetchCeremonyVotes(){
  const {data,error}=await db.rpc('get_ceremony_votes',{p_pin:organizerPin}); if(error)throw error;
  allVotes=data||[]; completeVoters=FRIENDS.filter(name=>new Set(allVotes.filter(v=>v.voter===name).map(v=>v.question_id)).size===QUESTIONS.length);
}
async function renderResults(){
  if(!db)return; let progress; try{progress=await fetchProgress();}catch(e){console.error(e);return;}
  if(ceremony.started){renderCeremony();return;}
  const pct=Math.round(progress.complete/FRIENDS.length*100);
  res.innerHTML=`<div class="secret-card"><div class="lock">✦</div><p class="eyebrow">/// VOTES SOUS SCELLÉS ///</p><h3>${progress.complete} / ${FRIENDS.length} PARTICIPANTS</h3><div class="bigbar"><span style="width:${pct}%"></span></div><p>${progress.total} réponses enregistrées sur ${FRIENDS.length*QUESTIONS.length}. Aucun vote individuel n'est lisible depuis le site.</p>${progress.complete===FRIENDS.length?'<div class="ready">TOUS LES VOTES SONT ENREGISTRÉS</div>':''}<button class="btn" onclick="unlockCeremony()">MODE ORGANISATEUR →</button></div>`;
}
async function unlockCeremony(){
  const pin=prompt('Code organisateur :'); if(pin===null)return; organizerPin=pin;
  try{ await fetchCeremonyVotes(); }catch(e){ console.error(e); organizerPin=''; alert('Code incorrect ou accès refusé.'); return; }
  ceremony.unlocked=true;
  res.innerHTML=`<div class="ceremony-intro"><img src="logo.png"><p class="eyebrow">/// LES VOTES SONT SCELLÉS ///</p><h3>${QUESTIONS.length} QUESTIONS<br>${FRIENDS.length} JOUEURS<br><span>1 GRAND GAGNANT</span></h3><p>Chaque vainqueur de question remporte 1 titre. En cas d'égalité à la première place, chaque premier ex æquo gagne 1 titre.</p><button class="btn" onclick="startCeremony()" ${completeVoters.length<FRIENDS.length?'disabled':''}>COMMENCER LA CÉRÉMONIE →</button>${completeVoters.length<FRIENDS.length?`<small>Disponible lorsque les ${FRIENDS.length} participants ont terminé.</small>`:''}</div>`;
}
async function startCeremony(){
  try{await fetchCeremonyVotes();}catch(e){alert('Accès organisateur expiré ou refusé.');return;}
  if(completeVoters.length<FRIENDS.length){alert('Tout le monde doit avoir terminé avant la révélation.');return;}
  ceremony.started=true;ceremony.index=0;ceremony.revealed=false;ceremony.finished=false;ceremony.titles=Object.fromEntries(FRIENDS.map(x=>[x,0]));renderCeremony();
}
function questionStandings(i){const qid=questionRows[i].id,counts=Object.fromEntries(FRIENDS.map(x=>[x,0]));allVotes.filter(v=>v.question_id===qid).forEach(v=>{if(v.target in counts)counts[v.target]++});return Object.entries(counts).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));}
function renderCeremony(){if(ceremony.finished){renderFinal();return;}const i=ceremony.index, standings=questionStandings(i);if(!ceremony.revealed){res.innerHTML=`<div class="reveal"><div class="question-progress">QUESTION ${String(i+1).padStart(2,'0')} / ${QUESTIONS.length}</div><h3>${esc(QUESTIONS[i])}</h3><div class="sealed">RÉSULTATS SOUS SCELLÉS</div><button class="btn giant" onclick="revealQuestion()">RÉVÉLER LES RÉSULTATS</button></div>`;return;}const max=standings[0][1],winners=standings.filter(x=>x[1]===max&&max>0);res.innerHTML=`<div class="reveal"><div class="question-progress">QUESTION ${String(i+1).padStart(2,'0')} / ${QUESTIONS.length}</div><h3>${esc(QUESTIONS[i])}</h3><div class="winner">${winners.length>1?'PREMIERS EX ÆQUO':'TITRE REMPORTÉ PAR'}<strong>${winners.map(x=>esc(x[0])).join(' & ')}</strong><span>${max} vote${max>1?'s':''}</span></div><div class="question-ranking">${standings.map((r,n)=>`<div class="rank"><span>#${n+1} — ${esc(r[0])}</span><strong>${r[1]}</strong></div>`).join('')}</div><button class="btn" onclick="nextQuestion()">${i===QUESTIONS.length-1?'VOIR LE CLASSEMENT DES TITRES →':'QUESTION SUIVANTE →'}</button></div>`;}
function revealQuestion(){const s=questionStandings(ceremony.index),max=s[0][1];s.filter(x=>x[1]===max&&max>0).forEach(x=>ceremony.titles[x[0]]++);ceremony.revealed=true;renderCeremony();}
function nextQuestion(){if(ceremony.index===QUESTIONS.length-1){ceremony.finished=true;renderFinal(false);return;}ceremony.index++;ceremony.revealed=false;renderCeremony();}
function renderFinal(showWinner=false){const ranks=Object.entries(ceremony.titles).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])),max=ranks[0][1],winners=ranks.filter(x=>x[1]===max);if(!showWinner){res.innerHTML=`<div class="final"><p class="eyebrow">/// CLASSEMENT FINAL ///</p><h3>LES TITRES</h3><div class="title-ranking">${ranks.map((r,i)=>`<div class="rank ${i<3?'top':''}"><span>#${i+1} — ${esc(r[0])}</span><strong>${r[1]} titre${r[1]>1?'s':''}</strong></div>`).join('')}</div><button class="btn giant" onclick="renderFinal(true)">RÉVÉLER LE GRAND GAGNANT</button></div>`;return;}res.innerHTML=`<div class="champion"><img src="logo.png"><p class="eyebrow">/// RAWSFYNZ CLUB 2026 ///</p><div class="trophy">♛</div><h3>${winners.length>1?'GRANDS GAGNANTS':'GRAND GAGNANT'}</h3><div class="champion-name">${winners.map(x=>esc(x[0])).join(' & ')}</div><p>${max} titre${max>1?'s':''} remporté${max>1?'s':''}</p><button class="btn ghost" onclick="restartCeremony()">REJOUER LA RÉVÉLATION</button></div>`;}
function restartCeremony(){ceremony.started=true;ceremony.finished=false;ceremony.index=0;ceremony.revealed=false;ceremony.titles=Object.fromEntries(FRIENDS.map(x=>[x,0]));renderCeremony();}
window.go=go;window.submitVote=submitVote;window.unlockCeremony=unlockCeremony;window.startCeremony=startCeremony;window.revealQuestion=revealQuestion;window.nextQuestion=nextQuestion;window.renderFinal=renderFinal;window.restartCeremony=restartCeremony;init();
async function renderArchives(){
  const box = document.querySelector('#archivesApp');
  if(!box || !db) return;

  try{
    const {data: seasons, error: seasonError} = await db
      .from('archive_seasons')
      .select('year,grand_winner')
      .order('year', {ascending:false});

    if(seasonError) throw seasonError;

    const {data: results, error: resultError} = await db
      .from('archive_results')
      .select('year,question_position,question_text,winner,winner_votes')
      .order('question_position');

    if(resultError) throw resultError;

    if(!seasons || !seasons.length){
      box.innerHTML = '<p>Aucune archive disponible.</p>';
      return;
    }

    box.innerHTML = seasons.map(season => {
      const seasonResults = (results || []).filter(r => r.year === season.year);

      const questions = {};
      seasonResults.forEach(r => {
        if(!questions[r.question_position]){
          questions[r.question_position] = {
            text: r.question_text,
            winners: []
          };
        }

        questions[r.question_position].winners.push(
          `${esc(r.winner)} — ${r.winner_votes} vote${r.winner_votes > 1 ? 's' : ''}`
        );
      });

      const questionHTML = Object.entries(questions)
        .sort((a,b) => Number(a[0]) - Number(b[0]))
        .map(([position,q]) => `
          <div class="archive-question">
            <p class="eyebrow">CATÉGORIE ${String(position).padStart(2,'0')}</p>
            <h3>${esc(q.text)}</h3>
            <p>🏆 ${q.winners.join(' & ')}</p>
          </div>
        `).join('');

      return `
        <div class="secret-card archive-season">
          <p class="eyebrow">/// SAISON ${season.year} ///</p>

          <div class="lock">♛</div>

          <h3>GRAND GAGNANT ${season.year}</h3>
          <h2>${esc(season.grand_winner)}</h2>

          <p>Champion officiel du RAWSFYNZ CLUB ${season.year}</p>
        </div>

        <div class="archive-list">
          ${questionHTML}
        </div>
      `;
    }).join('');

  }catch(e){
    console.error('Archives:', e);
    box.innerHTML = '<p>Impossible de charger les archives.</p>';
  }
}
