export interface ApiResponse<T = unknown> {

  success: boolean
  data?: T
  error?: any
  
}

// Define types for subsidiary structures
type Tag = {
    // Add properties for tag objects here
    // For example:
    id: string;
    name: string;
}
  
  type Rating = {
    // Add properties for rating objects here
    // For example:
    score: number;
    category: string;
}
  
  type AIThink = {
    // Add properties for AI_think here
    // For example:
    analysis: string;
    confidence: number;
}
  
  // Main SiteData type
export type SiteData = {
    id?: string;
    description?: string;
    icon?: string;
    image?: string;
    logo?: string;
    name?: string;
    title?: string;
    url?: string;
    area?: string;
    categoria?: string;
    tags?: Tag[]; // Array of tag objects
    ratings?: Rating[];
    AI_think?: AIThink;
    AI_summary?: string;
    id_provider?: string;
}