import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Star, StarOff, ChevronLeft, ChevronRight, Upload, X, Check, Shield } from 'lucide-react';
import { formatPrice } from '../api/client';
import './Admin.css';

// ─────────────────────────────────────────────────────────────────
//  Đặt mật khẩu admin của bạn ở đây (chỉ cần đổi chuỗi bên dưới)
// ─────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = 'hperfume2025';

function AdminGate({ onSuccess }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('hperfume_admin', '1');
      onSuccess();
    } else {
      setError(true);
      setPw('');
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="admin-gate">
      <div className="admin-gate-card">
        <div className="admin-gate-logo">
          <img src="/logo-hperfume.png" alt="H Perfume" />
        </div>
        <h2 className="admin-gate-title">Đăng nhập Quản trị</h2>
        <p className="admin-gate-desc">Vui lòng nhập mật khẩu để truy cập trang quản trị.</p>
        <form onSubmit={handleSubmit} className="admin-gate-form">
          <input
            ref={inputRef}
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Nhập mật khẩu…"
            className={`admin-gate-input ${error ? 'shake' : ''}`}
            autoComplete="current-password"
          />
          {error && <p className="admin-gate-error">Mật khẩu không đúng</p>}
          <button type="submit" className="admin-gate-btn">
            <Shield size={15} />
            Xác nhận
          </button>
        </form>
        <Link to="/shop" className="admin-gate-back">← Quay lại cửa hàng</Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Toast helper
// ─────────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${type === 'success' ? '✓' : '✕'}</span> ${msg}`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ─────────────────────────────────────────────────────────────────
//  Format helpers
// ─────────────────────────────────────────────────────────────────
function formatNum(n) {
  return new Intl.NumberFormat('vi-VN').format(n || 0);
}

// ─────────────────────────────────────────────────────────────────
//  Main Admin Dashboard
// ─────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || '/api';
const PER_PAGE = 20;

export default function Admin() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem('hperfume_admin') === '1'
  );
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: '', brand: '', description: '',
    price: '', original_price: '',
    size: '', category: '', gender: 'Nữ',
    notes_top: '', notes_heart: '', notes_base: '',
    featured: false, is_tester: false, stock: '10', image: ''
  });

  // ── Load products ──
  const loadProducts = async (pg = 1, q = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: PER_PAGE });
      if (q) params.set('q', q);
      const res = await fetch(`${API}/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setPage(pg);
    } catch { setProducts([]); }
    setLoading(false);
  };

  useEffect(() => { loadProducts(page, search); }, []);

  // ── Auth gate ──
  if (!authed) return <AdminGate onSuccess={() => setAuthed(true)} />;

  const handleLogout = () => {
    sessionStorage.removeItem('hperfume_admin');
    setAuthed(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(1, search);
  };

  const openNew = () => {
    setForm({
      name: '', brand: '', description: '',
      price: '', original_price: '',
      size: '', category: '', gender: 'Nữ',
      notes_top: '', notes_heart: '', notes_base: '',
      featured: false, is_tester: false, stock: '10', image: ''
    });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name, brand: p.brand, description: p.description || '',
      price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : '',
      size: p.size || '', category: p.category || '', gender: p.gender,
      notes_top: p.notes_top || '', notes_heart: p.notes_heart || '',
      notes_base: p.notes_base || '',
      featured: !!p.featured, is_tester: !!p.is_tester,
      stock: String(p.stock || 10), image: p.image || ''
    });
    setEditing(p);
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${API}/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setForm(f => ({ ...f, image: data.url }));
        toast('Upload ảnh thành công!');
      } else {
        toast('Upload thất bại', 'error');
      }
    } catch { toast('Upload thất bại', 'error'); }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.brand || !form.price) {
      toast('Vui lòng nhập tên, thương hiệu và giá', 'error');
      return;
    }
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `${API}/products/${editing.id}` : `${API}/products`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error();
      toast(editing ? 'Đã cập nhật sản phẩm!' : 'Đã thêm sản phẩm mới!');
      setShowForm(false);
      loadProducts(page, search);
    } catch { toast('Lỗi khi lưu sản phẩm', 'error'); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Xóa "${name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await fetch(`${API}/products/${id}`, { method: 'DELETE' });
      toast('Đã xóa sản phẩm');
      loadProducts(page, search);
    } catch { toast('Lỗi khi xóa', 'error'); }
  };

  const toggleFeatured = async (p) => {
    try {
      await fetch(`${API}/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !p.featured })
      });
      loadProducts(page, search);
    } catch {}
  };

  return (
    <div className="admin-page">
      {/* Top bar */}
      <div className="admin-topbar">
        <div className="admin-topbar-left">
          <img src="/logo-hperfume.png" alt="H Perfume" className="admin-logo" />
          <div>
            <h1 className="admin-title">Quản lý sản phẩm</h1>
            <p className="admin-subtitle">H PERFUME Admin</p>
          </div>
        </div>
        <div className="admin-topbar-right">
          <Link to="/shop" className="admin-back-link">← Cửa hàng</Link>
          <button className="admin-logout-btn" onClick={handleLogout}>Đăng xuất</button>
          <button className="btn-gold" onClick={openNew}>
            <Plus size={15} /> Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="admin-controls">
        <form className="admin-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Tìm theo tên, thương hiệu…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit">Tìm</button>
        </form>
        <div className="admin-stat">
          <span className="stat-n">{products.length}</span>
          <span className="stat-l">sản phẩm</span>
          <span className="stat-divider">|</span>
          <span className="stat-n">{totalPages}</span>
          <span className="stat-l">trang</span>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="admin-empty">
            <p>Chưa có sản phẩm nào</p>
            <button className="btn-gold" onClick={openNew}><Plus size={14} /> Thêm sản phẩm đầu tiên</button>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Thông tin</th>
                <th>Giá</th>
                <th>Loại</th>
                <th>Nổi bật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className={p.featured ? 'row-featured' : ''}>
                  <td className="td-img">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="prod-thumb" />
                    ) : (
                      <div className="prod-thumb-placeholder">
                        <span>{p.brand?.[0] || '?'}</span>
                      </div>
                    )}
                  </td>
                  <td className="td-info">
                    <div className="td-brand">{p.brand}</div>
                    <div className="td-name">{p.name}</div>
                    <div className="td-meta">{p.size} · {p.gender}</div>
                  </td>
                  <td className="td-price">
                    <span className="price-display">{formatNum(p.price)}đ</span>
                    {p.original_price && p.original_price > p.price && (
                      <span className="price-old">{formatNum(p.original_price)}đ</span>
                    )}
                  </td>
                  <td className="td-badges">
                    {p.is_tester
                      ? <span className="badge badge-tester">Tester</span>
                      : <span className="badge badge-full">Full</span>
                    }
                  </td>
                  <td className="td-featured">
                    <button className={`btn-star ${p.featured ? 'on' : ''}`} onClick={() => toggleFeatured(p)}>
                      {p.featured ? <Star size={15} /> : <StarOff size={15} />}
                    </button>
                  </td>
                  <td className="td-actions">
                    <button className="btn-edit" onClick={() => openEdit(p)}><Pencil size={14} /></button>
                    <button className="btn-del" onClick={() => handleDelete(p.id, p.name)}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button disabled={page <= 1} onClick={() => loadProducts(page - 1, search)}><ChevronLeft size={16} /></button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1;
            return (
              <button key={p} className={page === p ? 'active' : ''}
                onClick={() => loadProducts(p, search)}>{p}</button>
            );
          })}
          {totalPages > 7 && <span className="page-ellipsis">…</span>}
          <button disabled={page >= totalPages} onClick={() => loadProducts(page + 1, search)}><ChevronRight size={16} /></button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group full">
                  <label>Tên sản phẩm <span className="req">*</span></label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="VD: Coco Mademoiselle EDP" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Thương hiệu <span className="req">*</span></label>
                  <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="VD: Chanel" list="brands-list" />
                  <datalist id="brands-list">
                    {['Chanel', 'Dior', 'YSL', 'Tom Ford', 'Louis Vuitton', 'Gucci', 'Versace', 'Jo Malone', 'Hermès', 'Narciso Rodriguez', 'Parfums de Marly', 'Diptyque', 'Kilian', 'Bvlgari', 'Lancôme', 'Kenzo', 'Burberry', 'Maison Margiela'].map(b => <option key={b} value={b} />)}
                  </datalist>
                </div>
                <div className="form-group">
                  <label>Giới tính <span className="req">*</span></label>
                  <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                    <option value="Nữ">Nữ</option>
                    <option value="Nam">Nam</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giá bán (VNĐ) <span className="req">*</span></label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="VD: 2800000" />
                </div>
                <div className="form-group">
                  <label>Giá gốc (VNĐ)</label>
                  <input type="number" value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))} placeholder="VD: 3500000" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Dung tích</label>
                  <input value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} placeholder="VD: 100ml" />
                </div>
                <div className="form-group">
                  <label>Nhóm hương</label>
                  <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="VD: Floral, Woody…" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Top Notes</label>
                  <input value={form.notes_top} onChange={e => setForm(f => ({ ...f, notes_top: e.target.value }))} placeholder="VD: Cam Bergamot" />
                </div>
                <div className="form-group">
                  <label>Heart Notes</label>
                  <input value={form.notes_heart} onChange={e => setForm(f => ({ ...f, notes_heart: e.target.value }))} placeholder="VD: Hoa nhài" />
                </div>
                <div className="form-group">
                  <label>Base Notes</label>
                  <input value={form.notes_base} onChange={e => setForm(f => ({ ...f, notes_base: e.target.value }))} placeholder="VD: Gỗ tuyết tùng" />
                </div>
              </div>

              <div className="form-group full">
                <label>Mô tả</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Mô tả sản phẩm…" />
              </div>

              {/* Image */}
              <div className="form-group full">
                <label>Hình ảnh sản phẩm</label>
                <div className="image-row">
                  {form.image && (
                    <div className="image-preview-wrap">
                      <img src={form.image} alt="preview" className="image-preview" />
                      <button type="button" className="image-remove" onClick={() => setForm(f => ({ ...f, image: '' }))}>
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  <div className="image-inputs">
                    <input
                      type="text"
                      value={form.image}
                      onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                      placeholder="Dán URL ảnh (VD: https://...)"
                      className="image-url-input"
                    />
                    <label className="btn-upload" title="Upload ảnh từ máy">
                      <Upload size={14} />
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
                {uploading && <p className="upload-msg">⏳ Đang upload…</p>}
              </div>

              {/* Toggles */}
              <div className="form-toggles">
                <label className="toggle-label">
                  <input type="checkbox" checked={form.is_tester} onChange={e => setForm(f => ({ ...f, is_tester: e.target.checked }))} />
                  <span>Tester — giá thấp hơn, không hộp</span>
                </label>
                <label className="toggle-label">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
                  <span>Hiển thị ở trang chủ (Nổi bật)</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="btn-submit">
                  <Check size={14} /> {editing ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
