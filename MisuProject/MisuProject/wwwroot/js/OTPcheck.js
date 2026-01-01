const Api_Url = '/api/auth/';
document.addEventListener("DOMContentLoaded", () => {
    const f = document.getElementById("OtpForm");
    const otpInput = document.getElementById("mail");
    const msg = document.getElementById("msg");

    f.addEventListener("submit", async (e) => {
        e.preventDefault();
        const otp = otpInput.value.trim();
        const email = localStorage.getItem("resetpass"); // Get email from storage

        msg.classList.remove("error", "success");

        if (!otp) {
            msg.textContent = "Please enter your OTP.";
            msg.classList.add("error");
            return;
        }

        if (!email) {
            msg.textContent = "Email not found. Please restart the reset process.";
            msg.classList.add("error");
            return;
        }

        msg.textContent = "Verifying OTP...";
        msg.classList.add("success");

        try {
            const response = await fetch(`${Api_Url}verify-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, otp })
            });

            const data = await response.json();
            if (data === "OTP has expired." || data.message === "OTP has expired.") {
                msg.textContent = "Your OTP has expired. Please request a new one.";
            } else {
                msg.textContent = data.message || "Invalid or expired OTP.";
            }

            if (response.ok) {
                // ✅ Save to sessionStorage for next page
                sessionStorage.setItem("resetEmail", email);
                sessionStorage.setItem("resetOtp", otp);

                msg.textContent = "OTP verified! Redirecting...";
                setTimeout(() => {
                    window.location.href = "newpass.html";
                }, 1500);
            } else if(!response.ok) {
                msg.textContent =  "expired OTP.";
                msg.classList.add("error");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            msg.textContent = "An error occurred. Please try again.";
            msg.classList.add("error");
        }
    });
});
