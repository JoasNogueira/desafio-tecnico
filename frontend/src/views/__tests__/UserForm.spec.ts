import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import UserForm from '../UserForm.vue';
import api from '../../services/api';

// Mocks Globais
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: {} }), // Params vazio = Modo Criação
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [{ id: 1, name: 'Admin' }] }), // Profiles
    post: vi.fn(),
    put: vi.fn(),
  },
}));

// Mock do componente Modal filho para não renderizar complexidade
vi.mock('../components/ConfirmationModal.vue', () => ({
  default: { template: '<div class="mock-modal"></div>' }
}));

describe('UserForm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve remover números do campo nome automaticamente', async () => {
    const wrapper = mount(UserForm, {
      global: {
        directives: { maska: {} } // Mock da diretiva v-maska
      }
    });

    const inputName = wrapper.find('[data-testid="input-nome"]');
    
    // Simula digitação com números
    await inputName.setValue('João 123 Silva');
    await inputName.trigger('input');

    // Verifica se limpou
    expect((inputName.element as HTMLInputElement).value).toBe('João  Silva');
    // Verifica reatividade
    expect((wrapper.vm as any).form.name).toBe('João  Silva');
  });

  it('deve permitir apenas números no campo número do endereço', async () => {
    const wrapper = mount(UserForm, {
      global: { directives: { maska: {} } }
    });

    const inputNumero = wrapper.find('[data-testid="input-numero"]');
    
    // Simula digitação com letras
    await inputNumero.setValue('10A');
    await inputNumero.trigger('input');

    // Verifica se limpou as letras
    expect((inputNumero.element as HTMLInputElement).value).toBe('10');
    // Verifica reatividade
    expect((wrapper.vm as any).novoEndereco.number).toBe('10');
  });

  it('deve adicionar um novo endereço à lista', async () => {
    const wrapper = mount(UserForm, {
      global: { directives: { maska: {} } }
    });

    // Preenche campos do novo endereço
    // Como usamos v-model no novoEndereco, acessamos via input
    // Encontrar inputs específicos é difícil sem classes/ids únicos, 
    // mas vamos assumir a ordem ou usar placeholder
    
    await wrapper.find('[data-testid="input-cep"]').setValue('40000-000');
    await wrapper.find('[data-testid="input-logradouro"]').setValue('Rua Teste');
    await wrapper.find('[data-testid="input-numero"]').setValue('10');

    // Clica em adicionar
    await wrapper.find('[data-testid="btn-add-address"]').trigger('click');

    // Verifica se foi para a lista form.addresses
    expect((wrapper.vm as any).form.addresses).toHaveLength(1);
    expect((wrapper.vm as any).form.addresses[0].street).toBe('Rua Teste');
  });

  it('não deve salvar se não tiver endereços (validação)', async () => {
    const wrapper = mount(UserForm, {
      global: { directives: { maska: {} } }
    });

    // Tenta salvar sem endereços
    await wrapper.find('form').trigger('submit.prevent');

    // A API não deve ser chamada
    expect(api.post).not.toHaveBeenCalled();
    
    // Verifica se o modal de aviso foi ativado (verificando o estado)
    expect((wrapper.vm as any).modalConfig.show).toBe(true);
    expect((wrapper.vm as any).modalConfig.title).toBe('Atenção');
  });
});