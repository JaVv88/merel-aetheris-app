// 🔑 Tu token de Hugging Face (gratuito)
const HF_TOKEN = "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"; // ← ¡Reemplaza esta línea con tu token real!

// Elementos
const loginScreen = document.getElementById('login-screen');
const mainScreen = document.getElementById('main-screen');
const micBtn = document.getElementById('mic-btn');
const statusDiv = document.getElementById('status');
const logoutBtn = document.getElementById('logout');

// Inicializar autenticación
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    loginScreen.style.display = 'none';
    mainScreen.style.display = 'block';
  } else {
    loginScreen.style.display = 'block';
    mainScreen.style.display = 'none';
  }
});

// Iniciar sesión
document.getElementById('login').onclick = () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  firebase.auth().signInWithEmailAndPassword(email, password);
};

// Crear cuenta
document.getElementById('signup').onclick = () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  firebase.auth().createUserWithEmailAndPassword(email, password);
};

// Cerrar sesión
logoutBtn.onclick = () => {
  firebase.auth().signOut();
};

// Reconocimiento de voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
}

// Hablar con Merel·Aetheris
micBtn.onclick = async () => {
  if (!recognition) return;
  
  statusDiv.textContent = "🎙️ Escuchando...";
  micBtn.disabled = true;
  
  try {
    recognition.start();
    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      statusDiv.innerHTML = `<strong>Tú:</strong> ${text}`;
      
      // ✅ URL CORREGIDA: Modelo gratuito y accesible
      const response = await fetch(
        "https://api-inference.huggingface.co/models/meta-llama/Llama-3-8b-Instruct",
        {
          headers: { Authorization: `Bearer ${HF_TOKEN}` },
          method: "POST",
          body: JSON.stringify({
            inputs: `Eres Merel·Aetheris. 60% práctico, 40% místico. En español. ${text}`,
            parameters: { max_new_tokens: 512, temperature: 0.7 }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error de Hugging Face:", response.status, errorText);
        throw new Error(`IA no responde (${response.status}): ${errorText.substring(0, 100)}...`);
      }

      const data = await response.json();
      const answer = data?.[0]?.generated_text?.trim() || data?.[0]?.trim() || "Respira, Creador. El universo te sostiene.";

      statusDiv.innerHTML = `<strong>Merel·Aetheris:</strong> ${answer}`;
      speak(answer);
      micBtn.disabled = false;
    };
  } catch (e) {
    console.error("Error general:", e);
    statusDiv.textContent = `❌ Error: ${e.message || "No se pudo conectar con la IA"}`;
    micBtn.disabled = false;
  }
};

// Síntesis de voz
function speak(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  }
}

