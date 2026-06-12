/**
 * バックエンド (Spring Boot) の DTO に対応する TypeScript 型定義。
 * com.reservecore.api 以下の record 型と一対一で対応する。
 */

export type Role = "ADMIN" | "STAFF" | "CUSTOMER";

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

// ---------- Auth ----------
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  role: Role;
}

// ---------- User ----------
export interface UserResponse {
  id: number;
  email: string;
  name: string;
  role: Role;
}

// ---------- Store ----------
export interface StoreResponse {
  id: number;
  name: string;
  address: string;
  phone: string;
  openingTime: string; // "HH:mm" or "HH:mm:ss"
  closingTime: string;
}

export interface StoreCreateRequest {
  name: string;
  address: string;
  phone?: string;
  openingTime: string;
  closingTime: string;
}

// ---------- Service (メニュー) ----------
export interface ServiceResponse {
  id: number;
  storeId: number;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface ServiceCreateRequest {
  name: string;
  durationMinutes: number;
  price: number;
}

// ---------- Store Staff ----------
export interface StaffResponse {
  userId: number;
  storeId: number;
  email: string;
  name: string;
}

export interface StaffAssignRequest {
  userId: number;
}

// ---------- Reservation ----------
export interface ReservationResponse {
  id: number;
  storeId: number;
  serviceId: number;
  customerId: number;
  staffId: number;
  startTime: string; // ISO local datetime "yyyy-MM-ddTHH:mm:ss"
  endTime: string;
  status: ReservationStatus;
  note?: string | null;
}

export interface ReservationCreateRequest {
  storeId: number;
  serviceId: number;
  staffId: number;
  startTime: string; // "yyyy-MM-ddTHH:mm:ss"
  note?: string;
}

// ---------- Error ----------
export interface ErrorResponse {
  status: number;
  message: string;
  fieldErrors?: Record<string, string> | null;
  timestamp: string;
}
