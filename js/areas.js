// areas.js - Area-specific functionality
// This file contains the JavaScript functionality for each area page

// Index area functionality
export function initializeIndex() {
    walkTheFish();
    stayOnTopFish();
    document.getElementById('fish').addEventListener('click', () => {
        playAudio('https://' + 'www.myinstants.com/media/sounds/large-water-splash-sound-effect.mp3', "goofy-sfx", 0.5);
    });
}

function stayOnTopFish() {
    const fish = document.getElementById('fish');
    let top = -44;
    anime({
        targets: fish,
        top: `${top}px`,
        duration: 100,
        easing: 'linear',
        complete: () => {

            stayOnTopFish();
        }
    });
}
function walkTheFish() {
    const fish = document.getElementById('fish');
    if (!fish) return; // Guard clause in case fish element doesn't exist

    const initialX = 0;
    const time = 7000;
    let switchWalk = false;

    function moveFish() {

        const areaContent = document.getElementById('area-content');
        if (!areaContent) return;

        const finalX = areaContent.clientWidth - 50;
        const targetX = switchWalk ? initialX : finalX;

        // Change direction
        fish.style.transform = switchWalk ? 'scaleX(-1)' : 'scaleX(1)';

        // Animate the fish
        anime({
            targets: fish,
            left: `${targetX}px`,
            duration: time,
            easing: 'linear',
            complete: () => {
                // After animation completes, switch direction and move again
                switchWalk = !switchWalk;
                moveFish();
            }
        });


    }

    moveFish(); // Start the animation
}

// Drawings area functionality
export function initializeDrawings() {
    console.log("Initializing drawings gallery");

    insertFolders().then((data) => {
        let isWorking = addListeners(data);
        if (isWorking) {
            const nepetaElement = document.getElementById("nepeta");
            if (nepetaElement) {
                nepetaElement.click();
            }
        }
    });
}

async function insertFolders() {
    const data = await fetchJSON('/assets/docs/drawingsthumb.json');
    for (const folder of Object.keys(data)) {
        const container = document.getElementById("grid-container");
        if (!container) continue;

        const folderDiv = document.createElement("div");
        folderDiv.className = "grid-item folder";
        folderDiv.id = folder;
        const folderLink = document.createElement("a");
        folderLink.textContent = `/${folder}/`;
        folderDiv.appendChild(folderLink);
        container.appendChild(folderDiv);
    }
    return data;
}

