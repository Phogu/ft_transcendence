function loadLogin() {
    fetch("/api/check_login_status/")
        .then((response) => response.json())
        .then((data) => {
            if (data.logged_in) {
                fetch("/dashboard/")
                    .then((response) => response.text())
                    .then((html) => {
                        document.documentElement.innerHTML = html;
                        window.history.pushState({}, "", "/dashboard/");
                        const scripts = ["/static/js/popper.min.js", "/static/js/bootstrap.min.js", "/static/js/nav.js", "/static/js/loadlater.js", "/static/js/updateprofile.js", "/static/js/friends.js", "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"];
                        scripts.forEach((src) => {
                            const script = document.createElement("script");
                            script.src = src;
                            script.async = false;
                            document.body.appendChild(script);
                        });
                    });
            } else {
                fetch("/login/")
                    .then((response) => response.text())
                    .then((html) => {
                        document.documentElement.innerHTML = html;
                        window.history.pushState({}, "", "/login/");
                        const scripts = ["/static/js/popper.min.js", "/static/js/bootstrap.min.js", "/static/js/login.js", "/static/js/register.js", "/static/js/nav.js"];
                        scripts.forEach((src) => {
                            const script = document.createElement("script");
                            script.src = src;
                            document.body.appendChild(script);
                        });
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });
            }
        });
}
