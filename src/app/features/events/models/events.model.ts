export interface Event {
  id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  deleted_by?: string;
  deleted?: boolean;
  name: string;
  name_ar?: string;
  description?: string;
  created_by?: number;
}
