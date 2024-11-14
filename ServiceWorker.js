self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    // 캐시를 사용하지 않으므로 install 이벤트에서 아무 작업도 하지 않음
});

self.addEventListener('activate', function (e) {
    console.log('[Service Worker] Activate');
    // 캐시를 사용하지 않으므로 activate 이벤트에서 아무 작업도 하지 않음
});

self.addEventListener('fetch', function (e) {
    if (e.request.method !== 'GET') {
        return; // GET 요청만 처리
    }

    e.respondWith((async function () {
        try {
            // 항상 네트워크에서 요청하여 최신 파일을 가져옴
            const networkResponse = await fetch(e.request);
            return networkResponse;
        } catch (error) {
            console.error('Fetch failed:', error);
            return caches.match('offline.html'); // 오프라인 페이지
        }
    })());
});
