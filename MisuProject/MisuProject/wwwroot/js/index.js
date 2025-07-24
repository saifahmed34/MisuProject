const Api_Url = 'http://localhost:5189/api/auth/';

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#loginForm");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        

        const email = document.querySelector("#mail").value.trim();
        const password = document.querySelector("#pass").value.trim();
        const message = document.getElementById("message9");

        if (!email || !password) {
            message.style.color = "red";
            message.textContent = "Please enter your email or password";
            return;
        }

        try {
            const response = await fetch(`${Api_Url}login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });
            

            const data = await response.json();
            console.log(JSON.stringify(data));
            console.log('==================================');
            console.log(JSON.stringify(data));
            console.log("Received token:", data.token); // Better for debugging
            sessionStorage.setItem("token", data.token);
            
            if (response.ok && data.token) {
               // alert(data.token);
                sessionStorage.setItem("email", email);
                //alert(email)
               
               
                message.style.color = "green";
                message.textContent = "Login successful. Redirecting...";
                sessionStorage.setItem("token", data.token);
                setTimeout(() => {
                    window.location.href = "home.html";
                }, 1500);
            } else {
                message.style.color = "red";
                message.textContent = data.message || "Login failed. Please try again.";
            }
        } catch (error) {
            console.error("Login error:", error);
            message.style.color = "red";
            message.textContent = "Your email or password is incorrect";
        }
    });
});
