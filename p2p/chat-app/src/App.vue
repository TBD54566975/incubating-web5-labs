<script setup>
import { ref } from 'vue'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';

import {
  Bars3Icon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/vue/24/outline';

import {
  PlusIcon as PlusIconSolid
} from '@heroicons/vue/24/solid';

const sidebarOpen = ref(false);
const newMessage = ref('');

function sendMessage() {
  console.log('hi');
}
</script>

<template>
  <div>
    <!-- Mobile Sidebar -->
    <TransitionRoot as="template" :show="sidebarOpen">
      <Dialog as="div" class="relative z-40 md:hidden" @close="sidebarOpen = false">
        <TransitionChild as="template" enter="transition-opacity ease-linear duration-300" enter-from="opacity-0"
          enter-to="opacity-100" leave="transition-opacity ease-linear duration-300" leave-from="opacity-100"
          leave-to="opacity-0">
          <div class="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </TransitionChild>

        <div class="fixed inset-0 z-40 flex">
          <TransitionChild as="template" enter="transition ease-in-out duration-300 transform"
            enter-from="-translate-x-full" enter-to="translate-x-0"
            leave="transition ease-in-out duration-300 transform" leave-from="translate-x-0"
            leave-to="-translate-x-full">
            <DialogPanel class="relative flex w-full max-w-xs flex-1 flex-col bg-white">
              <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0"
                enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100" leave-to="opacity-0">
                <div class="absolute top-0 right-0 -mr-12 pt-2">
                  <button type="button"
                    class="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    @click="sidebarOpen = false">
                    <span class="sr-only">Close sidebar</span>
                    <XMarkIcon class="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </TransitionChild>
              <div class="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                <div class="flex flex-shrink-0 items-center px-4">
                  <p>5ignal</p>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
          <div class="w-14 flex-shrink-0">
            <!-- Force sidebar to shrink to fit close icon -->
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Static sidebar for desktop -->
    <div class="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
      <div class="flex min-h-0 flex-1 flex-col border-r-2 border-gray-200">
        <div class="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div class="flex flex-shrink-0 items-center px-4">
            <p>5ignal</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Area -->
    <div class="md:pl-64">
      <main class="flex flex-col h-screen">
        <!-- Header -->
        <div class="border-b-2 border-gray-200 h-16 align-middle flex space-x-4">
          <button type="button"
            class="md:hidden inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            @click="sidebarOpen = true">
            <span class="sr-only">Open sidebar</span>
            <Bars3Icon class="h-6 w-6" aria-hidden="true" />
          </button>
          <!-- Recipient -->
          <div class="mt-4 ml-4">
            To: did:ion:123
          </div>
        </div>
        <!-- Message Thread -->
        <div class="h-96">
          <p>hi</p>
        </div>

        <!-- Message Input -->
        <div class="sticky top-[100vh] h-24 border-t-2 border-gray-200 flex">
          <form class="flex justify-between space-x-4 m-auto">
            <div class="mt-1">
              <input type="text" name="name" id="name" v-model="newMessage"
                class="block w-96 rounded-full border-gray-300 px-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Hi2u" />
            </div>
            <div>
              <button type="button"
                class="inline-flex items-center rounded-full border border-transparent bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <PlusIcon class="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>