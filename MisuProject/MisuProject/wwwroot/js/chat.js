const Api_Urls = 'http://localhost:5189/api/Message/';
document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById("chatInput");
    const chatMessages = document.getElementById("chatMessages");
    const token = sessionStorage.getItem('token'); // assume you store token
    const email = sessionStorage.getItem('email'); // you can store email during login
    const closeMsgBtn = document.getElementById("close-msg");
    const msgBox = document.getElementById("msg");

    chatInput.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
             e.preventDefault();
            const message = chatInput.value.trim();

            if (message !== "") {
                // Send message to backend
                await fetch(`${Api_Urls}send`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        
                        senderEmail: email,
                        message: message,
                        time: new Date().getTime(),
                    })
                });

                chatInput.value = "";
            }
        }
    });

    async function loadMessages() {
        try {
            const res = await fetch(`${Api_Urls}messages`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error("Server error:", res.status, errText);
                return;
            }

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                console.error("Unexpected content type:", contentType);
                return;
            }

            const messages = await res.json();

            chatMessages.innerHTML = ""; // clear previous messages

            messages.forEach(msg => {
                const div = document.createElement("div");
                const dates = new Date(msg.timestamp).toLocaleString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                div.innerHTML = `<strong>${dates}</strong>: ${msg.message}`;
                div.style.padding = "6px";
                div.style.marginBottom = "4px";
                div.style.backgroundColor = "#f1f1f1";
                div.style.borderRadius = "5px";
                chatMessages.appendChild(div);
            });

            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (error) {
            console.error("Fetch/loadMessages error:", error);
        }
    }


// Polling every 2 seconds
    setInterval(loadMessages, 2000);


    if (closeMsgBtn) {
        closeMsgBtn.addEventListener("click", () => {
            msgBox.style.display = "none";
        });
    }
})
