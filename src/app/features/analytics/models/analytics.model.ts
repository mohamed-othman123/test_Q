export interface Dashboard {
    id: number;
    name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
    tags?: string[];
    thumbnail?: string;
    is_public?: boolean;
    view_count?: number;
    last_accessed?: string;
  }
  
  export interface Question {
    id: number;
    name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
    dashboard_id?: number;
    category?: string;
    parameters?: QuestionParameter[];
    is_public?: boolean;
  }
  
  export interface DashboardUrl {
    url: string;
    expires_at?: string;
    token?: string;
  }
  
  export interface DashboardFilters {
    dashboardType?: DashboardTypes;
    months?: number;
    fromDate?: string;
    toDate?: string;
    timeGranularity?: string;
    eventTypeId?: number;
    eventTime?: string;
    bookingProcessStatus?: string;
    attendeesType?: string;
    clientType?: string;
    expenseStatus?: string;
    expenseType?: string;
    expenseCategory?: number;
    expenseItem?: number;
    hallIds?: number[];
  }
  
  export interface AnalyticsMetrics {
    totalDashboards: number;
    totalQuestions: number;
    recentlyViewed: number;
    favoriteCount: number;
    lastSync?: string;
  }
  
  export interface DashboardSearchOptions {
    query?: string;
    type?: DashboardTypes;
    tags?: string[];
    sortBy?: 'name' | 'created_at' | 'updated_at' | 'view_count';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }
  
  export interface AnalyticsError {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  }
  
  export enum DashboardTypes {
    Booking = 'Bookings',
    Expense = 'Expenses',
  }
  
  export interface QuestionParameter {
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'array';
    required: boolean;
    default?: any;
    options?: any[];
    description?: string;
  }