import html, os, re
os.chdir(os.path.dirname(os.path.abspath(__file__)))
c = open('contact.html').read()
hs = c.index('<header class="hero">'); he = c.index('</header>') + len('</header>')
header = c[hs:he].replace('Contact', 'Portfolio', 1) if False else c[hs:he]
header = header.replace('id="contactLine"', 'id="pfLine"')
header = re.sub(r'\s*<p class="standfirst standfirst-bold">.*?</p>', '', header, flags=re.S)
import re
header = re.sub(r'(<h2>\s*)Contact(\s*</h2>)', r'\1Portfolio\2', header)
header = re.sub(r'\s*<div class="standfirst hero-strap hero-ticker">.*?</div>\s*</div>\s*</div>', '', header, flags=re.S)
V = '20261013f'

def tile(cls, thumb, title, meta, group, full=None, video=None, href=None, preview=None, top=False, icon=None, ext=False, frame=None):
    a = ['class="pf-tile pf-reveal %s%s"' % (cls, ' top' if top else ''), 'data-group="%s"' % group,
         'data-title="%s"' % html.escape(title), 'data-meta="%s"' % html.escape(meta)]
    if full: a.append('data-full="%s"' % full)
    if video: a.append('data-video="%s"' % video)
    if frame: a.append('data-frame="%s"' % frame)
    if preview: a.append('data-preview="%s"' % preview)
    tag, close = 'button type="button"', 'button'
    if href and not full and not video and not frame:
        tag = 'a href="%s"' % href + (' target="_blank" rel="noopener noreferrer"' if ext else '')
        close = 'a'
    elif href:
        a.append('data-href="%s"' % href)
    if thumb:
        media = '<img src="assets/portfolio/thumbs/%s.jpg" alt="" loading="lazy"/>' % thumb
    else:
        media = '<video src="%s" muted playsinline preload="metadata"></video>' % video
    ic = '<span class="pf-icon" aria-hidden="true">%s</span>' % icon if icon else ''
    return '<%s %s aria-label="%s">%s%s<span class="pf-cap"><b>%s</b><span>%s</span></span></%s>' % (
        tag, ' '.join(a), html.escape(title), media, ic, html.escape(title), html.escape(meta), close)

PLAY, OUT, ZOOM = '▶', '↗', '⤢'
NZH_W = "https://www.nzherald.co.nz/hawkes-bay-today/news/whenua-interactive-the-history-of-how-new-zealand-land-moved-out-of-maori-ownership-use-our-map-to-search-your-area/AK3CEOK5QVGYLE6MO5UGI4H5ZA/"
VIVA = "https://www.nzherald.co.nz/viva/food-drink/the-viva-top-50-auckland-restaurants-2025/premium/CYNLC3WLTJFPLMJL3GXCHBHXQQ/"
WOB = "https://insights.nzherald.co.nz/data/media/67a3e171ebe3-Comp-1_1.mp4"

digital = [
 tile('lg', 'whenua', 'Whenua: Our Land, Our History', 'Design lead · Interactive', 'dig', href=NZH_W, icon=OUT, ext=True),
 tile('', 'fentanyl', 'Fentanyl in New Zealand', 'Motion graphics', 'dig', video='assets/images/turning-ideas.mp4', preview='assets/images/turning-ideas.mp4', icon=PLAY),
 tile('', 'mmp', 'What is MMP?', 'Motion graphics · Explainer', 'dig', video='assets/images/mmp-explainer.mp4', preview='assets/images/mmp-explainer.mp4', icon=PLAY),
 tile('', 'viva', 'Viva Top 50 Auckland Restaurants', 'Interactive design · Figma', 'dig', href=VIVA, icon=OUT, ext=True, top=True),
 tile('', 'drone', 'Iran’s Shahed-136 drone', 'Interactive graphic · 3D', 'dig', frame='assets/images/drone-embed.html', preview='assets/images/DRONE5.mp4', icon='\u2922'),
 tile('', 'wellington', 'Wellington in 3D', '3D · Open data', 'dig', full='assets/images/Welly.jpg', href='index.html', icon='\u2922'),
 tile('', 'auckland', 'Auckland in 3D', '3D · Blender · three.js', 'dig', full='assets/images/model-placeholder.jpg', href='index.html', icon=ZOOM),
 tile('', 'deep-trouble', 'Deep Trouble', 'Immersive long-form', 'dig', href='assets/images/shorthand-showcase.html', icon=OUT, ext=True),
 '<div class="pf-tile pf-reveal pf-loop" aria-label="How the wobble seam works"><video src="%s" muted loop playsinline preload="metadata" aria-hidden="true"></video><span class="pf-cap"><b>How the wobble seam works</b><span>Motion graphics · Sport</span></span></div>' % WOB,
]

