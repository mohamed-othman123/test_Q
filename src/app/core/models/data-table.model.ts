export interface TableData<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface DataTableFilter {
  page?: number;
  limit?: number;
  [key: string]: any;
}
