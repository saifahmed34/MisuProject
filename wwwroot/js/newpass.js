const Api_Url = 'http://localhost:5189/api/auth/';

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("newpass");
    const newpassword = document.getElementById("mail");
    const confirmpassword = document.getElementById("pass");
    const msg = document.getElementById("msg");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const password = newpassword.value.trim();
        const confpassword = confirmpassword.value.trim();
        const email = sessionStorage.getItem("resetEmail");
        const otp = sessionStorage.getItem("resetOtp");

        if (!password || !confpassword) {
            msg.textContent = "Please enter both password fields.";
            return;
        }

        if (password !== confpassword) {
            msg.textContent = "Passwords do not match.";
            return;
        }

        if (!email || !otp) {
            msg.textContent = "Reset session expired. Please verify OTP again.";
            return;
        }

        try {
            const response = await fetch(`${Api_Url}reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    otp: otp,
                    newPassword: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                msg.textContent = "Password reset successful! Redirecting...";
                sessionStorage.clear(); // remove saved otp/email
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 2000);
            } else {
                msg.textContent = data.message || "Failed to reset password.";
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            msg.textContent = "Something went wrong. Please try again.";
        }
    });
});
