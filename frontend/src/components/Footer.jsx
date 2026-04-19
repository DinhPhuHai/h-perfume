import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/logo-hperfume.png" alt="H Perfume" className="footer-logo-img" />
          <p className="footer-tagline">
            Authentic 100% | Cam kết chính hãng<br />
            Tuyển chọn 60+ mùi hương thịnh hành<br />
            Chiết trải nghiệm &amp; Fullbox sang trọng
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
            <a href="#" aria-label="Email"><Mail size={18} /></a>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Cửa hàng</h4>
            <Link to="/shop">Tất cả sản phẩm</Link>
            <Link to="/shop?gender=Nữ">Nước hoa Nữ</Link>
            <Link to="/shop?gender=Nam">Nước hoa Nam</Link>
            <Link to="/shop?gender=Unisex">Unisex</Link>
            <Link to="/shop?is_tester=1">Tester giảm giá</Link>
          </div>
          <div className="footer-col">
            <h4>Hỗ trợ</h4>
            <Link to="#">Chính sách đổi trả</Link>
            <Link to="#">Hướng dẫn mua hàng</Link>
            <Link to="#">Câu hỏi thường gặp</Link>
            <Link to="#">Liên hệ</Link>
          </div>
          <div className="footer-col">
            <h4>Liên hệ</h4>
            <span><MapPin size={14} /> TP. Hồ Chí Minh</span>
            <span><Phone size={14} /> 0777 7899 84</span>
            <span><Mail size={14} /> hello@hperfume.vn</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 H PERFUME. All rights reserved.</p>
        <p className="footer-note">Mỹ phẩm chính hãng 100% • Cam kết authentic</p>
      </div>
    </footer>
  );
}