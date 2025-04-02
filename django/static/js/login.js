function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function submitLoginForm() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const csrftoken = getCookie('csrftoken');

    fetch('/api/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            alert(data.message);
            window.history.replaceState({}, '', '/dashboard/');
            fetch('/dashboard/')
                .then(response => response.text())
                .then(html => {
                    document.documentElement.innerHTML = html;
                    window.history.pushState({}, '', '/dashboard/');
                    const scripts = [
                        "/static/js/popper.min.js", 
                        "/static/js/bootstrap.min.js", 
                        "/static/js/nav.js", 
                        "/static/js/loadlater.js", 
                        "/static/js/updateprofile.js", 
                        "/static/js/friends.js",
                        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"];
                    scripts.forEach((src) => {
                        const script = document.createElement("script");
                        script.src = src;
                        script.async = false; // Sıralı yükleme için
                        document.body.appendChild(script);
                    });
                });
        } else {
            alert(data.message);
        }
    })
    .catch(error => { 
        console.error('Error:', error);
    });
}