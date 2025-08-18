export interface Product {
    id: string;
    name: string;
    image: string;
    price: number;
    originalPrice?: number;
    quantity: number;
    variant?: string;
    color?: string;
    size?: string;
}
