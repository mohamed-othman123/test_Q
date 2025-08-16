export interface ProfileRequest {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role?: number;
  note?: string;
  active?: boolean;
}

export interface ProfileResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: number;
  note: string;
  active: boolean;
}
