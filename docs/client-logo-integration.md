# Client Logos Integration (Trust + Performance)

This project uses **Netlify** and a **SPA build**. Client logos are integrated in a way that:
- maximizes trust (clean, consistent presentation)
- keeps Core Web Vitals healthy (lazy loading + lightweight assets)
- stays maintainable as new logos are added

---

## Part 1 — Asset prep (WebP, standardized)

### What was done
- All supplied client logos were converted to **WebP** and placed at:
  - `images/client-logos/*.webp`
- A registry file was generated at:
  - `assets/client-logos.json`

### Standard size
All logos are normalized into a bounding box of **320×160 px** (retina friendly), preserving aspect ratio.

### Visual consistency
We keep the source colors in the logo files. For the homepage carousel, we apply a **desaturated (serious) style via CSS**, and restore full color on hover/focus.

### Transparency
- PNG/SVG logos are exported with transparency where possible.
- JPG logos are exported as WebP with a white background (original asset has no transparency).

### Adding more logos later
1. Put new logo source files into a working folder.
2. Convert to WebP:
   - target: **320×160**, keep aspect ratio
   - use transparency when available
3. Add it to `assets/client-logos.json` (copy one entry and update fields).

> Naming rule: **company name = logo name**. Use the company’s real name in the `name_*` fields.

---

## Part 2 — Homepage + Services “Trust Carousel” (Infinite loop)

### Files
- CSS: `assets/client-logos-slider.css`
- JS: `assets/client-logos-slider.js`

Both Arabic and English entrypoints include these files:
- `/ar/index.html`
- `/en/index.html`

### Behavior
- Infinite, seamless loop (duplicated track)
- Pauses on hover/focus
- Native lazy loading (`loading="lazy"`, `decoding="async"`)
- Motion reduced automatically for users with `prefers-reduced-motion`

### Plain HTML snippet (reference)
If you ever want a fully static embed (without the injector JS), use this structure:

```html
<section class="client-logos" aria-label="Trusted by clients">
  <div class="client-logos__container">
    <h2 class="client-logos__headline">Trusted by clients</h2>

    <div class="client-logos__marquee" role="region" aria-label="Client logos">
      <div class="client-logos__track">
        <!-- Repeat the logo list twice for seamless loop -->
        <a class="client-logos__item" href="/projects/" aria-label="Saudi Aramco">
          <img loading="lazy" decoding="async" src="/images/client-logos/saudi-aramco.webp" alt="Saudi Aramco — Project: {Project Name} — Type: {Project Type}">
        </a>
      </div>
    </div>
  </div>
</section>
```

**Important:** in the live site, we inject this right **after the Services section** (Homepage and Services page) using a DOM watcher, so we don’t need to modify the compiled SPA bundles.

---

## Part 3 — Project / Case Study integration

### UI placement
On a “Project Details / Case Study” page:
- Place the **full-color** logo next to the client name.
- Make the logo clickable:
  - preferred: client official website (if approved)
  - fallback: link to the case study URL

### HTML example
```html
<div class="project-client">
  <a class="project-client__logo" href="https://client.example" target="_blank" rel="noopener noreferrer">
    <img loading="lazy" decoding="async"
         src="/images/client-logos/saudi-aramco.webp"
         alt="Saudi Aramco — Project: King Salman Airport — Type: Geotechnical Investigation">
  </a>
  <div class="project-client__meta">
    <div class="project-client__name">Saudi Aramco</div>
    <div class="project-client__project">King Salman Airport — Geotechnical Investigation</div>
  </div>
</div>
```

### JSON-LD schema example (Project + Client Organization)
Embed this in the case study page (update values per project):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Project",
  "name": "King Salman Airport – Ground Improvement",
  "description": "Ground improvement and subsurface risk mitigation for major infrastructure.",
  "url": "https://etlaqksa.com/projects/king-salman-airport",
  "provider": {
    "@type": "Organization",
    "name": "Etlaq",
    "url": "https://etlaqksa.com",
    "logo": "https://etlaqksa.com/logo.png"
  },
  "client": {
    "@type": "Organization",
    "name": "Saudi Aramco",
    "url": "https://www.aramco.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://etlaqksa.com/images/client-logos/saudi-aramco.webp"
    }
  }
}
</script>
```

> If you don’t have the official client URL approved, set `client.url` to the internal case study URL.

---

## Accessibility & SEO notes
- Always use descriptive `alt` text:
  - **Client name + Project name + Project type**
- Keep carousel logos `alt` descriptive but short.
- For the carousel, avoid making every logo a separate “SEO link” unless you truly have case study pages.

---

## Client registry
Update these fields in `assets/client-logos.json` per logo:
- `projectType_en`, `projectName_en`
- `projectType_ar`, `projectName_ar`
- `url` (client official site) or `caseStudyUrl`
