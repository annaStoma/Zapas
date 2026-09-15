import { Product } from '../types/product';
import './ProductCard.scss';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div className="ProductCard" onClick={onClick}>
      <img className="ProductCard-image" src={product.thumbnail} alt={product.title} />
      <div className="ProductCard-title">{product.title}</div>
      <div className="ProductCard-brand">{product.brand}</div>
      <div className="ProductCard-price">${product.price}</div>
    </div>
  );
}

export default ProductCard;
