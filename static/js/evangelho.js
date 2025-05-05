// evangelho.js

const inputData = document.getElementById('dataLiturgia');
const btnBuscar = document.getElementById('btnBuscar');
const container = document.getElementById('leituras-container');
const dataHeader = document.getElementById('data-liturgia');

async function carregarLeituras(date) {
  const [ano, mes, dia] = date.split('-');
  // Monta a URL da CNBB
  const urlCNBB = 
    `https://www.cnbb.org.br/apostolado-da-evangelizacao/evangelho-do-dia/` +
    `?dia=${dia}&mes=${mes}&ano=${ano}`;
  // Usa AllOrigins para bypass CORS
  const proxy = 
    `https://api.allorigins.win/raw?url=${encodeURIComponent(urlCNBB)}`;

  try {
    const res  = await fetch(proxy);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // Atualiza o header com a data
    dataHeader.textContent = `${dia}/${mes}/${ano}`;

    // Parseia o HTML
    const parser = new DOMParser();
    const doc    = parser.parseFromString(html, 'text/html');

    // Pega todo o conteúdo principal
    const principal = doc.querySelector('.principal-content');
    if (!principal) {
      throw new Error('Conteúdo principal não encontrado');
    }

    // Injeta no nosso container
    container.innerHTML = principal.innerHTML;

  } catch (err) {
    console.error('Erro ao carregar via CNBB:', err);
    container.innerHTML = `
      <div class="alert alert-warning text-center">
        Não foi possível carregar as leituras para ${date}.
      </div>`;
  }
}

// Eventos
btnBuscar.addEventListener('click', () => {
  if (!inputData.value) return alert('Escolha uma data primeiro.');
  carregarLeituras(inputData.value);
});

// Carrega hoje por padrão
window.addEventListener('load', () => {
  const hoje = new Date();
  const dd   = String(hoje.getDate()).padStart(2, '0');
  const mm   = String(hoje.getMonth() + 1).padStart(2, '0');
  const yyyy = hoje.getFullYear();
  const today = `${yyyy}-${mm}-${dd}`;
  inputData.value = today;
  carregarLeituras(today);
});
