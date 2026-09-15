import { Product, ProductCategory, ProductsResponse } from '../types/product';

export async function fetchProducts(
  limit: number = 10,
  skip: number = 0,
  category?: string
): Promise<ProductsResponse> {
  const url = category
    ? `https://dummyjson.com/products/category/${category}?limit=${limit}&skip=${skip}`
    : `https://dummyjson.com/products?limit=${limit}&skip=${skip}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }
  return res.json();
}

export async function fetchProduct(id: number): Promise<Product> {
  const res = await fetch(`https://dummyjson.com/products/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch product: ${res.status}`);
  }
  return res.json();
}

export async function fetchProductsCategories(): Promise<ProductCategory[]> {
  const res = await fetch(`https://dummyjson.com/products/categories`);
  if (!res.ok) {
    throw new Error(`Failed to fetch product: ${res.status}`);
  }
  return res.json();
}
