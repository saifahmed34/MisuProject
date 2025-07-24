const Api_Url = 'http://localhost:5189/api/';
const Auth_Url = `${Api_Url}auth/`;
const Follow_Url = `${Api_Url}follow/`;

document.addEventListener("DOMContentLoaded", async () => {
    const logoutIcon = document.getElementById('logouts');
    const token = sessionStorage.getItem('token');
    const closeChat = document.getElementById('closeChat');
    const msgbox = document.getElementById('chat');
/*    closeChat.addEventListener('click', (e) => {
        //e.preventDefault();
        msgbox.style.display = 'none';
        
    })*/
    
    
    // Logout
    if (logoutIcon) {
        logoutIcon.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to logout?")) {
                sessionStorage.clear();
                alert('Logged out');
                window.location.href = 'index.html';
            }
        });
    }

    if (!token) {
        alert("Please login first.");
        return;
    }

    const userCardsContainer = document.getElementById("userCardsContainer");
    const msgBox = document.getElementById("msg");
    const msgText = msgBox.querySelector("p");
    const closeMsgBtn = document.getElementById("close-msg");

    // Close follow message box
    if (closeMsgBtn) {
        closeMsgBtn.addEventListener("click", () => {
            msgBox.style.display = "none";
        });
    }

    let followingList = [];

    try {
        const followRes = await fetch(`${Follow_Url}my-following`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        followingList = await followRes.json();
    } catch (err) {
        console.error("Error fetching following list:", err);
    }

    try {
        const userRes = await fetch(`${Auth_Url}users`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const users = await userRes.json();
        
        const email = sessionStorage.getItem("email")
       // alert(JSON.stringify(email));
       /* console.log(JSON.stringify(userRes) );
        console.log(JSON.stringify(users));*/
        //console.log(users.find());
        //console.log(token);
        //alert(JSON.stringify(users));

        users.forEach((user) => {
            const isFollowing = followingList.includes(user.name);

            const card = document.createElement("div");
            card.className = "div1";

            card.innerHTML = `
                <div class="img1">
                    <img src="./photo/WhatsApp Image 2025-07-20 at 08.22.54_7c17943e.jpg" alt="User Image" />
                </div>
                <div class="div1text1">
                    <div class="textcontanier">
                        <h3>${user.name}</h3>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                    </div>
                    <button type="button" class="button" data-user-id="${user.id}">
                        ${isFollowing ? "Unfollow" : "Follow"} <i class="fa-solid fa-user-plus"></i>
                    </button>
                </div>
            `;

            const button = card.querySelector(".button");

            button.addEventListener("click", async (e) => {
                e.preventDefault();
                const action = button.textContent.trim().toLowerCase();
                const followeeId = user.id;

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
                            button.textContent = "Unfollow";
                            showFollowMessage(user.name, "follow");
                        } else {
                            alert("Error: " + await res.text());
                        }
                    } catch (err) {
                        console.error("Follow error:", err);
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
                            button.textContent = "Follow";
                            showFollowMessage(user.name, "unfollow");
                        } else {
                            alert("Error: " + await res.text());
                        }
                    } catch (err) {
                        console.error("Unfollow error:", err);
                    }
                }
            });

            userCardsContainer.appendChild(card);
        });

    } catch (error) {
        console.error("User fetch error:", error);
    }

    function showFollowMessage(name, action) {
        if (!msgBox || !msgText) return;

        msgText.innerHTML =
            action === "unfollow"
                ? `You are not following "<strong>${name}</strong>"`
                : `You are following "<strong>${name}</strong>"`;

        msgBox.style.display = "block";
        msgBox.style.animation = "fadein 0.5s, fadeout 1.5s 1.5s";

        setTimeout(() => {
            msgBox.style.display = "none";
        }, 3000);
    }
});
   



