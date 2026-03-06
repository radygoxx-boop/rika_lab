/**
 * Rika Lab — Service Worker
 * オフラインキャッシュ + バックグラウンド同期
 */

const CACHE_NAME = 'rika-lab-v1.0.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&family=Syne:wght@400;600;700;800&display=swap',
];

// ── インストール: 静的アセットをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// ── アクティベート: 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// ── フェッチ: キャッシュファースト戦略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Notion API / 外部APIはキャッシュしない
  if (url.hostname === 'api.notion.com' || url.hostname === 'api.anthropic.com') {
    return;
  }

  // Googleフォントはネットワークファースト
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // それ以外: キャッシュファースト → ネットワークフォールバック
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    }).catch(() => {
      // オフライン時のフォールバック
      if (request.destination === 'document') {
        return caches.match('./index.html');
      }
    })
  );
});

// ── プッシュ通知（将来の拡張用）
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Rika Lab', {
      body: data.body || '今日も理科を学ぼう！',
      icon: './icons/icon-192x192.png',
      badge: './icons/icon-96x96.png',
      tag: 'rika-lab-notification',
      renotify: true,
      data: { url: data.url || './' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
