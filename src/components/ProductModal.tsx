import { useCallback, useEffect, useState } from 'react';
import { Product } from '../types/product';
import { fetchProduct } from '../api/products';
import './ProductModal.scss';
import Loader from './Loader';

interface ProductModalProps {
  productId: number | null;
  onClose: () => void;
}

function ProductModal({ productId, onClose }: ProductModalProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId === null) {
      return;
    }
    setProduct(null);
    setLoading(true);
    setError(null);
    fetchProduct(productId)
      .then(setProduct)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleClose = useCallback(() => {
    setProduct(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (productId === null) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [productId, handleClose]);

  if (productId === null) {
    return null;
  }

  return (
    <div className="ProductModal-overlay" onClick={handleClose}>
      <div className="ProductModal-panel" onClick={(event) => event.stopPropagation()}>
        <button className="ProductModal-close" onClick={handleClose}>
          ×
        </button>
        {loading && (
          <div className="centerLoaderWrapper">
            <Loader />
          </div>
        )}
        {!loading && error && <p>Ошибка: {error}</p>}
        {!loading && !error && product && (
          <>
            <img className="ProductModal-image" src={product.thumbnail} alt={product.title} />
            <h2>{product.title}</h2>
            <p className="ProductModal-brand">{product.brand}</p>
            <p>{product.description}</p>
            <p className="ProductModal-price">${product.price}</p>
            <div className="ProductModal-meta">
              <div className="ProductModal-meta-item">
                <span className="ProductModal-meta-label">В наличии</span>
                <span>{product.stock}</span>
              </div>
              <div className="ProductModal-meta-item">
                <span className="ProductModal-meta-label">Рейтинг</span>
                <span>{product.rating}</span>
              </div>
              <div className="ProductModal-meta-item">
                <span className="ProductModal-meta-label">Вес</span>
                <span>{product.weight}</span>
              </div>
              <div className="ProductModal-meta-item">
                <span className="ProductModal-meta-label">Доставка</span>
                <span>{product.shippingInformation}</span>
              </div>
              <div className="ProductModal-meta-item">
                <span className="ProductModal-meta-label">Габариты</span>
                <span>
                  {product.dimensions.width} × {product.dimensions.height} ×{' '}
                  {product.dimensions.depth}
                </span>
              </div>
            </div>
            {product.reviews.length > 0 && (
              <div className="ProductModal-reviews">
                <h3>Отзывы</h3>
                {product.reviews.map((review, index) => (
                  <div className="ProductModal-review" key={index}>
                    <div className="ProductModal-review-header">
                      <span>{review.reviewerName}</span>
                      <span>{review.rating}★</span>
                    </div>
                    <p>{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProductModal;
