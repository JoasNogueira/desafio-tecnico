// src/services/cep.ts

interface EnderecoViaCep {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export async function buscarCEP(cep: string): Promise<EnderecoViaCep | null> {
  // Remove tudo que não é número
  const cleanCep = cep.replace(/\D/g, '');

  // Valida tamanho
  if (cleanCep.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();

    if (data.erro) {
      return null;
    }

    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      zip: data.cep || '',
      country: 'Brasil'
    };
  } catch (e) {
    console.error("Erro ao buscar CEP:", e);
    return null;
  }
}