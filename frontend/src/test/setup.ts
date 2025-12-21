import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// Mock (imitação) da diretiva v-maska para os testes não quebrarem
config.global.directives = {
  maska: {}
}

// Mock do Vue Router (para não reclamar do router-link ou useRouter)
config.global.mocks = {
  $router: {
    push: vi.fn()
  },
  $route: {
    params: {}
  }
}