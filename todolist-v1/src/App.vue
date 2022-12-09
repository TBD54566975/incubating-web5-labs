<script setup>
import { Dwn, CollectionsWrite, CollectionsQuery } from '@tbd54566975/dwn-sdk-js';
import { base64url } from 'multiformats/bases/base64';
import { onMounted, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from 'vue-toastification';
import { PlusIcon as PlusIconMini } from '@heroicons/vue/solid';
import { CheckCircleIcon } from '@heroicons/vue/outline';

import { DIDKey } from './lib/did-key';
import { useGlobalState } from './state';


let dwn;
const state = useGlobalState();
const toast = useToast();

const newTodoDescription = ref('');
const todos = ref([]);

onMounted(async () => {
  // create identity if one doesn't already exist
  if (!state.getDID()) {
    const { did, privateJWK } = await DIDKey.generate();
    state.setIdentity(did, privateJWK);
  }

  dwn = await Dwn.create({});

  const collectionsQueryMessage = await CollectionsQuery.create({
    target : state.getDID(),
    nonce  : uuidv4(),
    filter : {
      schema: 'http://some-schema-registry.org/todo'
    },
    signatureInput: state.getSignatureMaterial()
  });

  const result = await dwn.processMessage(collectionsQueryMessage.toJSON());
  
  if (result.status.code !== 200) {
    toast.error('Failed to fetch todos from DWN. check console for error');
    console.error(result);

    return;
  }

  console.log(result);

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
});

async function addTodo() {
  const todo = {
    description : newTodoDescription.value,
    completed   : false
  };
  
  newTodoDescription.value = '';

  const todoStringified = JSON.stringify(todo);
  const todoBytes = new TextEncoder().encode(todoStringified);

  const dwnMessage = await CollectionsWrite.create({
    data           : todoBytes,
    dataFormat     : 'application/json',
    nonce          : uuidv4(),
    recipient      : state.getDID(),
    target         : state.getDID(),
    schema         : 'http://some-schema-registry.org/todo',
    signatureInput : state.getSignatureMaterial()
  });

  const result = await dwn.processMessage(dwnMessage.toJSON());
  console.log(result);

  if (result.status.code !== 202) {
    toast.error('Failed to write todo to DWN. check console for error');
    console.error(result);

    return;
  }

  // TODO data itself does not have `recordId`, we add it for easy identification
  todo.id = dwnMessage.message.recordId;
  todos.value.push(todo);
}

async function toggleTodoComplete(todoId) {
  console.log(todoId);
  let toggledTodo;
  
  for (let todo of todos.value) {
    if (todo.id === todoId) {
      todo.completed = !todo.completed;

      toggledTodo = todo;
      break;
    }
  }

  const todoStringified = JSON.stringify(toggledTodo);
  const todoBytes = new TextEncoder().encode(todoStringified);

  // currently, we have to overwrite the entire DWeb Message to update the data stored within it
  const dwnMessage = await CollectionsWrite.create({
    data           : todoBytes,
    dataFormat     : 'application/json',
    nonce          : uuidv4(),
    recipient      : state.getDID(),
    recordId       : toggledTodo.id,
    target         : state.getDID(),
    schema         : 'http://some-schema-registry.org/todo',
    signatureInput : state.getSignatureMaterial()
  });

  const result = await dwn.processMessage(dwnMessage.toJSON());
  console.log(result);

  if (result.status.code !== 202) {
    toast.error('Failed to update todo in DWN. check console for error');
    console.error(result);
  }
}

</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-full px-8 py-12 sm:px-6">
    <!-- Title -->
    <div class="sm:max-w-md sm:w-full">
      <h2 class="font-bold text-3xl text-center tracking-tight">
        Todo List
      </h2>
    </div>

    <!-- Add Todo Form -->
    <div class="mt-16">
      <form class="flex space-x-4" @submit.prevent="addTodo">
        <div class="border-b border-gray-200 sm:w-full">
          <label for="add-todo" class="sr-only">Add a todo</label>
          <textarea
            rows="1" name="add-todo" id="add-todo" v-model="newTodoDescription"
            @keydown.enter.exact.prevent="addTodo"
            class="block border-0 border-transparent focus:ring-0 p-0 pb-2 resize-none sm:text-sm w-96"
            placeholder="Add a Todo" />
        </div>
        <button type="submit" class="bg-indigo-600 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:bg-indigo-700 inline-flex items-center p-1 rounded-full shadow-sm text-white">
          <PlusIconMini class="h-5 w-5" aria-hidden="true" />
        </button>
      </form>
    </div>

    <div v-if="(todos.length > 0)" class="border-gray-200 border-t border-x mt-16 rounded-lg shadow-md sm:max-w-xl sm:mx-auto sm:w-full">
      <div v-for="todo in todos" :key="todo.id" class="border-b border-gray-200 flex items-center p-4">
        <div @click="toggleTodoComplete(todo.id)" class="cursor-pointer">
          <CheckCircleIcon class="h-8 text-gray-200 w-8" :class="{ 'text-green-500': todo.completed }" />
        </div>
        <div class="font-light ml-3 text-gray-500 text-xl">
          {{ todo.description }}
        </div>
      </div>
    </div>
  </div>
</template>