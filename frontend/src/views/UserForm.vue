<template>
  <div class="max-w-5xl mx-auto p-6">
    
    <div class="flex flex-col md:flex-row justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">
        {{ isEditing ? 'Editar Usuário' : 'Cadastro de Usuário' }}
      </h1>
      <button type="button" 
        class="mt-4 md:mt-0 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow transition cursor-pointer"
        @click="router.push('/')">
        Voltar
      </button>
    </div>

    <form @submit.prevent="salvar" class="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
      
      <h2 class="text-xl font-semibold text-gray-700 border-b pb-2 mb-6">Dados Pessoais</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input v-model.trim="form.name" type="text" required placeholder="Nome completo" @input="filtrarNome($event)"  
            class="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
          <input v-model="form.cpf" type="text" required placeholder="000.000.000-00" v-maska="'###.###.###-##'" maxlength="14"
            class="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input v-model="form.email" type="email" required placeholder="email@exemplo.com"
            class="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Perfil *</label>
          <select v-model="form.profile_id" required
            class="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
            <option value="" disabled>Selecione</option>
            <option v-for="perfil in perfis" :key="perfil.id" :value="perfil.id">
              {{ perfil.name }}
            </option>
          </select>
        </div>
      </div>

      <h2 class="text-xl font-semibold text-gray-700 border-b pb-2 mb-6 mt-8">Endereços</h2>
      
      <div class="bg-gray-50 p-6 rounded-md border border-gray-200 mb-6 relative">
        <div v-if="loadingCep" class="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-md">
          <span class="text-blue-600 font-bold animate-pulse">Buscando CEP...</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          <div class="md:col-span-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              CEP * <span v-if="loadingCep" class="text-xs text-blue-500 ml-2">(Buscando...)</span>
            </label>
            <input v-model="novoEndereco.zip" type="text" placeholder="00000-000" v-maska="'#####-###'" maxlength="9"
              class="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              :class="{'bg-gray-100': loadingCep}">
          </div>

          <div class="md:col-span-7">
            <label class="block text-sm font-medium text-gray-700 mb-1">Logradouro *</label>
            <input v-model.trim="novoEndereco.street" type="text" placeholder="Rua, Av..." 
              class="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
          </div>
          
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Número *</label>
            <input v-model="novoEndereco.number" type="number" placeholder="Nº" ref="numeroInput"
              class="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
          </div>

          <div class="md:col-span-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
            <input v-model.trim="novoEndereco.complement" type="text" placeholder="Apto, sala..."
              class="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
          </div>

          <div class="md:col-span-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
            <input v-model.trim="novoEndereco.neighborhood" type="text" placeholder="Bairro" 
              class="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
          </div>
          
          <div class="md:col-span-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
            <input v-model.trim="novoEndereco.city" type="text" placeholder="Cidade" 
              class="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
            <input v-model="novoEndereco.state" type="text" placeholder="UF" maxlength="2"
              class="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase">
          </div>
          
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">País *</label>
            <input v-model.trim="novoEndereco.country" type="text" placeholder="País" 
              class="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
          </div>

          <div class="md:col-span-12 mt-2">
            <button type="button" @click="adicionarEndereco" 
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded shadow transition text-sm">
              + Adicionar Endereço
            </button>
          </div>
        </div>
      </div>

      <div v-if="form.addresses.length > 0" class="overflow-x-auto mb-6 border rounded-lg shadow-sm">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CEP</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logradouro</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bairro</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade/UF</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 text-sm">
            <tr v-for="(end, index) in form.addresses" :key="index">
              <td class="px-4 py-3 whitespace-nowrap">{{ end.zip }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ end.street }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ end.number }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ end.neighborhood }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ end.city }}/{{ end.state }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-center">
                <button type="button" @click="removerEndereco(index)" 
                  class="text-red-500 hover:text-red-700 font-medium text-xs border border-red-200 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition cursor-pointer">
                  Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-8">
        <button type="submit" 
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow transition duration-200 text-lg cursor-pointer">
          Salvar Dados
        </button>
      </div>

    </form>

    <ConfirmationModal 
      :show="modalConfig.show"
      :title="modalConfig.title"
      :message="modalConfig.message"
      :show-cancel="modalConfig.showCancel"
      :confirm-text="modalConfig.confirmText"
      :confirm-color="modalConfig.confirmColor"
      @close="modalConfig.show = false"
      @confirm="fecharModalDeAviso"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import { buscarCEP } from '../services/cep';
import ConfirmationModal from '../components/ConfirmationModal.vue';

const route = useRoute();
const router = useRouter();

// Refs
const numeroInput = ref<HTMLInputElement | null>(null); // Para focar no número após buscar
const loadingCep = ref(false); // Estado de carregamento

const form = ref({
  name: '',
  cpf: '',
  email: '',
  profile_id: '',
  addresses: [] as Array<any>
});

const novoEndereco = ref({
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  country: '',
  zip: ''
});

const perfis = ref<{ id: number; name: string }[]>([]);
const isEditing = computed(() => !!route.params.id);

const filtrarNome = (event: Event) => {
  const input = event.target as HTMLInputElement;
  // Expressão Regular: Substitui qualquer dígito (0-9) por vazio
  const valorSemNumeros = input.value.replace(/\d/g, '');
  
  // Atualiza o valor no estado e no input visualmente
  form.value.name = valorSemNumeros;
  input.value = valorSemNumeros;
};

const modalConfig = ref({
  show: false,
  title: '',
  message: '',
  showCancel: false,      // Avisos simples não tem botão cancelar
  confirmText: 'OK',      // Botão diz apenas OK
  confirmColor: 'bg-blue-600 hover:bg-blue-700' // Cor azul
});


const abrirModalAviso = (titulo: string, msg: string, erro = false) => {
  modalConfig.value = {
    show: true,
    title: titulo,
    message: msg,
    showCancel: false, 
    confirmText: 'Entendi',
    confirmColor: erro ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
  };
};

const fecharModalDeAviso = () => {
  modalConfig.value.show = false;
  // Se for uma mensagem de sucesso, redireciona ao fechar
  if (modalConfig.value.title === 'Sucesso') {
    router.push('/');
  }
};

watch(() => novoEndereco.value.zip, async (novoCep) => {
  const cepLimpo = novoCep?.replace(/\D/g, '') || '';
  
  if (cepLimpo.length === 8) {
    loadingCep.value = true;
    
    const enderecoEncontrado = await buscarCEP(cepLimpo);
    
    if (enderecoEncontrado) {
      novoEndereco.value.street = enderecoEncontrado.street;
      novoEndereco.value.neighborhood = enderecoEncontrado.neighborhood;
      novoEndereco.value.city = enderecoEncontrado.city;
      novoEndereco.value.state = enderecoEncontrado.state;
      novoEndereco.value.country = enderecoEncontrado.country;
      setTimeout(() => numeroInput.value?.focus(), 100);
    } else {
      abrirModalAviso('CEP Não Encontrado', 'O CEP informado não retornou nenhum endereço. Verifique e tente novamente.', true);
    }
    
    loadingCep.value = false;
  }
});

// --- Funções do CRUD ---

const carregarPerfis = async () => {
  try {
    const res = await api.get('/profiles');
    perfis.value = res.data;
  } catch (error) {
    console.error('Erro ao carregar perfis:', error);
  }
};

const adicionarEndereco = () => {
  if (!novoEndereco.value.street || !novoEndereco.value.number || !novoEndereco.value.zip) {
    alert('Preencha CEP, Logradouro e Número!');
    return;
  }
  form.value.addresses.push({ ...novoEndereco.value });
  // Limpa tudo
  novoEndereco.value = { street: '', number: '', complement: '', neighborhood: '', city: '', state: '', country: '', zip: '' };
};

const removerEndereco = (index: number) => {
  form.value.addresses.splice(index, 1);
};

const salvar = async () => {
  try {
    if (form.value.addresses.length === 0) {
      abrirModalAviso('Atenção', 'Adicione pelo menos um endereço!', true);
      return;
    }

    // Modal de aviso de sucesso ao Editar ou Cadastrar novo usuário
    if (isEditing.value) {
      await api.put(`/users/${route.params.id}`, form.value);
      abrirModalAviso('Sucesso', 'Usuário atualizado com sucesso!');
    } else {
      await api.post('/users', form.value);
      abrirModalAviso('Sucesso', 'Usuário cadastrado com sucesso!');
    }
    
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Erro ao salvar';
    abrirModalAviso('Erro', msg, true);
  }
};

const carregarDadosEdicao = async () => {
  if (!isEditing.value) return;
  try {
    const res = await api.get(`/users/${route.params.id}`);
    const user = res.data;
    form.value.name = user.name;
    form.value.email = user.email;
    form.value.cpf = user.cpf;
    form.value.profile_id = user.profile_id;
    
    form.value.addresses = user.addresses.map((e: any) => ({
      street: e.street,
      number: e.number,
      complement: e.complement,
      neighborhood: e.neighborhood,
      city: e.city,
      state: e.state,
      country: e.country,
      zip: e.zip
    }));
  } catch (error) {
    router.push('/');
  }
};

onMounted(() => {
  carregarPerfis();
  carregarDadosEdicao();
});
</script>