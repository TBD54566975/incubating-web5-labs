<script setup>
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime)

const props = defineProps(['messages', 'active-thread']);
</script>

<template>
    <div class="pl-64 w-full">
        <div class="flex flex-col m-5">
            <div class="flex space-x-4 align-middle items-center" v-for="(message, index) in props.messages"
                :key="message.dWebMessage.recordId">
                <Markdown class="border border-blue-500 text-white bg-blue-500 max-w-fit py-2 px-4 rounded-2xl mt-5"
                    :source="message.data.text" :breaks="true" />
                <p class="italic">{{ dayjs(message.dWebMessage.descriptor.dateCreated).fromNow() }}</p>
            </div>
        </div>
    </div>
</template>