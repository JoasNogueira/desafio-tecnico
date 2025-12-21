// src/views/__tests__/UserList.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import UserList from '../UserList.vue';
import api from '../../services/api';

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock do Modal
vi.mock('../components/ConfirmationModal.vue', () => ({
  default: { 
    template: '<div data-test="modal"></div>',
    props: ['show'],
    emits: ['confirm', 'close'] 
  }
}));

describe('UserList.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Simula usuário logado com permissão total (id 1)
    localStorage.setItem('user', JSON.stringify({ id: 1, profile: { id: 1 } }));
  });

  it('deve buscar e listar usuários ao montar', async () => {
    (api.get as any).mockResolvedValue({
      data: [
        { id: 1, name: 'User A', email: 'a@a.com', cpf: '123', profile: { name: 'Admin' } },
        { id: 2, name: 'User B', email: 'b@b.com', cpf: '456', profile: { name: 'User' } }
      ]
    });

    const wrapper = mount(UserList, {
      global: { directives: { maska: {} } }
    });

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(api.get).toHaveBeenCalledWith('/users', expect.anything());
    // Verifica se renderizou 2 linhas na tabela (+1 se contar o header, depende da estrutura)
    // Vamos verificar se os nomes estão no texto
    expect(wrapper.text()).toContain('User A');
    expect(wrapper.text()).toContain('User B');
  });

  it('deve aplicar filtro de nome sem números', async () => {
    const wrapper = mount(UserList, { global: { directives: { maska: {} } } });
    
    const inputName = wrapper.find('[data-testid="filter-name"]');
    await inputName.setValue('Teste 123');
    await inputName.trigger('input');

    // Verifica se limpou o input
    expect((inputName.element as HTMLInputElement).value).toBe('Teste ');
    // Verifica se atualizou o filtro
    expect((wrapper.vm as any).filters.name).toBe('Teste ');
  });

  it('deve abrir modal e excluir usuário ao confirmar', async () => {
    (api.get as any).mockResolvedValue({ data: [{ id: 10, name: 'Para Deletar' }] });
    (api.delete as any).mockResolvedValue({});

    const wrapper = mount(UserList, { global: { directives: { maska: {} } } });
    await new Promise(resolve => setTimeout(resolve, 0));

    // Clica no botão excluir
    const btnDelete = wrapper.find('[data-testid="btn-delete"]');
    await btnDelete?.trigger('click');

    // Verifica se o estado do modal mudou para true
    expect((wrapper.vm as any).showDeleteModal).toBe(true);
    expect((wrapper.vm as any).userIdToDelete).toBe(10);

    // Simula a confirmação do modal (emitindo evento 'confirm' do componente filho)
    // Como mockamos o componente filho, precisamos emitir o evento manualmente no wrapper pai
    // chamando a função que o @confirm invoca
    await (wrapper.vm as any).confirmarExclusao();

    expect(api.delete).toHaveBeenCalledWith('/users/10');
  });
});