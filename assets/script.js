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

const thoughtElement = document.getElementById("thoughts");
const jobTitleElement = document.getElementById("jobTitles");

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

    let resizeTimer;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(reserveSpace, 150);
    });

    let wordIndex = 0;
    let charIndex = 0;

    function typeNextCharacter() {

        if (wordIndex >= items.length) {
            setTimeout(fadeOut, 2500);
            return;
        }

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
            element.style.opacity = "1";

            typeNextCharacter();

        }, 700);

    }

    typeNextCharacter();

}

startTyping(thoughtElement, words);
startTyping(jobTitleElement, jobTitles);


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

        // Close all chapters. Transitions are switched off so the whole
        // reposition happens in a single frame — no mid-animation shifting and
        // no delayed jump. The layout is final immediately, so we can scroll
        // the opened chapter's header straight to the top.

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

            // Layout is final (no transitions), so put the chapter's header at
            // the top of the screen instantly, in the same frame.
            accordion.scrollIntoView({ behavior: "instant", block: "start" });

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

    const strap = document.querySelector(".hero-strap");
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