function addListeners(data) {
    const gallery = document.getElementById('gallery');
    if (!gallery) return false;

    gallery.addEventListener('wheel', event => {
        const { ctrlKey } = event
        if (ctrlKey) {
            event.preventDefault();
            const delta = Math.sign(event.deltaY) * -0.05;
            let dampzoom = Math.abs(window.galleryscale - window.galleryscaleTarget);
            if (dampzoom < 0.3 && window.galleryscaleTarget + delta < 2 && window.galleryscaleTarget + delta > 0.5) {
                window.galleryscaleTarget += delta;
            } else {
                window.galleryscaleTarget += 0;
            }
            return
        }
    }, { passive: false })

    // Am I working or not?
    let working = false

    const folders = document.querySelectorAll('.grid-item');

    folders.forEach((folder) => {
        if (!data[folder.id]) return;

        folder.images = data[folder.id]['images'];
        folder.text = data[folder.id]['notes'];
        folder.scale = 1;

        folder.addEventListener('mouseenter', () => {
            folder.style.backgroundImage = "url('/assets/images/idlefolder.gif')";
        });

        folder.addEventListener('mouseleave', () => {
            folder.style.backgroundImage = "url('/assets/images/folder.png')";
            anime({
                targets: folder,
                scale: 1,
                duration: 1,
                easing: 'easeOutCirc',
            });
        });

        folder.addEventListener('mousedown', () => {
            anime({
                targets: folder,
                scale: 0.80,
                duration: 50,
                easing: 'easeOutCirc',
            });
        });

        folder.addEventListener('mouseup', () => {
            anime({
                targets: folder,
                scale: 1,
                duration: 1,
                easing: 'easeOutCirc',
            });
        });

        folder.addEventListener('click', (event) => {
            playAudio("/assets/audio/sfx/opengallery.wav");

            const gallerySelectedOverlay = document.createElement('div');
            gallerySelectedOverlay.id = 'gallery-selected-overlay';
            gallerySelectedOverlay.className = 'gallery-selected-overlay';
            gallerySelectedOverlay.style.display = 'none';

            const closegallery = document.getElementById('closegallery');
            if (closegallery) closegallery.style.display = 'block';

            const gallery = document.getElementById('gallery');
            if (!gallery) return;

            gallery.style.display = 'none';
            gallery.style.display = 'block';
            const images = folder.images;

            const galleryImages = document.getElementById('gallery-images');
            if (!galleryImages) return;

            galleryImages.innerHTML = "";
            galleryImages.appendChild(gallerySelectedOverlay);

            images.forEach(image => {
                let xpos, ypos, width, height;

                const imageContainer = document.createElement("div");
                imageContainer.className = "gallery-image-container";
                imageContainer.style.position = "absolute";
                imageContainer.style.transform = `rotate(${image.rotation}deg)`;
                imageContainer.style.userSelect = "none";
                imageContainer.image_url = image.image_url;

                const img = document.createElement("img");
                img.className = "gallery-image"
                img.src = image.image_thumb;
                img.draggable = false;

                if (image.width == "auto" || image.width === undefined) {
                    img.style.width = "auto";
                } else {
                    img.style.width = `${image.width}px`;
                }

                if (image.height == "auto" || image.height === undefined) {
                    img.style.height = "auto";
                } else {
                    img.style.height = `${image.height}px`;
                }

                const title = document.createElement("h3");
                title.innerHTML = image.title;

                imageContainer.appendChild(title);
                imageContainer.appendChild(img);
                galleryImages.appendChild(imageContainer);

                img.onload = function () {
                    let ratio;
                    xpos = image.position[0];
                    ypos = -image.position[1];

                    if (image.width == "auto" || image.width === undefined) {
                        height = img.naturalHeight * (image.height / img.naturalHeight || 1);
                        ratio = height / img.naturalHeight
                        width = img.naturalWidth * ratio
                    } else if (image.height == "auto" || image.height === undefined) {
                        width = img.naturalWidth * (image.width / img.naturalWidth || 1);
                        ratio = width / img.naturalWidth
                        height = img.naturalHeight * ratio
                    }

                    imageContainer.style.top = `${(ypos - height / 2) + 5000 / 2}px`;
                    imageContainer.style.left = `${(xpos - width / 2) + 5000 / 2}px`;

                    imageContainer.opened = false;
                    imageContainer.topPos = ypos;
                    imageContainer.leftPos = xpos;
                    imageContainer.width = width;
                    imageContainer.height = height;

                    imageContainer.addEventListener('mousedown', () => {
                        window.clickedImage = true;
                    });

                    imageContainer.addEventListener('mousemove', () => {
                        window.clickedImage = false;
                    });

                    imageContainer.addEventListener('mouseup', () => {
                        if (window.clickedImage || window.isFocusingOnImage) {
                            toggleImageContainer(imageContainer);
                        }
                        window.clickedImage = false;
                    });
                }
            });

            const galleryImageContainers = document.querySelectorAll('.gallery-image-container');
            galleryImageContainers.forEach((container) => {
                container.style.pointerEvents = 'none';
            });

            if (!working) {
                anime({
                    targets: '#gallery',
                    maxHeight: ["0%", "80%"],
                    duration: 250,
                    easing: 'easeOutCirc',
                })

                anime({
                    targets: '.gallery-image-container',
                    translateY: function (el, i, l) {
                        if (i % 2 === 0) {
                            return [-50, 0];
                        } else {
                            return [50, 0];
                        }
                    },
                    duration: 250,
                    easing: 'easeOutCirc',
                    delay: function (el, i, l) {
                        return i * 100 + 250;
                    },
                    complete: function (anim) {
                        galleryImageContainers.forEach((container) => {
                            container.style.pointerEvents = 'auto';
                        });
                    }
                });

                anime({
                    targets: '.gallery-image-container',
                    opacity: [0, 1],
                    duration: 0.2,
                    easing: 'easeOutCirc',
                    delay: function (el, i, l) {
                        return i * 100 + 200;
                    },
                });
            } else {
                anime({
                    targets: '.gallery-image-container',
                    opacity: [0, 1],
                    duration: 250,
                    easing: 'easeOutCirc',
                });
            }

            const galleryOverlay = document.getElementById('gallery');
            const galleryContent = document.querySelector('.gallery-content');
            const viewportHeight = window.innerHeight;

            // Center the scroll position
            galleryOverlay.scrollLeft = (galleryContent.scrollWidth) / 2 - galleryOverlay.clientWidth / 2;
            galleryOverlay.scrollTop = (galleryContent.scrollHeight) / 2 - (viewportHeight * 80 / 100) / 2;

            galleryOverlay.addEventListener('mousemove', (event) => {
                if (event.buttons === 1 && !window.clickedImage && !window.isFocusingOnImage) {
                    galleryOverlay.scrollLeft -= event.movementX;
                    galleryOverlay.scrollTop -= event.movementY;
                }
            });
        });
    });

    return working;
}

