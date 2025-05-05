// evangelho.js

const inputData         = document.getElementById('dataLiturgia');
const btnBuscar         = document.getElementById('btnBuscar');
const container         = document.getElementById('leituras-container');
const dataHeader        = document.getElementById('data-liturgia');
const liturgiaSemanaEl  = document.getElementById('liturgia-semana');

async function carregarLeituras(date) {
  // formata data no header
  const [ano, mes, dia] = date.split('-');
  dataHeader.textContent = `${dia}/${mes}/${ano}`;

  // limpa container e atualiza semana
  container.innerHTML = '';
  liturgiaSemanaEl.textContent = 'Carregando…';

  // monta URL da API + proxy CORS
  const apiUrl = `https://api-liturgia-diaria.vercel.app/?date=${date}`;
  const proxy  = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;

  try {
    const res  = await fetch(proxy);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    // … depois de obter json.today.entry_title …
    const fullTitle = json.today.entry_title || '';
    let firstLine = fullTitle.split(/<br\s*\/?>/i)[0].trim();

    // AQUI você faz a correção de acentos:
    firstLine = firstLine
    .replace(/Pascoa/g,      'Páscoa')
    .replace(/Misericordia/g,'Misericórdia');
    firstLine = firstLine.replace(/^(\d+)(?:[aoAOªº]\.?)?/, '$1°');
    
  
    // aplica esilos no titulo liturgico
    liturgiaSemanaEl.textContent        = firstLine;
    liturgiaSemanaEl.style.fontSize     = '2.5rem';
    liturgiaSemanaEl.style.fontWeight   = '500';
    liturgiaSemanaEl.classList.remove('text-secondary');
    liturgiaSemanaEl.style.color = '#fc1c03';   // cor do tempo da liturgia

// segue o restante da montagem das leituras…

    const R = json.today.readings || {};

    // 1ª Leitura
    if (R.first_reading) {
      container.innerHTML += `
        <section class="card mb-4 shadow-sm">
          <div class="card-body">
            <h2 class="card-title h5">1ª Leitura</h2>
            <div class="fw-bold">${R.first_reading.title}</div>
            <p>${R.first_reading.text}</p>
            <div class="fst-italic fw-bold">${R.first_reading.footer}</div>
          </div>
        </section>`;
    }

    // Salmo
    if (R.psalm && R.psalm.content_psalm) {
      const ps = R.psalm;
      const salmoHtml = ps.content_psalm.map(l => `<p>${l}</p>`).join('');
      container.innerHTML += `
        <section class="card mb-4 shadow-sm">
          <div class="card-body">
            <h2 class="card-title h5">Salmo Responsorial</h2>
            <div class="fw-bold">${ps.title}</div>
            <div class="fst-italic mb-2">${ps.response}</div>
            ${salmoHtml}
          </div>
        </section>`;
    }

    // 2ª Leitura (se existir)
    if (R.second_reading) {
      container.innerHTML += `
        <section class="card mb-4 shadow-sm">
          <div class="card-body">
            <h2 class="card-title h5">2ª Leitura</h2>
            <div class="fw-bold">${R.second_reading.title}</div>
            <p>${R.second_reading.text}</p>
            <div class="fst-italic fw-bold">${R.second_reading.footer}</div>
          </div>
        </section>`;
    }

    // Evangelho
    if (R.gospel) {
      container.innerHTML += `
        <section class="card mb-4 shadow-sm">
          <div class="card-body">
            <h2 class="card-title h5">Evangelho</h2>
            <div class="fw-bold">${R.gospel.head_title || ''}</div>
            <p>${R.gospel.head || ''}</p>
            <p>${R.gospel.text}</p>
            <div class="fst-italic fw-bold">${R.gospel.footer_response || R.gospel.footer || ''}</div>
          </div>
        </section>`;
    }

  } catch (err) {
    console.error('Erro ao carregar leituras:', err);
    liturgiaSemanaEl.textContent = '';
    container.innerHTML = `
      <div class="alert alert-warning text-center">
        Não foi possível carregar as leituras: ${err.message}
      </div>`;
  }
}

// eventos e load
btnBuscar.addEventListener('click', () => {
  if (!inputData.value) return alert('Escolha uma data primeiro.');
  carregarLeituras(inputData.value);
});

window.addEventListener('load', () => {
  const hoje = new Date();
  const dd   = String(hoje.getDate()).padStart(2, '0');
  const mm   = String(hoje.getMonth() + 1).padStart(2, '0');
  const yyyy = hoje.getFullYear();
  const today = `${yyyy}-${mm}-${dd}`;
  inputData.value = today;
  carregarLeituras(today);
});
