interface OrderData {
  id: number;
  short_name: string;
  status: 'processing' | 'moving' | 'completed' | 'cancelled' | 'none'
  created_at: string;
  price: number;
  photo: string[];
  quantity: number;
}

export interface GeneralData {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  date_registration: string;
  total_orders: number;
  total_price: number;
  products_info: OrderData[];
}