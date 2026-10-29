import { shareScoreImage } from './share-score-image.js';
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const translations = window.UNITYQUEST_LOCAL_TRANSLATIONS;
  const words = Object.fromEntries(Object.entries(translations).map(([code, texts]) => [code, texts.words]));
  const companions = [
    { face: '🐑 🌸', color: '#faf0f4' },
    { face: '🐑 ✨', color: '#faf5e7' },
    { face: '🐑 🌿', color: '#edf4ed' },
    { face: '🐑 💜', color: '#f1ecf9' }
  ];
  let language = 'fr';
  let companion = Math.floor(Math.random() * companions.length);
  let progress = null;
  let sharing = false;
  const number = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
  const format = value => new Intl.NumberFormat(translations[language].locale).format(value);
  function readProgress() {
    try {
      const score=Number(localStorage.getItem('patrix_max_score')||0),level=Number(localStorage.getItem('patrix_max_level')||0);
      const trophies=JSON.parse(localStorage.getItem('patrix_trophies')||'[]');
      const profile=JSON.parse(localStorage.getItem('patrix_local_profile')||'{}');
      if(!Number.isFinite(score)||!Number.isFinite(level)||!Array.isArray(trophies))return {state:'invalid'};
      return {state:'ready',pseudo:profile.pseudo||words[language].anonymous,score:number(score),wisdom:number(level),revelation:trophies.length,xp:number(Number(localStorage.getItem('patrix_games_played')||0)),stars:0,levels:[Math.min(50,number(level))]};
    }catch{return {state:'unavailable'};}
  }
  function resetShare() { $('share-state').textContent = ''; $('manual-share').hidden = true; $('manual-share').value = ''; }
  function renderCompanion() {
    const current = companions[companion];
    $('sheep-face').setAttribute('src', `companions/sheep-${companion}.svg`);
    $('sheep-message').textContent = translations[language].sheep[companion];
    $('sheep-panel').style.backgroundColor = current.color;
  }
  function renderProgress() {
    progress = readProgress();
    $('data-state').textContent = words[language][progress.state];
    $('share').disabled = progress.state !== 'ready' || sharing;
    $('player-name').textContent = progress.state === 'ready' ? `${words[language].player} ${progress.pseudo}` : '';
    for (const key of ['score', 'wisdom', 'revelation', 'xp', 'stars']) $(key).textContent = progress.state === 'ready' ? format(progress[key]) : '—';
    $('levels').textContent = progress.state === 'ready' ? `${words[language].highest} : ${progress.wisdom} / 50` : '';
  }
  function setLanguage(value) {
    const aliases = { ja: 'jp', ln: 'rc' };
    language = translations[aliases[value] || value] ? (aliases[value] || value) : 'fr';
    const texts = translations[language];
    document.documentElement.lang = texts.locale;
    document.documentElement.dir = texts.dir;
    document.title = 'Emmanuel Payet — ' + texts.labels.title;
    $('language').value = language;
    document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = texts.page[Number(element.dataset.i18n)]; });
    document.querySelectorAll('[data-label]').forEach(element => { element.textContent = texts.labels[element.dataset.label]; });
    document.querySelectorAll('[data-local-aria]').forEach(element => { element.setAttribute('aria-label', texts.labels[element.dataset.localAria]); });
    document.querySelectorAll('[data-local-alt]').forEach(element => { element.setAttribute('alt', texts.labels[element.dataset.localAlt]); });
    document.querySelectorAll('[data-back-label]').forEach(element => { element.setAttribute('aria-label', texts.page[32]); });
    $('manual-share').setAttribute('aria-label', words[language].choose);
    const metricLabels=language==='fr'?['Niveau','Trophées','Parties']:['Level','Trophies','Games'];
    ['wisdom','revelation','xp'].forEach((id,i)=>{$(id).parentElement.querySelector('span').textContent=metricLabels[i];});
    $('stars').parentElement.hidden=true;
    resetShare(); renderCompanion(); renderProgress();
  }
  function showManual(text) {
    $('manual-share').value = text; $('manual-share').hidden = false;
    $('share-state').textContent = words[language].manual;
    $('manual-share').focus(); $('manual-share').select();
  }
  async function shareScore() {
    if (sharing) return;
    renderProgress();
    if (progress.state !== 'ready') return;
    resetShare(); sharing = true; $('share').disabled = true;
    const mascot = companions[companion];
    const savedName = JSON.parse(localStorage.getItem('patrix_local_profile')||'{}').pseudo?.trim();
    const sharedName = !savedName || savedName === 'Joueur local' ? '' : savedName;
    const text = `${mascot.face} 💗 ✨ 😊 ${sharedName ? sharedName + ' — ' : ''}${words[language].score} : ${format(progress.score)} ${words[language].points} !\n${translations[language].sheep[companion]}`;
    try {
      const result = await shareScoreImage({ variant: companion, pseudo: sharedName, score: progress.score, texts: translations[language], assetBase: '.', text });
      if (result === 'shared') $('share-state').textContent = words[language].shared;
      else if (result === 'downloaded') { showManual(text); $('share-state').textContent = words[language].downloaded; }
    } catch (error) { if (error.name !== 'AbortError') { showManual(text); $('share-state').textContent = words[language].imageError; } }
    finally { sharing = false; renderProgress(); }
  }
  $('language').addEventListener('change', event => {
    try { localStorage.setItem('emmanuelModuleLanguage', event.target.value); } catch {}
    setLanguage(event.target.value);
  });
  $('refresh').addEventListener('click', () => { resetShare(); renderProgress(); });
  $('new-sheep').addEventListener('click', () => { companion = (companion + 1 + Math.floor(Math.random() * (companions.length - 1))) % companions.length; resetShare(); renderCompanion(); });
  $('share').addEventListener('click', shareScore);
  $('manual-share').addEventListener('focus', event => event.target.select());
  window.addEventListener('storage', event => { if (!event.key || ['patrix_max_score','patrix_max_level','patrix_trophies','patrix_local_profile','patrix_games_played'].includes(event.key)) { resetShare(); renderProgress(); } });
  window.addEventListener('focus', renderProgress);
  let initial = new URLSearchParams(location.search).get('lang');
  if (!initial) try { initial = localStorage.getItem('emmanuelModuleLanguage') || localStorage.getItem('patrix_language'); } catch {}
  setLanguage(initial);
})();
