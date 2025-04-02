function loadContent(pageUrl, path, skipPushState = false) {
    const contentEl = document.getElementById("content");
    const url = (!contentEl || path === "/") ? path : pageUrl;

    fetch(url, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network Error: ' + response.status);
        }
        return response.text();
    })
    .then(html => {
        if (path === "/dashboard/" || path.startsWith("/profile/") || path === "/game/" || path === "/leaderboard/") {
            fetch("/api/check_login_status/")
            .then((response) => response.json())
            .then((data) => {
                if (!data.logged_in) {
                    return loadContent("/login/", "/login/");
                }
            });
        }

        if (path === "/game/" || path === "/" || !contentEl) {
            document.body.innerHTML = html;
            const loadLater = document.createElement('script');
            loadLater.src = '/static/js/loadlater.js';
            document.body.appendChild(loadLater);
        } else {
            contentEl.innerHTML = html;
        }

        if (!skipPushState) {
            history.pushState({ pageUrl: pageUrl }, "", path);
        }

        var activeLink = document.querySelector("li.active");
        if (activeLink) {
            activeLink.classList.remove("active");
        }
        var clickedLink = document.querySelector(`a[data-url="${path}"]`);
        if (clickedLink) {
            clickedLink.parentElement.classList.add("active");
        }

        if (path === "/game/") {
            const loadLater = document.createElement('script');
            const pongScript = document.createElement('script');
            loadLater.src = '/static/js/gameloadlater.js';
            pongScript.src = '/static/js/pong3d.js';
            document.body.appendChild(loadLater);
            document.body.appendChild(pongScript);
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

function search(friendUsername) {
    const path = `/profile/${friendUsername}/`;
    fetch(path + "raw/")
    .then(response => {
        if (response.ok) {
            loadContent(path + "raw/", path);
        } else {
            return response.json();
        }
    })
    .then(data => {
        if (data && data.error) {
            const searchInput = document.getElementById("search-input");
            searchInput.classList.add("border-danger");
            setTimeout(() => {
                searchInput.classList.remove("border-danger");
            }, 1000);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    var path = window.location.pathname;
    if (path === "/game/") {
        loadContent(path, path);
    } else {
        loadContent(path + "raw/", path);
    }
});

window.onpopstate = function (event) {
    var path = window.location.pathname;
    if (path === "/game/") {
        loadContent(path, path, true);
    } else {
        loadContent(path + "raw/", path, true);
    }
};
