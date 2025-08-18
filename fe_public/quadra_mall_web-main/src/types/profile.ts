export interface LoginResponse {
  fullName: string;
  phone: string;
  avatarUrl: string;
  email: string;
  // Thêm các trường khác nếu backend trả về (accessToken, roles, ...)
}
