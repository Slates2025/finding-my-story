# Builds studio.html. Run via _build_portfolio.py (it shares the masthead,
# the gallery tiles from assets/portfolio/studio.json and the viewer).
# Edit the copy below and re-run:  python3 _build_portfolio.py

EMAIL = 'paulrobertslater1972@gmail.com'
SUBJECT = 'Portrait commission enquiry'
BODY = ("Hi Paul,\n\nI'd like to ask about a portrait.\n\n"
        "Who it's of:\nSize:\nMedium:\nAny date it's needed by:\n\n"
        "I've attached a photo or two.\n\nThanks,\n")
from urllib.parse import quote
MAILTO = 'mailto:%s?subject=%s&amp;body=%s' % (EMAIL, quote(SUBJECT), quote(BODY))

st_header = re.sub(r'(<h2>\s*)Portfolio(\s*</h2>)', r'\1Studio commissions\2', header)

PRICES = [  # (what, size, price)
    ('Pet portraits', 'A4 from', '$350'),
    ('People portraits', 'A4 from', '$400'),
    ('Oil paintings', 'A4 from', '$450'),
]
STEPS = [
    ('Get in touch', 'Send me a short note with a photo or two and an idea of what you’d like. I’ll confirm pricing and timing.'),
    ('Deposit', 'A 20% deposit secures your spot and covers materials.'),
    ('I get to work', 'I’ll let you know when to expect a first look.'),
    ('Preview', 'You’ll see the finished portrait before it’s sent, and I’m happy to make small adjustments.'),
    ('Final payment and delivery', 'Once you’re happy, the balance plus postage is paid by internet banking, and your portrait is on its way.'),
]
QUOTES = [
    ('I cried when I saw it. You have captured him beautifully, and the eyes are so true to Sarge, it is amazing.', 'Nikki O’Leary'),
    ('The portrait of Murphy is very special and had a strong but unexpected impact on me. You captured his spirit perfectly.', 'Julia Gabel'),
    ('She’s so lifelike, it’s unbelievable.', 'Helen van Berkel'),
    ('I showed my family and said you have portrayed him perfectly. I am so very grateful for the work you have put into our beautiful boy.', 'Nicole McCarthy'),
    ('I was afraid to even touch it, it is SO beautiful.', 'Anne Gibson'),
    ('Mate, you are incredible! I love it. I want to blow it up and put it on hoodies for the kids for Christmas!', 'Rob Cox'),
    ('Absolutely gorgeous! Tears! Their faces are stunning, and you’ve captured their souls beautifully.', 'Kylee Douds'),
]
ARROW = ICONS['↗']

prices = '<div class="st-prices">' + ''.join(
    '<div class="st-price pf-reveal"><span class="st-what">%s</span><span class="st-size">%s</span><b>%s</b></div>' % (w, z, p)
    for w, z, p in PRICES) + '</div>'
notes = '''<div class="st-notes pf-reveal">
<p>An A4 drawing takes around 15 to 20 hours. More complex pieces and larger sizes take longer, and are priced on application.</p>
<p>Prices include materials and a high-resolution digital copy of the finished portrait. Postage, packing and framing aren’t included.</p>
<p>Based in Auckland. I ship within New Zealand, and overseas on request.</p>
</div>'''
steps = '<ol class="st-steps">' + ''.join(
    '<li class="pf-reveal"><span class="st-n">%02d</span><b>%s</b><p>%s</p></li>' % (i + 1, t, d)
    for i, (t, d) in enumerate(STEPS)) + '</ol>'
quotes = '<div class="st-quotes">' + ''.join(
    '<figure class="st-quote pf-reveal"><blockquote>%s</blockquote><figcaption>%s</figcaption></figure>' % (html.escape(q), html.escape(n))
    for q, n in QUOTES) + '</div>'
cta = '''<div class="st-cta pf-reveal">
<h2>Ready to start?</h2>
<p>If you have a person or pet in mind, I’d love to hear about them. Send me a note with a photo or two, and I’ll get back to you with ideas, pricing and timing.</p>
<a class="project-button" href="%s">Start a commission%s</a>
</div>''' % (MAILTO, ARROW)

def st_section(sid, title, lede, body):
    lede = '<p class="pf-lede">%s</p>' % lede if lede else ''
    return '''<section class="pf-section st-section" id="%s">
<div class="pf-inner">
<div class="pf-head">
<h2 class="pf-title">%s</h2>
%s
</div>
%s
</div>
</section>
''' % (sid, title, lede, body)

st_sections = (
    st_section('gallery', 'Gallery', 'Commissioned pet portraits, plus the films, music and people that resonate with me. Select any piece to see it larger.', gal) +
    st_section('kind-words', 'Kind words', '', quotes) +
    st_section('pricing', 'Pricing', 'Every portrait starts with a good photo and a conversation about what makes them who they are: the look in their eyes, the tilt of their head, the personality that only you would recognise. I work in colour pencil, pastel, pencil and oils, and I take on a small number of commissions at a time so each one gets the attention it deserves.', prices + notes) +
    st_section('process', 'How it works', '', steps + cta)
)

st_page = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Paul Slater | Studio: portrait commissions</title>
<meta name="description" content="Hand-drawn and painted portraits of pets and people by Auckland artist Paul Slater. A4 commissions from $350.">
<link rel="stylesheet" href="assets/style.css?v=%(V)s">
<link rel="stylesheet" href="assets/portfolio/portfolio.css?v=22">
<link rel="stylesheet" href="assets/portfolio/studio.css?v=4">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="assets/icons/favicon.svg">
<link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">
</head>
<body class="pf-page st-page">
<!-- Generated by _build_studio.py (run _build_portfolio.py): edit that script and re-run it rather than editing this file by hand. -->
<div class="page">
<nav class="top-nav">
<a href="index.html">Home</a>
<a href="portfolio.html">Portfolio</a>
<a href="studio.html" class="active">Studio</a>
<a href="cv.html">Resumé</a>
<a href="contact.html">Contact</a>
</nav>
%(header)s
<nav class="standfirst hero-strap pf-strapnav" aria-label="Studio sections">
<ul>
<li><a href="#gallery">Gallery</a></li>
<li><a href="#kind-words">Kind words</a></li>
<li><a href="#pricing">Pricing</a></li>
<li><a href="#process">How it works</a></li>
<li class="pf-marker" aria-hidden="true"></li>
</ul>
</nav>
<div class="st-intro">
<h2>Portraits, painted and drawn</h2>
<p class="standfirst standfirst-bold">I paint and draw portraits of the people and animals that matter most: a much-loved dog, a family cat, someone you want to celebrate.</p>
<div class="st-actions"><a class="project-button" href="%(mailto)s">Start a commission%(arrow)s</a><a class="st-textlink" href="#pricing">See pricing</a></div>
</div>

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
<script src="assets/portfolio/portfolio.js?v=14"></script>
</body>
</html>
''' % {'V': V, 'header': st_header, 'sections': st_sections, 'mailto': MAILTO, 'arrow': ARROW}
open('studio.html', 'w').write(st_page)
print('ok studio', len(st_page))
