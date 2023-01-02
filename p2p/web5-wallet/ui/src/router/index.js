import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path      : '/user-consent/dwn-access',
    component : () => import('../views/DwnAccessConsentPopup.vue'),
  },
  {
    path      : '/',
    component : () => import('../views/Layout.vue'),
    children  : [
      {
        path      : '',
        component : () => import('../views/Identities.vue'),

      }
    ]
  }
];

export const router = createRouter({ history: createWebHashHistory(), routes });