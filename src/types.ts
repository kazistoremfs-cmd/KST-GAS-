export interface Brand {
  id: string;
  name: string;
  color: string;
  overlay: string;
  logo: string;
  image: string;
  currentPrice?: number;
  previousPrice?: number;
}

export type CylinderSize = 12;

export interface Pricing {
  size: CylinderSize;
  price: number;
}

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'cash' | 'bank' | 'online';

export interface OrderData {
  brand: Brand | null;
  size: CylinderSize;
  cylinderType: 'refill' | 'new';
  quantity: number;
  customerName: string;
  phone: string;
  address: string;
  deliveryType: 'self' | 'road_step';
  paymentMethod: PaymentMethod;
  onlineSubMethod?: 'bkash' | 'nagad' | 'rocket';
  senderPhone: string;
  trxId: string;
  orderId?: string;
}
