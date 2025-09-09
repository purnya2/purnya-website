


function loadHeader() {
    // Use fetch to load the external HTML file (header.html)
    fetch('components/navbar.html')
        .then(response => {
            // Check if the fetch request was successful
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text(); // Convert the response to text (HTML content)
        })
        .then(data => {
            // Inject the fetched HTML content into the container
            document.getElementById('navbar-container').innerHTML = data;
        })
        .catch(error => {
            // If there's an error, log it to the console
            console.error('There was a problem with the fetch operation:', error);
        });
}

// Call the function to load the header when the page loads
document.addEventListener('DOMContentLoaded', loadHeader);

async function fetchJSON(str) {

    try {
        const res = await fetch(str);

        if (!res.ok) {
            throw new Error("HTTP error " + res.status);
        }
        const json = await res.json();
        return json;
    } catch (error) {
        console.error('Error fetching JSON: ', error)
    }


}