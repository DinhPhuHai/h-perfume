import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Truck, Award } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProductCard from '../components/ProductCard';
import PerfumeScene3D from '../components/PerfumeScene3D';
import ParticleCanvas from '../components/ParticleCanvas';
import { api } from '../api/client';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

const BRANDS = ['Chanel', 'Dior', 'YSL', 'Tom Ford', 'Louis Vuitton', 'Gucci', 'Versace', 'Jo Malone', 'Narciso Rodriguez', 'Parfums de Marly', 'Hermès', 'Diptyque', 'Kilian', 'Bvlgari', 'Lancôme', 'Kenzo'];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [heroReady, setHeroReady] = useState(false);
  const sceneRef = useRef({});
  const wrapRef = useRef(null);

  useEffect(() => {
    api.getFeatured().then(setFeatured).catch(() => {});
    requestAnimationFrame(() => requestAnimationFrame(() => setHeroReady(true)));
  }, []);

  // ── Master GSAP scroll timeline ──
  useEffect(() => {
    let ctx;
    let checkId;

    const setup = () => {
      const s = sceneRef.current;
      if (!s.bottle || !s.camera) return;
      clearInterval(checkId);

      ctx = gsap.context(() => {
        const bottle = s.bottle;
        const camera = s.camera;
        const goldPt = s.goldPt;
        const keyLight = s.keyLight;
        const dust = s.dust;

        // ── SINGLE MASTER TIMELINE for all 3D transforms ──
        // trigger = the entire story area (sections 1-4)
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: '.story-wrap',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,        // <-- snappier (was 1.5)
            invalidateOnRefresh: true,
          },
        });

        // Phase 1 (0–25%): Hero — ultra slow spin
        tl.to(bottle.rotation, { y: Math.PI * 0.15, ease: 'none', duration: 25 }, 0);

        // Phase 2 (25–50%): Slide right + camera orbit
        tl.to(bottle.position, { x: 2.0, ease: 'power2.inOut', duration: 25 }, 25);
        tl.to(bottle.rotation, { x: 0.1, ease: 'power2.inOut', duration: 25 }, 25);
        tl.to(camera.position, { x: 1.0, z: 4.2, ease: 'power2.inOut', duration: 25 }, 25);

        // Phase 3 (50–75%): Slide left + zoom in + glow
        tl.to(bottle.position, { x: -1.8, ease: 'power2.inOut', duration: 25 }, 50);
        tl.to(bottle.scale, { x: 1.35, y: 1.35, z: 1.35, ease: 'power2.inOut', duration: 25 }, 50);
        tl.to(camera.position, { x: -0.5, z: 3.5, y: 0.55, ease: 'power2.inOut', duration: 25 }, 50);
        tl.to(goldPt, { intensity: 10, duration: 25 }, 50);

        // Phase 4 (75–100%): Center + zoom + dramatic
        tl.to(bottle.position, { x: 0, ease: 'power2.inOut', duration: 25 }, 75);
        tl.to(bottle.scale, { x: 1.7, y: 1.7, z: 1.7, ease: 'power2.inOut', duration: 25 }, 75);
        tl.to(bottle.rotation, { y: 0, x: 0, ease: 'power2.inOut', duration: 25 }, 75);
        tl.to(camera.position, { x: 0, z: 2.8, y: 0.4, ease: 'power2.inOut', duration: 25 }, 75);
        tl.to(keyLight, { intensity: 14, duration: 25 }, 75);
        tl.to(dust.material, { opacity: 0.6, duration: 25 }, 75);

        // ── Hero content fade out on scroll ──
        gsap.to('.hero-content', {
          opacity: 0,
          y: -80,
          filter: 'blur(8px)',
          ease: 'power2.in',
          scrollTrigger: {
            trigger: '.scroll-s1',
            start: 'top top',
            end: '60% top',
            scrub: 0.4,
          },
        });

        // Scroll cue disappears fast
        gsap.to('.scroll-cue', {
          opacity: 0,
          scrollTrigger: {
            trigger: '.scroll-s1',
            start: '5% top',
            end: '20% top',
            scrub: 0.3,
          },
        });

        // ── Story text reveals ──
        gsap.utils.toArray('.story-panel').forEach((panel) => {
          // Fade in with blur
          gsap.fromTo(panel,
            { opacity: 0, y: 80, filter: 'blur(6px)' },
            {
              opacity: 1, y: 0, filter: 'blur(0px)',
              ease: 'power3.out',
              scrollTrigger: {
                trigger: panel,
                start: 'top 85%',
                end: 'top 45%',
                scrub: 0.4,
              },
            }
          );
          // Fade out with blur
          gsap.to(panel, {
            opacity: 0, y: -50, filter: 'blur(6px)',
            ease: 'power2.in',
            scrollTrigger: {
              trigger: panel,
              start: 'bottom 55%',
              end: 'bottom 25%',
              scrub: 0.4,
            },
          });
        });

      }, wrapRef);
    };

    checkId = setInterval(() => setup(), 100);

    return () => {
      clearInterval(checkId);
      if (ctx) ctx.revert();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div className="home-scroll" ref={wrapRef}>

      {/* Fixed layers */}
      <PerfumeScene3D sceneRef={sceneRef} />
      <div className="particles-fixed"><ParticleCanvas /></div>
      <div className="scroll-vignette" />

      {/* ═══ STORY SECTIONS — scroll-driven ═══ */}
      <div className="story-wrap">

        {/* S1: Hero */}
        <section className="story-section scroll-s1">
          <div className={`hero-content ${heroReady ? 'in' : ''}`}>
            <p className="hero-tagline h-item">
              <span className="dot" />
              Authentic 100% &nbsp;·&nbsp; Hơn 60+ thương hiệu
              <span className="dot" />
            </p>
            <h1 className="hero-heading h-item">
              <span className="hh-line hh-white">Your Scent,</span>
              <span className="hh-line hh-gold">Your Story.</span>
            </h1>
            <p className="hero-sub h-item">
              Mỗi giọt hương là một câu chuyện — từ Chanel, Dior, Tom Ford
              đến Louis Vuitton.
            </p>
            <div className="hero-btns h-item">
              <Link to="/shop" className="hero-btn-primary">
                <span>Khám phá BST</span><ArrowRight size={15} />
                <div className="btn-shimmer" />
              </Link>
              <Link to="/shop?is_tester=1" className="hero-btn-ghost">Tester giảm giá</Link>
            </div>
          </div>
          <div className={`scroll-cue ${heroReady ? 'in' : ''}`}>
            <div className="scroll-track"><div className="scroll-thumb" /></div>
            <span>Cuộn để khám phá</span>
          </div>
        </section>

        {/* S2: The Craft */}
        <section className="story-section scroll-s2">
          <div className="story-panel left">
            <p className="story-label">— Nghệ thuật —</p>
            <h2 className="story-heading">Hương Thơm<br/>Đích Thực</h2>
            <p className="story-body">
              Mỗi chai nước hoa là một tác phẩm nghệ thuật — được chế tác
              bởi những nhà pha chế hàng đầu thế giới.
            </p>
          </div>
        </section>

        {/* S3: Trust */}
        <section className="story-section scroll-s3">
          <div className="story-panel right">
            <p className="story-label">— Cam kết —</p>
            <h2 className="story-heading">100%<br/>Authentic</h2>
            <p className="story-body">
              Cam kết từng sản phẩm đều là hàng chính hãng — đổi trả 7 ngày
              nếu không hài lòng.
            </p>
            <div className="trust-badges-inline" style={{ marginTop: 24 }}>
              <div className="tbi"><Shield size={16} /><span>Đổi trả 7 ngày</span></div>
              <div className="tbi"><Truck size={16} /><span>Giao toàn quốc</span></div>
              <div className="tbi"><Award size={16} /><span>Chính hãng 100%</span></div>
            </div>
          </div>
        </section>

        {/* S4: Collections */}
        <section className="story-section scroll-s4">
          <div className="story-panel center">
            <p className="story-label">— Bộ sưu tập —</p>
            <h2 className="story-heading">Nổi Bật</h2>
            <p className="story-body" style={{ margin: '0 auto' }}>
              Những mùi hương được yêu thích nhất.
            </p>
          </div>
        </section>
      </div>

      {/* ═══ NORMAL SECTIONS ═══ */}
      <div className="normal-sections">
        <section className="sec-featured container">
          <div className="feat-grid">
            {featured.slice(0, 4).map((p, i) => (
              <div key={p.id} className="feat-card-wrap" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          <div className="sec-action">
            <Link to="/shop" className="hero-btn-ghost">Xem tất cả <ArrowRight size={14} /></Link>
          </div>
        </section>

        <section className="sec-brands">
          <div className="container">
            <div className="sec-head">
              <p className="sec-label">— Thế giới nước hoa —</p>
              <h2 className="sec-title">Thương Hiệu</h2>
            </div>
          </div>
          <div className="mq-container">
            <div className="mq-track">
              {[...BRANDS, ...BRANDS].map((b, i) => (
                <Link key={`a${i}`} to={`/shop?brand=${encodeURIComponent(b)}`} className="mq-chip">{b}</Link>
              ))}
            </div>
          </div>
          <div className="mq-container reverse">
            <div className="mq-track">
              {[...BRANDS.slice().reverse(), ...BRANDS.slice().reverse()].map((b, i) => (
                <Link key={`b${i}`} to={`/shop?brand=${encodeURIComponent(b)}`} className="mq-chip">{b}</Link>
              ))}
            </div>
          </div>
        </section>

        <section className="sec-about">
          <div className="about-grid container">
            <div className="about-left">
              <p className="sec-label">— Về chúng tôi —</p>
              <h2 className="about-heading">H Perfume</h2>
              <p className="about-text">
                Không chỉ bán nước hoa — H PERFUME là điểm đến cho những ai tìm
                kiếm <em>sự đặc biệt và hương thơm đích thực</em>.
              </p>
              <Link to="/shop" className="hero-btn-primary" style={{ marginTop: 16 }}>
                <span>Khám phá ngay</span><ArrowRight size={15} /><div className="btn-shimmer" />
              </Link>
            </div>
            <div className="about-right">
              <div className="stat-grid">
                <div className="stat-box"><div className="stat-num gradient-text">63+</div><div className="stat-lbl">Sản phẩm</div></div>
                <div className="stat-box"><div className="stat-num gradient-text">25+</div><div className="stat-lbl">Thương hiệu</div></div>
                <div className="stat-box"><div className="stat-num gradient-text">500+</div><div className="stat-lbl">Khách hàng</div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec-nl container">
          <div className="nl-card">
            <Sparkles size={22} className="nl-icon" />
            <h3>Đăng ký nhận tin</h3>
            <p>Khuyến mãi, sản phẩm mới và tips chọn nước hoa.</p>
            <form className="nl-form" onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="Nhập email của bạn..." />
              <button type="submit" className="shimmer-btn">Đăng ký <ArrowRight size={14} /></button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}