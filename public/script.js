const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const resetBtn = document.getElementById('reset-chat');
const modeSelect = document.getElementById('mode-select');

// Simpan riwayat percakapan
let conversation = [];

// Filter kata tidak pantas
function sanitizeInput(text) {
  const forbidden = ["kasar1", "kasar2", "dewasa1"]; // daftar kata
  for (let word of forbidden) {
    if (text.toLowerCase().includes(word)) {
      return "⚠️ Itu belum cocok untuk dibahas. Yuk bahas hal lain yang seru!";
    }
  }
  return text;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  let userMessage = input.value.trim();
  if (!userMessage) return;

  userMessage = sanitizeInput(userMessage);
  conversation.push({ role: "user", text: userMessage });
  appendMessage('user', userMessage);
  input.value = "";

  const thinkingMsg = appendMessage('bot', "✍️ Bot sedang mengetik...");

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation })
    });

    const data = await response.json();
    conversation.push({ role: "bot", text: data.result });
    thinkingMsg.innerHTML = formatBotMessage(data.result || "Maaf, tidak ada jawaban.");
  } catch {
    thinkingMsg.textContent = "⚠️ Gagal terhubung ke server.";
  }
});

// Tombol reset chat
resetBtn.addEventListener('click', () => {
  conversation = [];
  chatBox.innerHTML = "";
  appendMessage('bot', "🔄 Chat sudah direset. Yuk mulai obrolan baru!");
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);

  const avatar = document.createElement('span');
  avatar.classList.add('avatar');
  avatar.textContent = sender === 'bot' ? '🤖' : '👦';

  const content = document.createElement('span');
  content.classList.add('text');
  content.innerHTML = text;

  msg.appendChild(avatar);
  msg.appendChild(content);

  chatBox.insertBefore(msg, chatBox.firstChild);
  chatBox.scrollTop = 0;

  return msg;
}

function formatBotMessage(text) {
  let mode = modeSelect.value;
  let decorated = text;

  if (mode === "kids") {
    decorated = "🌟 " + text + " 🎉😄";
    decorated = decorated.replace(/\. /g, ".<br>");
    decorated += "<br><br>🐰 Mau tahu hal seru lainnya?";
  } else {
    decorated = "📘 " + text + " 🔎";
    decorated = decorated.replace(/\. /g, ".<br>");
    decorated += "<br><br>🤔 Ada hal lain yang ingin kamu tanyakan?";
  }

  return decorated;
}
