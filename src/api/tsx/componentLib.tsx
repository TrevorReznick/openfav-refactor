import type { ComponentConfig, ComponentRegistry } from './types/componentTypes'

class ComponentLibrary {
  private registry: ComponentRegistry = new Map()

  register(name: string, config: ComponentConfig) {
    console.log(`📦 Registering component: ${name}`)
    this.registry.set(name, config)
    return this
  }

  get(name: string) {
    const component = this.registry.get(name)
    if (!component) {
      console.error(`❌ Component not found: ${name}`)
      throw new Error(`Component "${name}" not found in registry`)
    }
    console.log(`✅ Component loaded: ${name}`)
    return component
  }

  has(name: string): boolean {
    return this.registry.has(name)
  }

  list(): string[] {
    return Array.from(this.registry.keys())
  }

  getMetadata(name: string) {
    return this.get(name).metadata || {}
  }
}

export const componentLib = new ComponentLibrary()