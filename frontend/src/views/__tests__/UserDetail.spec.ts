import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import UserDetail from '../UserDetail.vue';
import api from '../../services/api';

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '1' } }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../../services/api', () => ({
  default: { get: vi.fn() },
}));

describe('UserDetail.vue', () => {
  it('deve carregar e exibir dados do usuário', async () => {
    // Mock do usuário logado (localStorage)
    localStorage.setItem('user', JSON.stringify({ id: 1, profile_id: 1 }));

    // Mock da resposta da API
    (api.get as any).mockResolvedValue({
      data: {
        id: 1,
        name: 'Testanto Teste',
        email: 'testando@teste.com',
        addresses: [],
        created_at: '2023-01-01T10:00:00Z'
      }
    });

    const wrapper = mount(UserDetail);

    // Aguarda o onMounted e a promise da API
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(api.get).toHaveBeenCalledWith('/users/1');
    expect(wrapper.text()).toContain('Testanto Teste');
    expect(wrapper.text()).toContain('testando@teste.com');
  });

  it('deve esconder o botão editar se o perfil não tiver permissão', async () => {
    // Perfil 3 (exemplo: Usuário comum) não pode editar
    localStorage.setItem('user', JSON.stringify({ id: 99, profile_id: 3 }));
    
    (api.get as any).mockResolvedValue({ data: { id: 1, addresses: [] } });

    const wrapper = mount(UserDetail);
    await new Promise(resolve => setTimeout(resolve, 0));

    const editBtn = wrapper.find('[data-testid="btn-edit"]');
    expect(editBtn.exists()).toBe(false);
  });
});