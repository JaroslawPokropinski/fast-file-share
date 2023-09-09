/// <reference lib="WebWorker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
// import { createClient } from 'graphql-ws';
import { createClient } from 'graphql-ws';

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

const GRAPHQL_BASE_URL = '127.0.0.1';
const GRAPHQL_PORT = '4022';
const SECURE_PORT = true;
// const GRAPHQL_URL = `${GRAPHQL_BASE_URL}:${GRAPHQL_PORT}`;
const GRAPHQL_URL = `vite.merume.ovh`;

const registerServiceWorker = async () => {
  const client = createClient({
    url: `${SECURE_PORT ? 'wss' : 'ws'}://${GRAPHQL_URL}/subscriptions`,
  });

  console.log('register for subscription');

  const query = client.iterate({
    query: `
  subscription NewNotification {
    newNotification {
      id
      fileName
      magnet
    }
  }
`,
  });
  for (let nextResult = await query.next();nextResult.value != null; nextResult = await query.next()) {
    const { value: result } = nextResult;
    console.log('got notification form server');
    if (self.Notification?.permission !== 'granted') {
      console.warn('Notifications are disabled');
      continue;
    }

    const visible = await self.clients
      .matchAll({ includeUncontrolled: true, type: 'window' })
      .then((clientList) => {
        console.log(clientList);
        return (
          clientList.length === 0 ||
          clientList.some((state) => state.visibilityState !== 'hidden')
        );
      });

    if (visible) {
      console.log('Do not show notification as window is visible');
      continue;
    }

    self.registration.showNotification('New file shared', {
      body:
        (result.data?.newNotification as { fileName: string }).fileName ?? '',
    });
    console.log('sub value', result);
  }
};

self.addEventListener('notificationclick', (event) => {
  console.log('On notification click: ', event.notification.tag);
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window',
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      }),
  );
});

registerServiceWorker().catch(console.error);
