import {useCallback, useEffect, useState} from 'react';
import {Product} from '../types/product';
import {fetchProduct, fetchProducts} from '../api/products';
import './Shelf.scss';

function Shelf() {
    const [products, setProducts] = useState<Product[]>([]);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Без useCallback функция loadProducts пересоздавалась бы заново при каждом рендере
    // Тогда в массиве зависимостей useEffect — [loadProducts] — React видел бы "новую"
    // функцию на каждом рендере и бесконечно перезапускал эффект → бесконечные запросы.
    const loadProducts = useCallback(() => {
        setLoading(true);
        setError(null);
        fetchProducts()
            .then((data) => setProducts(data.products))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const getProduct = useCallback((id: number) => {
        fetchProduct(id)
            .then((product) => {
                setProduct(product);
                console.log(product);
            })
            .catch((err) => setError(err.message));
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    return (
        <div>
            <h1>Товары</h1>
            <button onClick={loadProducts}>Обновить</button>
            {loading && <p>Загрузка...</p>}
            {!loading && error && <p>Ошибка: {error}</p>}
            {!loading && !error && (
                <div className="ProductGrid">
                    {products.map((product) => (
                        <div onClick={() => getProduct(product.id)} className="ProductCard" key={product.id}>
                            <img
                                className="ProductCard-image"
                                src={product.thumbnail}
                                alt={product.title}
                            />
                            <div className="ProductCard-title">{product.title}</div>
                            <div className="ProductCard-brand">{product.brand}</div>
                            <div className="ProductCard-price">${product.price}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Shelf;
