// --- CONFIGURAÇÃO ---
// Nome exclusivo para este app. Se atualizar o código, mude para v2, v3...
const CACHE_NAME = 'agendamento-interno-v1'; 

// Lista exata dos arquivos que devem ser guardados no celular
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // Seus ícones (exatamente como estão no manifest)
  './novo_icon_any_192.png',
  './novo_icon_maskable_192.png',
  './novo_icon_any_512.png',
  './novo_icon_maskable_512.png'
];

// 1. INSTALAÇÃO (Baixa os arquivos para a memória)
self.addEventListener('install', event => {
  self.skipWaiting(); // Força a ativação imediata
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto para Agendamento Interno');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. ATIVAÇÃO (Limpeza de caches antigos)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Se o cache não for o 'v1' deste app, apaga!
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Assume o controle da página imediatamente
});

// 3. INTERCEPTAÇÃO DE PEDIDOS (A Lógica Inteligente)
self.addEventListener('fetch', event => {
  
  // A. Se for o arquivo de versão, OBRIGA a ir buscar na internet (Network Only)
  // Isso garante que o popup de "Nova Versão" apareça na hora certa
  if (event.request.url.includes('versao.json')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Se estiver offline, retorna 0 para não dar erro no console
        return new Response(JSON.stringify({ versao_atual: 0 }), {
            headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // B. Para o resto (Ícones, Index), tenta o Cache primeiro. Se não tiver, vai na internet.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
