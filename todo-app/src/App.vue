<script setup>
import { onBeforeMount, ref, toRaw } from 'vue';
import { base64url } from 'multiformats/bases/base64';
import { PlusIcon as PlusIconMini } from '@heroicons/vue/solid';
import { CheckCircleIcon, TrashIcon } from '@heroicons/vue/outline';
import { Web5 } from '@tbd54566975/web5';

const web5 = new Web5();
const dwnDID = ref('');
const todos = ref([]);
let myDid;

onBeforeMount(async () => {
  let registerInfo;
  // Load DWN DID from local storage or create a new one
  if(localStorage.getItem('dwn-info') && localStorage.getItem('myDid')){
    // User has an "account," so load their data
    registerInfo = JSON.parse(localStorage.getItem('dwn-info'));
    myDid = JSON.parse(localStorage.getItem('myDid'));
  } else {
    // User does not have an "account," so create one for them
    myDid = await web5.did.create('ion');
    registerInfo = {
      connected : true,
      endpoint  : 'app://dwn', 
      keys: {
        ['#dwn']: {
          keyPair: myDid.keys[0].keyPair,
        },
      }
    };
    await web5.did.manager.set(myDid.id, registerInfo);
    localStorage.setItem('myDid', JSON.stringify(myDid));
    localStorage.setItem('registerInfo', JSON.stringify(registerInfo));
  }

  // Populate todos from DWN
  const queryResponse = await web5.dwn.records.query(myDid.id, {
    author  : myDid.id,
    message : {
      filter: {
        schema: 'http://some-schema-registry.org/todo'
      },
      dateSort: 'createdAscending'
    }
  });
  
  // Serialize Todo
  const textDecoder = new TextDecoder();
  const storedTodos = [];

  for (let entry of queryResponse.entries) {
    let todo = { dWebMessage: entry };
    
    const todoBytes = base64url.baseDecode(entry.encodedData);
    const todoStringified = textDecoder.decode(todoBytes);
    todo.data = JSON.parse(todoStringified);
    storedTodos.push(todo);
  }
  todos.value = storedTodos;
});

// Adding Todos
const newTodoDescription = ref('');

async function addTodo() {
  const todoData = {
    completed   : false,
    description : newTodoDescription.value
  };

  newTodoDescription.value = '';

  const result  = await web5.dwn.records.write(myDid.id, {
    author  : myDid.id,
    data    : todoData,
    message : {
      schema     : 'http://some-schema-registry.org/todo',
      dataFormat : 'application/json'
    }
  });

  // TODO: Get record ID from write result
  // Query DWN for record
  const queryResponse = await web5.dwn.records.query(myDid.id, {
    author  : myDid.id,
    message : {
      filter: {
        schema: 'http://some-schema-registry.org/todo'
      },
      dateSort: 'createdAscending'
    }
  });

  const record = queryResponse.entries[queryResponse.entries.length - 1];

  // add DWeb message recordId as a way to reference the message for further operations
  // e.g. updating it or overwriting it
  const todo = {
    dWebMessage : record,
    data        : todoData
  };
  todos.value.push(todo);
}

async function deleteTodo(todoRecordId) {
  let deletedTodo;
  let index = 0;

  for (let todo of todos.value) {
    if (todo.dWebMessage.recordId === todoRecordId) {
      deletedTodo = todo;
      break;
    }
    index ++;
  }

  todos.value.splice(index, 1);

  const deleteResponse = await web5.dwn.records.delete(myDid.id, {
    author  : myDid.id,
    message : {
      recordId: deletedTodo.dWebMessage.recordId
    }
  });
}

// Toggling Todo Status
async function toggleTodoComplete(todoRecordId) {
  let toggledTodo;
  let updatedTodoData;

  for (let todo of todos.value) {
    if (todo.dWebMessage.recordId === todoRecordId) {
      toggledTodo = todo;
      todo.data.completed = !todo.data.completed;
      updatedTodoData = { ...toRaw(todo.data) };
      break;
    }
  }

  const { descriptor } = toggledTodo.dWebMessage;

  const result  = await web5.dwn.records.write(myDid.id, {
    author  : myDid.id,
    data    : updatedTodoData,
    message : {
      recordId    : toggledTodo.dWebMessage.recordId,
      dateCreated : descriptor.dateCreated,
      schema      : descriptor.schema,
      dataFormat  : descriptor.dataFormat,
    }
  });
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
    <!-- Todos -->
    <div v-if="(todos.length > 0)" class="border-gray-200 border-t border-x mt-16 rounded-lg shadow-md sm:max-w-xl sm:mx-auto sm:w-full">
      <div v-for="todo in todos" :key="todo.dWebMessage.recordId" class="border-b border-gray-200 flex items-center p-4">
        <div @click="toggleTodoComplete(todo.dWebMessage.recordId)" class="cursor-pointer">
          <CheckCircleIcon class="h-8 text-gray-200 w-8" :class="{ 'text-green-500': todo.data.completed }" />
        </div>
        <div class="font-light ml-3 text-gray-500 text-xl">
          {{ todo.data.description }}
        </div>
        <!-- Delete Todo -->
        <div class="ml-auto">
          <div @click="deleteTodo(todo.dWebMessage.recordId)" class="cursor-pointer">
            <TrashIcon class="h-8 text-gray-200 w-8" :class="'text-red-500'" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>