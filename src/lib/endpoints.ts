/**
 * バックエンドの REST エンドポイントへの薄いラッパー。
 * 各メソッドは apiFetch を通すので JWT 自動付与・エラー変換・401 自動ログアウトが効く。
 */
import { apiFetch } from "./api";
import type {
  ReservationCreateRequest,
  ReservationResponse,
  ServiceCreateRequest,
  ServiceResponse,
  StaffAssignRequest,
  StaffResponse,
  StoreCreateRequest,
  StoreResponse,
  UserResponse,
} from "./types";

export const endpoints = {
  stores: {
    list: () => apiFetch<StoreResponse[]>("/api/stores"),
    get: (id: number) => apiFetch<StoreResponse>(`/api/stores/${id}`),
    create: (req: StoreCreateRequest) =>
      apiFetch<StoreResponse>("/api/stores", { method: "POST", body: req }),
  },
  services: {
    list: (storeId: number) =>
      apiFetch<ServiceResponse[]>(`/api/stores/${storeId}/services`),
    create: (storeId: number, req: ServiceCreateRequest) =>
      apiFetch<ServiceResponse>(`/api/stores/${storeId}/services`, {
        method: "POST",
        body: req,
      }),
  },
  staff: {
    list: (storeId: number) =>
      apiFetch<StaffResponse[]>(`/api/stores/${storeId}/staff`),
    assign: (storeId: number, req: StaffAssignRequest) =>
      apiFetch<StaffResponse>(`/api/stores/${storeId}/staff`, {
        method: "POST",
        body: req,
      }),
    remove: (storeId: number, userId: number) =>
      apiFetch<void>(`/api/stores/${storeId}/staff/${userId}`, {
        method: "DELETE",
      }),
  },
  reservations: {
    list: () => apiFetch<ReservationResponse[]>("/api/reservations"),
    create: (req: ReservationCreateRequest) =>
      apiFetch<ReservationResponse>("/api/reservations", {
        method: "POST",
        body: req,
      }),
    cancel: (id: number) =>
      apiFetch<ReservationResponse>(`/api/reservations/${id}/cancel`, {
        method: "PATCH",
      }),
  },
  users: {
    me: () => apiFetch<UserResponse>("/api/users/me"),
    list: () => apiFetch<UserResponse[]>("/api/users"),
  },
};
