import api from "../../utils/auth.tsx";

export const getProduct = async (product_id: number) => {
  const resp = await api.get('/product/get', {
    params: {product_id}
  });
  return resp.data
}