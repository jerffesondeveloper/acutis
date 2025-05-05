document.addEventListener('DOMContentLoaded', () => {
    const inputData = document.getElementById('dataLiturgia');
    const btnBuscar = document.getElementById('btnBuscar');
  
    // Função que tenta duas APIs: v2 oficial e fallback CNBB GitHub
    async function fetchLiturgia(ano, mes, dia) {
      // 1) Tenta API v2 do liturgia-diaria
      try {
        const urlV2 = `https://liturgia.up.railway.app/v2/${ano}-${mes}-${dia}`;
        const proxyV2 = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlV2)}`;
        const resV2 = await fetch(proxyV2);
        if (resV2.ok) {
          const dataV2 = await resV2.json();
          if (!dataV2.erro && dataV2.leituras) {
            console.log('usando API v2', dataV2);
            return dataV2;
          }
          console.warn('API v2 sem dados:', dataV2.erro);
        }
      } catch (err) {
        console.warn('falha API v2', err);
      }
  
      // 2) Fallback: API CNBB hospedada no GitHub (LucasGiori) via proxy CORS
      try {
        const urlFallback = 'https://cors.bridged.cc/https://api-liturgia-cnbb.vercel.app/api/liturgia';
        const resFb = await fetch(urlFallback, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ano, mes, dia })
        });
        if (resFb.ok) {
          const dataFb = await resFb.json();
          console.log('usando API fallback', dataFb);
          return dataFb;
        }
      } catch (err) {
        console.warn('falha API fallback', err);
      }
  
      throw new Error('Nenhuma API retornou leituras');
    }
  
    async function carregarLeituras(date) {
      const [ano, mes, dia] = date.split('-');
      try {
        const data = await fetchLiturgia(ano, mes, dia);
        // Se API retornou objeto com erro, exibe mensagem
        if (data.erro) {
          throw new Error(data.erro);
        }
        // Normaliza leituras (v2: data.leituras; v1/fallback: raiz)
        const leituras = data.leituras || {
          leitura1: data.leitura1,
          leitura2: data.leitura2,
          salmo: data.salmo,
          evangelho: data.evangelho
        };
  
        // Atualiza título e rito
        document.getElementById('data-liturgia').textContent =
          `${dia}/${mes}/${ano} — ${data.liturgia || data.nome || ''}`;
  
        // 1ª Leitura
        const l1 = leituras.leitura1;
        document.getElementById('texto-leitura1').textContent =
          l1 ? `${l1.referencia || l1.titulo}: ${l1.texto}` : 'Não há 1ª Leitura.';
  
        // Salmo Responsorial
        const sal = leituras.salmo;
        document.getElementById('texto-salmo').textContent =
          sal ? `${sal.referencia || sal.titulo}: ${sal.texto}` : 'Não há Salmo.';
  
        // 2ª Leitura (opcional)
        const l2 = leituras.leitura2;
        if (l2 && (l2.texto || l2.referencia)) {
          document.getElementById('texto-leitura2').textContent =
            `${l2.referencia || l2.titulo}: ${l2.texto}`;
          document.getElementById('leitura2').classList.remove('d-none');
        } else {
          document.getElementById('leitura2').classList.add('d-none');
        }
  
        // Evangelho
        let evArr = leituras.evangelho;
        if (!evArr && data.evangelho) evArr = [data.evangelho];
        const ev = Array.isArray(evArr) ? evArr[0] : evArr;
        document.getElementById('texto-evangelho').textContent =
          ev ? `${ev.referencia || ev.titulo}: ${ev.texto}` : 'Não há Evangelho.';
  
        // Esconde banner de erro, se existir
        const banner = document.getElementById('banner-erro');
        if (banner) banner.classList.add('d-none');
  
      } catch (err) {
        console.error('Erro ao carregar leituras:', err);
        // Exibe banner e mensagem
        const banner = document.getElementById('banner-erro');
        if (banner) {
          banner.textContent = err.message;
          banner.classList.remove('d-none');
        }
        // Limpa cards
        document.getElementById('data-liturgia').textContent = `${dia}/${mes}/${ano}`;
        document.getElementById('texto-leitura1').textContent = err.message;
        document.getElementById('texto-salmo').textContent = '';
        document.getElementById('texto-evangelho').textContent = '';
        document.getElementById('leitura2').classList.add('d-none');
      }
    }
  
    // Evento de click
    btnBuscar.addEventListener('click', () => {
      const date = inputData.value;
      if (!date) return alert('Selecione uma data.');
      carregarLeituras(date);
    });
  
    // Carrega hoje por padrão (mas só útil para datas já publicadas)
    const hoje = new Date();
    const yyyy = hoje.getFullYear();
    const mm   = String(hoje.getMonth() + 1).padStart(2, '0');
    const dd   = String(hoje.getDate()).padStart(2, '0');
    const today = `${yyyy}-${mm}-${dd}`;
    inputData.value = today;
    carregarLeituras(today);
  });
  