function toggleImageContainer(imageContainer) {
    if (!imageContainer.opened) {
        playAudio("/assets/audio/sfx/selectimage.wav");

        window.isFocusingOnImage = true;

        const galleryOverlay = document.getElementById('gallery');
        const galleryContent = document.querySelector('.gallery-content');
        const viewportHeight = window.innerHeight;
        let newScale = (galleryOverlay.clientHeight / (imageContainer.height + 200));

        let newScrollLeft = ((galleryContent.scrollWidth) / 2 - galleryOverlay.clientWidth / 2);
        let newScrollTop = ((galleryContent.scrollHeight) / 2 - galleryOverlay.clientHeight / 2)

        let offsetX = imageContainer.leftPos * newScale
        let offsetY = imageContainer.topPos * newScale + 60

        newScrollLeft += offsetX
        newScrollTop += offsetY

        window.galleryscaleTarget = newScale
        window.galleryscale = newScale

        anime({
            targets: galleryOverlay,
            scrollTop: newScrollTop,
            scrollLeft: newScrollLeft,
            easing: 'easeOutCirc',
            duration: 350,
        });

        anime({
            targets: galleryContent,
            scale: window.galleryscale,
            easing: 'easeOutCirc',
            duration: 350,
        });

        imageContainer.classList.toggle("gallery-image-container");
        imageContainer.classList.toggle("gallery-image-container-selected");

        const gallerySelectedOverlay = document.getElementById('gallery-selected-overlay');
        gallerySelectedOverlay.onclick = function () {
            toggleImageContainer(imageContainer);
        }
        gallerySelectedOverlay.style.display = 'block';

        anime({
            targets: '#gallery-selected-overlay',
            opacity: [0, 1],
            easing: 'easeOutCirc',
            duration: 250,
        });

        imageContainer.opened = true;
    } else {
        playAudio("/assets/audio/sfx/deselectimage.wav");

        window.isFocusingOnImage = false;

        const galleryOverlay = document.getElementById('gallery');
        const galleryContent = document.querySelector('.gallery-content');

        let newScrollLeft = ((galleryContent.scrollWidth) / 2 - galleryOverlay.clientWidth / 2);
        let newScrollTop = ((galleryContent.scrollHeight) / 2 - galleryOverlay.clientHeight / 2)
        let offsetX = imageContainer.leftPos
        let offsetY = imageContainer.topPos + 60
        newScrollLeft += offsetX
        newScrollTop += offsetY

        anime({
            targets: galleryOverlay,
            scrollTop: newScrollTop,
            scrollLeft: newScrollLeft,
            easing: 'easeOutCirc',
            duration: 100,
        });

        window.galleryscale = 1
        window.galleryscaleTarget = 1

        anime({
            targets: galleryContent,
            scale: 1,
            easing: 'easeOutCirc',
            duration: 100,
        });

        anime({
            targets: '#gallery-selected-overlay',
            opacity: 0,
            easing: 'easeOutCirc',
            duration: 100,
            begin: function (anim) {
                const gallerySelectedOverlay = document.getElementById('gallery-selected-overlay');
                gallerySelectedOverlay.style.zIndex = 5;
            },
            complete: function (anim) {
                const gallerySelectedOverlay = document.getElementById('gallery-selected-overlay');
                gallerySelectedOverlay.style.display = 'none';
                imageContainer.classList.toggle("gallery-image-container");
                imageContainer.classList.toggle("gallery-image-container-selected");
            }
        });

        imageContainer.opened = false;
    }
}

