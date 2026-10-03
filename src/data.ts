import { Brand, Pricing } from './types';
import bashundharaImg from './assets/images/bashundhara_cylinder_1790516206358.jpg';

const cylinderImg = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR90iTYnY7LeX-Efcr-HNSQlITYEat-HhOSH2ArgP10kw&s=10';

export const BRANDS: Brand[] = [
  { id: 'bashundhara', name: 'Bashundhara LP Gas', color: 'bg-red-600', overlay: '', logo: 'B', image: bashundharaImg, currentPrice: 1600, previousPrice: 1700 },
  { id: 'omera', name: 'Omera LPG', color: 'bg-yellow-500', overlay: 'bg-yellow-500/40', logo: 'O', image: cylinderImg, currentPrice: 1580, previousPrice: 1680 },
  { id: 'jamuna', name: 'Jamuna Gas', color: 'bg-orange-600', overlay: 'bg-orange-600/40', logo: 'J', image: cylinderImg, currentPrice: 1550, previousPrice: 1650 },
  { id: 'beximco', name: 'Beximco LPG', color: 'bg-blue-600', overlay: 'bg-blue-600/40', logo: 'BX', image: cylinderImg, currentPrice: 1590, previousPrice: 1690 },
  { id: 'bm', name: 'BM Energy', color: 'bg-green-600', overlay: 'bg-green-600/40', logo: 'BM', image: cylinderImg, currentPrice: 1570, previousPrice: 1670 },
  { id: 'fresh', name: 'Fresh LPG', color: 'bg-cyan-500', overlay: 'bg-cyan-500/40', logo: 'F', image: cylinderImg, currentPrice: 1560, previousPrice: 1660 },
];

export const PRICING: Record<number, Pricing> = {
  
  12: { size: 12, price: 1450 },
  
};

export const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', icon: 'Banknote' },
  { id: 'bkash', label: 'bKash', icon: 'Smartphone' },
  { id: 'nagad', label: 'Nagad', icon: 'Smartphone' },
  { id: 'rocket', label: 'Rocket', icon: 'Smartphone' },
  { id: 'cash', label: 'CASH', icon: 'Banknote' },
  { id: 'bank', label: 'BANK', icon: 'Building2' },
  { id: 'online', label: 'ONLINE PAYMENT', icon: 'CreditCard' },
];

export const PAYMENT_METHODS_UNDER_2000 = [
  { id: 'cod', label: 'Cash on Delivery', icon: 'Banknote' },
  { id: 'cash', label: 'CASH', icon: 'Banknote' },
  { id: 'online', label: 'ONLINE PAYMENT', icon: 'CreditCard' },
];

export const PAYMENT_METHODS_ABOVE_2000 = [
  { id: 'cod', label: 'Cash on Delivery', icon: 'Banknote' },
  { id: 'bkash', label: 'bKash', icon: 'Smartphone' },
  { id: 'nagad', label: 'Nagad', icon: 'Smartphone' },
  { id: 'rocket', label: 'Rocket', icon: 'Smartphone' },
  { id: 'cash', label: 'CASH', icon: 'Banknote' },
  { id: 'bank', label: 'BANK', icon: 'Building2' },
];
