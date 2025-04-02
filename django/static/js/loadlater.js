var mobile_collapse_over = document.querySelector("#mobile-collapse");
if (mobile_collapse_over) {
    mobile_collapse_over.addEventListener("click", function () {
        var temp_sidebar = document.querySelector(".pc-sidebar");
        if (temp_sidebar) {
            if (document.querySelector(".pc-sidebar").classList.contains("mob-sidebar-active")) {
                rm_menu();
            } else {
                document.querySelector(".pc-sidebar").classList.add("mob-sidebar-active");
                document.querySelector(".pc-sidebar").insertAdjacentHTML("beforeend", '<div class="pc-menu-overlay"></div>');
                document.querySelector(".pc-menu-overlay").addEventListener("click", function () {
                    rm_menu();
                });
            }
        }
    });
}

var sidebar_hide = document.querySelector("#sidebar-hide");
if (sidebar_hide) {
    sidebar_hide.addEventListener("click", function () {
        if (document.querySelector(".pc-sidebar").classList.contains("pc-sidebar-hide")) {
            document.querySelector(".pc-sidebar").classList.remove("pc-sidebar-hide");
        } else {
            document.querySelector(".pc-sidebar").classList.add("pc-sidebar-hide");
        }
    });
}
document.addEventListener("keydown", myFunction);
function myFunction(event) {
    if (event.ctrlKey && event.keyCode == 75) {
        if (!!document.querySelector(".form-search input")) {
            document.querySelector(".form-search input").focus();
        }
        event.preventDefault();
    }
}

var clickedLink = document.querySelector(`a[data-url="/dashboard/"]`);
if (clickedLink && window.location.pathname === "/dashboard/") {
    clickedLink.parentElement.classList.add("active");
}

function rm_menu() {
    var temp_list = document.querySelector(".pc-sidebar");
    if (temp_list) {
        document.querySelector(".pc-sidebar").classList.remove("mob-sidebar-active");
    }
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function updateStatus(status) {
    if (window.location.pathname === "/login/" || window.location.pathname === "/register/" || window.location.pathname === "/") {
        return;
    }
    try {
        const response = await fetch("/profile/api/update_status/", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-CSRFToken": getCookie("csrftoken"),
            },
            body: `status=${status}`,
        });
        if (response.ok) {
            const data = await response.json();
            updateBadge(data.status);
        }
    } catch (error) {
        console.error("Error updating status:", error);
    }
}


function updateBadge(status) {
    const badge = document.querySelector(".chat-badge");
    if (!badge)
        return;
    
    if (window.location.pathname === "/profile/"){
        badge.classList.remove("bg-success", "bg-danger");
        if (status === "online") {
            badge.classList.add("bg-success");
        }  else {
            badge.classList.add("bg-danger");
        }
    }
}

window.addEventListener("beforeunload", () => {
    navigator.sendBeacon("/profile/api/update_status/", `status=offline&_csrf=${getCookie("csrftoken")}`);
});

function logoutUser() {
    updateStatus('offline');
    fetch("/logout/")
        .then((response) => {
            if (response.status === 200) {
                return fetch("/");
            } else {
                throw new Error("Logout failed. Please try again.");
            }
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to load content.");
            }
            return response.text();
        })
        .then((html) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const newHead = doc.head;
            const oldHead = document.head;

            Array.from(oldHead.querySelectorAll("link[rel='stylesheet']")).forEach((link) => link.remove());

            Array.from(newHead.querySelectorAll("link[rel='stylesheet']")).forEach((link) => {
                const newLink = document.createElement("link");
                newLink.rel = link.rel;
                newLink.href = link.href;
                document.head.appendChild(newLink);
            });

            Array.from(newHead.querySelectorAll("script")).forEach((script) => {
                const newScript = document.createElement("script");
                newScript.src = script.src;
                newScript.async = script.async;
                document.head.appendChild(newScript);
            });

            const loadlogin = document.createElement("script");
            loadlogin.src = "/static/js/loadlogin.js";
            document.body.appendChild(loadlogin);

            document.body.innerHTML = doc.body.innerHTML;

            loadContent("/", "/");
        })
        .catch((error) => {
            console.error("Error:", error);
            alert(error.message);
        });
}
