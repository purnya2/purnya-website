function checkFileExists(url) {
    return fetch(url, { method: "HEAD" })
        .then((response) => {
            return response.ok;
        })
        .catch(() => {
            return false;
        });
}