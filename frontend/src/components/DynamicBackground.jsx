import { useEffect, useState } from 'react';
import './DynamicBackground.css';

export default function DynamicBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Chỉ chạy hiệu ứng trên màn hình máy tính (tránh giật lag trên điện thoại)
    if (window.matchMedia("(max-width: 768px)").matches) return;

    const handleMouseMove = (e) => {
      // Chuẩn hóa toạ độ chuột từ -1 (trái/trên cùng) đến 1 (phải/dưới cùng) screen
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="dynamic-bg">
      <div 
        className="orb orb-1"
        style={{ transform: `translate(${mousePos.x * 140}px, ${mousePos.y * 140}px)` }}
      ></div>
      <div 
        className="orb orb-2"
        style={{ transform: `translate(${mousePos.x * -110}px, ${mousePos.y * -110}px)` }}
      ></div>
      <div 
        className="orb orb-3"
        style={{ transform: `translate(${mousePos.x * 70}px, ${mousePos.y * -90}px)` }}
      ></div>
      <div className="noise-overlay"></div>
    </div>
  );
}
