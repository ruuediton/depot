
export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  type: 'incoming' | 'outgoing' | 'rejected' | 'pending';
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  dailyEarnings: number;
  durationDays: number;
  totalProfit: number;
  rating: number;
  image: string;
  tag?: string;
  isSoldOut?: boolean;
}

export interface Referral {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'sent';
  avatar: string;
  reward?: number;
}
