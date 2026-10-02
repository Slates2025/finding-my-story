/*================================================

FINDING MY STORY
Homepage interactions
Version 2.0

================================================*/


/*------------------------------------------------
/*------------------------------------------------
  HERO THOUGHT LINE
------------------------------------------------*/

const words = [
    "Curiosity",
    "Ideas",
    "Prototypes",
    "Design",
    "Systems",
    "Stories"
];

const jobTitles = [
    "Digital Design Specialist",
    "Creative Director",
    "Art Director",
    "Senior Designer",
    "Graphic Artist",
    "Illustrator"
];

const contactWords = [
    "Projects",
    "Ideas",
    "Questions",
    "Collaborations",
    "Conversations"
];

const thoughtElement = document.getElementById("thoughts");
const jobTitleElement = document.getElementById("jobTitles");
const contactElement = document.getElementById("contactLine");

function startTyping(element, items) {

    if (!element) return;

    const container = element.parentElement;

    // Reserve vertical space for the fully-typed line so the page never jumps
    // as the text wraps and resets. Measured off-screen (so the live line is
    // never disturbed) and refreshed whenever the column width changes.
    function reserveSpace() {

        const probe = document.createElement("div");
        probe.className = container.className;
        probe.style.cssText =
            "position:absolute; left:0; top:0; visibility:hidden; " +
            "pointer-events:none; min-height:0;";
        probe.style.width = container.clientWidth + "px";

        items.forEach((word, i) => {
            const chunk = document.createElement("span");
            chunk.className = "tl-word";
            if (i > 0) {
                const dot = document.createElement("span");
                dot.className = "thought-dot";
                chunk.appendChild(dot);
            }
            chunk.appendChild(document.createTextNode(word));
            probe.appendChild(chunk);
        });

        container.parentElement.appendChild(probe);
        container.style.minHeight = probe.offsetHeight + "px";
        container.parentElement.removeChild(probe);
    }

    reserveSpace();

    // Ticker mode (homepage strap): the line never wraps. Once it's wider
    // than its window, the track glides left so the newest word stays in view.
    const isTicker = container.classList.contains("ticker-track");

    function slide() {
        if (!isTicker) return;
        const overflow = container.scrollWidth - container.parentElement.clientWidth;
        container.style.transform = "translateX(" + -Math.max(0, overflow) + "px)";
    }

    let resizeTimer;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () { reserveSpace(); slide(); }, 150);
    });

    let wordIndex = 0;
    let charIndex = 0;

    function typeNextCharacter() {

        // The masthead cogs turn only while the ticker is typing.
        const hero = isTicker ? container.closest(".hero") : null;

        if (wordIndex >= items.length) {
            if (hero) hero.classList.remove("is-turning");
            setTimeout(fadeOut, 2500);
            return;
        }

        if (hero) hero.classList.add("is-turning");

        const currentWord = items[wordIndex];

        // Each word gets its own inline-block "chunk" holding the separating
        // dot (for every word after the first) plus the word text. The chunk
        // never breaks internally, so the line can only wrap *before* a dot —
        // a dot always travels to the next line with its word, never stranded.
        if (charIndex === 0) {

            const chunk = document.createElement("span");
            chunk.className = "tl-word";

            if (wordIndex > 0) {
                const dot = document.createElement("span");
                dot.className = "thought-dot";
                chunk.appendChild(dot);
            }

            chunk.appendChild(document.createTextNode(""));
            element.appendChild(chunk);
        }

        charIndex++;

        // Reveal one more character in the current chunk's text node.
        element.lastChild.lastChild.textContent = currentWord.slice(0, charIndex);
        slide();

        if (charIndex < currentWord.length) {

            const speed = 35 + Math.random() * 30;
            setTimeout(typeNextCharacter, speed);

        } else {

            wordIndex++;
            charIndex = 0;

            setTimeout(typeNextCharacter, 260);

        }

    }

    function fadeOut() {

        element.style.transition = "opacity 600ms ease";
        element.style.opacity = "0";

        setTimeout(() => {

            wordIndex = 0;
            charIndex = 0;

            element.innerHTML = "";
            if (isTicker) {
                // Snap back to the start while invisible.
                container.style.transition = "none";
                container.style.transform = "translateX(0)";
                void container.offsetWidth;
                container.style.transition = "";
            }
            element.style.opacity = "1";

            typeNextCharacter();

        }, 700);

    }

    typeNextCharacter();

}

startTyping(thoughtElement, words);
startTyping(jobTitleElement, jobTitles);
startTyping(contactElement, contactWords);


/*------------------------------------------------
  CHAPTER ACCORDION
------------------------------------------------*/

const accordions = document.querySelectorAll(".accordion");

