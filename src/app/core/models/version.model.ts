export interface Version {
  id: number;
  versionNumber: string;
  whatsNewEn: string;
  whatsNewAr: string;
  feature: string;
  stack: Stack;
  releasedDate: string;
}

export enum Stack {
  BE = 'BE',
  FE = 'FE',
}
