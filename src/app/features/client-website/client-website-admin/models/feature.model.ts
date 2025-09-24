export interface Feature {
  id?: number;
  icon: string;
  title: string;
  description: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFeatureDto {
  sectionId: number;
  icon: string;
  title: string;
  description: string;
  order?: number;
}

export interface UpdateFeatureDto {
  title?: string;
  description?: string;
  order?: number;
  icon?: string;
}

export interface FeatureResponseDto {
  id: number;
  title: string;
  description: string;
  order: number;
  icon: string;
  created_at: string;
  updated_at: string;
}
