export interface Service {
  id?: number;
  name: string;
  order: number;
}

export interface LandingPageServicesDto {
  services: string[];
}
