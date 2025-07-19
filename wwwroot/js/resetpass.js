    const Api_Url = 'http://localhost:5189/api/auth/'
    document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("resetpass");
    const emailInput = document.getElementById("mail");
    const msg = document.getElementById("msg");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        msg.classList.remove("error", "success");
        localStorage.setItem("resetpass", email)
       // alert(email)

        if (!email) {
            msg.textContent = "Please enter your email";
            msg.classList.add("error");
            msg.style.position = "absolute";
            msg.style.left='170px'
            return;
        }
       

        msg.textContent = "Email is valid, redirecting...";
        msg.classList.add("success");

        try {
          //  alert("Your email: " + email); // Debug alert, remove in production
           // console.log('fetching')
            const response = await fetch(`${Api_Url}forgot-password`, {
                
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
        


            if (response.ok) {
            //        console.log("Response received:", response);
            // console.log("Parsed data:", data);
                 window.location.href = "ver.html"; 
            }
        } catch (error) {
            msg.style.position = "absolute";
            msg.style.left='125px'
            msg.textContent = "Your email or password is incorrect";
            msg.classList.add("error");
        }
    });
});
