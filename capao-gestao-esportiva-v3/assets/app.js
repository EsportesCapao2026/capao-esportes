const STORAGE_KEY = 'capao_esportes_v3';

const seed = {
  campeonatos: [
    { id: crypto.randomUUID(), nome: 'Campeonato Municipal de Futsal 2026', modalidade: 'Futsal', inicio: '2026-03-10', fim: '2026-05-20', inscricoesAbertas: true, fases: ['Grupos','Quartas','Semifinal','Final'] },
    { id: crypto.randomUUID(), nome: 'Campeonato Municipal de Campo', modalidade: 'Futebol de campo', inicio: '2026-04-05', fim: '2026-07-12', inscricoesAbertas: false, fases: ['Primeira fase','Semifinal','Final'] }
  ],
  inscricoes: [],
  denuncias: [],
  punicoes: [],
  resultados: []
};

let state = load();
let selectedChampionshipId = state.campeonatos[0]?.id || null;
let activeTab = 'visao';

function load(){
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved) return JSON.parse(saved);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return structuredClone(seed);
}
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function $(sel){ return document.querySelector(sel); }
function $all(sel){ return [...document.querySelectorAll(sel)]; }

function setView(id){
  $all('.view').forEach(v => v.classList.toggle('show', v.id === id));
  $all('.nav').forEach(n => n.classList.toggle('active', n.dataset.view === id));
  if(id === 'home' || id === 'publico') renderChampionshipLists();
  if(id === 'admin') renderAdmin();
}

function championshipCard(c){
  const tpl = $('#championshipCardTemplate').content.cloneNode(true);
  const article = tpl.querySelector('.champ-card');
  const status = tpl.querySelector('.status');
  status.textContent = c.inscricoesAbertas ? 'Inscrições abertas' : 'Inscrições fechadas';
  status.classList.toggle('closed', !c.inscricoesAbertas);
  tpl.querySelector('h3').textContent = c.nome;
  tpl.querySelector('p').textContent = `${c.modalidade} • ${formatDate(c.inicio)} até ${formatDate(c.fim)}`;
  tpl.querySelector('button').addEventListener('click', () => openChampionship(c.id));
  return tpl;
}

function renderChampionshipLists(){
  ['homeChampionships','publicChampionships'].forEach(id => {
    const box = $('#' + id);
    box.innerHTML = '';
    if(!state.campeonatos.length){ box.innerHTML = '<div class="empty">Nenhum campeonato criado ainda.</div>'; return; }
    state.campeonatos.forEach(c => box.appendChild(championshipCard(c)));
  });
}

function openChampionship(id){
  selectedChampionshipId = id;
  activeTab = 'visao';
  setView('championship');
  renderChampionship();
}

function selectedChampionship(){ return state.campeonatos.find(c => c.id === selectedChampionshipId); }
function champData(key){ return state[key].filter(x => x.campeonatoId === selectedChampionshipId); }

