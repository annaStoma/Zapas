import {Product, ProductsResponse} from "../types/product";


export async function fetchProducts(): Promise<ProductsResponse> {
    const res = await fetch('https://dummyjson.com/products');
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
