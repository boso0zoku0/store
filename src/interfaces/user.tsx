export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  user_role: string;
  url_id: string;
  date_registration?: string;
  ip?: string;
}