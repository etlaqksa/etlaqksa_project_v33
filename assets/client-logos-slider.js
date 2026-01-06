/* Client logos slider injector (v1)
   - Inserts an infinite-loop logo marquee just after the Services section
   - Works on SPA routes by watching DOM changes
*/
(function(){
  const CFG = {
    jsonUrl: '/assets/client-logos.json',
    sectionId: 'client-logos-slider',
    // Keywords to locate a "Services" section in either language
    serviceKeywords: [
      'Services', 'Service',
      'خدمات', 'خدماتنا', 'الخدمات'
    ],
    // Headline text (will be replaced based on document language)
    headline: {
      ar: 'عملاء يثقون بنا',
      en: 'Trusted by clients'
    }
  };

  function isRtl(){
    return (document.documentElement.getAttribute('dir') || '').toLowerCase() === 'rtl';
  }

  function getLang(){
    const l = (document.documentElement.getAttribute('lang') || 'ar').toLowerCase();
    return l.startsWith('en') ? 'en' : 'ar';
  }

  function normalizeText(s){
    return (s || '').replace(/\s+/g,' ').trim().toLowerCase();
  }

  function findServicesAnchor(){
    // Look for headings that resemble a Services section
    const headings = Array.from(document.querySelectorAll('h1,h2,h3'));
    const kw = CFG.serviceKeywords.map(k=>k.toLowerCase());

    for (const h of headings){
      const t = normalizeText(h.textContent);
      if (!t) continue;
      if (kw.some(k => t.includes(k.toLowerCase()))){
        return h;
      }
    }

    // Fallback: look for elements with href/route containing services
    const links = Array.from(document.querySelectorAll('a[href]'));
    for (const a of links){
      const href = (a.getAttribute('href')||'');
      if (/services/i.test(href) || /خدمات/.test(href)){
        // Try the nearest section around this link
        const sec = a.closest('section') || a.closest('div');
        if (sec) return sec;
      }
    }
    return null;
  }

  function buildLogoItem(c){
    // Logo is clickable to project/case-study URL if present
    const href = c.projectUrl || '#';
    const a = document.createElement('a');
    a.className = 'client-logos__item';
    a.href = href;
    if (href !== '#'){
      a.rel = 'noopener';
    } else {
      a.setAttribute('aria-disabled','true');
      a.tabIndex = -1;
    }

    const img = document.createElement('img');
    img.src = c.file;
    img.alt = (getLang() === 'en' ? c.alt_en : c.alt_ar) || c.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 320;
    img.height = 160;

    a.appendChild(img);
    return a;
  }

  function buildSection(clients){
    const lang = getLang();
    const section = document.createElement('section');
    section.className = 'client-logos';
    section.id = CFG.sectionId;
    section.setAttribute('aria-label', lang === 'en' ? 'Client logos' : 'شعارات العملاء');

    const container = document.createElement('div');
    container.className = 'client-logos__container';

    const title = document.createElement('div');
    title.className = 'client-logos__title';
    title.textContent = CFG.headline[lang];

    const marquee = document.createElement('div');
    marquee.className = 'client-logos__marquee';

    const track = document.createElement('div');
    track.className = 'client-logos__track';

    // Duplicate items to create a seamless loop
    const items = clients.map(buildLogoItem);
    const items2 = clients.map(buildLogoItem);

    for (const el of items) track.appendChild(el);
    for (const el of items2) track.appendChild(el);

    marquee.appendChild(track);
    container.appendChild(title);
    container.appendChild(marquee);
    section.appendChild(container);

    return section;
  }

  async function getClients(){
    try {
      const res = await fetch(CFG.jsonUrl, {cache:'force-cache'});
      if (!res.ok) throw new Error('Failed to fetch logos json');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch(e){
      console.warn('[client-logos] failed to load json', e);
      return [];
    }
  }

  function insertAfter(target, node){
    if (!target || !target.parentNode) return false;
    const parent = target.parentNode;
    parent.insertBefore(node, target.nextSibling);
    return true;
  }

  async function ensureInserted(){
    if (document.getElementById(CFG.sectionId)) return;

    const anchor = findServicesAnchor();
    if (!anchor) return;

    const clients = await getClients();
    if (!clients.length) return;

    // Find best insertion point (closest section/div)
    const host = anchor.closest('section') || anchor.closest('div') || anchor;
    const section = buildSection(clients);

    // Prefer inserting right AFTER the services section container
    insertAfter(host, section);
  }

  // Initial attempt
  ensureInserted();

  // SPA route changes: observe DOM
  const obs = new MutationObserver(() => {
    // Debounce via rAF
    if (ensureInserted._scheduled) return;
    ensureInserted._scheduled = true;
    requestAnimationFrame(() => {
      ensureInserted._scheduled = false;
      ensureInserted();
    });
  });

  obs.observe(document.documentElement, {subtree:true, childList:true});

  // Also handle back/forward navigation
  window.addEventListener('popstate', ensureInserted);
})();
