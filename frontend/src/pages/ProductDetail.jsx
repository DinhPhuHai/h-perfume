import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api, formatPrice } from '../api/client';
import './ProductDetail.css';

const ZALO_NUMBER = import.meta.env.VITE_ZALO_NUMBER || '0777789984';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.getProduct(id)
      .then(data => {
        setProduct(data);
        setRelated(data.related || []);
      })
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="spinner" style={{ marginTop: '120px' }} />;
  if (!product) return null;

  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.price / product.original_price) * 100) : 0;

  const handleBuyZalo = () => {
    const itemsLine = `${product.brand} ${product.name} (${product.size}) × ${qty}`;
    const msg = encodeURIComponent(
      `🛍️ ĐƠN HÀNG H PERFUME\n\n` +
      `📦 Sản phẩm:\n` +
      `${itemsLine}\n` +
      `💰 Đơn giá: ${formatPrice(product.price)} × ${qty} = ${formatPrice(product.price * qty)}\n\n` +
      `Xin chào shop, tôi muốn đặt mua sản phẩm trên. Vui lòng xác nhận giúp tôi!`
    );
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const zaloUrl = isMobile
      ? `zalo://zalo.me/${ZALO_NUMBER}?action=compose&message=${msg}`
      : `https://zalo.me/${ZALO_NUMBER}?message=${msg}`;
    window.open(zaloUrl, '_blank');
  };

  return (
    <div className="product-detail">
      <div className="pd-topbar container">
        <Link to="/shop" className="pd-back">
          <ArrowLeft size={16} />
          <span>Quay lại cửa hàng</span>
        </Link>
      </div>

      <div className="pd-content container">
        {/* Left: Image */}
        <div className="pd-image-section">
          <div className="pd-image-main">
            {product.image ? (
              <img src={product.image} alt={product.name} className="pd-real-img" />
            ) : (
              <div className="pd-img-placeholder">
                <div className="pd-brand-label">{product.brand}</div>
                <div className="pd-product-icon">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <path d="M40 8C40 8 16 24 16 44C16 55 27 66 40 66C53 66 64 55 64 44C64 24 40 8 40 8Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <path d="M40 28V48M32 36H48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="pd-name-label">{product.name}</div>
                <div className="pd-size-label">{product.size}</div>
              </div>
            )}
            {product.is_tester && <span className="badge badge-tester">Tester</span>}
            {hasDiscount && <span className="discount-tag">-{discountPct}%</span>}
          </div>
        </div>

        {/* Right: Info */}
        <div className="pd-info">
          <div className="pd-brand">{product.brand}</div>
          <h1 className="pd-name">{product.name}</h1>
          <div className="pd-meta-row">
            <span className="pd-size">{product.size}</span>
            <span className="pd-gender">{product.gender}</span>
            <span className="pd-category">{product.category}</span>
          </div>

          {/* Price */}
          <div className="pd-price-section">
            {hasDiscount && (
              <span className="price-original">{formatPrice(product.original_price)}</span>
            )}
            <span className="pd-price">{formatPrice(product.price)}</span>
            {hasDiscount && <span className="pd-discount">-{discountPct}%</span>}
          </div>

          {/* Notes Tabs */}
          <div className="pd-tabs">
            <button className={`pd-tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
              Nốt hương
            </button>
            <button className={`pd-tab ${activeTab === 'desc' ? 'active' : ''}`} onClick={() => setActiveTab('desc')}>
              Mô tả
            </button>
          </div>

          {activeTab === 'notes' ? (
            <div className="pd-notes">
              <div className="note-item">
                <div className="note-label">Top Notes</div>
                <div className="note-value gradient-text">{product.notes_top}</div>
                <div className="note-bar"><div style={{ width: '100%', background: 'linear-gradient(90deg, var(--shimmer-1), var(--gold))' }} /></div>
              </div>
              <div className="note-item">
                <div className="note-label">Heart Notes</div>
                <div className="note-value gradient-text">{product.notes_heart}</div>
                <div className="note-bar"><div style={{ width: '75%', background: 'linear-gradient(90deg, var(--shimmer-1), var(--gold))' }} /></div>
              </div>
              <div className="note-item">
                <div className="note-label">Base Notes</div>
                <div className="note-value gradient-text">{product.notes_base}</div>
                <div className="note-bar"><div style={{ width: '60%', background: 'linear-gradient(90deg, var(--shimmer-1), var(--gold))' }} /></div>
              </div>
            </div>
          ) : (
            <p className="pd-desc">{product.description}</p>
          )}

          {/* Zalo Buy Action */}
          <div className="pd-actions">
            <div className="pd-qty">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <button className="pd-zalo-btn" onClick={handleBuyZalo}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.03 2 11c0 2.76 1.36 5.22 3.55 6.88L2 22l5.27-1.63C8.46 20.8 10.15 22 12 22c5.52 0 10-4.03 10-9S17.52 2 12 2zm4.53 13.53c-.37.96-2.47 1.84-2.53 1.87-.45.2-.67.15-.95-.23-.26-.36-1.02-1.37-1.02-2.62 0-1.25.74-2.32 1.02-2.63.28-.31.45-.29.75-.14.3.15 1.88 1 2.24 1.18.37.18.6.27.69.4.09.14.09.8-.25 2.27-.33 1.39-1.06 2.57-1.46 3.01-.41.45-.85.5-.99.5h-.17c-.24-.02-.46-.11-.78-.4-.29-.27-.49-.65-.7-1.04-.17-.33-.31-.59-.58-.66-.18-.05-.52-.05-1.42.35-.74.33-1.35 1.04-1.56 1.35-.2.31-.22 1.23-.01 1.59.21.36.64.59 1.05.63.41.04.69-.06.92-.33.23-.27.34-.46.58-.73.11-.13.46-.54 1.33-1.5 1.12-1.22 1.88-2.38 2.24-2.96.36-.58.48-1.1.48-1.1z"/>
              </svg>
              Mua ngay qua Zalo
            </button>
            <p className="pd-buy-note">Nhấn để chat trực tiếp với shop qua Zalo — giao hàng trong 1–3 ngày</p>
          </div>

          {/* Trust badges */}
          <div className="pd-badges">
            <div className="pd-badge-item">
              <Check size={14} />
              <span>100% Chính hãng</span>
            </div>
            <div className="pd-badge-item">
              <Check size={14} />
              <span>Giao hàng toàn quốc</span>
            </div>
            <div className="pd-badge-item">
              <Check size={14} />
              <span>Đổi trả trong 7 ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pd-related container">
          <h2 className="pd-related-title">Sản phẩm liên quan</h2>
          <div className="related-grid">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
