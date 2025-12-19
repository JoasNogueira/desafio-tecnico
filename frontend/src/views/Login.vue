<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
      <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Entrar no Sistema</h1>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input v-model="email" type="email" required placeholder="admin@teste.com"
            class="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <input v-model="password" type="password" required placeholder="******"
            class="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
        </div>

        <button type="submit" 
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200">
          Entrar
        </button>
      </form>

      <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const handleLogin = async () => {
  try {
    const response = await api.post('/login', { email: email.value, password: password.value });
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    router.push('/');
  } catch (err) {
    error.value = 'Login falhou. Verifique suas credenciais.';
  }
};
</script>