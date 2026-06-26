import {type CartItem, ProductStatus} from "../interfaces.tsx";
import api from "../../utils/auth.tsx";

export const handleAddProduct = async (
  slug: string,
  product_status: ProductStatus,
  setModalLogin
) => {
  try {
    await api.post(`/products/add/to-cart`, {slug, product_status});
  } catch (error: any) {
    if (error.status === 401) {
      setModalLogin(true);
    }
  }
};


export const truncateText = (text: string) => text.length > 40 ? `${text.slice(0, 30)}...` : text;



export const openModal = (
  product: CartItem,
  setOpenedProduct,
  setOpenModalProduct) => {

  setOpenedProduct(product);
  setOpenModalProduct(true);
};

export const closeModal = (setOpenModalProduct, setOpenedProduct) => {

  setOpenModalProduct(false);
  setOpenedProduct(null);
};