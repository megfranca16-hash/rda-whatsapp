// BotNinja Service Worker
// PWA offline functionality and caching

const CACHE_NAME = 'botninja-v1.0.0';
const urlsToCache = [
  '/',
  '/css/styles.css',
  '/js/app.js',
  '/js/storage.js',
  '/js/whatsapp.js',
  '/js/ai-engine.js',
  '/js/ui-manager.js',
  '/js/qrcode.min.js',
  '/manifest.webmanifest'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and external requests
  if (event.request.url.startsWith('chrome-extension://') || 
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return response;
        }
        
        // Otherwise fetch from network
        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Check if response is valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response for caching
            const responseToCache = response.clone();
            
            // Cache the fetched resource
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed', error);
            
            // Return offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
            
            throw error;
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations
      doBackgroundSync()
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização do BotNinja',
    icon: '/assets/icon-192.png',
    badge: '/assets/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir BotNinja',
        icon: '/assets/icon-192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/assets/icon-192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('BotNinja 3.0', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.matchAll()
        .then((clients) => {
          // Check if app is already open
          const client = clients.find(c => c.visibilityState === 'visible');
          
          if (client) {
            client.navigate('/');
            client.focus();
          } else {
            self.clients.openWindow('/');
          }
        })
    );
  }
});

// Message handling for communication with main app
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    // Force cache update
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          return cache.addAll(urlsToCache);
        })
    );
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    console.log('Service Worker: Performing background sync');
    
    // Here you can perform background tasks like:
    // - Sync offline data
    // - Send queued messages
    // - Update cached data
    
    // For now, just log the sync
    console.log('Service Worker: Background sync completed');
    
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync', event.tag);
  
  if (event.tag === 'content-sync') {
    event.waitUntil(
      // Perform periodic sync
      doPeriodicSync()
    );
  }
});

async function doPeriodicSync() {
  try {
    console.log('Service Worker: Performing periodic sync');
    
    // Update app data periodically
    // This could include checking for new features, updates, etc.
    
  } catch (error) {
    console.error('Service Worker: Periodic sync failed', error);
  }
}

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker: Global error', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled promise rejection', event.reason);
});