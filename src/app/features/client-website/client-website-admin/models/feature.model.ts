export interface Feature {
  id?: number;
  icon: string;
  title: string;
  description: string;
  order: number;
}

export interface CreateFeatureDto {
  sectionId: number;
  icon: string;
  title: string;
  description: string;
  order: number;
}

export interface UpdateFeatureDto {
  title: string;
  description: string;
  order: number;
  icon: string;
}
