export interface RoleReq {
  name?: string | null;
  name_ar?: string | null;
  notes?: string | null;
  permissions: number[];
}

export interface RoleRes {
  id: number;
  name: string;
  name_ar: string;
  notes: string;
  permissions: number[];
}
