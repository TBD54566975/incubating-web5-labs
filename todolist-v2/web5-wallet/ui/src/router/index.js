import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/user-consent/dwn-access',
    component: () => import('../views/DwnAccessConsentPopup.vue'),
  }
]

export const router = createRouter({ history: createWebHashHistory(), routes });