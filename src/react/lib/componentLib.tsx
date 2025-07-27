// ~/react/lib/componentLib.ts - Versione aggiornata con kebab-case routing
import type { ComponentType } from 'react';

export interface ComponentMetadata {
  description?: string;
  category?: string;
  tags?: string[];
  props?: Record<string, any>;
  examples?: any[];
  directory?: string;
  path?: string;
  buildPath?: string;
  buildUrl?: string;
}

export interface ComponentInfo {
  component: ComponentType<any>;
  metadata: ComponentMetadata;
}

class ComponentLibrary {
  private components = new Map<string, ComponentInfo>();
  private initialized = false;
  private componentModules: Record<string, () => Promise<any>> = {};
  private loadingPromises = new Map<string, Promise<any>>();

  constructor() {
    this.scanComponents();
  }

  private scanComponents() {
    this.componentModules = {
      ...import.meta.glob('/src/react/components/auth/**/*.{jsx,tsx}', { eager: false }),
      ...import.meta.glob('/src/react/components/common/**/*.{jsx,tsx}', { eager: false }),
      ...import.meta.glob('/src/react/components/examples/**/*.{jsx,tsx}', { eager: false }),
      ...import.meta.glob('/src/react/components/home/**/*.{jsx,tsx}', { eager: false }),
      ...import.meta.glob('/src/react/components/ui/**/*.{jsx,tsx}', { eager: false }),
      ...import.meta.glob('/src/react/v4-components/**/*.{jsx,tsx}', { eager: false })
    };
  }

  async initialize() {
    if (this.initialized) return;

    console.log('🔄 Initializing Component Library...');
    let loadedCount = 0;
    let errorCount = 0;

    for (const [path, importFn] of Object.entries(this.componentModules)) {
      try {
        const module = await importFn();
        const componentName = this.extractComponentName(path);
        const directory = this.extractDirectory(path);
        
        // Genera il nome kebab-case per il routing
        const kebabName = this.toKebabCase(componentName);
        
        if (module.default) {
          const baseMetadata: ComponentMetadata = {
            description: module.metadata?.description || `${componentName} component`,
            category: module.metadata?.category || directory,
            tags: module.metadata?.tags || [],
            props: module.metadata?.props || {},
            examples: module.metadata?.examples || [],
            directory,
            path,
            buildPath: `/build/${kebabName}`, // Usiamo il nome kebab-case
            buildUrl: this.getBuildUrl(kebabName)
          };

          // Registra con il nome originale (per uso interno)
          this.components.set(componentName, {
            component: module.default,
            metadata: baseMetadata
          });

          // Registra anche con il nome kebab-case (per routing Astro)
          this.components.set(kebabName, {
            component: module.default,
            metadata: { 
              ...baseMetadata,
              buildPath: `/build/${kebabName}`,
              buildUrl: this.getBuildUrl(kebabName)
            }
          });

          // Registra anche con prefisso directory + kebab-case
          const prefixedName = `${directory}/${kebabName}`;
          this.components.set(prefixedName, {
            component: module.default,
            metadata: { 
              ...baseMetadata, 
              description: `${directory}/${componentName}`,
              buildPath: `/build/${prefixedName}`,
              buildUrl: this.getBuildUrl(prefixedName)
            }
          });

          loadedCount++;
        }
      } catch (error) {
        console.warn(`❌ Failed to load component from ${path}:`, error);
        errorCount++;
      }
    }

    console.log(`✅ Component Library initialized: ${loadedCount} components loaded, ${errorCount} errors`);
    this.initialized = true;
  }

  /**
   * Converte una stringa da PascalCase/CamelCase a kebab-case
   * Esempi:
   * - MyComponent -> my-component
   * - UserProfileCard -> user-profile-card
   * - APIConnector -> api-connector
   */
  private toKebabCase(str: string): string {
    // Se è una singola parola (tutto maiuscolo o tutto minuscolo)
    if (!/[a-z]/.test(str) || !/[A-Z]/.test(str)) {
      return str.toLowerCase();
    }
    
    // Gestisce il camelCase/PascalCase
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')  // myComponent → my-Component
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2') // MYComponent → MY-Component
      .toLowerCase();                           // tutto in minuscolo
  }

  private extractComponentName(path: string): string {
    return path.split('/').pop()?.replace(/\.(jsx|tsx)$/, '') || '';
  }

  private extractDirectory(path: string): string {
    const parts = path.split('/');
    return parts[parts.length - 2] || 'unknown';
  }

  private getBuildUrl(componentName: string): string {
    return `/build/${componentName}`;
  }

  // Metodi principali
  async getComponent(name: string): Promise<ComponentType<any> | null> {
    // If already loading this component, return the existing promise
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }

