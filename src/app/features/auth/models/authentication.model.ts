import {OtpChannels} from '@core/enums';

export interface SignUpBody {
  name: string;
  password: string;
  email: string;
}

export interface SignUpResponse {
  userId: number;
  clientId: number;
  message: string;
}

export interface verifyOtpBody {
  userId: number;
  otp: number;
  channel: string;
  isRememberMe: boolean;
}

export interface OtpData {
  channel: OtpChannels;
  email: string;
  other: any;
}

export interface VerifyOtpResponse {
  token: string;
  user: User;
  refresh_token: string;
  support: Support;
}

export interface Support {
  email: string;
  phone: string;
}
export interface User {
  userId: number;
  clientId: number;
  email: string;
  type: string;
  name: string;
  role: Role;
  permissionType: PermissionTypes;
  subscription: Superscription;
}

export interface Superscription {
  startDate?: string;
  endDate?: string;
}

interface Role {
  id: number;
  name: string;
  name_ar: string;
  permissions: Permission[];
  type?: string;
}

export enum UserTypes {
  SYSTEM_MANAGER = 'system manager',
  EMPLOYEE = 'employee',
}

export enum PermissionTypes {
  GENERAL = 'general permission',
  SPECIAL = 'special permission',
}
export interface Permission {
  id: number;
  ar_module: string;
  ar_name: string;
  en_module: string;
  en_name: string;
  name: string;
  module: string;
  route: string;
  type: string;
}

export interface PermissionMatrix {
  [module: string]: {
    read: Permission | null;
    create: Permission | null;
    update: Permission | null;
    delete: Permission | null;
  };
}

export interface ForgetPasswordResponse {
  message: string;
  data: boolean;
}

export interface ResetPassword {
  password: string | null;
  confirmedPassword: string | null;
}

export interface ResetPasswordResponse {
  message: string;
}

export type UserData = VerifyOtpResponse;

export type LoginResponse = SignUpResponse;
