import type { ComponentType } from 'react'

export interface ComponentConfig {
  import: () => Promise<{ default: ComponentType }>
  preload?: boolean
  metadata?: Record<string, unknown>
}

export type ComponentRegistry = Map<string, ComponentConfig>

export interface AppClientProps {
  componentName: string;
  useQueryString?: boolean; // Added useQueryString property
  // other properties
}