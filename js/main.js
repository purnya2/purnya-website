window.galleryscale = 1
window.galleryscaleTarget = 1

window.isFocusingOnImage = false
window.clickedImage = false

window.enableSounds = true
window.fullHeight = false;
window.enableAnimations = true;

function loadHeader() {
    fetch("components/navbar.html")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok")
            }
            return response.text() // Convert the response to text (HTML content)
        })
        .then((data) => {
            document.getElementById("navbar-container").innerHTML = data
            document.getElementById("navbar-container-burger").innerHTML = data
            const navbarLinks = document.getElementsByClassName("navbar-link")

            for (let i = 0; i < navbarLinks.length; i++) {
                navbarLinks[i].addEventListener("click", () => {
                    playAudio("/assets/audio/sfx/select.ogg");
                })
            }
        })
        .catch((error) => {
            console.error("There was a problem with the fetch operation:", error)
        })
}

// Call the function to load the header when the page loads
document.addEventListener("DOMContentLoaded", loadHeader)

async function fetchJSON(str) {
    try {
        const res = await fetch(str)

        if (!res.ok) {
            throw new Error("HTTP error " + res.status)
        }
        const json = await res.json()
        return json
    } catch (error) {
        console.error("Error fetching JSON: ", error)
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const navbarBurger = document.getElementById("navbar-burger")

    navbarBurger.addEventListener("mouseenter", () => {
        const burgertitle = document.getElementById("burger-title")

        navbarBurger.className = "open"
        burgertitle.className = "hide"
    })
    navbarBurger.addEventListener("mouseleave", () => {
        const burgertitle = document.getElementById("burger-title")

        navbarBurger.classList = [""]
        burgertitle.className = ""
    })
})

function toggleAnimation() {
    window.enableAnimations = !window.enableAnimations;
    const animationunlocked = document.getElementById("animationunlocked");
    const animationlocker = document.getElementById("animationlocked");

    if (window.enableAnimations) {
        animationunlocked.style.display = "block";
        animationlocker.style.display = "none";
        document.documentElement.style.setProperty('--show-nohover-opacity', '0.7');

    } else {
        document.documentElement.style.setProperty('--show-nohover-opacity', '1');

        animationunlocked.style.display = "none";
        animationlocker.style.display = "block";
    }
}

function toggleUiSound() {



    window.enableSounds = !window.enableSounds;
    const volumetogglebutton = document.getElementById("volumetogglebutton");
    const volumeup = document.getElementById("volumeup");
    const volumemute = document.getElementById("volumemute");

    if (window.enableSounds) {
        anime({
            targets: '#volumetogglebutton',
            scale: 0.9,
            duration: 150,
            easing: 'easeOutCirc',
            direction: 'alternate'
        })
        volumeup.style.display = "block";
        volumemute.style.display = "none";

        playAudio("/assets/audio/sfx/unmute.wav");
    } else {
        anime({
            targets: '#volumetogglebutton',
            translateX: [-5, 5, -5, 5, -5, 0],
            duration: 150,
            easing: 'easeOutCirc',
        })
        volumeup.style.display = "none";
        volumemute.style.display = "block";

        playAudio("/assets/audio/sfx/mute.wav", "goofy-sfx", 0.2);
    }
}