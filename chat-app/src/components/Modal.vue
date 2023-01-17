<script setup>
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';

defineEmits(['close']);

defineProps({
  open: Boolean
});
</script>

<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-10" @close="$emit('close')">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="bg-gray-500 bg-opacity-75 fixed inset-0 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto z-10">
        <div class="flex items-end justify-center min-h-full p-4 sm:items-center sm:p-0 text-center">
          <TransitionChild as="template" enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel
              class="bg-white overflow-hidden pb-4 pt-5 px-4 relative rounded-lg shadow-xl sm:max-w-lg sm:my-8 sm:p-6 sm:w-full text-left transform transition-all">
              <div class="absolute hidden pr-4 pt-4 right-0 sm:block top-0">
                <button type="button"
                  class="bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:text-gray-500 rounded-md text-gray-400"
                  @click="$emit('close')">
                  <span class="sr-only">Close</span>
                  <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div>
                <slot />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>