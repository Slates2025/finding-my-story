/* ==========================================================
   ACCORDION PROTOTYPE
   Version 2.0
========================================================== */

const accordions = document.querySelectorAll(".accordion");

accordions.forEach((accordion) => {

    const button = accordion.querySelector(".accordion-toggle");

    button.addEventListener("click", () => {

        const isOpen = accordion.classList.contains("open");

        // Close every accordion

        accordions.forEach((item) => {

            item.classList.remove("open");

        });

        // Open the clicked one

        if (!isOpen) {

            accordion.classList.add("open");

        }

    });

});