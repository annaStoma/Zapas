import { Product } from '../types/product';
import './ProductTable.scss';

interface ProductTableProps {
  products: Product[];
  onProductClick: (id: number) => void;
}

function ProductTable({ products, onProductClick }: ProductTableProps) {
  return (
    <table className="ProductTable">
      <thead>
        <tr>
          <th></th>
          <th>Название</th>
          <th>Бренд</th>
          <th>Категория</th>
          <th>Цена</th>
          <th>В наличии</th>
          <th>Рейтинг</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id} onClick={() => onProductClick(product.id)}>
            <td>
              <img className="ProductTable-thumbnail" src={product.thumbnail} alt={product.title} />
            </td>
            <td>{product.title}</td>
            <td>{product.brand}</td>
            <td>{product.category}</td>
            <td>${product.price}</td>
            <td>{product.stock}</td>
            <td>{product.rating}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ProductTable;
