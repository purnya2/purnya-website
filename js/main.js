window.galleryscale = 1
window.galleryscaleTarget = 1

window.isFocusingOnImage = false
window.clickedImage = false

window.enableSounds = true
window.fullHeight = false;
window.enableAnimations = true;


// Preloading logic
const areasDict = new Map();
const stickersDict = new Map();
const componentsDict = new Map();


function loadHeader() {
    fetch("components/navbar.html")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok")
            }
            return response.text()
        })
        .then((data) => {
            document.getElementById("navbar-container").innerHTML = data
            document.getElementById("navbar-container-burger").innerHTML = data
            const navbarLinks = document.getElementsByClassName("navbar-link")


            const areas_tmp = []
            for (let i = 0; i < navbarLinks.length; i++) {
                navbarLinks[i].addEventListener("click", () => {
                    playAudio("/assets/audio/sfx/select.ogg");
                })

                const name = navbarLinks[i].textContent.replace('.html', '');
                if (!areas_tmp.includes(name)) {
                    areas_tmp.push(name);
                }
            }
            preloadAreas(areas_tmp)
            reloadAreaContent()

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
function animateBanner() {
    anime({
        targets: '#banner',
        translateY: [-50, 0],
        duration: 250,
        easing: 'easeOutCirc',
    });
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

function preloadAreas(areasArray) {
    areasArray.forEach(area => {
        // Validate area name to prevent path traversal
        if (!/^[a-zA-Z0-9_-]+$/.test(area)) {
            console.warn('Invalid area name:', area);
            return;
        }
        let area_text = fetch('/areas/' + area + '.html').then(elem => {
            if (!elem.ok) {
                console.warn('Area not found:', area);
                return;
            }
            return elem.text();
        }).catch(err => {
            console.warn('Failed to load area:', area);
            return null;
        });

        let sticker_text = fetch('/stickers/' + area + '_stickers.html').then(elem => {
            if (!elem.ok) {
                console.warn('Stickers not found for area:', area);
                return;
            }
            return elem.text();
        }).catch(err => {
            console.warn('Failed to load stickers for area:', area);
            return null;
        });

        let component_text = fetch('/components/' + area + '_components.html').then(elem => {
            if (!elem.ok) {
                console.warn('Components not found for area:', area);
                return;
            }
            return elem.text();
        }).catch(err => {
            console.warn('Failed to load components for area:', area);
            return null;
        });


        areasDict.set(area, area_text);
        stickersDict.set(area, sticker_text);
        componentsDict.set(area, component_text);
    });
}

async function reloadAreaContent() {

    // check the params in the url
    const urlParams = new URLSearchParams(window.location.search);
    var myParam = urlParams.get('area');

    if (myParam == null) {
        myParam = "home";
    }

    try {
        // Helper function to safely inject content
        const injectContent = (content, targetId) => {
            const targetDiv = document.getElementById(targetId);
            if (content) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = content;

                const scripts = tempDiv.querySelectorAll('script');
                scripts.forEach(script => script.remove());

                targetDiv.innerHTML = tempDiv.innerHTML;
            } else {
                targetDiv.innerHTML = '';
            }
        };

        // Load all content in parallel and wait for completion
        const [componentContent, stickerContent, areaContent] = await Promise.all([
            componentsDict.get(myParam),
            stickersDict.get(myParam),
            areasDict.get(myParam)
        ]);

        // Inject content sequentially
        injectContent(componentContent, "area-components");
        injectContent(stickerContent, "area-stickers");
        injectContent(areaContent, "area-content");

        // Initialize area-specific functionality
        if (window.areaInitializers && window.areaInitializers[myParam]) {
            window.areaInitializers[myParam]();
        }

        // Keep existing blog logic for now
        if (myParam == 'blog') {
            insertBlogs();
        }

        // Starting animation of the banner upon entering area
        animateBanner();
    } catch (error) {
        console.error('Failed to load area content:', error);
    }
    changeBackground(myParam)
}

function changeArea(area_name) {

    const urlParams = new URLSearchParams(window.location.search);
    var myParam = urlParams.get('area');

    if (area_name != myParam) {
        let url = new URL(window.location);
        url.searchParams.set('area', area_name);
        window.history.pushState({}, '', url)
        reloadAreaContent()
    }
}






function addBlog(blog) {

    const container = document.getElementById("blogs-container");

    const blogPreviewContainer = document.createElement("div");
    blogPreviewContainer.className = "blog-preview-container rot slight_boop";

    // Create the title container
    const titleContainer = document.createElement("div");
    titleContainer.id = "title";

    // Create the title element
    const titleElement = document.createElement("h4");
    const titleLink = document.createElement("a");
    titleLink.href = "blog/blog_area.html?id=" + blog.contentUrl + ".html"
    titleLink.textContent = blog.title;
    titleElement.appendChild(titleLink);

    // Create the date element
    const dateElement = document.createElement("p");
    dateElement.id = "date";
    dateElement.textContent = blog.date;

    // Append title and date to the title container
    titleContainer.appendChild(titleElement);
    titleContainer.appendChild(dateElement);

    // Create a horizontal rule
    const hrElement = document.createElement("hr");
    hrElement.className = "wave";

    // Create the content paragraph
    const contentParagraph = document.createElement("p");
    contentParagraph.textContent = blog.description;

    // Append all elements to the blog preview container
    blogPreviewContainer.appendChild(titleContainer);
    blogPreviewContainer.appendChild(hrElement);
    blogPreviewContainer.appendChild(contentParagraph);

    // Append the blog preview container to the main container
    container.appendChild(blogPreviewContainer);

    anime({
        targets: blogPreviewContainer,
        translateX: [-10, 0]
    })

}


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function changeBackground(str) {
    let bgelem = document.getElementById("background");
    let url = '/assets/images/backgrounds/' + str + '.jpg';
    checkFileExists(url).then((exists) => {
        if (exists) {
            bgelem.style = "background-image: url(" + url + ")"

        } else {
            bgelem.style = "background-image: url(/assets/images/backgrounds/index.jpg)"

        }
    })


}



async function insertBlogs() {
    const data = await fetchJSON('/assets/docs/blogs.json');
    const blogs = data.blogs;

    const sortedBlogs = blogs.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        return dateB - dateA;

    })

    for (const blog of sortedBlogs) {

        addBlog(blog);
        await delay(100);

    }
}



