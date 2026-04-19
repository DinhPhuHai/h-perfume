import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Grid3x3, LayoutList } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api } from '../api/client';
import './Shop.css';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const currentPage  = parseInt(searchParams.get('page') || '1');
  const currentBrand = searchParams.get('brand') || '';
  const currentGender = searchParams.get('gender') || '';
  const currentSort  = searchParams.get('sort') || 'popular';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const isTester = searchParams.get('is_tester') || '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery)   params.q = searchQuery;
      if (currentBrand)  params.brand = currentBrand;
      if (currentGender) params.gender = currentGender;
      if (currentSort)   params.sort = currentSort;
      if (minPrice)      params.minPrice = minPrice;
      if (maxPrice)      params.maxPrice = maxPrice;
      if (isTester)      params.is_tester = isTester;
      params.page  = currentPage;
      params.limit = 12;
      const data = await api.getProducts(params);
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch { /* errors handled silently */ }
    setLoading(false);
  }, [searchQuery, currentBrand, currentGender, currentSort, minPrice, maxPrice, isTester, currentPage]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { api.getBrands().then(setBrands).catch(() => {}); }, []);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const clearFilters = () => { setSearchQuery(''); setSearchParams({}); };
  const hasActive = currentBrand || currentGender || minPrice || maxPrice || searchQuery || isTester;

  // Page title
  const pageTitle = currentBrand || (currentGender ? `Nước hoa ${currentGender}` : 'Cửa hàng');

  return (
    <div className="shop-page">

      {/* ── Top Search Bar ── */}
      <div className="shop-search-bar">
        <div className="container">
          <div className="search-bar-inner">
            <div className="search-input-wrap">
              <Search size={17} className="si-icon" />
              <input
                type="text"
                placeholder="Tìm nước hoa, thương hiệu, nhóm hương…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') updateFilter('q', searchQuery); }}
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => { setSearchQuery(''); updateFilter('q', ''); }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <button className="search-submit shimmer-btn" onClick={() => updateFilter('q', searchQuery)}>
              Tìm kiếm
            </button>
            <button className="filter-toggle-btn outline-btn" onClick={() => setFilterOpen(!filterOpen)}>
              <SlidersHorizontal size={14} />
              Bộ lọc
              {hasActive && <span className="filter-badge" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Controls Row ── */}
      <div className="shop-controls container">
        <div className="shop-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <span>{pageTitle}</span>
        </div>
        <div className="shop-meta">
          <span className="result-count">
            {loading ? 'Đang tải…' : `${products.length} sản phẩm`}
          </span>
          <div className="view-toggle">
            <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} title="Lưới">
              <Grid3x3 size={15} />
            </button>
            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} title="Danh sách">
              <LayoutList size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="shop-layout container">

        {/* Sidebar */}
        <aside className={`filter-sidebar ${filterOpen ? 'open' : ''}`}>
          <div className="filter-header">
            <h3>Bộ lọc</h3>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {hasActive && (
                <button className="filter-clear" onClick={clearFilters}>Xóa tất cả</button>
              )}
              <button className="filter-close-mobile" onClick={() => setFilterOpen(false)}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Sort */}
          <div className="filter-group">
            <h4>Sắp xếp</h4>
            {[
              { value: 'popular',    label: 'Phổ biến nhất' },
              { value: 'newest',    label: 'Mới nhất' },
              { value: 'price_asc', label: 'Giá: Thấp → Cao' },
              { value: 'price_desc',label: 'Giá: Cao → Thấp' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`filter-option ${currentSort === opt.value ? 'active' : ''}`}
                onClick={() => updateFilter('sort', opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Gender */}
          <div className="filter-group">
            <h4>Giới tính</h4>
            {[
              { value: 'Nữ', label: 'Nước hoa Nữ' },
              { value: 'Nam', label: 'Nước hoa Nam' },
              { value: 'Unisex', label: 'Unisex' },
            ].map(g => (
              <button
                key={g.value}
                className={`filter-option ${currentGender === g.value ? 'active' : ''}`}
                onClick={() => updateFilter('gender', currentGender === g.value ? '' : g.value)}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Brand */}
          <div className="filter-group">
            <h4>Thương hiệu</h4>
            {brands.map(b => (
              <button
                key={b}
                className={`filter-option ${currentBrand === b ? 'active' : ''}`}
                onClick={() => updateFilter('brand', currentBrand === b ? '' : b)}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Price */}
          <div className="filter-group">
            <h4>Khoảng giá</h4>
            <div className="price-range">
              <input
                type="number"
                placeholder="Từ (đ)"
                value={minPrice}
                onChange={e => updateFilter('minPrice', e.target.value)}
              />
              <span>—</span>
              <input
                type="number"
                placeholder="Đến (đ)"
                value={maxPrice}
                onChange={e => updateFilter('maxPrice', e.target.value)}
              />
            </div>
            <button className="filter-apply" onClick={() => setFilterOpen(false)}>
              Áp dụng
            </button>
          </div>
        </aside>

        {/* Products */}
        <main className="shop-products">
          {/* Loading overlay */}
          {loading && (
            <div className={`products-container`}>
              <div className="products-grid grid">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="skeleton-card" />
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {!loading && (
            <div className={`products-container ${products.length === 0 ? '' : ''}`}>
              {products.length === 0 ? (
                <div className="shop-empty">
                  <div style={{ fontSize: 48, marginBottom: 16 }}>
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ opacity: 0.3 }}>
                      <path d="M32 8C32 8 12 20 12 36C12 46 21 54 32 54C43 54 52 46 52 36C52 20 32 8 32 8Z"
                        stroke="rgba(201,168,76,0.5)" strokeWidth="2" fill="none" />
                      <path d="M32 22V38M24 30H40" stroke="rgba(201,168,76,0.5)" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p>Không tìm thấy sản phẩm nào</p>
                  <p style={{ fontSize: 13, color: 'var(--text-f)' }}>
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </p>
                  <button className="outline-btn" style={{ marginTop: 8 }}
                    onClick={() => { setSearchParams({}); setSearchQuery(''); }}>
                    Xóa bộ lọc
                  </button>
                </div>
              ) : (
                <>
                  <div className={`products-grid ${viewMode}`}>
                    {products.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="pagination">
                      <button
                        className="page-btn"
                        disabled={currentPage <= 1}
                        onClick={() => updateFilter('page', String(currentPage - 1))}
                      >‹</button>

                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const p = i + 1;
                        return (
                          <button
                            key={p}
                            className={`page-btn ${currentPage === p ? 'active' : ''}`}
                            onClick={() => updateFilter('page', String(p))}
                          >{p}</button>
                        );
                      })}

                      {totalPages > 5 && <span className="page-ellipsis">…</span>}

                      <button
                        className="page-btn"
                        disabled={currentPage >= totalPages}
                        onClick={() => updateFilter('page', String(currentPage + 1))}
                      >›</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
