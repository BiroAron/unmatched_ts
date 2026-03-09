export interface Space {
  id: string;
  zones: string[];
  neighbors: string[];
}

export interface MapData {
  name: string;
  spaces: Space[];
  specialRules?: Record<string, any>;
}
