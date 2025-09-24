const elementDict = new Map();

function getOrInitializeElementData(element) {
    if (!elementDict.has(element)) {
        // If the element is not already in the dictionary, initialize it
        elementDict.set(element, [0, 0, 0]);
    }
    return elementDict.get(element); // Return the data (array)
}

let mouseX = window.innerWidth / 2; // Default mouse X (center of the window)
let mouseY = window.innerHeight / 2; // Default mouse Y (center of the window)

document.addEventListener('mousemove', (event) => {
    mouseX = event.pageX;
    mouseY = event.pageY;
});

let lastFrameTime = 0;
const frameInterval = 1000 / 60; // 30 FPS


function updateElements() {
    if ((Math.abs(window.galleryscaleTarget - window.galleryscale)) > 0.005) {
        window.galleryscale = lerp(window.galleryscale, window.galleryscaleTarget, 0.1);
        const galleryContent = document.querySelector('.gallery-content');
        galleryContent.style.transform = 'scale(' + window.galleryscale + ')';
    }

    const currentTime = performance.now();
    if (currentTime - lastFrameTime >= frameInterval) {
        lastFrameTime = currentTime;

        const elements = document.querySelectorAll('.rot');
        if (window.enableAnimations) {
            elements.forEach((element, index) => {

                const data = getOrInitializeElementData(element);

                let currentXRot = data[0];
                let currentYRot = data[1];
                let currentDist = data[2];

                const rect = element.getBoundingClientRect();

                const top = rect.top + window.scrollY;
                const left = rect.left + window.scrollX;
                const right = rect.right + window.scrollX;
                const bottom = rect.bottom + window.scrollY;

                const area = (bottom - top) * (right - left) / 100000;

                const isMouseInside =
                    mouseX >= rect.left &&
                    mouseX <= rect.right &&
                    mouseY >= rect.top &&
                    mouseY <= rect.bottom;

                if (!isMouseInside) {

                    const centerX = (right - left) / 2 + left;
                    const centerY = (bottom - top) / 2 + top;

                    let lim = 1.5;
                    let xrot = clamp((mouseX - centerX) / mouseX, -lim, lim);
                    let yrot = clamp(-(mouseY - centerY) / mouseY, -lim, lim);

                    let dist = Math.sqrt(xrot ** 2 + yrot ** 2);

                    let dampener = 1.6;

                    currentXRot = lerp(currentXRot, xrot, 0.1) / dampener;
                    currentYRot = lerp(currentYRot, yrot, 0.1) / dampener;
                    currentDist = lerp(currentDist, dist, 0.1) / dampener;


                    element.style.transform = `translate3d(${currentXRot * 20}px, ${currentYRot * -20}px, 0) rotate3d(${currentYRot}, ${currentXRot}, 0, ${currentDist}rad)`;
                } else {
                    currentXRot = lerp(currentXRot, 0, 0.1);
                    currentYRot = lerp(currentYRot, 0, 0.1);
                    currentDist = lerp(currentDist, 0, 0.1);

                    element.style.transform = `translate3d(${currentXRot * 20}px, ${currentYRot * -20}px, 0) rotate3d(${currentYRot}, ${currentXRot}, 0, ${currentDist}rad)`;
                }

                data[0] = currentXRot;
                data[1] = currentYRot;
                data[2] = currentDist;
            });
        } else {
            elements.forEach((element, index) => {
                element.style.transform = 'translate3d(0px, 0px, 0) rotate3d(0, 0, 0, 0rad)';
            });
        }

    }
    requestAnimationFrame(updateElements);

};

function smoothstep(edge0, edge1, x) {
    x = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return x * x * (3.0 - 2.0 * x)
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function lerp(start, end, t) {
    return start + (end - start) * t;
}

updateElements();
