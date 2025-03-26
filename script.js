const GEMINI_API_KEY = "AIzaSyBHsdOBw6dQ03_vwHN8Gs9y6PHwOzzmCzc";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const chatBody = document.querySelector(".chat-body");
const chatForm = document.querySelector(".chat-form");
const messageInput = document.querySelector(".message-input");

// Initialize Showdown Markdown Converter
const converter = new showdown.Converter({ 
    tables: true, 
    ghCodeBlocks: true 
});

function addMessage(text, sender) {
    console.log(`Adding ${sender} message:`, text); // Debugging

    // Convert Markdown to HTML
    let formattedText = sender === "bot" ? converter.makeHtml(text) : text;

    const messageHTML = `
        <div class="message ${sender}-message">
            ${sender === "bot" ? `<img class="bot-avatar" src="rexbot.png" width="50" height="50" alt="Rex">` : ""}
            <div class="message-text">${formattedText}</div>
        </div>
    `;
    chatBody.innerHTML += messageHTML;

    // Re-run Prism.js to highlight any code blocks
    Prism.highlightAll();

    chatBody.scrollTop = chatBody.scrollHeight; // Auto-scroll to latest message
}

// Function to show "thinking..." animation
function showThinkingAnimation() {
    const thinkingHTML = `
        <div class="message bot-message thinking" id="thinking">
            <img class="bot-avatar" src="rexbot.png" width="50" height="50" alt="">
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        </div>
    `;
    chatBody.innerHTML += thinkingHTML;
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Function to remove "thinking..." animation
function removeThinkingAnimation() {
    const thinkingMessage = document.getElementById("thinking");
    if (thinkingMessage) {
        thinkingMessage.remove();
    }
}

// Function to send user input to the AI
async function getAIResponse(userText) {
    const requestData = {
        contents: [
            {
                parts: [{ text: userText }],
            },
        ],
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        });

        if (response.ok) {
            const data = await response.json();
            return data["candidates"][0]["content"]["parts"][0]["text"];
        } else {
            return "Sorry, I couldn't process your request.";
        }
    } catch (error) {
        console.error(error);
        return "Error: Unable to connect to the AI.";
    }
}

// Event listener for form submission
chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userText = messageInput.value.trim();
    if (!userText) return; // Ignore empty messages

    addMessage(userText, "user"); // Add user message
    messageInput.value = ""; // Clear input

    showThinkingAnimation(); // Show "thinking..." animation

    const botResponse = await getAIResponse(userText);
    
    removeThinkingAnimation(); // Remove "thinking..." animation
    addMessage(botResponse, "bot"); // Add bot response
});