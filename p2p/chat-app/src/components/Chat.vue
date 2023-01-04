<script setup>
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime)

const props = defineProps(['messages', 'active-thread', 'userDid']);
</script>

<template>
    <div class="pl-64 w-full">
        <div class="flex flex-col m-5">
            <div class="flex space-x-4 align-middle items-center" v-for="(message, index) in props.messages"
                :key="message.dWebMessage.recordId">
                <Markdown
                    :class="[message.data.from.did === props.userDid ? 'border-blue-500 bg-blue-500 ml-auto' : 'bg-gray-500 border-gray-500']"
                    class="border text-white max-w-fit py-2 px-4 rounded-2xl mt-5"
                    :source="message.data.text || message.data.messageText" :breaks="true" />
                <p class="italic">{{ dayjs(message.dWebMessage.descriptor.dateCreated).fromNow() }}</p>
            </div>
        </div>
    </div>
</template>