    const loadPromise = (async () => {
      try {
        await this.initialize();
        const componentInfo = this.components.get(name);
        if (!componentInfo) {
          console.warn(`Component "${name}" not found in registry`);
          return null;
        }
        
        // If component is already loaded, return it
        if (typeof componentInfo.component !== 'function') {
          console.log(`✅ Using cached component: ${name}`);
          return componentInfo.component;
        }
        
        // Import the component if it's a dynamic import
        if (componentInfo.component instanceof Promise) {
          console.log(`🔄 Loading component module: ${name}`);
          const module = await componentInfo.component;
          const component = module.default || module;
          // Update the component reference
          componentInfo.component = component;
          return component;
        }
        
        return componentInfo.component;
      } catch (error) {
        console.error(`❌ Failed to load component ${name}:`, error);
        throw error;
      } finally {
        this.loadingPromises.delete(name);
      }
    })();

    this.loadingPromises.set(name, loadPromise);
    return loadPromise;
  }

  async getMetadata(name: string): Promise<ComponentMetadata | null> {
    await this.initialize();
    return this.components.get(name)?.metadata || null;
  }

  async has(name: string): Promise<boolean> {
    await this.initialize();
    return this.components.has(name);
  }

  async getAllComponents(): Promise<Map<string, ComponentInfo>> {
    await this.initialize();
    return new Map(this.components);
  }

  async getComponentsByCategory(category: string): Promise<Map<string, ComponentInfo>> {
    await this.initialize();
    const filtered = new Map();
    
    for (const [name, info] of this.components) {
      if (info.metadata.category === category) {
        filtered.set(name, info);
      }
    }
    
    return filtered;
  }

  async getComponentsByTag(tag: string): Promise<Map<string, ComponentInfo>> {
    await this.initialize();
    const filtered = new Map();
    
    for (const [name, info] of this.components) {
      if (info.metadata.tags?.includes(tag)) {
        filtered.set(name, info);
      }
    }
    
    return filtered;
  }

  async searchComponents(query: string): Promise<Map<string, ComponentInfo>> {
    await this.initialize();
    const filtered = new Map();
    const lowercaseQuery = query.toLowerCase();
    
    for (const [name, info] of this.components) {
      if (
        name.toLowerCase().includes(lowercaseQuery) ||
        info.metadata.description?.toLowerCase().includes(lowercaseQuery) ||
        info.metadata.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
        info.metadata.category?.toLowerCase().includes(lowercaseQuery)
      ) {
        filtered.set(name, info);
      }
    }
    
    return filtered;
  }

  // Nuovi metodi specifici per il routing Astro
  async getComponentByKebabName(kebabName: string): Promise<ComponentType<any> | null> {
    await this.initialize();
    return this.components.get(kebabName)?.component || null;
  }

  async getKebabNames(): Promise<string[]> {
    await this.initialize();
    const kebabNames: string[] = [];
    
    for (const [name, info] of this.components) {
      // Filtra solo i nomi che sono in kebab-case (contengono - o sono tutti minuscoli)
      if (name.includes('-') || (name === name.toLowerCase() && !name.includes('/'))) {
        kebabNames.push(name);
      }
    }
    
    return [...new Set(kebabNames)]; // Rimuovi duplicati
  }

  async getAllBuildUrls(): Promise<string[]> {
    await this.initialize();
    const urls: string[] = [];
    
    for (const [name, info] of this.components) {
      // Solo i nomi kebab-case per il routing
      if (name.includes('-') || (name === name.toLowerCase() && !name.includes('/'))) {
        urls.push(info.metadata.buildPath || `/build/${name}`);
      }
    }
    
    return [...new Set(urls)]; // Rimuovi duplicati
  }

  // Metodi di compatibilità
  hasSync(name: string): boolean {
    if (!this.initialized) {
      this.initialize();
    }
    return this.components.has(name);
  }

  async getStats() {
    await this.initialize();
    const allComponents = this.components;
    const categories = new Set<string>();
    const tags = new Set<string>();
    let withExamples = 0;

    for (const [name, info] of allComponents) {
      if (info.metadata.category) categories.add(info.metadata.category);
      if (info.metadata.tags) {
        info.metadata.tags.forEach(tag => tags.add(tag));
      }
      if (info.metadata.examples && info.metadata.examples.length > 0) {
        withExamples++;
      }
    }

    return {
      totalComponents: allComponents.size,
      totalCategories: categories.size,
      totalTags: tags.size,
      componentsWithExamples: withExamples,
      categories: Array.from(categories),
      tags: Array.from(tags),
      buildUrls: await this.getAllBuildUrls()
    };
  }
}

// Esporta istanza singleton
export const componentLib = new ComponentLibrary();

// Utility per definire metadata nei componenti
export const defineComponentMetadata = (metadata: ComponentMetadata) => metadata;