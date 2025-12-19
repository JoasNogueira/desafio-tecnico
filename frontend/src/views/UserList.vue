<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="flex flex-col md:flex-row justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Pesquisar Usuários</h1>
      <div class="flex gap-3 mt-4 md:mt-0">
        <button @click="router.push('/novo')" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition">
          + Novo Cadastro
        </button>
        <button @click="fazerLogout" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow transition">
          Sair
        </button>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow mb-6 border border-gray-100">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <input v-model="filters.name" type="text" placeholder="Digite o nome"
            class="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">CPF</label>
          <input v-model="filters.cpf" type="text" placeholder="000.000.000-00"
            class="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cadastrado em:</label>
          <input v-model="filters.data_inicio" type="date"
            class="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Até:</label>
          <input v-model="filters.data_fim" type="date"
            class="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500">
        </div>
      </div>
      <div class="flex flex-col md:flex-row gap-3 mt-4">
        <button @click="buscarUsuarios" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded shadow transition w-full md:w-auto">
          Filtrar Resultados
        </button>
        
        <button @click="limparFiltros" class="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded shadow-sm transition w-full md:w-auto">
          Limpar Filtros
        </button>
      </div>
    </div>

    <div class="overflow-x-auto bg-white rounded-lg shadow">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
          <tr>
            <th class="py-3 px-6">ID</th>
            <th class="py-3 px-6">Data</th>
            <th class="py-3 px-6">Nome</th>
            <th class="py-3 px-6">CPF</th>
            <th class="py-3 px-6">E-mail</th>
            <th class="py-3 px-6">Perfil</th>
            <th class="py-3 px-6 text-center">Ações</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <tr v-for="user in users" :key="user.id" class="border-b border-gray-200 hover:bg-gray-50">
            <td class="py-3 px-6 font-bold">{{ user.id }}</td>
            <td class="py-3 px-6">{{ formatarData(user.created_at) }}</td>
            <td class="py-3 px-6">{{ user.name }}</td>
            <td class="py-3 px-6">{{ user.cpf }}</td>
            <td class="py-3 px-6">{{ user.email }}</td>
            <td class="py-3 px-6">
              <span class="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs">
                {{ user.profile?.name || 'N/A' }}
              </span>
            </td>
            <td class="py-3 px-6 text-center">
              <div class="flex justify-center gap-2">
                <button
                  @click="router.push(`/detalhes/${user.id}`)"
                  class="bg-cyan-500 text-white py-1 px-3 rounded text-xs hover:bg-cyan-600"
                >
                  Ver
                </button>
                <button
                  v-if="currentUser.profile?.id === 1 || currentUser.profile?.id === 2"
                  @click="router.push(`/editar/${user.id}`)"
                  class="bg-yellow-500 text-white py-1 px-3 rounded text-xs hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  v-if="currentUser.profile?.id === 1"
                  @click="excluir(user.id)"
                  class="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600"
                >
                  Excluir
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="7" class="py-6 text-center text-gray-500">Nenhum usuário encontrado.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();

interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  created_at: string;
  profile?: { name: string };
  profile_id: number;
}

const users = ref<User[]>([]);
const currentUser = ref<any>(null);
const filters = ref({
  name: '',
  cpf: '',
  data_inicio: '',
  data_fim: ''
});

const fazerLogout = async () => {
  try {
    await api.post('/logout');
  } catch (error) {
    console.error('Erro ao sair:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }
};

const buscarUsuarios = async () => {
  try {
    const response = await api.get('/users', { params: filters.value });
    users.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    if ((error as any).response?.status === 401) fazerLogout();
  }
};

const limparFiltros = () => {
  filters.value = {
    name: '',
    cpf: '',
    data_inicio: '',
    data_fim: ''
  };
  buscarUsuarios(); 
};

const excluir = async (id: number) => {
  if (confirm('Tem certeza?')) {
    try {
      await api.delete(`/users/${id}`);
      alert('Usuário excluído!');
      buscarUsuarios();
    } catch (error) {
      alert('Erro ao excluir.');
    }
  }
};

const formatarData = (dataIso: string) => {
  if (!dataIso) return '-';
  return new Date(dataIso).toLocaleDateString('pt-BR');
};

onMounted(() => {
  const userStr = localStorage.getItem('user');
  if (userStr) currentUser.value = JSON.parse(userStr);
  buscarUsuarios();
});
</script>