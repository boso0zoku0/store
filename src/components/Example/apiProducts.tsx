import {useEffect, useState} from "react";
import axios from "axios";
import type {CartItem} from "./interface.tsx";
import api from "../../utils/auth.tsx";


export default function useFetchProducts() {
  const [products, setProducts] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get('/products/get/to-cart', {withCredentials: true}).then((res) => {
      setProducts(res.data)
      console.log(res.data)
    })
      .finally(() => setLoading(false))
  }, []);

  return {products, loading}
}