// For components
export interface ProductDetailsProps {
  productId: number;
}

// For API
export interface ProductDescription {
  type: string;
  color: string;
  volume: string;
  diameter: string;
  specificity: string;
}

export interface Product {
  id: number;
  name: string;
  short_name: string;
  price: number;
  filters: ProductDescription
  photos: string[];
  about: string;
}