// Blog area functionality (handled in main index.html)
export function initializeBlog() {
    // Blog initialization is handled by insertBlogs() in the main file
    console.log("Blog area initialized");
}

// Placeholder initializers for other areas
export function initializeProjects() {
    console.log("Projects area initialized");
}

export function initializeWhoAreYou() {
    const images = document.querySelectorAll('.stamps img');
    images.forEach((img) => {
        img.addEventListener('click', () => {
            playAudio('/assets/audio/sfx/fullscreen.wav');
        });

        img.addEventListener('mouseover', () => {
            playAudio('/assets/audio/sfx/hoverstamp.wav', "ui-sfx", 0.1);
        });

        img.addEventListener("dblclick", () => {
            const link = document.createElement('a');
            link.href = img.src;
            link.download = img.src.split('/').pop(); // Use filename from src
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });
}

export function initializeAnythingElse() {
    console.log("Anything else area initialized");

    const audioElement = document.getElementById('thinking-music');
    const volumeSlider = document.getElementById('volume-slider');
    volumeSlider.value = 20;
    audioElement.volume = volumeSlider.value / 100;
    if (audioElement) {
        const playAudio = () => {
            audioElement.play().catch(error => {
                console.error("Audio playback failed:", error);
            });
        };

        // Ensure playback is triggered by user interaction
        document.addEventListener('click', playAudio, { once: true });

        // Link volume slider to audio element
        if (volumeSlider) {
            volumeSlider.addEventListener('input', () => {
                audioElement.volume = volumeSlider.value / 100; // Slider value is 0-100, volume is 0-1
            });
        } else {
            console.warn("Volume slider 'volume-slider' not found.");
        }
    } else {
        console.warn("Audio element 'thinking-music' not found.");
    }

    anime({
        targets: '#song-info',
        translateX: [-10, 0],
        duration: 10500,
        easing: 'easeOutCirc',
    });

    anime({
        targets: '#song-info',
        opacity: [0, 0.5],
        duration: 20000,
        easing: 'easeOutCirc',
        delay: 1000,
    });

    anime({
        targets: '#banner-anything-else',
        translateY: [5, -10],
        duration: 10000,
        easing: 'easeOutCirc',
    });

}

export function initializeBalenciaga() {
    console.log("Balenciaga area initialized");
}

// TODO this should be imported from utils.js or something of the sorts
// should be generated based on the filesystem
// Area initialization mapping
export const areaInitializers = {
    'index': initializeIndex,
    'drawings': initializeDrawings,
    'blog': initializeBlog,
    'projects': initializeProjects,
    'who_are_you': initializeWhoAreYou,
    'anything_else': initializeAnythingElse,
};