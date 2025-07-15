// --- Theme Handling ---
const themeToggle = document.getElementById('themeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function setTheme(mode) {
  document.body.classList.remove('dark', 'light');
  document.getElementById('chatBox').classList.remove('dark', 'light');
  if (mode === 'dark') {
    document.body.classList.add('dark');
    document.getElementById('chatBox').classList.add('dark');
    themeToggle.textContent = "☀️";
  } else if (mode === 'light') {
    document.body.classList.add('light');
    document.getElementById('chatBox').classList.add('light');
    themeToggle.textContent = "🌙";
  } else {
    themeToggle.textContent = prefersDark ? "☀️" : "🌙";
  }
}

// Load theme from localStorage or system
function loadTheme() {
  const saved = localStorage.getItem('chat-theme');
  if (saved === 'dark' || saved === 'light') {
    setTheme(saved);
  } else {
    setTheme(prefersDark ? 'dark' : 'light');
  }
}
loadTheme();

themeToggle.onclick = function () {
  const isDark = document.body.classList.contains('dark');
  if (isDark) {
    setTheme('light');
    localStorage.setItem('chat-theme', 'light');
  } else {
    setTheme('dark');
    localStorage.setItem('chat-theme', 'dark');
  }
};

// --- Background Combo Picker ---
const bgComboSelect = document.getElementById('bgComboSelect');
const combosCount = 5;

function clearBGCombos() {
  for (let i = 0; i < combosCount; i++) {
    document.body.classList.remove('bg-combo-' + i);
  }
}
bgComboSelect.onchange = function () {
  clearBGCombos();
  document.body.classList.add('bg-combo-' + bgComboSelect.value);
  localStorage.setItem('bg-combo', bgComboSelect.value);
};
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('bg-combo');
  if (saved !== null && saved < combosCount) {
    bgComboSelect.value = saved;
    clearBGCombos();
    document.body.classList.add('bg-combo-' + saved);
  }
});

// --- Firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyDe2QhJ_8RsSxawcK363nuSL77vi8FhKpM",
  authDomain: "live-chat-cb5bd.firebaseapp.com",
  projectId: "live-chat-cb5bd",
  storageBucket: "live-chat-cb5bd.firebasestorage.app",
  messagingSenderId: "376360205546",
  appId: "1:376360205546:web:aa769e166cb4e41e42ab93",
  measurementId: "G-FK8TV518ZV"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const messagesRef = db.collection("messages");

// Generate a consistent color for each name
function nameToColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

function sendMessage() {
  const name = document.getElementById("name").value.trim();
  const message = document.getElementById("message").value.trim();
  if (name && message) {
    messagesRef.add({ name, message, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
    document.getElementById("message").value = "";
  }
}

function handleTextareaKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function deleteMessage(id) {
  messagesRef.doc(id).delete();
}

messagesRef.orderBy("timestamp").onSnapshot(snapshot => {
  const msgBox = document.getElementById("messages");
  msgBox.innerHTML = "";
  snapshot.forEach(doc => {
    const msg = doc.data();
    const msgElem = document.createElement("div");
    msgElem.className = "msg";

    // Name with color
    const nameElem = document.createElement("span");
    nameElem.className = "name";
    nameElem.textContent = msg.name + ":";
    nameElem.style.color = nameToColor(msg.name);

    // Message (support paragraphs)
    const messageElem = document.createElement("span");
    messageElem.innerHTML = msg.message.replace(/\n/g, "<br>");

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✖";
    deleteBtn.className = "deleteBtn";
    deleteBtn.onclick = () => deleteMessage(doc.id);

    // Timestamp
    const timeElem = document.createElement("span");
    timeElem.className = "timestamp";
    const date = msg.timestamp?.toDate?.();
    timeElem.textContent = date ? new Intl.DateTimeFormat("default", { dateStyle: "short", timeStyle: "short" }).format(date) : "";

    // Build message element
    msgElem.appendChild(nameElem);
    msgElem.appendChild(messageElem);
    msgElem.appendChild(deleteBtn);
    msgElem.appendChild(timeElem);
    msgBox.appendChild(msgElem);
  });
  msgBox.scrollTop = msgBox.scrollHeight;
});

// --- Emoji Picker ---
const emojis = ["🩷", "😭", "😂", "💖", "😤", "😼", "😻", "💕", "🫶", "😎"];
const emojiPicker = document.getElementById('emojiPicker');
emojis.forEach(emoji => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'emojiBtn';
  btn.textContent = emoji;
  btn.onclick = function () { insertEmoji(emoji); };
  emojiPicker.appendChild(btn);
});

function insertEmoji(emoji) {
  const textarea = document.getElementById('message');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  // Insert emoji at cursor position
  textarea.value = text.slice(0, start) + emoji + text.slice(end);
  // Move cursor after inserted emoji
  textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
  textarea.focus();
}

// Attach Enter handler to textarea
document.getElementById('message').addEventListener('keydown', handleTextareaKey);
// Attach click handler to send button
document.getElementById('sendBtn').addEventListener('click', sendMessage);
