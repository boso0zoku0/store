import {useEffect, useState} from "react";
import axios from "axios";
import type {CartItem} from "./interface.tsx";


export default function useFetchProducts() {
  const [products, setProducts] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    axios.get('http://localhost:8000/products/get/to-cart', {withCredentials: true}).then((res) => {
      setProducts(res.data)
      console.log(res.data)
    })
      .finally(() => setLoading(false))
  }, []);

  return {products, loading}
}