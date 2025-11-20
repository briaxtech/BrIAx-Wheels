export interface Car {
  id: string;
  name: string;
  category: string;
  pricePerDay: number;
  passengers: number;
  transmission: 'Automatic' | 'Manual';
  imageUrl: string;
  features: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum ViewState {
  HOME = 'HOME',
  FLEET = 'FLEET',
  CONTACT = 'CONTACT'
}

export type Language = 'en' | 'es';
