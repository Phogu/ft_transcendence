function addFriend(friendUsername) {
    const username = friendUsername;
    const messageDiv = document.getElementById("message-af");

    fetch("/profile/api/addfriend/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
            friend_username: username,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                messageDiv.innerText = data.error;
                messageDiv.classList.add("card");
                messageDiv.classList.add("p-2");
                messageDiv.style.color = "red";
            } else {
                messageDiv.innerText = data.message;
                messageDiv.classList.add("card");
                messageDiv.classList.add("p-2");
                messageDiv.style.color = "green";
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            messageDiv.innerText = "An error occurred. Please try again.";
            messageDiv.style.color = "red";
        });
}

function removeFriend(friendUsername) {
    const username = friendUsername;

    fetch("/profile/api/removefriend/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
            friend_username: username,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                div = document.getElementById("friendx-" + username);
                div.remove();
                // alert(data.message);
                if (document.querySelectorAll('[id^="friendx-"]').length === 0) {
                    const noFriendsMessage = document.createElement("tr");
                    noFriendsMessage.id = "no-friends";
                    noFriendsMessage.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center">
                            <h6 class="mb-0 ms-2">You have no friends</h6>
                        </div>
                    </td>
                `;
                    document.getElementById("friends-list").appendChild(noFriendsMessage);
                }
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            messageDiv.innerText = "An error occurred. Please try again.";
            messageDiv.style.color = "red";
        });
}

function acceptRequest(friendUsername) {
    const username = friendUsername;

    fetch("/profile/api/acceptfriend/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
            friend_username: username,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(data.message);

                const friendImageElement = document.getElementById("friend-image-" + username);
                const friendImage = friendImageElement ? friendImageElement.src : "";
                const friendRequest = document.getElementById("friend-request-" + username);
                friendRequest.remove();

                if (document.querySelectorAll('[id^="friend-request-"]').length === 0) {
                    const noRequestsMessage = document.createElement("li");
                    noRequestsMessage.innerHTML = "No friend requests.";
                    noRequestsMessage.classList.add("list-group-item");
                    document.getElementById("friend-requests-list").appendChild(noRequestsMessage);
                }

                const notNumber = document.getElementById("not-number");
                if (notNumber && parseInt(notNumber.innerText) > 1) {
                    notNumber.innerText = parseInt(notNumber.innerText) - 1;
                } else {
                    notNumber.remove();
                }

                const friendCard = document.createElement("tr");
                friendCard.id = "friendx-" + username;
                friendCard.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <img id="friend-image-${username}" src="${friendImage}" alt="" class="img-fluid wid-30 rounded-1">
                        <h6 class="mb-0 ms-2">${username}</h6>
                    </div>
                </td>
                <td class="text-center gap-3 d-flex justify-content-end">
                    <button type="button" onclick="removeFriend('${username}')" class="btn btn-light-danger"><i class="bi bi-trash fs-4"></i></button>
                </td>
            `;
                frienddList = document.getElementById("friends-list");

                if (frienddList) {
                    frienddList.prepend(friendCard);
                }

                const noFriendsMessage = document.getElementById("no-friends");
                if (noFriendsMessage) {
                    noFriendsMessage.remove();
                }
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function rejectRequest(friendUsername) {
    const username = friendUsername;

    fetch("/profile/api/rejectfriend/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
            friend_username: username,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(data.message);

                const friendRequest = document.getElementById("friend-request-" + username);
                friendRequest.remove();

                if (document.querySelectorAll('[id^="friend-request-"]').length === 0) {
                    const noRequestsMessage = document.createElement("li");
                    noRequestsMessage.innerHTML = "No friend requests.";
                    noRequestsMessage.classList.add("list-group-item");
                    document.getElementById("friend-requests-list").appendChild(noRequestsMessage);
                }

                const notNumber = document.getElementById("not-number");
                if (notNumber && parseInt(notNumber.innerText) > 1) {
                    notNumber.innerText = parseInt(notNumber.innerText) - 1;
                } else {
                    notNumber.remove();
                }
            }
        })
        .catch((error) => {
            console.error("Error:", error);
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

function fetchFriendRequests() {
    if (window.location.pathname === "/" || window.location.pathname === "/login/" || window.location.pathname === "/register/") {
        return;
    }
    fetch("/profile/api/getfriendrequests/")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            const friendRequestsList = document.getElementById("friend-requests-list");
            if (!friendRequestsList) {
                return;
            }
            friendRequestsList.innerHTML = "";

            if (data.friend_requests && data.friend_requests.length > 0) {
                data.friend_requests.forEach((request) => {
                    // Create list item for each friend request
                    const listItem = document.createElement("li");
                    listItem.className = "list-group-item";
                    listItem.style.width = "450px";
                    listItem.id = `friend-request-${request.from_user.username}`;
                    listItem.innerHTML = `
                            <div class="d-flex">
                                <div class="flex-shrink-0">
                                    <img id="friend-image-${request.from_user.username}" 
                                        src="${request.from_user.profile_image}" 
                                        alt="user-image" 
                                        class="user-avtar avtar avtar-s" 
                                        style="object-fit: cover;" />
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <div class="d-flex">
                                        <div class="flex-grow-1 me-3 position-relative">
                                            <h6 class="mb-0 text-truncate">${request.from_user.username}</h6>
                                        </div>
                                        <div class="flex-shrink-0">
                                            <span class="text-sm">${request.created_at} ago</span>
                                        </div>
                                    </div>
                                    <p class="position-relative mt-1 mb-2">Friend Request</p>
                                    <button class="btn btn-sm rounded-pill btn-outline-danger me-2" 
                                        onclick="rejectRequest('${request.from_user.username}')">Decline</button>
                                    <button class="btn btn-sm rounded-pill btn-outline-success" 
                                        onclick="acceptRequest('${request.from_user.username}')">Accept</button>
                                </div>
                            </div>
                        `;
                    friendRequestsList.appendChild(listItem);
                });
                numBell = document.getElementById("numBell");
                if (numBell) {
                    const spannum = document.getElementById("not-number");
                    if (!spannum) {
                        const span = document.createElement("span");
                        span.id = "not-number";
                        span.className = "badge bg-success pc-h-badge";
                        span.innerText = data.friend_requests.length;
                        numBell.append(span);
                    }
                }
            } else {
                friendRequestsList.innerHTML = `<li class="list-group-item">No friend requests.</li>`;
            }
        })
        .catch((error) => {
            console.error("Error fetching friend requests:", error);
        });
}

setInterval(fetchFriendRequests, 10000);
fetchFriendRequests();
