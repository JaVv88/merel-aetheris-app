// 🔑 Tu token de Hugging Face (gratuito)
const HF_TOKEN = "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";

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
      
      // Llamar a Hugging Face
      const response = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        {
          headers: { Authorization: `Bearer ${HF_TOKEN}` },
          method: "POST",
          body: JSON.stringify({
            inputs: `Eres Merel·Aetheris. 60% práctico, 40% místico. En español. ${text}`,
            parameters: { max_new_tokens: 512, temperature: 0.7 }
          })
        }
      );
      const data = await response.json();
      const answer = data[0]?.generated_text?.split("}")[1]?.trim() || "Respira, Creador. El universo te sostiene.";
      
      // Responder con voz
      statusDiv.innerHTML = `<strong>Merel·Aetheris:</strong> ${answer}`;
      speak(answer);
      micBtn.disabled = false;
    };
  } catch (e) {
    statusDiv.textContent = "❌ Error";
    micBtn.disabled = false;
  }
};

// Síntesis de voz
function speak(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    speechSynthesis.speak(utterance);
  }
}