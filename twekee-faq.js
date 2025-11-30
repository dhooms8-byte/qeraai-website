// twekee-faq.js
// Frontend logic for Twekee chat widget – calls /api/twekee-faq backend

function twekeeInit() {
  const chatButton = document.getElementById("twekee-chat-bubble");
  const chatWindow = document.getElementById("twekee-chat-window");
  const closeButton = document.getElementById("twekee-chat-close");
  const messagesContainer = document.getElementById("twekee-chat-messages");
  const input = document.getElementById("twekee-chat-input");
  const sendButton = document.getElementById("twekee-chat-send");

  if (!chatButton || !chatWindow || !closeButton || !messagesContainer || !input || !sendButton) {
    console.error("Twekee chat: some elements are missing in index.html");
    return;
  }

  let history = [];

  function addMessage(text, type) {
    const messageEl = document.createElement("div");
    messageEl.classList.add("twekee-message");
    if (type === "user") {
      messageEl.classList.add("twekee-message-user");
    } else {
      messageEl.classList.add("twekee-message-bot");
    }
    messageEl.textContent = text;
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async function callTwekeeAPI(userText) {
    // temporary loading bubble
    const loadingEl = document.createElement("div");
    loadingEl.classList.add("twekee-message", "twekee-message-bot");
    loadingEl.textContent = "…";
    messagesContainer.appendChild(loadingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const res = await fetch("/api/twekee-faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history
        })
      });

      if (!res.ok) {
        loadingEl.textContent =
          "Sorry, I had trouble connecting to Twekee's brain right now. Please try again in a moment.";
        return;
      }

      const data = await res.json();
      const reply =
        data.reply ||
        "I’m Twekee. I couldn’t generate a proper response just now. Please try again.";

      loadingEl.textContent = reply;

      // update history so backend has more context next time
      history.push({ role: "user", content: userText });
      history.push({ role: "assistant", content: reply });
    } catch (err) {
      console.error("Twekee frontend error:", err);
      loadingEl.textContent =
        "Network error while talking to Twekee. Please check your connection and try again.";
    }
  }

  function openChat() {
    chatWindow.style.display = "flex";
    messagesContainer.innerHTML = "";
    history = [];
    addMessage("Hi, I’m Twekee. How can I help you today?", "bot");
  }

  function closeChat() {
    chatWindow.style.display = "none";
  }

  function handleSend() {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, "user");
    input.value = "";
    callTwekeeAPI(text);
  }

  chatButton.addEventListener("click", openChat);
  closeButton.addEventListener("click", closeChat);
  sendButton.addEventListener("click", handleSend);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSend();
    }
  });
}

window.addEventListener("DOMContentLoaded", twekeeInit);
