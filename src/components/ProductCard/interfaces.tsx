import type {CartItem} from "../interfaces.tsx";

export interface ProductCardProps {
  products: CartItem[];
  isMobile: boolean;
  setOpenedProduct: React.Dispatch<React.SetStateAction<CartItem | null>>;
  setOpenModalProduct: React.Dispatch<React.SetStateAction<boolean>>;
}