prnt = [tile('lg', 'print-11', 'Weekend Herald and Canvas relaunch', '[Role, year] · Redesign', 'prn', full='assets/images/HZ11.jpg', icon=ZOOM),
        tile('tall', 'ft-wrap', 'The world’s biggest newspaper', 'Financial Times · Building wrap', 'prn', full='assets/images/ft-two-ifc.jpg', icon=ZOOM, top=True)]
for n, t, c2 in [('04', 'Financial Times special reports', ''), ('05', 'The National Business Review Magazine', ''),
                 ('08', 'Lightning likely to strike twice', 'wide'), ('06', 'Rugby News covers', ''),
                 ('07', 'Fault lines: the trouble with Chorus', ''), ('09', 'Dive into the deep blue yonder', ''),
                 ('10', 'Sunday Insight', ''), ('12', 'Stats that matter', 'wide'), ('13', 'Game over', ''),
                 ('14', 'Junior Fa v Joseph Parker', '')]:
    prnt.append(tile(c2, 'print-' + n, t, '[Publication, year · role]', 'prn', full='assets/images/HZ%d.jpg' % int(n), icon=ZOOM))

ill = [tile('lg' if i == 1 else '', 'ill-%02d' % i, 'Editorial illustration %d' % i, '[Publication · story]', 'ill',
            full='assets/images/illustrations/ill-%02d.jpg' % i) for i in range(1, 38)]

import json
studio = json.load(open('assets/portfolio/studio.json'))
def stile(it, label=None):
    cls = 'pf-feature' if it['feature'] else 'pf-mtile'
    t, m = html.escape(it.get('title', '')), html.escape(it.get('medium', ''))
    meta = '<span>%s</span>' % m if m else ''
    return ('<button type="button" class="pf-tile %s pf-reveal" style="--ar:%s" data-group="studio" data-full="assets/portfolio/full/%s.jpg" '
            'data-title="%s" data-meta="%s" aria-label="%s"><img src="assets/portfolio/thumbs/%s.jpg" alt="%s" loading="lazy"/>'
            '<span class="pf-cap"><b>%s</b>%s</span></button>') % (cls, it['ar'], it['name'], t, m, (t + (', ' + m if m else '')), it['name'], t, t, meta)
def studio_group(g, sub):
    items = [x for x in studio if x['group'] == g]
    feat = [x for x in items if x['feature']]
    rest = [x for x in items if not x['feature']]
    label = 'Portrait' if g == 'people' else 'Pet portrait'
    lab = lambda x: ('It\u2019s a Wonderful Life' if x['name'] == 'studio-01' else ('British bulldog' if x['feature'] and g == 'pets' else ('Wildlife' if x['kind'] == 'Wildlife' else label)))
    if g == 'pets':
        # Bulldog large on the left, the first six pets in two rows beside it.
        beside, rest = rest[:6], rest[6:]
        return ('<p class="pf-subhead">%s</p>' % sub +
                '<div class="pf-featurerow">' + ''.join(stile(x, lab(x)) for x in feat) +
                '<div class="pf-masonry pf-beside">' + ''.join(stile(x, lab(x)) for x in beside) + '</div></div>' +
                '<div class="pf-masonry">' + ''.join(stile(x, lab(x)) for x in rest) + '</div>')
    # People: one continuous run (oils, then pencil), after the large feature.
    return ('<p class="pf-subhead">%s</p>' % sub + ''.join(stile(x, lab(x)) for x in feat) +
            '<div class="pf-masonry">' + ''.join(stile(x, lab(x)) for x in rest) + '</div>')
def runs(items):
    # Start a new row block whenever the kind changes (paintings, then pencil drawings).
    out = []
    for x in items:
        if out and out[-1][0]['kind'] == x['kind']: out[-1].append(x)
        else: out.append([x])
    return out
