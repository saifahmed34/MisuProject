document.addEventListener("DOMContentLoaded", async () => {
    const messageInput = document.querySelector('input[name="message"]');
    const logoutButton = document.getElementById('logouts');

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
        const chatText = document.querySelector('.chattext');

        // Wrapper to prevent overlapping
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper';

        const messageDiv = document.createElement('div');
        messageDiv.className = isCurrentUser ? 'message' : 'message2';

        const usernameDiv = document.createElement('div');
        usernameDiv.className = isCurrentUser ? 'username' : 'username2';
        const usernameP = document.createElement('p');
        usernameP.textContent = sender;
        usernameDiv.appendChild(usernameP);

        const contentDiv = document.createElement('div');
        contentDiv.className = isCurrentUser ? 'content' : 'content2';
        const contentP = document.createElement('p');
        contentP.textContent = content;
        contentDiv.appendChild(contentP);

        const timeDiv = document.createElement('div');
        timeDiv.className = isCurrentUser ? 'time' : 'time2';
        const timeP = document.createElement('p');
        timeP.textContent = new Date().toLocaleTimeString();
        timeDiv.appendChild(timeP);

        messageDiv.appendChild(usernameDiv);
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);

        // Add message to wrapper
        wrapper.appendChild(messageDiv);

        // Append wrapper to chat area
        chatText.appendChild(wrapper);

        // Scroll to bottom
        chatText.scrollTop = chatText.scrollHeight;
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

    // Logout logic
    logoutButton.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'index.html';
    });

    // Start connection
    startConnection();
});
