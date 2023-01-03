<script setup>
const props = defineProps(['messages']);
</script>

<template>
    <div class="h-screen pl-64 w-full">
        <div class="flex flex-col m-5">
            <div v-for="(message, index) in props.messages" :key="message.dWebMessage.recordId"
                class="border border-blue-500 text-white bg-blue-500 max-w-fit py-2 px-4 rounded-2xl mt-5">
                {{ message.data.text }}
            </div>
        </div>
    </div>
</template>