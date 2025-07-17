const Api_Url = 'http://localhost:5189/api/';
const Auth_Url = `${Api_Url}auth/`;
const Follow_Url = `${Api_Url}follow/`;

document.addEventListener("DOMContentLoaded", async () => {
    const logoutIcon = document.getElementById('logouts');

    if (logoutIcon) {
        logoutIcon.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to logout?")) {
                localStorage.clear();
                alert('Logged out');
                window.location.href = 'index.html';
            }
        });
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login first.");
        return;
    }

    let followingList = [];

    try {
        // Get current following
        const followResponse = await fetch(`${Follow_Url}my-following`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        followingList = await followResponse.json();
    } catch (err) {
        console.error("Error loading following list:", err);
    }

    try {
        const response = await fetch(`${Auth_Url}users`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const users = await response.json();
        const h3elements = document.querySelectorAll('h3');
        const buttons = document.querySelectorAll('.button');

        users.forEach((user, i) => {
            if (h3elements[i]) h3elements[i].textContent = user.name;
            if (buttons[i]) {
                buttons[i].setAttribute('data-user-id', user.id);

                const isFollowing = followingList.includes(user.name);
                buttons[i].textContent = isFollowing ? "Unfollow" : "Follow";
                buttons[i].addEventListener('click', async (e) => {
                    e.preventDefault();

                    const followeeId = user.id;
                    const action = buttons[i].textContent.trim().toLowerCase();

                    if (action === "follow") {
                        try {
                            const res = await fetch(`${Follow_Url}${followeeId}`, {
                                method: "POST",
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                }
                            });

                            if (res.ok) {
                                alert("Followed successfully");
                                buttons[i].textContent = "Unfollow";
                            } else {
                                const err = await res.text();
                                alert("Error: " + err);
                            }
                        } catch (err) {
                            console.error("Follow failed", err);
                        }
                    } else if (action === "unfollow") {
                        try {
                            const res = await fetch(`${Follow_Url}${followeeId}`, {
                                method: "DELETE",
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                }
                            });

                            if (res.ok) {
                                alert("Unfollowed successfully");
                                buttons[i].textContent = "Follow";
                            } else {
                                const err = await res.text();
                                alert("Error: " + err);
                            }
                        } catch (err) {
                            console.error("Unfollow failed", err);
                        }
                    }
                });
            }
        });

    } catch (error) {
        console.error("User fetch error:", error);
    }
});