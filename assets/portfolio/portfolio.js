/*================================================
  PORTFOLIO PAGE (draft)
  Ticker, sticky section bar, reveal-on-scroll,
  hover video previews and the full-screen viewer.
================================================*/

(function () {

    const reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const canHover = !!(window.matchMedia && window.matchMedia("(hover: hover)").matches);

    /* ---- Keep the section bar tucked under the pinned nav ---- */
    const nav = document.querySelector(".top-nav");
    function setNavH() {
        if (nav) document.documentElement.style.setProperty("--nav-h", nav.offsetHeight + "px");
    }
    setNavH();
    window.addEventListener("resize", setNavH);

    /* ---- Section bar: smooth jump + sliding marker that follows the scroll ---- */
    const bar = document.querySelector(".pf-strapnav ul");
    const marker = document.querySelector(".pf-strapnav .pf-marker");
    const links = [...document.querySelectorAll(".pf-strapnav a")];
    const sections = links.map(a => document.querySelector(a.getAttribute("href")));

    function moveMarker(link) {
        if (!marker || !link) return;
        marker.style.width = link.offsetWidth + "px";
        marker.style.transform = "translateX(" + link.offsetLeft + "px)";
        links.forEach(l => l.classList.toggle("is-current", l === link));
        // On phones, keep the current chip in view in the swipeable bar.
        if (bar && bar.scrollWidth > bar.clientWidth) {
            bar.scrollTo({ left: link.offsetLeft - 24, behavior: reduceMotion ? "auto" : "smooth" });
        }
    }

    links.forEach((a, i) => a.addEventListener("click", e => {
        e.preventDefault();
        sections[i].scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        history.replaceState(null, "", a.getAttribute("href"));
    }));

    // Current section = the last one whose top has passed just under the
    // pinned nav + strip. Checked on scroll (once per frame) and on load.
    const strap = document.querySelector(".pf-strapnav");
    let ticking = false;
    function updateCurrent() {
        ticking = false;
        const line = (nav ? nav.offsetHeight : 0) + (strap ? strap.offsetHeight : 0) + 80;
        let cur = links[0];
        sections.forEach((sec, i) => { if (sec && sec.getBoundingClientRect().top <= line) cur = links[i]; });
        if (!cur.classList.contains("is-current")) moveMarker(cur);
    }
    window.addEventListener("scroll", () => {
        if (!ticking) { ticking = true; requestAnimationFrame(updateCurrent); }
    }, { passive: true });
    window.addEventListener("load", updateCurrent);
    moveMarker(links[0]);
    updateCurrent();
    window.addEventListener("resize", () => moveMarker(links.find(l => l.classList.contains("is-current")) || links[0]));

    /* ---- Reveal tiles as they scroll into view, a row at a time ---- */
    const reveals = document.querySelectorAll(".pf-reveal");
    if (!reduceMotion && "IntersectionObserver" in window) {
        const io = new IntersectionObserver(entries => {
            let n = 0;
            entries.forEach(en => {
                if (!en.isIntersecting) return;
                en.target.style.transitionDelay = (n++ * 70) + "ms";
                en.target.classList.add("is-in");
                io.unobserve(en.target);
            });
        }, { rootMargin: "0px 0px -8% 0px" });
        reveals.forEach(el => io.observe(el));
    } else {
        reveals.forEach(el => el.classList.add("is-in"));
    }

    /* ---- Hover previews: video tiles play a silent loop under the mouse ---- */
    if (canHover && !reduceMotion) {
        document.querySelectorAll(".pf-tile[data-preview]").forEach(tile => {
            let v = null;
            tile.addEventListener("mouseenter", () => {
                if (!v) {
                    v = document.createElement("video");
                    v.className = "pf-preview";
                    v.src = tile.dataset.preview;
                    v.muted = true; v.loop = true; v.playsInline = true;
                    v.setAttribute("aria-hidden", "true");
                    tile.insertBefore(v, tile.querySelector(".pf-cap"));
                }
                const p = v.play(); if (p && p.catch) p.catch(() => {});
                tile.classList.add("is-previewing");
            });
            tile.addEventListener("mouseleave", () => {
                tile.classList.remove("is-previewing");
                if (v) v.pause();
            });
        });
    }


    /* ---- Studio: justified rows (keeps order, no cropping, no orphans) ----
       Builds rows of equal height that exactly fill the width. A short last
       row is merged into the one before it, so a single piece is never left
       on its own. Next to the bulldog, every row stretches to fill. */

    // Split items, in order, into k groups whose aspect-ratio sums are as even
    // as possible (minimises the squared difference from the average).
    function partition(items, ars, k) {
        const n = items.length;
        k = Math.min(k, n);
        const pre = [0]; ars.forEach(x => pre.push(pre[pre.length - 1] + x));
        const avg = pre[n] / k;
        const cost = (i, j) => { const d = pre[j] - pre[i] - avg; return d * d; };
        const D = Array.from({ length: k + 1 }, () => Array(n + 1).fill(Infinity));
        const P = Array.from({ length: k + 1 }, () => Array(n + 1).fill(0));
        D[0][0] = 0;
        for (let r = 1; r <= k; r++) {
            for (let j = r; j <= n; j++) {
                for (let i = r - 1; i < j; i++) {
                    const v = D[r - 1][i] + cost(i, j);
                    if (v < D[r][j]) { D[r][j] = v; P[r][j] = i; }
                }
            }
        }
        const out = []; let j = n;
        for (let r = k; r >= 1; r--) { const i = P[r][j]; out.unshift(items.slice(i, j)); j = i; }
        return out;
    }
    function justify(box) {
        const tiles = [...box.children].filter(el => el.classList.contains("pf-mtile"));
        if (!tiles.length) return;
        const W = box.clientWidth;
        if (!W) return;
        const cs = getComputedStyle(box);
        const gap = parseFloat(cs.columnGap) || 16;
        const target = parseFloat(cs.getPropertyValue("--row-px")) || (W < 700 ? 160 : 300);
        const stretchAll = box.classList.contains("pf-beside");
        const ar = el => parseFloat(el.style.getPropertyValue("--ar")) || 1;

        // Decide how many rows we need, then split the pieces (in order) into
        // that many rows as evenly as possible, so every row is a similar height.
        const ars = tiles.map(ar);
        const total = ars.reduce((t, x) => t + x, 0);
        const k = stretchAll ? 2 : Math.max(1, Math.round((total * target) / W));
        const rows = partition(tiles, ars, k);
        rows.forEach(r => {
            const s = r.reduce((t, el) => t + ar(el), 0);
            const h = (W - gap * (r.length - 1)) / s;
            let used = 0;
            r.forEach((el, i) => {
                let w = Math.floor(ar(el) * h);
                if (i === r.length - 1) w = Math.floor(W - gap * (r.length - 1) - used);
                used += w;
                el.style.flex = "none";
                el.style.width = w + "px";
                el.style.height = Math.round(h) + "px";
            });
        });
    }
    const boxes = [...document.querySelectorAll(".pf-masonry")];
    // Bulldog row: size the bulldog so its height matches the two rows of pets
    // beside it (a few passes, as each change affects the other).
    function fitFeatureRow(fr) {
        const feat = fr.querySelector(".pf-feature");
        const beside = fr.querySelector(".pf-beside");
        if (!feat || !beside) return;
        if (window.innerWidth <= 700) { fr.style.gridTemplateColumns = ""; justify(beside); return; }
        const a = parseFloat(feat.style.getPropertyValue("--ar")) || .72;
        const gap = parseFloat(getComputedStyle(fr).columnGap) || 16;
        let w = fr.clientWidth * .38;
        for (let i = 0; i < 4; i++) {
            fr.style.gridTemplateColumns = Math.round(w) + "px 1fr";
            justify(beside);
            w = beside.offsetHeight * a;
            w = Math.min(w, fr.clientWidth * .5);
        }
        fr.style.gridTemplateColumns = Math.round(w) + "px 1fr";
        justify(beside);
    }
    const runJustify = () => {
        boxes.filter(b => !b.classList.contains("pf-beside")).forEach(justify);
        document.querySelectorAll(".pf-featurerow").forEach(fitFeatureRow);
    };
    runJustify();
    let jt;
    window.addEventListener("resize", () => { clearTimeout(jt); jt = setTimeout(runJustify, 120); });


    /* ---- Print slideshow caption: publication (and piece) under each slide ---- */
    const printCap = document.getElementById("printCap");
    if (printCap) {
        let capItems = [];
        try { capItems = JSON.parse(printCap.dataset.items || "[]"); } catch (e) {}
        const setCap = i => {
            const it = capItems[i]; if (!it) return;
            printCap.innerHTML = "<b>" + it.pub + "</b>" +
                "<em>" + (i + 1) + " / " + capItems.length + "</em>";
        };
        setCap(0);
        window.addEventListener("message", e => {
            if (e.data && e.data.ssId === "print" && typeof e.data.ssSlide === "number") setCap(e.data.ssSlide);
        });
    }


    /* ---- Embedded interactives report their height (drone graphic) ---- */
    window.addEventListener("message", e => {
        const h = e.data && typeof e.data.height === "number" ? e.data.height : 0;
        if (!h) return;
        document.querySelectorAll(".pf-lb-frame iframe").forEach(f => {
            if (f.contentWindow === e.source) f.style.height = h + "px";
        });
    });

    /* ---- Looping tiles: silent clips that play in place while on screen ---- */
    const loops = document.querySelectorAll(".pf-loop video");
    if (loops.length && !reduceMotion && "IntersectionObserver" in window) {
        const lo = new IntersectionObserver(entries => {
            entries.forEach(en => {
                const v = en.target;
                if (en.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
                else v.pause();
            });
        }, { threshold: .3 });
        loops.forEach(v => { v.muted = true; lo.observe(v); });
    }

    /* ---- Full-screen viewer ---- */
    const lb = document.querySelector(".pf-lightbox");
    const stage = lb.querySelector(".pf-lb-stage");
    const capTitle = lb.querySelector(".pf-lb-cap b");
    const capMeta = lb.querySelector(".pf-lb-cap span");
    const capLink = lb.querySelector(".pf-lb-cap a");
    const count = lb.querySelector(".pf-lb-count");
    let group = [], index = 0, lastFocus = null;

    function itemData(tile) {
        return {
            img: tile.dataset.full,
            video: tile.dataset.video,
            frame: tile.dataset.frame,
            title: tile.dataset.title || "",
            meta: tile.dataset.meta || "",
            href: tile.dataset.href || ""
        };
    }

    function render(dir) {
        const d = itemData(group[index]);
        const old = stage.firstElementChild;
        let el;
        if (d.frame) {
            // A live interactive (e.g. the drone graphic) in a scrollable panel.
            el = document.createElement("div");
            el.className = "pf-lb-frame" + (/model\.html/.test(d.frame) ? " pf-lb-frame--3d" : "");
            const f = document.createElement("iframe");
            f.src = d.frame; f.title = d.title; f.setAttribute("scrolling", "no");
            el.appendChild(f);
        } else if (d.video) {
            el = document.createElement("video");
            el.src = d.video; el.controls = true; el.playsInline = true;
            el.autoplay = true;
        } else {
            el = document.createElement("img");
            el.src = d.img; el.alt = d.title;
        }
        el.style.opacity = "0";
        stage.appendChild(el);
        if (old) {
            old.classList.add("is-leaving");
            if (old.tagName === "VIDEO") old.pause();
            setTimeout(() => old.remove(), 260);
        }
        const show = () => requestAnimationFrame(() => { el.style.opacity = "1"; });
        if (el.tagName === "IMG" && !el.complete) el.addEventListener("load", show, { once: true }); else show();

        capTitle.textContent = d.title;
        capMeta.textContent = d.meta;
        capLink.hidden = !d.href;
        if (d.href) capLink.href = d.href;
        count.textContent = group.length > 1 ? (index + 1) + " / " + group.length : "";
        lb.querySelector(".pf-lb-prev").hidden = group.length < 2;
        lb.querySelector(".pf-lb-next").hidden = group.length < 2;

        // Preload the neighbours so arrowing through feels instant.
        [index + 1, index - 1].forEach(i => {
            const t = group[(i + group.length) % group.length];
            if (t && t.dataset.full) { const im = new Image(); im.src = t.dataset.full; }
        });
    }

    function open(tile) {
        group = [...document.querySelectorAll('.pf-tile[data-group="' + tile.dataset.group + '"]')]
            .filter(t => t.dataset.full || t.dataset.video || t.dataset.frame);
        index = group.indexOf(tile);
        lastFocus = tile;
        stage.innerHTML = "";
        render(0);
        lb.classList.add("is-open");
        lb.setAttribute("aria-hidden", "false");
        document.body.classList.add("pf-locked");
        lb.querySelector(".pf-lb-close").focus();
    }
    function close() {
        lb.classList.remove("is-open");
        lb.setAttribute("aria-hidden", "true");
        document.body.classList.remove("pf-locked");
        const v = stage.querySelector("video"); if (v) v.pause();
        if (lastFocus) lastFocus.focus();
    }
    function step(n) { index = (index + n + group.length) % group.length; render(n); }

    document.querySelectorAll(".pf-tile[data-full], .pf-tile[data-video], .pf-tile[data-frame]").forEach(tile => {
        tile.addEventListener("click", e => { e.preventDefault(); open(tile); });
    });
    lb.querySelector(".pf-lb-close").addEventListener("click", close);
    lb.querySelector(".pf-lb-prev").addEventListener("click", () => step(-1));
    lb.querySelector(".pf-lb-next").addEventListener("click", () => step(1));
    lb.addEventListener("click", e => { if (e.target === lb || e.target === stage) close(); });
    document.addEventListener("keydown", e => {
        if (!lb.classList.contains("is-open")) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
    });
    let sx = 0;
    lb.addEventListener("touchstart", e => { sx = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", e => {
        const dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    }, { passive: true });

})();
