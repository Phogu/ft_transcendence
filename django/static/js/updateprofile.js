function uploadProfilePicture() {
    const formData = new FormData();
    const imageInput = document.getElementById("profile-image");
    const messageDiv = document.getElementById("message");
    const leftImage = document.getElementById("leftImage-image");
    const middleImage = document.getElementById("middleImage-image");
    const rightImage = document.getElementById("rightImage-image");

    if (imageInput.files.length === 0) {
        messageDiv.innerText = "Please select an image to upload.";
        messageDiv.style.color = "red";
        return;
    }

    formData.append("profile_image", imageInput.files[0]);

    fetch("/profile/api/updatepp/", {
        method: "POST",
        body: formData,
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
        },
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                messageDiv.innerText = data.error;
                messageDiv.style.color = "red";
            } else {
                messageDiv.innerText = data.message;
                messageDiv.style.color = "green";

                leftImage.src = data.image_url;
                middleImage.src = data.image_url;
                rightImage.src = data.image_url;
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            messageDiv.innerText = "An error occurred. Please try again.";
            messageDiv.style.color = "red";
        });
}

function updateProfile() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;
    const messageDiv = document.getElementById("message-pi");

    const leftUsername = document.getElementById("leftImage-username");
    const leftFullName = document.getElementById("leftImage-fullname");
    const middleUsername = document.getElementById("middleImage-username");
    const middleFullName = document.getElementById("middleImage-fullname");
    const middle2Username = document.getElementById("middle2Image-username");
    const middle2FullName = document.getElementById("middle2Image-fullname");
    const middle2Email = document.getElementById("middle2Image-email");

    fetch("/profile/api/updatepi/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
            username: username,
            email: email,
            first_name: firstName,
            last_name: lastName,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                messageDiv.innerText = data.error;
                messageDiv.style.color = "red";
            } else {
                messageDiv.innerText = data.message;
                messageDiv.style.color = "green";

                leftUsername.innerText = username;
                leftFullName.innerText = firstName + " " + lastName;
                middleUsername.innerText = username;
                middleFullName.innerText = firstName + " " + lastName;
                middle2Username.innerText = username;
                middle2FullName.innerText = firstName + " " + lastName;
                middle2Email.innerText = email;
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            messageDiv.innerText = "An error occurred. Please try again.";
            messageDiv.style.color = "red";
        });
}

function updatePassword() {
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const messageDiv = document.getElementById("message-pw");

    fetch("/profile/api/updatepw/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
            new_password: newPassword,
            confirm_password: confirmPassword,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                messageDiv.innerText = data.error;
                messageDiv.style.color = "red";
            } else {
                messageDiv.innerText = data.message;
                messageDiv.style.color = "green";
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            messageDiv.innerText = "An error occurred. Please try again.";
            messageDiv.style.color = "red";
        });
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
        }
        else {
            badge.classList.add("bg-danger");
        }
    }
}

window.addEventListener("focus", () => {
    updateStatus("online");
});

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        updateStatus("offline");
    } else {
        updateStatus("online");
    }
});

window.addEventListener("beforeunload", () => {
    navigator.sendBeacon("/profile/api/update_status/", `status=offline&_csrf=${getCookie("csrftoken")}`);
});

if (window.location.pathname !== "/login" && window.location.pathname !== "/register" && window.location.pathname !== "/") {
    updateStatus("online");
}
