const Api_Url = 'http://localhost:5189/api/';

document.addEventListener("DOMContentLoaded", async () => {
    const logoutIcon = document.getElementById('logouts');

    // Logout button
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

    // Fetch user list
    try {
        const response = await fetch(`${Api_Url}auth/users`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        });

        const data = await response.json();
        const h3elements = document.querySelectorAll('h3');
        const buttons = document.querySelectorAll('.button');

        data.forEach((user, index) => {
            if (h3elements[index]) h3elements[index].textContent = user.name;
            if (buttons[index]) buttons[index].setAttribute('data-user-id', user.id);
        });

        // Attach click events after names/IDs are set
        buttons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                const followeeId = button.getAttribute('data-user-id');
                const token = localStorage.getItem('jwt');

                if (!token) {
                    alert("Please login first.");
                    return;
                }

                try {
                    const followResponse = await fetch(`${Api_Url}follow/${followeeId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (followResponse.ok) {
                        alert("Followed successfully!");
                        button.textContent = 'Following';
                        button.disabled = true;
                    } else {
                        const errText = await followResponse.text();
                        alert("Error: " + errText);
                    }

                } catch (err) {
                    console.error("Follow request failed:", err);
                    alert("Failed to follow. See console.");
                }
            });
        });

    } catch (error) {
        console.error("Fetch error:", error);
    }
});
