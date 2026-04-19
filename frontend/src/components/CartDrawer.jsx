import { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, Send, ChevronRight, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../api/client';
import './CartDrawer.css';

export default function CartDrawer() {
  const {
    items, isOpen, closeCart,
    removeItem, updateQty,
    totalItems, totalPrice,
    clearCart,
  } = useCart();

  const [step, setStep] = useState('cart'); // 'cart' | 'form' | 'success'
  const [form, setForm] = useState({ name: '', phone: '', address: '', note: '' });
  const [errors, setErrors] = useState({});

  const openForm = () => setStep('form');
  const backToCart = () => setStep('cart');

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Vui lòng nhập họ tên';
    if (!form.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^0\d{9,10}$/.test(form.phone.replace(/\s/g, ''))) {
      errs.phone = 'SĐT không hợp lệ (VD: 0901234567)';
    }
    if (!form.address.trim()) errs.address = 'Vui lòng nhập địa chỉ giao hàng';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildZaloMessage = () => {
    const lines = items.map((item, i) =>
      `${i + 1}. ${item.brand} ${item.name} (${item.size}) × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`
    );
    return `🛍️ ĐƠN HÀNG H PERFUME

📦 Sản phẩm:
${lines.join('\n')}

💰 Tổng: ${formatPrice(totalPrice)}

👤 Khách hàng:
• Họ tên: ${form.name}
• SĐT: ${form.phone}
• Địa chỉ: ${form.address}
${form.note ? `• Ghi chú: ${form.note}` : ''}

Shop sẽ liên hệ xác nhận trong 30 phút. Cảm ơn bạn! 💛`;
  };

  const submitOrder = () => {
    if (!validate()) return;

    const zaloNumber = import.meta.env.VITE_ZALO_NUMBER || '0901234567';
    const msg = encodeURIComponent(buildZaloMessage());
    // Mở chat Zalo cá nhân — trên app sẽ dùng scheme zalo://, trên web dùng zalo.me
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const zaloUrl = isMobile
      ? `zalo://zalo.me/official/${zaloNumber}?action=compose&message=${msg}`
      : `https://zalo.me/${zaloNumber}?message=${msg}`;

    window.open(zaloUrl, '_blank');

    clearCart();
    setForm({ name: '', phone: '', address: '', note: '' });
    setErrors({});
    setStep('success');

    // Auto-close success after 3s
    setTimeout(() => {
      closeCart();
      setStep('cart');
    }, 3000);
  };

  const handleClose = () => {
    closeCart();
    setTimeout(() => {
      setStep('cart');
      setForm({ name: '', phone: '', address: '', note: '' });
      setErrors({});
    }, 400);
  };

  const handleInput = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(err => ({ ...err, [field]: '' }));
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay ${isOpen ? 'open' : ''}`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`} role="dialog" aria-label="Giỏ hàng">

        {/* ===== STEP 1: CART ===== */}
        {step === 'cart' && (
          <>
            <div className="cart-header">
              <div className="cart-title">
                <ShoppingBag size={20} />
                <span>Giỏ hàng</span>
                {totalItems > 0 && <span className="cart-count">({totalItems})</span>}
              </div>
              <button className="cart-close" onClick={handleClose} aria-label="Đóng">
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="cart-empty">
                <ShoppingBag size={48} />
                <p>Giỏ hàng trống</p>
                <button className="outline-btn" onClick={() => { handleClose(); window.location.href = '/shop'; }}>
                  Khám phá cửa hàng
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {items.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-img">
                        <div className="cart-img-placeholder">
                          <span>{item.brand}</span>
                        </div>
                      </div>
                      <div className="cart-item-info">
                        <div className="ci-brand">{item.brand}</div>
                        <div className="ci-name">{item.name}</div>
                        <div className="ci-size">{item.size}</div>
                        <div className="ci-bottom">
                          <div className="ci-price">{formatPrice(item.price * item.quantity)}</div>
                          <div className="ci-qty">
                            <button onClick={() => updateQty(item.id, item.quantity - 1)}>
                              <Minus size={12} />
                            </button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQty(item.id, item.quantity + 1)}>
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <button className="ci-remove" onClick={() => removeItem(item.id)} aria-label="Xóa">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Tổng cộng</span>
                    <span className="total-price">{formatPrice(totalPrice)}</span>
                  </div>
                  <button className="shimmer-btn checkout-btn" onClick={openForm}>
                    Đặt hàng qua Zalo
                    <ChevronRight size={16} />
                  </button>
                  <button className="outline-btn continue-btn" onClick={handleClose}>
                    Tiếp tục mua sắm
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ===== STEP 2: FORM ===== */}
        {step === 'form' && (
          <>
            <div className="cart-header">
              <div className="cart-title">
                <span>Thông tin đặt hàng</span>
              </div>
              <button className="cart-close" onClick={handleClose} aria-label="Đóng">
                <X size={20} />
              </button>
            </div>

            <div className="cart-form-body">
              <div className="form-items-summary">
                <div className="fis-label">Sản phẩm ({totalItems})</div>
                <div className="fis-list">
                  {items.map(item => (
                    <div key={item.id} className="fis-item">
                      <span>{item.brand} {item.name} ×{item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="fis-total">
                  <span>Tổng</span>
                  <span className="gradient-text">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className="cart-form">
                <div className="form-group">
                  <label>Họ tên *</label>
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Văn A"
                    value={form.name}
                    onChange={handleInput('name')}
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    placeholder="VD: 0901234567"
                    value={form.phone}
                    onChange={handleInput('phone')}
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="form-error">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label>Địa chỉ giao hàng *</label>
                  <input
                    type="text"
                    placeholder="VD: 123 Nguyễn Trãi, Q.1, TP.HCM"
                    value={form.address}
                    onChange={handleInput('address')}
                    className={errors.address ? 'error' : ''}
                  />
                  {errors.address && <span className="form-error">{errors.address}</span>}
                </div>

                <div className="form-group">
                  <label>Ghi chú <span style={{ color: 'var(--text-faint)' }}>(tùy chọn)</span></label>
                  <textarea
                    placeholder="VD: Giao giờ hành chính, gọi trước khi giao..."
                    value={form.note}
                    onChange={handleInput('note')}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="cart-footer">
              <button className="outline-btn" style={{ marginBottom: 8 }} onClick={backToCart}>
                ← Quay lại giỏ hàng
              </button>
              <button className="shimmer-btn checkout-btn zalo-submit-btn" onClick={submitOrder}>
                <Send size={16} />
                Gửi đơn qua Zalo
              </button>
              <p className="zalo-note">
                Cửa sổ Zalo sẽ mở ra với nội dung đơn hàng.<br />
                Bạn chỉ cần nhấn <strong>GỬI</strong> trên Zalo là xong!
              </p>
            </div>
          </>
        )}

        {/* ===== STEP 3: SUCCESS ===== */}
        {step === 'success' && (
          <>
            <div className="cart-header">
              <div className="cart-title">
                <Check size={20} />
                <span>Đặt hàng thành công!</span>
              </div>
              <button className="cart-close" onClick={handleClose} aria-label="Đóng">
                <X size={20} />
              </button>
            </div>
            <div className="cart-success">
              <div className="success-icon">
                <Check size={40} />
              </div>
              <h3>Cảm ơn bạn!</h3>
              <p>
                Cửa sổ Zalo đã mở — hãy nhấn <strong>GỬI</strong><br />
                để hoàn tất đơn hàng nhé!
              </p>
              <div className="success-zalo">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Zalo_logo.svg/512px-Zalo_logo.svg.png" alt="Zalo" />
                <span>Shop sẽ liên hệ xác nhận trong <strong>30 phút</strong></span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
