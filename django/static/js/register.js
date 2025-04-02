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

function submitRegisterForm() {
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;
    const chckbx = document.getElementById('registerChkBox');
    const csrftoken = getCookie('csrftoken');

    console.log(chckbx.checked);

    if (chckbx.checked === false) {
        alert('Please accept the terms and conditions');
        return;
    }

    fetch('/api/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({ firstname: firstname, lastname: lastname, email: email, username: username, password: password, password2: password2 })
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
            fetch('/login/raw')
                .then(response => response.text())
                .then(html => {
                    document.getElementById("content").innerHTML = html;
                    history.pushState(null, "", "/login/");
                    const scripts = ["/static/js/popper.min.js", "/static/js/bootstrap.min.js", "/static/js/login.js", "/static/js/register.js", "/static/js/nav.js"];
                    scripts.forEach((src) => {
                        const script = document.createElement("script");
                        script.src = src;
                        script.async = false;
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