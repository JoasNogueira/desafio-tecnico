<template>
  <div class="max-w-6xl mx-auto p-6"> <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Detalhes do Usuário</h1>
      <div class="flex gap-2">
        <button
          v-if="currentUser && (currentUser.profile_id === 1 || currentUser.profile?.id === 2)"
          @click="router.push(`/editar/${user.id}`)"
          class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded shadow transition cursor-pointer"
        >
          Editar
        </button>
        <button
          @click="router.push('/')"
          class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow transition cursor-pointer"
        >
          Voltar
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center text-gray-500 py-10">Carregando dados...</div>

    <div v-else-if="user.id">
      
      <div class="bg-white shadow-md rounded-lg overflow-hidden mb-6 border border-gray-100">
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200 font-bold text-gray-700 uppercase text-sm tracking-wider">
          Dados Pessoais
        </div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span class="block text-xs text-gray-500 uppercase font-bold">ID</span>
            <span class="text-gray-800">#{{ user.id }}</span>
          </div>
          <div>
            <span class="block text-xs text-gray-500 uppercase font-bold">Perfil</span>
            <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
              {{ user.profile?.name || 'N/A' }}
            </span>
          </div>
          <div>
            <span class="block text-xs text-gray-500 uppercase font-bold">Nome</span>
            <span class="text-lg text-gray-800">{{ user.name }}</span>
          </div>
          <div>
            <span class="block text-xs text-gray-500 uppercase font-bold">CPF</span>
            <span class="text-gray-800">{{ user.cpf }}</span>
          </div>
          <div>
            <span class="block text-xs text-gray-500 uppercase font-bold">E-mail</span>
            <span class="text-gray-800">{{ user.email }}</span>
          </div>
          <div>
            <span class="block text-xs text-gray-500 uppercase font-bold">Cadastrado em</span>
            <span class="text-gray-800">{{ formatarData(user.created_at) }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200 font-bold text-gray-700 uppercase text-sm tracking-wider">
          Endereços
        </div>
        
        <div class="p-6 overflow-x-auto">
          <p v-if="user.addresses.length === 0" class="text-gray-500 italic">Nenhum endereço vinculado.</p>

          <table v-else class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logradouro</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comp.</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bairro</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade/UF</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CEP</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">País</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 text-sm">
              <tr v-for="end in user.addresses" :key="end.id" class="hover:bg-gray-50">
                <td class="px-4 py-4 whitespace-nowrap text-gray-700">{{ end.street }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-gray-700">{{ end.number }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-gray-500">{{ end.complement || '-' }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-gray-700">{{ end.neighborhood }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-gray-700">{{ end.city }} / {{ end.state }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-gray-700">{{ end.zip }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-gray-700">{{ end.country }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const router = useRouter();
const loading = ref(true);

const currentUser = ref<any>(null);

interface UserDetail {
  id: number;
  name: string;
  email: string;
  cpf: string;
  created_at: string;
  profile?: { name: string };
  addresses: Array<{ 
    id: number; 
    street: string; 
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    zip: string; 
  }>;
}

const user = ref<Partial<UserDetail>>({ addresses: [] });

const carregarUsuario = async () => {
  try {
    const id = route.params.id;
    const response = await api.get(`/users/${id}`);
    user.value = response.data;
  } catch (error) {
    alert('Erro ao carregar detalhes.');
  } finally {
    loading.value = false;
  }
};

const formatarData = (dataIso?: string) => {
  if (!dataIso) return '-';
  return new Date(dataIso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

onMounted(() => {
  const userStr = localStorage.getItem('user');
  if (userStr) currentUser.value = JSON.parse(userStr);
  carregarUsuario();
});
</script>