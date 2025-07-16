const Api_Url = 'http://localhost:5189/api/auth/';

document.addEventListener("DOMContentLoaded", async () => {
    const logoutIcon = document.getElementById('logouts');

    // ✅ Logout button
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

    // ✅ Fetch and update H3 tags
    try {
        const response = await fetch(`${Api_Url}users`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        });

        const data = await response.json();
        const names = data.map((item) => item.name);

        const h3elements = document.querySelectorAll('h3');
        let index = 0;

        h3elements.forEach(h3 => {
            if (index < names.length) {
                h3.textContent = names[index];
                index++;
            }
        });

    } catch (error) {
        console.log("Fetch error:", error);
    }
}); // ✅ <- CLOSES document.addEventListener
