// data/products.ts
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  sold: number;
  rating: number;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Tshirt",
    category: "North Purwokerto",
    price: 26,
    image: "/assets/sinh-to.jpg",
    sold: 1238,
    rating: 4.8
  },
  {
    id: 2,
    name: "Green Man Jacket",
    category: "North Purwokerto",
    price: 49,
    image: "/assets/tra-sua-ca-phe-2.jpg",
    sold: 1238,
    rating: 4.8
  },
  {
    id: 3,
    name: "Iphone 14 Pro Max",
    category: "North Purwokerto",
    price: 1200,
    image: "/assets/tra-sua-ca-phe-2.jpg",
    sold: 1238,
    rating: 4.8
  },
  {
    id: 4,
    name: "Oversized Tshirt",
    category: "North Purwokerto",
    price: 48,
    image: "/assets/tra-sua-ca-phe-2.jpg",
    sold: 1238,
    rating: 4.8
  },
  {
    id: 5,
    name: "Brown Woman Hoodie",
    category: "North Purwokerto",
    price: 49,
    image: "/assets/tra-sua-ca-phe-2.jpg",
    sold: 1238,
    rating: 4.8
  },
  {
    id: 6,
    name: "Airpod Pro 2022",
    category: "North Purwokerto",
    price: 459,
    image: "/assets/tra-sua-ca-phe-2.jpg",
    sold: 1238,
    rating: 4.8
  },
  {
    id: 7,
    name: "DJI Mini 3 Pro",
    category: "North Purwokerto",
    price: 842,
    image: "/assets/tra-sua-ca-phe-2.jpg",
    sold: 1238,
    rating: 4.8
  },
  {
    id: 8,
    name: "Ipad Pro Gen 3",
    category: "North Purwokerto",
    price: 938,
    image: "/assets/tra-sua-ca-phe-2.jpg",
    sold: 1238,
    rating: 4.8
  }
];
