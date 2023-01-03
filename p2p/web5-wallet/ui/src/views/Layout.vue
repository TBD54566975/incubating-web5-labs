<script setup>
import { FingerPrintIcon, UserCircleIcon } from '@heroicons/vue/24/outline';
import { onMounted } from 'vue';

const navigation = [
  { name: 'Identities', href: '/dashboard', icon: FingerPrintIcon , current: true },
  { name: 'Contacts', href: '/dashboard/personas', icon: UserCircleIcon, current: false },
];

onMounted(async () => {
});
</script>

<template>
  <div class="flex">
    <!-- Navigation -->
    <div class="bg-tbd-yellow border-r border-tbd-yellow fixed flex flex-col flex-grow h-screen overflow-y-auto w-64">
      <!-- Logo -->
      <div class="border-b border-black p-4 w-full">
        <p class="text-xl">
          Web5 Wallet
        </p>
      </div>
      <div class="flex flex-col flex-grow mt-5">
        <nav class="flex-1 px-2 space-y-1" aria-label="Sidebar">
          <a
            v-for="item in navigation" :key="item.name" :href="item.href" class="text-black"
            :class="[item.current ? 'bg-yellow-500' : 'hover:bg-yellow-400 hover:text-black', 'group flex items-center px-2 py-2 text-sm font-medium rounded-md']">
            <component :is="item.icon" class="flex-shrink-0 h-6 mr-3 text-black w-6" aria-hidden="true" />
            <span class="flex-1">{{ item.name }}</span>
          </a>
        </nav>
      </div>
    </div>
    <!-- Main Content -->
    <main class="h-screen pl-64 w-full">
      <router-view />
    </main>
  </div>
</template>