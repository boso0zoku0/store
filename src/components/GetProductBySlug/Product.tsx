import {useEffect, useState} from "react";
import axios from "axios";

export interface DescriptionField {
  type: string;
  color: string;
  volume: string;
  diameter: string;
  specificity: string
}

export interface CartItem {
  id: number;
  name: string;
  shortName: string;
  price: number;
  description: DescriptionField;
  photos: string[];
  about: string
  quantity: number
}


export default function useProductBySlug(slug: string | null | undefined) {
  const [productBySlug, setProductBySlug] = useState<CartItem | null>(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    if (!slug) {
      setProductBySlug(null);
      setLoading(false);
      return;
    }
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:8000/products/get/product/?slug=${slug}`);
        setProductBySlug(data);
        console.log(data)
      } catch (error) {
        console.error('Error:', error);
        setProductBySlug(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  return { productBySlug, loading };
}