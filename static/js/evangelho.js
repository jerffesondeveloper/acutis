// static/js/evangelho.js

// elementos do DOM
const inputData        = document.getElementById('dataLiturgia');
const btnBuscar        = document.getElementById('btnBuscar');
const dataHeader       = document.getElementById('data-liturgia');
const liturgiaSemanaEl = document.getElementById('liturgia-semana');
const container        = document.getElementById('leituras-container');

// opcional: realça números de versículo dentro do texto
function wrapVerseNumbers(text) {
  return text.replace(/\b(\d+)\b/g,
    '<span class="verse-number">$1</span>');
}

async function carregarLeituras(date) {
  // 1) exibe data no header
  const [ano, mes, dia] = date.split('-');
  dataHeader.textContent = `${dia}/${mes}/${ano}`;

  // 2) limpa container e sinaliza loading da semana
  container.innerHTML          = '';
  liturgiaSemanaEl.textContent = 'Carregando…';

  // 3) URL da API + proxy CORS
  const apiUrl = `https://api-liturgia-diaria.vercel.app/?date=${date}`;
  const proxy  = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;

  try {
    const res  = await fetch(proxy);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    console.log('Chaves em json.today.readings:', Object.keys(json.today.readings));


    // 4) semana litúrgica (só a primeira linha antes do <br>)
    const fullTitle = json.today.entry_title || '';
    let firstLine   = fullTitle
      .split(/<br\s*\/?>/i)[0]
      .trim()
      // corrige Pascoa ➔ Páscoa
      .replace(/Pascoa/g, 'Páscoa')
      // troca "3a." ou "3ª" por "3•" (só no início)
      .replace(/^(\d+)(?:[aoAOªº]\.?)?/, '$1°');

    liturgiaSemanaEl.textContent = firstLine;

    // 5) prepara objeto de leituras
    const R = json.today.readings || {};

    // 6) ordem fixa para as mais comuns
    const ordemFixa = ['first_reading', 'psalm', 'second_reading', 'gospel'];
    // junta com quaisquer outras chaves que vierem
    const todasChaves = [
      ...ordemFixa,
      ...Object.keys(R).filter(k => !ordemFixa.includes(k))
    ];

    // 7) loop dinâmico sobre cada leitura
    todasChaves.forEach(chave => {
      const dado = R[chave];
      if (!dado) return;

      // define o título de seção
      let titulo;
      switch (chave) {
        case 'first_reading':  titulo = '1ª Leitura';         break;
        case 'second_reading': titulo = '2ª Leitura';         break;
        case 'gospel':         titulo = 'Evangelho';          break;
        case 'psalm':          titulo = 'Salmo Responsorial'; break;
        default:
          // usa dado.title ou formata a chave
          titulo = dado.title
            ? dado.title
            : chave
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
      }

      // começa a montar o bloco
      let html = `
        <section class="card mb-4 shadow-sm">
          <div class="card-body">
            <h2 class="card-title h5">${titulo}</h2>
      `;

      // Salmo com várias linhas
      if (chave === 'psalm' && Array.isArray(dado.content_psalm)) {
        html += `<div class="fw-bold">${dado.title}</div>
                 <div class="fst-italic mb-2">${dado.response}</div>
                 <div class="card-text">`;
        dado.content_psalm.forEach(linha => {
          const txt = wrapVerseNumbers(linha.trim().replace(/^-+\s*/, ''));
          html += `<p>${txt}</p>`;
        });
        html += `</div>`;
      }
      else {
        // leituras simples e evangelho
        const raw = dado.text || '';
        const txt = wrapVerseNumbers(raw.replace(/\n/g, '<br>'));
        html += `<div class="fw-bold">${dado.title}</div>
                 <div class="card-text"><p>${txt}</p></div>`;
      }

      // footer ou resposta do evangelho
      if (dado.footer) {
        html += `<div class="fst-italic fw-bold">${dado.footer}</div>`;
      } else if (dado.footer_response) {
        html += `<div class="fst-italic fw-bold">${dado.footer_response}</div>`;
      }

      html += `</div></section>`;

      // injeta no container
      container.innerHTML += html;
    });

  } catch (err) {
    console.error('Erro ao carregar leituras:', err);
    liturgiaSemanaEl.textContent = '';
    container.innerHTML = `
      <div class="alert alert-warning text-center">
        Não foi possível carregar as leituras: ${err.message}
      </div>`;
  }
}

// dispara a busca ao clicar
btnBuscar.addEventListener('click', () => {
  if (!inputData.value) return alert('Escolha uma data primeiro.');
  carregarLeituras(inputData.value);
});

// carrega as leituras de hoje ao abrir a página
window.addEventListener('load', () => {
  const hoje = new Date();
  const dd   = String(hoje.getDate()).padStart(2, '0');
  const mm   = String(hoje.getMonth() + 1).padStart(2, '0');
  const yyyy = hoje.getFullYear();
  const today = `${yyyy}-${mm}-${dd}`;
  inputData.value = today;
  carregarLeituras(today);
});
