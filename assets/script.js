const thoughts = [

    "Stories",
    "Systems",
    "Curiosity",
    "Making",
    "Learning",
    "Explaining",
    "Journalism"

];

const output = document.getElementById("thoughts");

let word = 0;

let character = 0;

let currentText = "";

function typeNextCharacter(){

    if(word >= thoughts.length) return;

    const currentWord = thoughts[word];

    if(character < currentWord.length){

        currentText += currentWord.charAt(character);

        output.textContent = currentText;

        character++;

        setTimeout(typeNextCharacter,45);

    }

    else{

        word++;

        character = 0;

        if(word < thoughts.length){

            currentText += " • ";

            setTimeout(typeNextCharacter,700);

        }

    }

}

setTimeout(typeNextCharacter,800);

const chapters = document.querySelectorAll("details");

chapters.forEach(chapter=>{

    chapter.addEventListener("toggle",()=>{

        if(!chapter.open) return;

        chapters.forEach(other=>{

            if(other!==chapter){

                other.removeAttribute("open");

            }

        });

    });

});