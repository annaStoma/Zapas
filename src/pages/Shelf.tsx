import { useCallback, useEffect, useState } from 'react';
import { Product, ProductCategory } from '../types/product';
import { fetchProducts, fetchProductsCategories } from '../api/products';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import ProductTable from '../components/ProductTable';
import './Shelf.scss';
import Loader from '../components/Loader';

type View = 'grid' | 'table';

// Всегда включает первую, последнюю и страницы вокруг текущей —
// иначе при переходе стрелкой на страницу вне списка она нигде не подсвечивается.
function getPageNumbers(
  current: number,
  totalPages: number,
  siblings: number = 1
): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [1];
  const start = Math.max(2, current - siblings);
  const end = Math.min(totalPages - 1, current + siblings);

  if (start > 2) {
    pages.push('ellipsis');
  }
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (end < totalPages - 1) {
    pages.push('ellipsis');
  }
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

function Shelf() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [view, setView] = useState<View>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const loadProducts = useCallback((limitValue: number, skip: number, category: string) => {
    setLoading(true);
    setError(null);
    fetchProducts(limitValue, skip, category || undefined)
      .then((data) => {
        setTotal(data.total);
        setProducts(data.products);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Категории грузятся один раз при монтировании — не зависят от page/limit/category.
  useEffect(() => {
    fetchProductsCategories()
      .then(setCategories)
      .catch((err) => setError(err.message));
  }, []);

  // Загрузка привязана к page/limit/selectedCategory, а не вызывается вручную —
  // так всегда используются актуальные значения состояния, без stale closure.
  useEffect(() => {
    loadProducts(limit, (page - 1) * limit, selectedCategory);
  }, [page, limit, selectedCategory, loadProducts]);

  const paginate = useCallback((direction: 'previous' | 'next') => {
    setPage((prev) => (direction === 'next' ? prev + 1 : Math.max(1, prev - 1)));
  }, []);

  const isFirstPage = page === 1;
  const isLastPage = total !== null && page * limit >= total;
  const totalPages = total !== null ? Math.max(1, Math.ceil(total / limit)) : 1;
  const pageNumbers = getPageNumbers(page, totalPages);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
    setPage(1);
  };

  return (
    <div>
      <div className="ItemsTitle">
        <p>Товары</p>
        {categories.length > 0 && (
          <div>
            <select value={selectedCategory} onChange={handleChange}>
              <option value="">Все категории</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="ViewSwitcher">
          <button
            className={view === 'grid' ? 'ViewSwitcher-button active' : 'ViewSwitcher-button'}
            onClick={() => setView('grid')}
          >
            Плитка
          </button>
          <button
            className={view === 'table' ? 'ViewSwitcher-button active' : 'ViewSwitcher-button'}
            onClick={() => setView('table')}
          >
            Таблица
          </button>
        </div>
        <button onClick={() => loadProducts(limit, (page - 1) * limit, selectedCategory)}>
          Обновить
        </button>
      </div>
      <div className="cardsList">
        {loading && (
          <div className="centerLoaderWrapper">
            <Loader />
          </div>
        )}
        {!loading && error && <p>Ошибка: {error}</p>}
        {!loading && !error && view === 'grid' && (
          <div className="ProductGrid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProductId(product.id)}
              />
            ))}
          </div>
        )}
        {!loading && !error && view === 'table' && (
          <ProductTable products={products} onProductClick={setSelectedProductId} />
        )}
      </div>
      <ProductModal productId={selectedProductId} onClose={() => setSelectedProductId(null)} />
      {total !== null && (
        <div className="PaginatorWrapper">
          <div className="Paginator">
            <button
              className="Paginator-previous"
              onClick={() => paginate('previous')}
              disabled={isFirstPage}
            >
              &larr;
            </button>

            <div className="Paginator-pages">
              {pageNumbers.map((pageNumber, index) =>
                pageNumber === 'ellipsis' ? (
                  <span key={`ellipsis-${index}`} className="Paginator-ellipsis">
                    …
                  </span>
                ) : (
                  <button
                    key={pageNumber}
                    className={
                      pageNumber === page
                        ? 'Paginator-page Paginator-page-active'
                        : 'Paginator-page'
                    }
                    onClick={() => setPage(pageNumber)}
                    disabled={pageNumber === page}
                  >
                    {pageNumber}
                  </button>
                )
              )}
            </div>

            <button
              className="Paginator-next"
              onClick={() => paginate('next')}
              disabled={isLastPage}
            >
              &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Shelf;
