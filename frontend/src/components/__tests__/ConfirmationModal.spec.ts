import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmationModal from '../ConfirmationModal.vue'

describe('ConfirmationModal', () => {
  
  it('deve renderizar o título e a mensagem corretamente', () => {
    const wrapper = mount(ConfirmationModal, {
      props: {
        show: true,
        title: 'Teste Título',
        message: 'Teste Mensagem'
      }
    })

    expect(wrapper.text()).toContain('Teste Título')
    expect(wrapper.text()).toContain('Teste Mensagem')
  })

  it('não deve renderizar nada se show for false', () => {
    const wrapper = mount(ConfirmationModal, {
      props: { show: false }
    })
    // Se show é false, o componente retorna null ou comentário, o DOM deve estar vazio
    expect(wrapper.find('div.fixed').exists()).toBe(false)
  })

  it('deve emitir "confirm" ao clicar no botão de confirmação', async () => {
    const wrapper = mount(ConfirmationModal, {
      props: { show: true }
    })

    // Busca o botão que tem a classe bg-red-600 (ou a cor padrão que definimos)
    const button = wrapper.find('[data-testid="btn-confirm"]')
    
    await button?.trigger('click')

    // Verifica se o evento foi emitido
    expect(wrapper.emitted()).toHaveProperty('confirm')
  })
})