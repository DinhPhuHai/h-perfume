import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { api } from '../api/client';
import './Header.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const results = await api.searchProducts(searchQuery);
        setSearchResults(results);
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          {/* Logo */}
          <Link to="/" className="logo">
            <img src="/logo-hperfume.png" alt="H Perfume" className="logo-img" />
          </Link>

          {/* Desktop Nav */}
          <nav className="nav-desktop">
            <Link to="/" className="nav-link">Trang chủ</Link>
            <Link to="/shop" className="nav-link">Cửa hàng</Link>
            <Link to="/shop?gender=Nữ" className="nav-link">Nữ</Link>
            <Link to="/shop?gender=Nam" className="nav-link">Nam</Link>
            <Link to="/shop?gender=Unisex" className="nav-link">Unisex</Link>
          </nav>

          {/* Actions */}
          <div className="header-actions">
            {/* Search */}
            <div className={`search-wrapper ${searchOpen ? 'open' : ''}`} ref={searchRef}>
              <button className="icon-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
                <Search size={20} />
              </button>
              {searchOpen && (
                <div className="search-dropdown">
                  <input
                    className="search-input"
                    type="text"
                    placeholder="Tìm nước hoa, brand, nhóm hương..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  {searchResults.length > 0 && (
                    <div className="search-results">
                      {searchResults.map(p => (
                        <Link
                          key={p.id}
                          to={`/product/${p.id}`}
                          className="search-result-item"
                          onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        >
                          <div className="sri-brand">{p.brand}</div>
                          <div className="sri-name">{p.name}</div>
                          <div className="sri-price">{new Intl.NumberFormat('vi-VN').format(p.price)}đ</div>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchQuery.length >= 2 && searchResults.length === 0 && (
                    <div className="search-empty">Không tìm thấy kết quả cho "{searchQuery}"</div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu */}
            <button className="icon-btn mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Trang chủ</Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)}>Cửa hàng</Link>
            <Link to="/shop?gender=Nữ" onClick={() => setMobileMenuOpen(false)}>Nước hoa Nữ</Link>
            <Link to="/shop?gender=Nam" onClick={() => setMobileMenuOpen(false)}>Nước hoa Nam</Link>
            <Link to="/shop?gender=Unisex" onClick={() => setMobileMenuOpen(false)}>Unisex</Link>
          </div>
        )}
      </header>
    </>
  );
}
