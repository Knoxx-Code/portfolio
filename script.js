function toggleFinding(btn){
  const detail = btn.nextElementSibling;
  const open = detail.classList.toggle('open');
  btn.textContent = open ? '– hide technical detail' : '+ show technical detail';
}

document.querySelectorAll('.finding-toggle').forEach(btn=>{
  btn.addEventListener('click', ()=> toggleFinding(btn));
});

/* ---------------- Live recon hero ---------------- */
(async function(){
  const out = document.getElementById('reconOutput');
  if(!out) return;

  let isBrave = false;
  try{
    isBrave = !!(navigator.brave && await navigator.brave.isBrave());
    console.log('Is Brave:', isBrave);
  }catch(e){ isBrave = false; }

  function parseUA(isBrave){
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    if(isBrave) browser = 'Brave';
    else if(/Edg\//.test(ua)) browser = 'Edge';
    else if(/OPR\//.test(ua)) browser = 'Opera';
    else if(/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = 'Chrome';
    else if(/Firefox\//.test(ua)) browser = 'Firefox';
    else if(/Safari\//.test(ua)) browser = 'Safari';
    let os = 'Unknown';
    if(/Windows/.test(ua)) os = 'Windows';
    else if(/Mac OS X/.test(ua)) os = 'macOS';
    else if(/Android/.test(ua)) os = 'Android';
    else if(/Linux/.test(ua)) os = 'Linux';
    else if(/iPhone|iPad/.test(ua)) os = 'iOS';
    return {browser, os};
  }

  const {browser, os} = parseUA(isBrave);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';
  const res = window.screen.width + 'x' + window.screen.height;
  const lang = navigator.language || 'unknown';
  let ref = 'direct — no referrer';
  if(document.referrer){
    try{ ref = new URL(document.referrer).hostname; }catch(e){ ref = 'unreadable'; }
  }
  const conn = (navigator.connection && navigator.connection.effectiveType) ? navigator.connection.effectiveType.toUpperCase() : 'n/a';
  const now = new Date().toLocaleString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' });

  const lines = [
    {t:'plain', text:'$ ./recon.sh --target=visitor --passive --no-cookies'},
    {t:'dim', text:'[*] starting passive fingerprint...'},
    {t:'kv', k:'os', v:os},
    {t:'kv', k:'browser', v:browser},
    {t:'kv', k:'viewport', v:res},
    {t:'kv', k:'locale', v:lang},
    {t:'kv', k:'timezone', v:tz},
    {t:'kv', k:'connection', v:conn},
    {t:'kv', k:'referrer', v:ref},
    {t:'kv', k:'scan_time', v:now},
    {t:'dim', text:'[*] no cookies set · no data stored · no third parties called'},
    {t:'ok', text:'✓ TARGET PROFILE: YOU — acquired in ~1.2s'},
    {t:'plain', text:''},
    {t:'ok', text:'$ now your turn to know who ran that scan_'}
  ];

  let li = 0;
  function typeLine(){
    if(li >= lines.length){
      out.insertAdjacentHTML('beforeend', '<span class="cursor"></span>');
      return;
    }
    const line = lines[li];
    let html = '';
    if(line.t === 'plain') html = `<span class="val">${line.text}</span>`;
    else if(line.t === 'dim') html = `<span class="dim">${line.text}</span>`;
    else if(line.t === 'ok') html = `<span class="ok">${line.text}</span>`;
    else if(line.t === 'kv') html = `<span class="dim">${line.k}:</span> <span class="val">${line.v}</span>`;
    out.insertAdjacentHTML('beforeend', html + '<br>');
    li++;
    setTimeout(typeLine, line.t === 'plain' && line.text === '' ? 120 : (140 + Math.random()*90));
  }

  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    // render instantly, no stagger
    lines.forEach(line=>{
      let html = '';
      if(line.t === 'plain') html = `<span class="val">${line.text}</span>`;
      else if(line.t === 'dim') html = `<span class="dim">${line.text}</span>`;
      else if(line.t === 'ok') html = `<span class="ok">${line.text}</span>`;
      else if(line.t === 'kv') html = `<span class="dim">${line.k}:</span> <span class="val">${line.v}</span>`;
      out.insertAdjacentHTML('beforeend', html + '<br>');
    });
  } else {
    setTimeout(typeLine, 300);
  }
})();

/* ---------------- Footer year ---------------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------- Scroll reveal ---------------- */
(function(){
  const selector = '.chapter-head, .profile-grid, .log-entry, .finding, .eng-card, .cap-cat, .cert, #contact .term, #contact .contact-links';
  const targets = Array.from(document.querySelectorAll(selector));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  targets.forEach((el, i)=>{
    el.classList.add('reveal');
    if(reduced){ el.classList.add('in'); return; }
    // slight stagger for siblings sharing a parent (log entries, findings, cards)
    const siblingsBefore = Array.prototype.indexOf.call(el.parentElement.children, el);
    el.style.transitionDelay = Math.min(siblingsBefore * 60, 240) + 'ms';
  });

  if(reduced) return;

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold:0.15, rootMargin:'0px 0px -40px 0px' });

  targets.forEach(el=>io.observe(el));
})();
