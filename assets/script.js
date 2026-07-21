/*================================================

FINDING MY STORY
Homepage interactions
Version 2.0

================================================*/


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

const thoughtElement = document.getElementById("thoughts");

if (thoughtElement) {

    let wordIndex = 0;
    let charIndex = 0;
    let output = "";

    function typeNextCharacter() {

        // Finished all words
        if (wordIndex >= words.length) {

            setTimeout(fadeOutThoughts, 2500);
            return;

        }

        const currentWord = words[wordIndex];

        // Type one character
        output += currentWord.charAt(charIndex);

        thoughtElement.innerHTML = output;

        charIndex++;

        // Continue current word
        if (charIndex < currentWord.length) {

            const speed = 35 + Math.random() * 30;

            setTimeout(typeNextCharacter, speed);

        }

        // Word finished
        else {

            wordIndex++;
            charIndex = 0;

            // Add separator before next word
            if (wordIndex < words.length) {

                output += '<span class="thought-dot"></span>';

            }

            setTimeout(typeNextCharacter, 260);

        }

    }

    function fadeOutThoughts() {

        thoughtElement.style.transition = "opacity 600ms ease";
        thoughtElement.style.opacity = "0";

        setTimeout(() => {

            output = "";
            wordIndex = 0;
            charIndex = 0;

            thoughtElement.innerHTML = "";
            thoughtElement.style.opacity = "1";

            typeNextCharacter();

        }, 700);

    }

    typeNextCharacter();

}


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

        // Close all chapters

        accordions.forEach((item) => {

    item.classList.remove("open");

    const panel = item.querySelector(".accordion-content");
    panel.style.maxHeight = null;

    const story = item.querySelector(".story-panel");

    if (story) {
        story.classList.remove("open");
    }

});

        // Open selected chapter

        if (!isOpen) {

            accordion.classList.add("open");

            content.style.maxHeight = content.scrollHeight + "px";
            const story = accordion.querySelector(".story-panel");

if (story) {
    story.classList.add("open");
}

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
