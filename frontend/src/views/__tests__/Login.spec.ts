import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Login from '../Login.vue';
import api from '../../services/api';

// Mock do Vue Router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock da API
vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('Login.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('deve realizar login com sucesso, salvar token e redirecionar', async () => {
    // Configura o mock da API para retornar sucesso
    (api.post as any).mockResolvedValue({
      data: {
        access_token: 'fake-token-123',
        user: { id: 1, name: 'Admin' },
      },
    });

    const wrapper = mount(Login);

    // Preenche os campos
    await wrapper.find('[data-testid="input-email"]').setValue('admin@teste.com');
    await wrapper.find('[data-testid="input-password"]').setValue('123456');

    // Submete o formulário
    await wrapper.find('[data-testid="btn-submit"]').trigger('submit');

    // Verifica se a API foi chamada
    expect(api.post).toHaveBeenCalledWith('/login', {
      email: 'admin@teste.com',
      password: '123456',
    });

    // Espera as promises resolverem
    await new Promise(resolve => setTimeout(resolve, 0));

    // Verifica localStorage e Redirecionamento
    expect(localStorage.getItem('token')).toBe('fake-token-123');
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('deve exibir mensagem de erro quando o login falhar', async () => {
    // Configura o mock para falhar
    (api.post as any).mockRejectedValue(new Error('Unauthorized'));

    const wrapper = mount(Login);
    
    await wrapper.find('[data-testid="input-email"]').setValue('erro@teste.com');
    await wrapper.find('[data-testid="input-password"]').setValue('errada');
    await wrapper.find('[data-testid="btn-submit"]').trigger('submit');

    // Espera atualização da UI
    await new Promise(resolve => setTimeout(resolve, 0));

    // Verifica se a mensagem de erro apareceu
    expect(wrapper.text()).toContain('Login falhou');
  });
});