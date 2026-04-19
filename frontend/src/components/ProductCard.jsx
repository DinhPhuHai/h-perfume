import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { formatPrice } from '../api/client';
import './ProductCard.css';

const ZALO_NUMBER = import.meta.env.VITE_ZALO_NUMBER || '0777789984';

export default function ProductCard({ product, className = '', style = {} }) {
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  const handleBuyZalo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const msg = encodeURIComponent(
      `🛍️ ĐƠN HÀNG H PERFUME\n\n` +
      `📦 Sản phẩm:\n` +
      `${product.brand} ${product.name} (${product.size})\n` +
      `💰 Giá: ${formatPrice(product.price)}\n\n` +
      `Xin chào shop, tôi muốn đặt mua sản phẩm trên. Vui lòng xác nhận giúp tôi!`
    );
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const zaloUrl = isMobile
      ? `zalo://zalo.me/${ZALO_NUMBER}?action=compose&message=${msg}`
      : `https://zalo.me/${ZALO_NUMBER}?message=${msg}`;
    window.open(zaloUrl, '_blank');
  };

  return (
    <div className={`product-card ${className}`} style={style}>
      <Link to={`/product/${product.id}`} className="product-card-image">
        {product.image ? (
          <img
            src={product.image}
            alt={`${product.brand} ${product.name}`}
            className="pc-real-img"
          />
        ) : (
          <div className="product-img-placeholder">
            <div className="product-img-brand">{product.brand}</div>
            <div className="product-img-icon">
              {/* Elegant perfume bottle — thin line, minimal */}
              <svg width="38" height="38" viewBox="0 0 38 52" fill="none">
                {/* Body */}
                <rect x="9" y="18" width="20" height="26" rx="2.5"
                  stroke="currentColor" strokeWidth="1.2" fill="none"/>
                {/* Shoulder */}
                <path d="M9 18 L14 12 L24 12 L29 18"
                  stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
                {/* Neck */}
                <rect x="16" y="7" width="6" height="5" rx="0.5"
                  stroke="currentColor" strokeWidth="1.2" fill="none"/>
                {/* Cap */}
                <rect x="13.5" y="2" width="11" height="5" rx="1.5"
                  stroke="currentColor" strokeWidth="1.2" fill="none"/>
                {/* Liquid level */}
                <path d="M11 30 L27 30" stroke="currentColor" strokeWidth="0.8"
                  strokeDasharray="2 2" opacity="0.5"/>
              </svg>
            </div>
            <div className="product-img-name">{product.name}</div>
          </div>
        )}

        {product.is_tester ? (
          <span className="badge badge-tester">Tester</span>
        ) : product.featured ? (
          <span className="badge badge-new">Nổi bật</span>
        ) : null}

        {hasDiscount && (
          <span className="discount-tag">-{discountPct}%</span>
        )}

        <div className="product-card-overlay">
          <button className="quick-add" onClick={handleBuyZalo}>
            <MessageCircle size={16} />
            <span>Mua ngay qua Zalo</span>
          </button>
        </div>
      </Link>

      <div className="product-card-info">
        <div className="pc-brand">{product.brand}</div>
        <Link to={`/product/${product.id}`} className="pc-name">{product.name}</Link>
        <div className="pc-meta">
          <span className="pc-size">{product.size}</span>
          <span className="pc-gender">{product.gender}</span>
        </div>
        <div className="pc-price-row">
          {hasDiscount && (
            <span className="price-original">{formatPrice(product.original_price)}</span>
          )}
          <span className="price">{formatPrice(product.price)}</span>
        </div>
      </div>
    </div>
  );
}