accordions.forEach((accordion) => {

const button = accordion.querySelector(".accordion-toggle");
const title = accordion.querySelector(".accordion-title");    
const content = accordion.querySelector(".accordion-content");
title.addEventListener("click", () => {
    button.click();
});

    button.addEventListener("click", () => {

        const isOpen = accordion.classList.contains("open");

        // Where the clicked chapter's header sits on screen right now. After the
        // open/close we keep it in exactly the same spot, so the page doesn't
        // jump: the banner stays in view until the reader scrolls it away.
        const headerTopBefore = accordion.getBoundingClientRect().top;

        // Close all chapters. Transitions are switched off so the whole
        // reposition happens in a single frame — no mid-animation shifting and
        // no delayed jump. The layout is final immediately, so the header can
        // be held in place (below).

        accordions.forEach((item) => {

            const panel = item.querySelector(".accordion-content");
            const story = item.querySelector(".story-panel");

            panel.style.transition = "none";
            if (story) story.style.transition = "none";

            item.classList.remove("open");

            const itemButton = item.querySelector(".accordion-toggle");
            if (itemButton) {
                itemButton.setAttribute("aria-expanded", "false");
            }

            panel.style.maxHeight = null;
            if (story) story.classList.remove("open");

        });

        // Open selected chapter

        if (!isOpen) {

            accordion.classList.add("open");
            button.setAttribute("aria-expanded", "true");

            content.style.maxHeight = content.scrollHeight + "px";
            const story = accordion.querySelector(".story-panel");

            if (story) {
                story.classList.add("open");
            }

        }

        // Layout is final (no transitions). If a chapter above this one just
        // closed, the header would have shifted up; scroll by exactly that
        // amount so it stays put. Otherwise nothing moves at all.
        const shift = accordion.getBoundingClientRect().top - headerTopBefore;
        if (shift !== 0) {
            window.scrollBy({ top: shift, behavior: "instant" });
        }

    });

});


/*------------------------------------------------
  WINDOW RESIZE
------------------------------------------------*/

window.addEventListener("resize", () => {

    document.querySelectorAll(".accordion.open").forEach((accordion) => {

        const content = accordion.querySelector(".accordion-content");

        content.style.maxHeight = content.scrollHeight + "px";

    });

});


/*------------------------------------------------
  HERO STRAPLINE — FIT TO WIDTH (mobile)
  Scales the tagline down so it always sits on one
  line and is never clipped, whatever the screen width.
------------------------------------------------*/

function fitHeroStrap() {

    // The homepage ticker strap manages its own width, so skip it.
    const strap = document.querySelector(".hero-strap:not(.hero-ticker)");
    if (!strap) return;

    // Only the mobile black strip is width-constrained; on desktop the
    // tagline wraps naturally, so clear any inline size we set.
    if (!window.matchMedia("(max-width:700px)").matches) {
        strap.style.fontSize = "";
        return;
    }

    // Start at the largest allowed size, then shrink until the single line
    // fits inside the strip.
    let size = 14;
    strap.style.fontSize = size + "px";

    let guard = 0;
    while (strap.scrollWidth > strap.clientWidth && size > 8 && guard < 80) {
        size -= 0.5;
        strap.style.fontSize = size + "px";
        guard++;
    }

}

fitHeroStrap();
window.addEventListener("load", fitHeroStrap);

let strapResizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(strapResizeTimer);
    strapResizeTimer = setTimeout(fitHeroStrap, 120);
});


/*------------------------------------------------
  WORK CHAPTER LOOPS
  Silent looping clips (GIF-style). They only load
  and play while on screen, and stay on a still
  frame for readers who prefer reduced motion.
------------------------------------------------*/

(function () {

    const loops = document.querySelectorAll("video.work-loop");
    if (!loops.length) return;

    let reduceMotion = false;
    try { reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

    loops.forEach((video) => {
        video.muted = true;
        if (reduceMotion) {
            // Show the first frame only.
            video.preload = "metadata";
        }
    });

    if (reduceMotion) return;

    if (typeof IntersectionObserver === "undefined") {
        loops.forEach((video) => { const p = video.play(); if (p && p.catch) p.catch(() => {}); });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) {
                const p = video.play();
                if (p && p.catch) p.catch(() => {});
            } else if (!video.paused) {
                video.pause();
            }
        });
    }, { threshold: 0.35 });

    loops.forEach((video) => observer.observe(video));

})();


/*------------------------------------------------
  WORK EMBEDS
  Live graphics in the work chapter. They're heavy,
  so each iframe only loads the first time its
  chapter is opened, then sizes itself to the
  height the graphic reports.
------------------------------------------------*/

(function () {

    const embeds = document.querySelectorAll("iframe.work-embed[data-src]");
    if (!embeds.length) return;

    function loadIn(accordion) {
        accordion.querySelectorAll("iframe.work-embed[data-src]").forEach((frame) => {
            frame.src = frame.dataset.src;
            frame.removeAttribute("data-src");
        });
    }

    embeds.forEach((frame) => {
        const accordion = frame.closest(".accordion");
        const trigger = accordion && accordion.querySelector(".accordion-toggle");
        if (!trigger) { frame.src = frame.dataset.src; return; }
        trigger.addEventListener("click", () => loadIn(accordion), { once: true });
        if (accordion.classList.contains("open")) loadIn(accordion);
    });

    window.addEventListener("message", (e) => {
        const d = e.data;
        if (!d || !d.workEmbed || !d.height) return;
        document.querySelectorAll("iframe.work-embed").forEach((frame) => {
            if (frame.contentWindow === e.source) {
                frame.style.height = d.height + "px";
            }
        });
    });

})();
