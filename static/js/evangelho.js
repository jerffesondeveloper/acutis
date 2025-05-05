document.addEventListener('DOMContentLoaded', () => {
    const inputData = document.getElementById('dataLiturgia');
    const btnBuscar = document.getElementById('btnBuscar');
  
    async function carregarLeituras(date) {
      const [ano, mes, dia] = date.split('-');
      const endpoint = `https://liturgia.up.railway.app/v2/${ano}-${mes}-${dia}`;
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(endpoint)}`;
  
      try {
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        const data = await res.json();
  
        // 1. Atualiza data e rito
        const textoRito = data.liturgia || data.ritual || 'Leituras do dia';
        document.getElementById('data-liturgia').textContent =
          `${dia}/${mes}/${ano} — ${textoRito}`;
  
        // 2. Primeira Leitura
        const l1 = data.leituras?.leitura1;
        document.getElementById('texto-leitura1').textContent =
          l1 ? `${l1.referencia}: ${l1.texto}` : 'Não há 1ª Leitura.';
  
        // 3. Salmo Responsorial
        const salmo = data.leituras?.salmo;
        document.getElementById('texto-salmo').textContent =
          salmo ? `${salmo.referencia}: ${salmo.texto}` : 'Não há Salmo.';
  
        // 4. 2ª Leitura (opcional)
        const l2 = data.leituras?.leitura2;
        if (l2) {
          document.getElementById('texto-leitura2').textContent =
            `${l2.referencia}: ${l2.texto}`;
          document.getElementById('leitura2').classList.remove('d-none');
        } else {
          document.getElementById('leitura2').classList.add('d-none');
        }
  
        // 5. Evangelho
        const evArr = data.leituras?.evangelho || [];
        if (evArr.length) {
          const ev = evArr[0];
          document.getElementById('texto-evangelho').textContent =
            `${ev.referencia}: ${ev.texto}`;
        } else {
          document.getElementById('texto-evangelho').textContent = 'Não há Evangelho.';
        }
  
      } catch (error) {
        console.error('Falha ao carregar leituras:', error);
        document.getElementById('texto-leitura1').textContent =
          'Não foi possível carregar as leituras. Tente novamente mais tarde.';
        document.getElementById('texto-salmo').textContent    = '';
        document.getElementById('texto-evangelho').textContent= '';
        document.getElementById('leitura2').classList.add('d-none');
      }
    }
  
    btnBuscar.addEventListener('click', () => {
      const selectedDate = inputData.value;
      if (!selectedDate) {
        alert('Por favor, selecione uma data.');
        return;
      }
      carregarLeituras(selectedDate);
    });
  
    // Inicializa com a data de hoje
    const hoje = new Date();
    const yyyy = hoje.getFullYear();
    const mm = String(hoje.getMonth() + 1).padStart(2, '0');
    const dd = String(hoje.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    inputData.value = todayStr;
    carregarLeituras(todayStr);
  });
  