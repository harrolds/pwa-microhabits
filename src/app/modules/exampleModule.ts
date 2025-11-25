import type { ModuleDefinition } from './types'

const moduleDefinition: ModuleDefinition = {
  meta: {
    id: 'example-module',
    title: 'Example module',
    commands: ['example']
  },
  commands: {
    example: {
      id: 'example',
      path: '/example',
      title: 'Example screen'
    }
  }
}

export default moduleDefinition

