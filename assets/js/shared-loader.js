// Shared Loader Control
(function(){
  function getLoader(){ return document.getElementById('loader'); }
  window.activateLoader = function(){ const l=getLoader(); if(!l) return; l.classList.remove('hidden'); l.classList.add('active'); };
  window.deactivateLoader = function(){ const l=getLoader(); if(!l) return; setTimeout(()=>{ l.classList.add('no-blur'); },600); setTimeout(()=>{ l.classList.add('hidden'); l.classList.remove('active'); },800); };
})();
