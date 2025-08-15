const mood = document.getElementById('mood');
const emoji = document.getElementById('emoji');
const statusEl = document.getElementById('status');

// simple device id so the backend knows "who" (no login needed)
let deviceId = localStorage.getItem('deviceId');
if (!deviceId) {
  deviceId = crypto.randomUUID();
  localStorage.setItem('deviceId', deviceId);
}

const faces = { happy:'😄', sad:'😢', excited:'🤩', tired:'😴' };

function setEmoji(name) {
  emoji.textContent = faces[name] || '🤔';
}

async function loadLastMood() {
  try {
    const res = await fetch(`/api/get-mood?deviceId=${encodeURIComponent(deviceId)}`);
    if (!res.ok) throw new Error('load failed');
    const data = await res.json();    // { mood, updatedAt } or {}
    if (data.mood) {
      mood.value = data.mood;
      setEmoji(data.mood);
      statusEl.textContent = `Last saved: ${data.mood} (${new Date(data.updatedAt).toLocaleString()})`;
    } else {
      statusEl.textContent = 'No mood saved yet.';
    }
  } catch {
    statusEl.textContent = 'Could not load (try again).';
  }
}

mood.addEventListener('change', async () => {
  const value = mood.value;
  setEmoji(value);
  if (!value) return;

  statusEl.textContent = 'Saving...';
  try {
    const res = await fetch('/api/set-mood', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ deviceId, mood: value })
    });
    if (!res.ok) throw new Error('save failed');
    const data = await res.json(); // { ok: true, updatedAt }
    statusEl.textContent = `Saved: ${value} (${new Date(data.updatedAt).toLocaleString()})`;
  } catch {
    statusEl.textContent = 'Save failed (check connection).';
  }
});

loadLastMood();