gal = studio_group('people', 'People') + studio_group('pets', 'Pets')

commission = '''<div class="pf-commission pf-reveal">
<h3>Commission a portrait</h3>
<p>A hand-painted portrait of your pet, or someone special, makes a gift that lasts. I take on a small number of commissions each year.</p>
<a class="project-button" href="contact.html">Get in touch about a commission<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"></path></svg></a>
</div>'''

def section(sid, num, title, count, lede, body):
    return '''<section class="pf-section" id="%s">
<div class="pf-inner">
<div class="pf-head">
<span class="pf-num">%s</span>
<h2 class="pf-title">%s</h2>
<span class="pf-count">%s</span>
<p class="pf-lede">%s</p>
</div>
%s
</div>
</section>
''' % (sid, num, title, count, lede, body)

PRINTCAP = '<p class="pf-slidecap" id="printCap" aria-live="polite" data-items="%s"></p>' % html.escape(open('assets/portfolio/print.json').read().replace('\n', ''))
sections = (
    section('digital', '01', 'Digital', '9 projects', 'Interactive graphics, motion explainers and 3D. Hover over a motion piece to preview it.', '<div class="pf-grid">' + ''.join(digital) + '</div>') +
    section('print', '02', 'Print', '36 pieces', 'Newspaper and magazine design: covers, features, special reports, infographics and full redesigns.', '<div class="pf-slideshow pf-reveal"><iframe src="assets/images/slideshow-print-portfolio.html?v=3" title="Print: a slideshow of newspaper and magazine design" loading="lazy" scrolling="no"></iframe></div>' + PRINTCAP) +
    section('illustration', '03', 'Illustration', '37 illustrations', 'Editorial illustration on deadline: ideas created to stop readers and sell the story, often in hours rather than weeks.', '<div class="pf-slideshow pf-reveal"><iframe src="assets/images/slideshow-illustrations.html?v=2" title="Editorial illustration: a slideshow of 37 illustrations" loading="lazy" scrolling="no"></iframe></div>') +
    section('studio', '04', 'Studio', 'Commissions open', 'Paintings in oils: the films, music and people that resonate with me, and portraits of much-loved pets.', gal + commission)
)

page = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Paul Slater | Portfolio</title>
<link rel="stylesheet" href="assets/style.css?v=%(V)s">
<link rel="stylesheet" href="assets/portfolio/portfolio.css?v=13">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="assets/icons/favicon.svg">
<link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">
</head>
<body class="pf-page">
<!-- Generated by _build_portfolio.py: edit that script and re-run it rather than editing this file by hand. -->
<div class="page">
<nav class="top-nav">
<a href="index.html">Home</a>
<a href="portfolio.html" class="active">Portfolio</a>
<a href="cv.html">CV</a>
<a href="contact.html">Contact</a>
</nav>
%(header)s
<nav class="standfirst hero-strap pf-strapnav" aria-label="Portfolio sections">
<ul>
<li><a href="#digital">Digital</a></li>
<li><a href="#print">Print</a></li>
<li><a href="#illustration">Illustration</a></li>
<li><a href="#studio">Studio</a></li>
<li class="pf-marker" aria-hidden="true"></li>
</ul>
</nav>
<p class="standfirst standfirst-bold pf-intro">A selection of my work across digital, print, editorial illustration and painting. Select any piece to see it larger.</p>

<div class="pf-wide">
%(sections)s
</div>
</div>

<div class="pf-lightbox" role="dialog" aria-modal="true" aria-hidden="true" aria-label="Image viewer">
<span class="pf-lb-count"></span>
<button class="pf-lb-btn pf-lb-close" type="button" aria-label="Close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
<button class="pf-lb-btn pf-lb-prev" type="button" aria-label="Previous"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg></button>
<button class="pf-lb-btn pf-lb-next" type="button" aria-label="Next"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></button>
<div class="pf-lb-stage"></div>
<div class="pf-lb-cap"><b></b><span></span><a href="#" target="_blank" rel="noopener noreferrer" hidden>View the project &#8599;</a></div>
</div>

<script src="assets/script.js?v=%(V)s"></script>
<script src="assets/portfolio/portfolio.js?v=9"></script>
</body>
</html>
''' % {'V': V, 'header': header, 'sections': sections}
open('portfolio.html', 'w').write(page)
print('ok', len(page))
