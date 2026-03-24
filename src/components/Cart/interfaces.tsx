
export interface DescriptionField {
  type: string;
  color: string;
  volume: string;
  diameter: string;
  specificity: string
}
export interface Items {
  id: number;
  name: string;
  shortName: string;
  slug: string;
  price: number;
  description: DescriptionField;
  photos: string[];
  about: string
}

export interface CartItem {
  Products: Items
  quantity: number
}