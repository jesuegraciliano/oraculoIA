// CONFIGURAÇÃO: Substituiremos pela URL do Cloudflare Worker depois
const WORKER_URL = "https://SEU-WORKER.workers.dev/chat";

async function enviarDuvida(event) {
  event.preventDefault();

  const inputEl = document.getElementById("input-student");
  const chatWindow = document.getElementById("chat-window");
  const btnEnviar = document.getElementById("btn-enviar");
  const duvida = inputEl.value.trim();

  if (!duvida) return;

  // 1. Adiciona a pergunta do aluno na tela
  renderMessage(duvida, "user-message");
  inputEl.value = ""; // Limpa o campo
  
  // Bloqueia o botão enquanto pensa
  btnEnviar.disabled = true;
  btnEnviar.textContent = "Pensando... 🧠";

  // 2. Cria uma mensagem de loading na tela
  const loadingId = appendLoadingMessage();

  try {
    // 3. Faz a chamada para o nosso backend serverless
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pergunta: duvida })
    });

    if (!response.ok) throw new Error("Erro ao consultar a IA.");

    const data = await response.json();
    
    // Remove o loading e mostra a resposta da IA
    removeLoadingMessage(loadingId);
    renderMessage(data.resposta, "ai-message");

  } catch (error) {
    removeLoadingMessage(loadingId);
    renderMessage("Desculpe, ocorreu um erro ao processar sua dúvida. Tente novamente.", "error-message");
    console.error(error);
  } finally {
    btnEnviar.disabled = false;
    btnEnviar.textContent = "Perguntar à IA ✨";
  }
}

function renderMessage(text, className) {
  const chatWindow = document.getElementById("chat-window");
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${className}`;
  msgDiv.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function appendLoadingMessage() {
  const id = "loading-" + Date.now();
  const chatWindow = document.getElementById("chat-window");
  const loadDiv = document.createElement("div");
  loadDiv.className = "message ai-message loading";
  loadDiv.id = id;
  loadDiv.innerHTML = `<p><em>Analisando sua dúvida pedagógica...</em></p>`;
  chatWindow.appendChild(loadDiv);
  return id;
}

function removeLoadingMessage(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}