function renderChampionship(){
  const c = selectedChampionship();
  if(!c) return setView('publico');
  $('#championshipHeader').innerHTML = `
    <h2>${c.nome}</h2>
    <p class="muted">Todas as informações abaixo pertencem somente a este campeonato.</p>
    <div class="championship-meta">
      <span class="pill">${c.modalidade}</span>
      <span class="pill">${formatDate(c.inicio)} até ${formatDate(c.fim)}</span>
      <span class="pill">${c.inscricoesAbertas ? 'Inscrições abertas' : 'Inscrições fechadas'}</span>
      <span class="pill">Fases: ${c.fases.join(', ') || 'Não informadas'}</span>
    </div>`;
  $all('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === activeTab));
  const content = $('#championshipContent');
  if(activeTab === 'visao') content.innerHTML = renderOverview(c);
  if(activeTab === 'inscricao') content.innerHTML = renderInscription(c);
  if(activeTab === 'denuncias') content.innerHTML = renderComplaintForm(c);
  if(activeTab === 'resultados') content.innerHTML = renderResults();
  if(activeTab === 'classificacao') content.innerHTML = renderStandings();
  if(activeTab === 'artilheiros') content.innerHTML = renderScorers();
  if(activeTab === 'punicoes') content.innerHTML = renderPunishments(c);
  bindDynamicForms();
}

function renderOverview(c){
  const results = champData('resultados').length;
  const complaints = champData('denuncias').length;
  const punishments = champData('punicoes').length;
  const inscriptions = champData('inscricoes').length;
  return `
  ${c.inscricoesAbertas ? `<div class="cta"><div><strong>Período de inscrição aberto</strong><p class="muted">Responsáveis das equipes podem cadastrar atletas neste campeonato.</p></div><button class="primary" data-tab-target="inscricao">Inscrever equipe</button></div>` : ''}
  <div class="cards-row">
    <div class="stat-card"><strong>${inscriptions}</strong><span>Inscrições</span></div>
    <div class="stat-card"><strong>${complaints}</strong><span>Denúncias</span></div>
    <div class="stat-card"><strong>${results}</strong><span>Resultados</span></div>
    <div class="stat-card"><strong>${punishments}</strong><span>Punições</span></div>
  </div>
  <div class="panel wide"><h3>Orientação</h3><p>Use as abas acima para consultar somente as informações deste campeonato. Nada fica misturado com outros torneios.</p></div>`;
}

function renderInscription(c){
  if(!c.inscricoesAbertas) return '<div class="empty">As inscrições deste campeonato estão fechadas pelo responsável do sistema.</div>';
  return `<form id="inscriptionForm" class="panel">
    <h3>Inscrever equipe neste campeonato</h3>
    <div class="two"><label>Nome da equipe<input name="equipe" required></label><label>Responsável<input name="responsavel" required></label></div>
    <div class="two"><label>WhatsApp do responsável<input name="whatsapp" required placeholder="(51) 99999-9999"></label><label>Nome do atleta<input name="atleta" required></label></div>
    <div class="two"><label>CPF/documento do atleta<input name="documento" required></label><label>Data de nascimento<input type="date" name="nascimento"></label></div>
    <button class="primary" type="submit">Salvar inscrição</button>
    <button class="secondary" type="button" onclick="window.print()">Gerar PDF</button>
  </form>`;
}

function renderComplaintForm(){
  return `<form id="complaintForm" class="panel">
    <h3>Registrar denúncia</h3>
    <p class="muted">A denúncia ficará salva dentro deste campeonato e será vista pelo responsável do sistema.</p>
    <div class="two"><label>Equipe reclamante<input name="equipe" required></label><label>Responsável<input name="responsavel" required></label></div>
    <div class="two"><label>Equipe denunciada<input name="denunciado"></label><label>Atleta citado<input name="atleta"></label></div>
    <label>Motivo<select name="motivo"><option>Atleta irregular</option><option>Briga em campo</option><option>Questão extracampo</option><option>Escalação irregular</option><option>Outro</option></select></label>
    <label>Descrição da denúncia<textarea name="descricao" required></textarea></label>
    <button class="primary" type="submit">Enviar denúncia</button>
  </form>${renderComplaintList()}`;
}
function renderComplaintList(){
  const list = champData('denuncias');
  if(!list.length) return '<div class="empty wide">Nenhuma denúncia registrada neste campeonato.</div>';
  return `<div class="panel wide"><h3>Denúncias deste campeonato</h3><table class="table"><thead><tr><th>Protocolo</th><th>Equipe</th><th>Motivo</th><th>Status</th></tr></thead><tbody>${list.map(d => `<tr><td>${d.protocolo}</td><td>${d.equipe}</td><td>${d.motivo}</td><td>${d.status}</td></tr>`).join('')}</tbody></table></div>`;
}
function renderResults(){
  const list = champData('resultados');
  if(!list.length) return '<div class="empty">Nenhum resultado lançado neste campeonato.</div>';
  return `<table class="table"><thead><tr><th>Jogo</th><th>Placar</th><th>Artilheiros informados</th></tr></thead><tbody>${list.map(r => `<tr><td>${r.timeA} x ${r.timeB}</td><td>${r.golsA} x ${r.golsB}</td><td>${r.goleadores || '-'}</td></tr>`).join('')}</tbody></table>`;
}
function renderStandings(){
  const table = calculateStandings();
  if(!table.length) return '<div class="empty">A classificação aparecerá automaticamente após o lançamento dos resultados.</div>';
  return `<table class="table"><thead><tr><th>Time</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr></thead><tbody>${table.map(t => `<tr><td>${t.time}</td><td>${t.pontos}</td><td>${t.jogos}</td><td>${t.vitorias}</td><td>${t.empates}</td><td>${t.derrotas}</td><td>${t.gp}</td><td>${t.gc}</td><td>${t.sg}</td></tr>`).join('')}</tbody></table>`;
}
function calculateStandings(){
  const map = {};
  const ensure = t => map[t] ||= {time:t,pontos:0,jogos:0,vitorias:0,empates:0,derrotas:0,gp:0,gc:0,sg:0};
  champData('resultados').forEach(r => {
    const a = ensure(r.timeA), b = ensure(r.timeB);
    a.jogos++; b.jogos++; a.gp += +r.golsA; a.gc += +r.golsB; b.gp += +r.golsB; b.gc += +r.golsA;
    if(+r.golsA > +r.golsB){ a.vitorias++; b.derrotas++; a.pontos += 3; }
    else if(+r.golsA < +r.golsB){ b.vitorias++; a.derrotas++; b.pontos += 3; }
    else { a.empates++; b.empates++; a.pontos++; b.pontos++; }
  });
  Object.values(map).forEach(t => t.sg = t.gp - t.gc);
  return Object.values(map).sort((a,b) => b.pontos-a.pontos || b.vitorias-a.vitorias || b.sg-a.sg || b.gp-a.gp);
}
function renderScorers(){
  const scorers = {};
  champData('resultados').forEach(r => parseScorers(r.goleadores).forEach(s => scorers[s.nome] = (scorers[s.nome] || 0) + s.gols));
  const list = Object.entries(scorers).sort((a,b)=>b[1]-a[1]);
  if(!list.length) return '<div class="empty">A artilharia aparecerá automaticamente quando os goleadores forem lançados.</div>';
  return `<table class="table"><thead><tr><th>Atleta</th><th>Gols</th></tr></thead><tbody>${list.map(([nome,gols]) => `<tr><td>${nome}</td><td>${gols}</td></tr>`).join('')}</tbody></table>`;
}
function parseScorers(text=''){
  return text.split(';').map(x => x.trim()).filter(Boolean).map(item => {
    const [nome, gols] = item.split('=').map(v => v.trim());
    return { nome, gols: Number(gols || 1) };
  }).filter(s => s.nome);
}
function renderPunishments(){
  const list = champData('punicoes');
  const form = `<form id="punishmentForm" class="panel"><h3>Cadastrar punição neste campeonato</h3><div class="two"><label>Atleta<input name="atleta" required></label><label>Equipe<input name="equipe" required></label></div><div class="two"><label>Motivo<input name="motivo" required placeholder="Agressão, briga, irregularidade..."></label><label>Suspenso até<input name="fim" type="date" required></label></div><label>Resumo da decisão<textarea name="descricao"></textarea></label><button class="primary" type="submit">Salvar punição</button><button class="secondary" type="button" onclick="window.print()">Gerar PDF</button></form>`;
  if(!list.length) return form + '<div class="empty wide">Nenhuma punição registrada neste campeonato.</div>';
  return form + `<div class="panel wide"><h3>Punições deste campeonato</h3><table class="table"><thead><tr><th>Atleta</th><th>Equipe</th><th>Motivo</th><th>Suspenso até</th></tr></thead><tbody>${list.map(p => `<tr><td>${p.atleta}</td><td>${p.equipe}</td><td>${p.motivo}</td><td>${formatDate(p.fim)}</td></tr>`).join('')}</tbody></table></div>`;
}

function bindDynamicForms(){
  document.querySelectorAll('[data-tab-target]').forEach(btn => btn.onclick = () => { activeTab = btn.dataset.tabTarget; renderChampionship(); });
  $('#inscriptionForm')?.addEventListener('submit', e => { e.preventDefault(); const data = Object.fromEntries(new FormData(e.target)); state.inscricoes.push({id:crypto.randomUUID(), campeonatoId:selectedChampionshipId, ...data, criadoEm:new Date().toISOString()}); save(); alert('Inscrição salva neste campeonato.'); renderChampionship(); });
  $('#complaintForm')?.addEventListener('submit', e => { e.preventDefault(); const data = Object.fromEntries(new FormData(e.target)); state.denuncias.push({id:crypto.randomUUID(), campeonatoId:selectedChampionshipId, protocolo:`DEN-${new Date().getFullYear()}-${String(state.denuncias.length+1).padStart(5,'0')}`, status:'Recebida', ...data}); save(); alert('Denúncia enviada e salva para análise.'); renderChampionship(); });
  $('#punishmentForm')?.addEventListener('submit', e => { e.preventDefault(); const data = Object.fromEntries(new FormData(e.target)); state.punicoes.push({id:crypto.randomUUID(), campeonatoId:selectedChampionshipId, ...data}); save(); alert('Punição salva neste campeonato.'); renderChampionship(); });
}

function renderAdmin(){
  const select = $('#resultForm select[name="campeonatoId"]');
  select.innerHTML = state.campeonatos.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
  const box = $('#adminChampionships');
  box.innerHTML = state.campeonatos.map(c => `<div class="admin-item"><div><strong>${c.nome}</strong><br><span class="muted">${c.modalidade} • ${c.inscricoesAbertas ? 'inscrições abertas' : 'inscrições fechadas'}</span></div><button class="small secondary" data-open="${c.id}">Abrir</button></div>`).join('') || '<div class="empty">Nenhum campeonato.</div>';
  document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => openChampionship(b.dataset.open));
}

$('#championshipForm').addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  state.campeonatos.push({ id: crypto.randomUUID(), nome:data.nome, modalidade:data.modalidade, inicio:data.inicio, fim:data.fim, inscricoesAbertas:data.inscricoesAbertas === 'true', fases:(data.fases||'').split(',').map(f=>f.trim()).filter(Boolean) });
  save(); e.target.reset(); renderAdmin(); renderChampionshipLists(); alert('Campeonato criado e exibido na página inicial.');
});
$('#resultForm').addEventListener('submit', e => {
  e.preventDefault(); const data = Object.fromEntries(new FormData(e.target)); state.resultados.push({id:crypto.randomUUID(), ...data}); save(); e.target.reset(); renderAdmin(); alert('Resultado salvo. A classificação e artilharia foram atualizadas automaticamente.');
});
$all('.nav').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
$all('[data-view-target]').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.viewTarget)));
$('#championshipTabs').addEventListener('click', e => { if(e.target.matches('.tab')){ activeTab = e.target.dataset.tab; renderChampionship(); } });
function formatDate(date){ if(!date) return '-'; return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR'); }

renderChampionshipLists();
renderAdmin();
