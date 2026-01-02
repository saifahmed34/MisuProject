// Mobile menu toggle
function toggleMenu() {
    const menu = document.getElementById('navMenu');
    menu.classList.toggle('active');
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const menu = document.getElementById('navMenu');
    const toggle = document.querySelector('.menu-toggle');
    
    if (menu && toggle && !menu.contains(event.target) && !toggle.contains(event.target)) {
        menu.classList.remove('active');
    }
});

// SignalR Chat Implementation
document.addEventListener("DOMContentLoaded", async () => {
    const messageInput = document.querySelector('input[name="message"]');
    const logoutButton = document.getElementById('logouts');

    const token = sessionStorage.getItem('token');
    const currentUser = sessionStorage.getItem('email');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    if (typeof signalR === 'undefined') {
        alert('SignalR not loaded. Please refresh.');
        return;
    }

    const connection = new signalR.HubConnectionBuilder()
        .withUrl("/chatHub", {
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

    // Display a message bubble with new responsive layout
    function appendMessage(sender, content, isCurrentUser) {
        const chatMessages = document.getElementById('chatMessages');

        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'message-wrapper ' + (isCurrentUser ? 'sent' : 'received');
        
        console.log('Adding message:', sender, 'isCurrentUser:', isCurrentUser, 'class:', messageWrapper.className);

        const photo = document.createElement('div');
        photo.className = 'photo';

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';

        const usernameDiv = document.createElement('div');
        usernameDiv.className = 'username';
        const usernameP = document.createElement('p');
        usernameP.textContent = sender;
        usernameDiv.appendChild(usernameP);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'content';
        contentDiv.textContent = content;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'time';
        const timeP = document.createElement('p');
        timeP.textContent = new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
        });
        timeDiv.appendChild(timeP);

        messageDiv.appendChild(usernameDiv);
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);

        messageWrapper.appendChild(photo);
        messageWrapper.appendChild(messageDiv);

        chatMessages.appendChild(messageWrapper);

        // Scroll to bottom
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

    // Logout logic
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            sessionStorage.clear();
            window.location.href = 'index.html';
        });
    }

    // Start connection
    startConnection();
});