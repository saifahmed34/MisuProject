document.addEventListener("DOMContentLoaded", async () => {
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');


    const token = sessionStorage.getItem('token');
    const currentUser = sessionStorage.getItem('email'); // Get current user email

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    if (typeof signalR === 'undefined') {
        alert('SignalR not loaded. Please refresh.');
        return;
    }

    const connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5189/chatHub", {
            accessTokenFactory: () => token
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

    async function startConnection() {
        try {
            await connection.start();
            console.log("SignalR Connected.");

            await connection.invoke("JoinGroup", "general");

            // Load previous messages
            loadChatHistory();
        } catch (err) {
            console.error("Connection failed. Retrying...", err);
            setTimeout(startConnection, 3000);
        }
    }

    connection.onclose(startConnection);

    // Receive live messages
    connection.on("ReceiveMessage", function (sender, content) {
        const isCurrentUser = sender === currentUser;
        appendMessage(sender, content, isCurrentUser);
    });

    // Send message on Enter key
    messageInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && messageInput.value.trim() !== '') {
            const message = messageInput.value.trim();
            try {
                await connection.invoke("SendMessageToGroup", "general", message);
                messageInput.value = '';
            } catch (err) {
                console.error("Message send failed:", err);
            }
        }
    });

    // Display a message bubble
    function appendMessage(sender, content, isCurrentUser) {
        const div = document.createElement('div');
        div.className = isCurrentUser ? 'message message-left' : 'message message-right';
        div.innerHTML = `<strong>${sender}:</strong> ${content}`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Load chat history from the API
    async function loadChatHistory() {
        try {
            const res = await fetch('http://localhost:5189/api/chat/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const history = await res.json();

            history.forEach(msg => {
                const isCurrentUser = msg.sender === currentUser;
                appendMessage(msg.sender, msg.content, isCurrentUser);
            });
        } catch (err) {
            console.error('Failed to load chat history:', err);
        }
    }

    // Start connection
    startConnection();
});
