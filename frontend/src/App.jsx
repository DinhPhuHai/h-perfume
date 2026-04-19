import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import ChatWidget from './components/ChatWidget';
import Admin from './pages/Admin';
import './styles/global.css';

// ⚙️  BẬT / TẮT TRANG ADMIN
// true  = Admin bật  (vào /admin để quản lý sản phẩm)
// false = Admin tắt  (route /admin sẽ chuyển hướng về trang chủ)
const ADMIN_ENABLED = true;

export default function App() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const revealEls = document.querySelectorAll('.reveal');
    revealEls.forEach((el) => observer.observe(el));

    const mutationObs = new MutationObserver(() => {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
        observer.observe(el);
      });
    });
    mutationObs.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObs.disconnect();
    };
  }, []);

  return (
    <BrowserRouter>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          {/* ══ Trang Admin — bật/tắt bằng biến ADMIN_ENABLED bên trên ══ */}
          {ADMIN_ENABLED ? (
            <Route path="/admin" element={<Admin />} />
          ) : (
            <Route path="/admin" element={<Navigate to="/" replace />} />
          )}

          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <ChatWidget />
    </BrowserRouter>
  );
}
