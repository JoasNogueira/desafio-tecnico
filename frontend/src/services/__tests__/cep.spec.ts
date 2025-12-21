import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buscarCEP } from '../cep';

// Mock global do fetch
const fetchMock = vi.fn();
globalThis.fetch = fetchMock;

describe('Service: ViaCEP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar null se o CEP tiver tamanho inválido', async () => {
    const resultado = await buscarCEP('123'); // Curto demais
    expect(resultado).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('deve retornar os dados formatados quando a API responder com sucesso', async () => {
    // Simula resposta positiva da ViaCEP
    const mockResponse = {
      logradouro: 'Praça da Sé',
      bairro: 'Sé',
      localidade: 'São Paulo',
      uf: 'SP',
      cep: '01001-000',
      erro: undefined
    };

    // Configura o fetch para retornar isso
    fetchMock.mockResolvedValue({
      json: () => Promise.resolve(mockResponse)
    });

    const resultado = await buscarCEP('01001000');

    // Verifica se a função mapeou os nomes corretamente (logradouro -> street)
    expect(resultado).toEqual({
      street: 'Praça da Sé',
      neighborhood: 'Sé',
      city: 'São Paulo',
      state: 'SP',
      zip: '01001-000',
      country: 'Brasil'
    });
  });

  it('deve retornar null se a API retornar { erro: true }', async () => {
    // ViaCEP retorna status 200 mas com json { erro: true } para CEP inexistente
    fetchMock.mockResolvedValue({
      json: () => Promise.resolve({ erro: true })
    });

    const resultado = await buscarCEP('99999999'); // CEP inexistente
    expect(resultado).toBeNull();
  });

  it('deve lidar com erros de rede (catch) e retornar null', async () => {
    // Simula internet caindo
    fetchMock.mockRejectedValue(new Error('Network Error'));
    
    // Espia o console.error para não sujar o output do teste
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const resultado = await buscarCEP('01001000');

    expect(resultado).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });
});