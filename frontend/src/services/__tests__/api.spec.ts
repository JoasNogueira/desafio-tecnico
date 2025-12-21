import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { InternalAxiosRequestConfig } from 'axios';

// Mock para a função 'use' do interceptor usando vi.hoisted
const mocks = vi.hoisted(() => ({
  use: vi.fn(),
}));

// Mocka do módulo 'axios' ANTES de importar o arquivo api.ts
vi.mock('axios', () => ({
  default: {
    create: () => ({
      interceptors: {
        request: { use: mocks.use } // Injetamos o spy aqui
      }
    })
  }
}));

// Importa o arquivo (o mock acima será usado na criação)
import '../api';

describe('Service: API (Axios)', () => {
  beforeEach(() => {
    // verificar a chamada feita durante a importação do arquivo '../api'
    localStorage.clear();
  });

  it('deve registrar o interceptador de request na inicialização', () => {
    expect(mocks.use).toHaveBeenCalled();
  });

  it('deve adicionar o token Bearer ao header se existir no localStorage', () => {
    // Simula token salvo
    const token = 'token-falso-123';
    localStorage.setItem('token', token);

    // Recupera a função interceptadora que foi passada para o axios
    // mocks.use.calls[0][0] é o primeiro argumento da primeira chamada (a função de sucesso)
    const interceptor = mocks.use.mock.calls[0]![0];

    // Cria uma config fake de request
    const config: InternalAxiosRequestConfig = { headers: {} as any } as any;

    // Executa o interceptor manualmente
    const result = interceptor(config);

    // Verifica se o header foi injetado
    expect(result.headers.Authorization).toBe(`Bearer ${token}`);
  });

  it('NÃO deve adicionar header Authorization se não houver token', () => {
    localStorage.removeItem('token');

    const interceptor = mocks.use.mock.calls[0]![0];
    const config: InternalAxiosRequestConfig = { headers: {} as any } as any;

    const result = interceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
  });
});