<script setup>
import { onMounted, ref } from 'vue';
import { useIntervalFn } from '@vueuse/core';
import { base64url } from 'multiformats/bases/base64';

const todos = ref([]);

onMounted(async () => {
  const { isAllowed } = await window.web5.dwn.requestAccess();

  if (!isAllowed) {
    alert('Access to DWN is forbidden. cannot write TODOs to DWN');
    return;
  }


  const { pause, resume, isActive } = useIntervalFn(async () => {
    const result = await window.web5.dwn.processMessage({
      method: 'CollectionsQuery',
      options: {
        filter: {
          schema: 'http://some-schema-registry.org/todo'
        }
      }
    });

    if (result.status.code !== 200) {
      alert('Failed to fetch todos from DWN. check console for error');
      console.error(result);

      return;
    }

    const textDecoder = new TextDecoder();
    const storedTodos = [];

    for (let entry of result.entries) {
      const todoBytes = base64url.baseDecode(entry.encodedData);
      const todoStringified = textDecoder.decode(todoBytes);
      const todo = JSON.parse(todoStringified);

      // TODO data itself does not have `recordId`, we add it after deserialization
      todo.id = entry.recordId;
      storedTodos.push(todo);
    }

    todos.value = storedTodos;
  }, 1500, { immediateCallback: true });

});
</script>


<template>
  <div>
    <ul>
      <li v-for="todo in todos" :key="todo.id">{{ todo.description }} - completed: {{ todo.completed }}</li>
    </ul>
  </div>
</template>