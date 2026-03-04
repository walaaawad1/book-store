
export enum Track {
  SCIENCE = 'علمي',
  LITERARY = 'أدبي'
}

export interface Book {
  id: string;
  title: string;
  price: number;
  track: Track;
  image: string;
  description: string;
}

export interface CartItem extends Book {
  quantity: number;
}

export interface UserDetails {
  fullName: string;
  phone: string;
  altPhone: string;
  address: string;
}

export type AppStep = 'catalog' | 'details' | 'invoice';

export interface LegalContent {
  title: string;
  content: string;
}
