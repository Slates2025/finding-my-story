# slatesdesign.com

The portfolio site of **Paul Slater**, a visual storyteller and designer based in Auckland, New Zealand.

**Live site:** [slatesdesign.com](https://slatesdesign.com)

I designed and built this site myself, rather than using a template or a website builder. It's a hand-written static site, and I maintain and publish it myself through GitHub. I used AI as a coding partner throughout: I bring the design, the content and the decisions, and AI helps me write and debug the code. It's how I've been teaching myself front-end development.

---

## The pages

| Page | What it is |
|---|---|
| [Home](https://slatesdesign.com) | My story, told in seven chapters that open like accordions, each with a real project as an example: interactive 3D cities, long-form digital stories, data interactives, motion graphics and illustration. |
| [Portfolio](https://slatesdesign.com/portfolio.html) | The work: a bento grid of digital projects, a print slideshow and editorial illustration, with a full-screen viewer. |
| [Studio](https://slatesdesign.com/studio.html) | Portrait commissions: a gallery of paintings and drawings, pricing, process and testimonials. |
| [CV](https://slatesdesign.com/cv.html) | Three decades of roles, from the *Financial Times* in London and Hong Kong to NZME in Auckland. |
| [Contact](https://slatesdesign.com/contact.html) | How to get in touch. |

## How it's built

- **Plain HTML, CSS and JavaScript.** No framework and no build pipeline, so it's fast and easy to maintain.
- **3D cities with [three.js](https://threejs.org):** Auckland and Wellington are modelled in Blender and exported as glTF (the Wellington model is compressed with meshopt). They load only when they scroll into view, orbit slowly until you drag, and render only while on screen.
- **Small Python build scripts:** `_build_portfolio.py` and `_build_studio.py` generate the Portfolio and Studio pages from simple data files (`assets/portfolio/*.json`), so adding a piece of work means editing a list rather than hand-writing HTML.
- **Responsive and accessible:** layouts adapt from wide screens to phones; animations respect *reduce motion*; images and interactive controls carry text alternatives for screen readers.
- **Hosting:** GitHub Pages, with a custom domain.
- **Analytics:** Cloudflare Web Analytics, which is cookie-free and privacy-friendly.

## Project structure

```
index.html, cv.html, contact.html     Hand-written pages
portfolio.html, studio.html           Generated: edit the build scripts instead
_build_portfolio.py, _build_studio.py Build scripts (run: python3 _build_portfolio.py)
model.html                            Full-window 3D city used by the Portfolio viewer
assets/
  style.css, script.js                Shared styles and behaviour for every page
  three.js                            The 3D city scenes
  portfolio/                          Portfolio and Studio styles, scripts, data and images
  images/, work/                      Media, embeds and standalone project pages
```

## Running it locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

A local server is needed (rather than opening the files directly) so the 3D models can load.

## Copyright

The code is shared so people can see how the site works. All artwork, illustrations, photographs, writing and published project work remain © Paul Slater (or their original publishers) and may not be reused without permission.
