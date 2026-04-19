const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'perfume.db'));

// Create tables (no users, no orders — Zalo handles order flow)
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    original_price INTEGER,
    size TEXT,
    category TEXT,
    gender TEXT NOT NULL,
    notes_top TEXT,
    notes_heart TEXT,
    notes_base TEXT,
    featured INTEGER DEFAULT 0,
    is_tester INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 10,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migrate: add image column if missing (for existing DBs)
try { db.exec("ALTER TABLE products ADD COLUMN image TEXT"); } catch {}

// Seed data
const seedProducts = [
  // Kilian
  { name: "Good Girl Gone Bad EDP", brand: "Kilian", price: 800000, size: "10ml", gender: "Nữ", category: "Floral", notes_top: "Hoa Nhài", notes_heart: "Hoa Huệ", notes_base: "Mộc Tê", is_tester: 0, featured: 1 },
  // YSL
  { name: "Libre Vanille Couture EDP Limited", brand: "YSL", price: 2600000, size: "50ml", gender: "Nữ", category: "Floral Amber", notes_top: "Oải hương", notes_heart: "Hoa Cam", notes_base: "Vani Madagascar", is_tester: 0, featured: 1 },
  // Montblanc
  { name: "Lady Emblem EDP", brand: "Montblanc", price: 720000, size: "75ml", gender: "Nữ", category: "Floral Fruity", notes_top: "Quả mâm xôi", notes_heart: "Hoa hồng", notes_base: "Xạ hương", is_tester: 0, featured: 0 },
  // Narciso Rodriguez
  { name: "Ambrée EDP", brand: "Narciso Rodriguez", price: 1420000, size: "90ml", gender: "Nữ", category: "Amber Floral", notes_top: "Hoa sứ", notes_heart: "Ngọc lan tây", notes_base: "Xạ hương", is_tester: 0, featured: 0 },
  // Diptyque
  { name: "Fleur de Peau EDP", brand: "Diptyque", price: 3500000, size: "75ml", gender: "Unisex", category: "Amber Woody", notes_top: "Xạ hương", notes_heart: "Diên vĩ", notes_base: "Tiêu hồng", is_tester: 0, featured: 1 },
  // Narciso Rodriguez
  { name: "For Him Vetiver Musc EDT", brand: "Narciso Rodriguez", price: 1200000, size: "100ml", gender: "Nam", category: "Aromatic Woody", notes_top: "Cỏ hương bài", notes_heart: "Xạ hương", notes_base: "Tuyết tùng", is_tester: 0, featured: 0 },
  // Gucci
  { name: "Flora Gorgeous Gardenia EDP", brand: "Gucci", price: 1800000, size: "100ml", gender: "Nữ", category: "Floral", notes_top: "Quả lê", notes_heart: "Hoa Gardenia", notes_base: "Đường nâu", is_tester: 0, featured: 0 },
  // Lancome
  { name: "Miniature Set (5 chai)", brand: "Lancôme", price: 1500000, size: "Set mini", gender: "Nữ", category: "Set", notes_top: "Hoa hồng", notes_heart: "Hoa nhài", notes_base: "Xạ hương", is_tester: 0, featured: 1 },
  // Marc Jacobs
  { name: "Daisy Dream EDT", brand: "Marc Jacobs", price: 1200000, size: "30ml", gender: "Nữ", category: "Floral Fruity", notes_top: "Quả việt quất", notes_heart: "Hoa daisy", notes_base: "Gỗ tuyết tùng", is_tester: 0, featured: 0 },
  { name: "Daisy Love Eau So Sweet EDT", brand: "Marc Jacobs", price: 1400000, size: "50ml", gender: "Nữ", category: "Floral Fruity", notes_top: "Quả anh đào", notes_heart: "Hoa daisy", notes_base: "Đường", is_tester: 0, featured: 0 },
  { name: "Daisy Love", brand: "Marc Jacobs", price: 1400000, size: "50ml", gender: "Nữ", category: "Floral Fruity", notes_top: "Quả mâm xôi", notes_heart: "Hoa daisy", notes_base: "Vani", is_tester: 0, featured: 0 },
  // Hermes
  { name: "Twilly d'Hermès EDP", brand: "Hermès", price: 2200000, size: "85ml", gender: "Nữ", category: "Oriental Floral", notes_top: "Gừng", notes_heart: "Hoa nhài", notes_base: "Đàn hương", is_tester: 0, featured: 1 },
  // Burberry
  { name: "London For Women EDP", brand: "Burberry", price: 770000, size: "100ml", gender: "Nữ", category: "Floral", notes_top: "Hoa nhài", notes_heart: "Hoa kim ngân", notes_base: "Quýt", is_tester: 0, featured: 0 },
  // Parfums de Marly
  { name: "Delina EDP", brand: "Parfums de Marly", price: 4450000, size: "75ml", gender: "Nữ", category: "Floral Rose", notes_top: "Hoa hồng Thổ Nhĩ Kỳ", notes_heart: "Quả vải", notes_base: "Vani", is_tester: 0, featured: 1 },
  // Thomas Kosmala
  { name: "No 4 Après l'Amour EDP", brand: "Thomas Kosmala", price: 1650000, size: "100ml", gender: "Unisex", category: "Amber", notes_top: "Vỏ chanh vàng", notes_heart: "Hổ phách", notes_base: "Xạ hương", is_tester: 0, featured: 0 },
  // Roja Parfums
  { name: "Elysium Pour Homme", brand: "Roja Parfums", price: 3400000, size: "100ml", gender: "Nam", category: "Aromatic Woody", notes_top: "Quả bưởi", notes_heart: "Cỏ hương bài", notes_base: "Long diên hương", is_tester: 0, featured: 0 },
  // Narciso Rodriguez
  { name: "Rouge EDP (Lùn Đỏ)", brand: "Narciso Rodriguez", price: 2100000, size: "50ml", gender: "Nữ", category: "Amber Floral", notes_top: "Diên vĩ", notes_heart: "Hoa hồng", notes_base: "Xạ hương", is_tester: 0, featured: 0 },
  // Jo Malone
  { name: "English Pear & Freesia", brand: "Jo Malone", price: 2100000, size: "100ml", gender: "Nữ", category: "Floral Fruity", notes_top: "Quả lê", notes_heart: "Hoa lan Nam Phi", notes_base: "Hoắc hương", is_tester: 0, featured: 1 },
  // Chanel
  { name: "Coco Mademoiselle EDP", brand: "Chanel", price: 5800000, size: "200ml", gender: "Nữ", category: "Oriental Floral", notes_top: "Quả cam", notes_heart: "Hoa hồng", notes_base: "Hoắc hương", is_tester: 0, featured: 1 },
  { name: "Bleu de Chanel EDP", brand: "Chanel", price: 4000000, size: "150ml", gender: "Nam", category: "Aromatic Woody", notes_top: "Quả bưởi", notes_heart: "Gừng", notes_base: "Gỗ tuyết tùng", is_tester: 0, featured: 1 },
  { name: "Bleu de Chanel PARFUM", brand: "Chanel", price: 4450000, size: "150ml", gender: "Nam", category: "Aromatic Woody", notes_top: "Quả bưởi", notes_heart: "Gừng", notes_base: "Gỗ tuyết tùng", is_tester: 0, featured: 0 },
  // Dior
  { name: "Sauvage EDP", brand: "Dior", price: 2870000, size: "100ml", gender: "Nam", category: "Aromatic Spicy", notes_top: "Cam Bergamot", notes_heart: "Tiêu", notes_base: "Ambroxan", is_tester: 0, featured: 1 },
  // Diptyque
  { name: "L'Eau Papier EDT", brand: "Diptyque", price: 3100000, size: "100ml", gender: "Unisex", category: "Woody", notes_top: "Xạ hương trắng", notes_heart: "Gạo rang", notes_base: "Mimosa", is_tester: 0, featured: 0 },
  // Tom Ford
  { name: "Velvet Orchid EDP", brand: "Tom Ford", price: 2500000, size: "100ml", gender: "Nữ", category: "Oriental Floral", notes_top: "Mật ong", notes_heart: "Rượu Rum", notes_base: "Phong lan đen", is_tester: 0, featured: 1 },
  // Parfums de Marly
  { name: "Valaya Exclusif", brand: "Parfums de Marly", price: 5350000, size: "75ml", gender: "Nữ", category: "Floral Amber", notes_top: "Quả đào", notes_heart: "Hoa cam", notes_base: "Xạ hương trắng", is_tester: 0, featured: 0 },
  // Louis Vuitton
  { name: "Ombre Nomade EDP", brand: "Louis Vuitton", price: 9500000, size: "100ml", gender: "Unisex", category: "Oriental Woody", notes_top: "Gỗ trầm hương (Oud)", notes_heart: "Hoa hồng", notes_base: "Nhang", is_tester: 0, featured: 1 },
  // Versace Tester
  { name: "Bright Crystal EDT (Tester)", brand: "Versace", price: 860000, original_price: 1500000, size: "90ml", gender: "Nữ", category: "Floral Fresh", notes_top: "Quả Yuzu", notes_heart: "Lựu", notes_base: "Hoa mẫu đơn", is_tester: 1, featured: 0 },
  { name: "Pour Homme EDT (Tester)", brand: "Versace", price: 790000, original_price: 1300000, size: "100ml", gender: "Nam", category: "Aromatic Fresh", notes_top: "Chanh vàng", notes_heart: "Hoa lan dạ hương", notes_base: "Tonka", is_tester: 1, featured: 0 },
  { name: "Dylan Blue Pour Homme (Tester)", brand: "Versace", price: 1230000, original_price: 1800000, size: "100ml", gender: "Nam", category: "Aromatic Aquatic", notes_top: "Bưởi", notes_heart: "Hương nước", notes_base: "Nhang, Tiêu đen", is_tester: 1, featured: 0 },
  { name: "Crystal Noir EDT (Tester)", brand: "Versace", price: 880000, original_price: 1600000, size: "90ml", gender: "Nữ", category: "Oriental Spicy", notes_top: "Gừng", notes_heart: "Quả dừa", notes_base: "Tiêu, Hoa sơn chi", is_tester: 1, featured: 0 },
  { name: "Eros Pour Homme EDT (Tester)", brand: "Versace", price: 900000, original_price: 1600000, size: "100ml", gender: "Nam", category: "Fresh Woody", notes_top: "Bạc hà", notes_heart: "Táo xanh", notes_base: "Vani, Đậu Tonka", is_tester: 1, featured: 1 },
  { name: "Bright Crystal Absolu EDP (Tester)", brand: "Versace", price: 1000000, original_price: 1800000, size: "90ml", gender: "Nữ", category: "Floral Fruity", notes_top: "Quả mâm xôi", notes_heart: "Hoa mẫu đơn", notes_base: "Quả Yuzu", is_tester: 1, featured: 0 },
  { name: "Eros Pour Homme EDT", brand: "Versace", price: 1800000, size: "100ml", gender: "Nam", category: "Fresh Woody", notes_top: "Bạc hà", notes_heart: "Táo xanh", notes_base: "Vani, Đậu Tonka", is_tester: 0, featured: 0 },
  { name: "Bright Crystal EDT", brand: "Versace", price: 1600000, size: "90ml", gender: "Nữ", category: "Floral Fresh", notes_top: "Quả Yuzu", notes_heart: "Lựu", notes_base: "Hoa mẫu đơn", is_tester: 0, featured: 0 },
  // Kenzo
  { name: "Flower by Kenzo EDP", brand: "Kenzo", price: 1800000, size: "50ml", gender: "Nữ", category: "Floral", notes_top: "Hoa mận", notes_heart: "Hoa nhài", notes_base: "Hổ phách", is_tester: 0, featured: 1 },
  // Bvlgari
  { name: "Man In Black EDP", brand: "Bvlgari", price: 3200000, size: "100ml", gender: "Nam", category: "Oriental Spicy", notes_top: "Cam Bergamot", notes_heart: "Đại hoàng", notes_base: "Gỗ trầm hương", is_tester: 0, featured: 0 },
  // Dior
  { name: "Homme Intense EDP", brand: "Dior", price: 3600000, size: "150ml", gender: "Nam", category: "Woody Iris", notes_top: "Iris", notes_heart: "Vani bourbon", notes_base: "Cedarwood", is_tester: 0, featured: 0 },
  // Lancome
  { name: "Trésor L'Eau de Parfum", brand: "Lancôme", price: 2400000, size: "100ml", gender: "Nữ", category: "Floral Amber", notes_top: "Hoa hồng", notes_heart: "Iris", notes_base: "Đào", is_tester: 0, featured: 0 },
  // Maison Margiela
  { name: "Replica Jazz Club EDT", brand: "Maison Margiela", price: 2800000, size: "100ml", gender: "Nam", category: "Aromatic Spicy", notes_top: "Rum", notes_heart: "Đường cháy", notes_base: "Tobacco leaf", is_tester: 0, featured: 1 },
  // MCM
  { name: "Eau de Parfum (Chai Balo)", brand: "MCM", price: 1900000, size: "75ml", gender: "Unisex", category: "Aromatic Woody", notes_top: "Cam Bergamot", notes_heart: "Lavender", notes_base: "Cedarwood", is_tester: 0, featured: 0 },
  // Narciso Rodriguez
  { name: "Poudrée EDP", brand: "Narciso Rodriguez", price: 1600000, size: "90ml", gender: "Nữ", category: "Amber Floral", notes_top: "Hoa hồng", notes_heart: "Peony", notes_base: "Xạ hương", is_tester: 0, featured: 0 },
  // YSL
  { name: "Libre Parfum De Peau (L'Eau Nue)", brand: "YSL", price: 3200000, size: "50ml", gender: "Nữ", category: "Floral Amber", notes_top: "Cam Bergamot", notes_heart: "Lavender", notes_base: "Vani", is_tester: 0, featured: 0 },
  // Louis Vuitton
  { name: "California Dream EDP", brand: "Louis Vuitton", price: 4200000, size: "100ml", gender: "Unisex", category: "Citrus Aromatic", notes_top: "Cam đắng", notes_heart: "Hoa nhài", notes_base: "Ambroxan", is_tester: 0, featured: 0 },
  // Liquides Imaginaires
  { name: "Blanche Bête EDP", brand: "Liquides Imaginaires", price: 2900000, size: "100ml", gender: "Unisex", category: "Aromatic Lactonic", notes_top: "Sữa", notes_heart: "Hoa bưởi", notes_base: "Coconut", is_tester: 0, featured: 0 },
  // Gucci
  { name: "Flora Gorgeous Magnolia EDP", brand: "Gucci", price: 2000000, size: "30ml", gender: "Nữ", category: "Floral", notes_top: "Cam đỏ", notes_heart: "Hoa Magnolia", notes_base: "Gỗ tuyết tùng", is_tester: 0, featured: 0 },
  // Jo Malone
  { name: "Peony & Blush Suede Cologne", brand: "Jo Malone", price: 2300000, size: "100ml", gender: "Nữ", category: "Floral", notes_top: "Quả đào", notes_heart: "Hoa peony đỏ", notes_base: "Da lộn", is_tester: 0, featured: 1 },
  // Dior Addict
  { name: "Addict Peachy Glow EDP", brand: "Dior", price: 3200000, size: "100ml", gender: "Nữ", category: "Floral Fruity", notes_top: "Đào", notes_heart: "Hoa cam", notes_base: "Vani", is_tester: 0, featured: 0 },
  { name: "Addict Rosy Glow EDP", brand: "Dior", price: 3200000, size: "100ml", gender: "Nữ", category: "Floral Rose", notes_top: "Hoa hồng", notes_heart: "Quả litchi", notes_base: "Vani", is_tester: 0, featured: 0 },
  { name: "Addict Purple Glow EDP", brand: "Dior", price: 3200000, size: "100ml", gender: "Nữ", category: "Floral", notes_top: "Quả mâm xôi", notes_heart: "Hoa nhài", notes_base: "Xạ hương", is_tester: 0, featured: 0 },
  // Narciso Tester
  { name: "Radiante EDP (Tester)", brand: "Narciso Rodriguez", price: 980000, original_price: 1800000, size: "90ml", gender: "Nữ", category: "Amber Floral", notes_top: "Hoa bưởi", notes_heart: "Hoa hồng", notes_base: "Xạ hương", is_tester: 1, featured: 0 },
  { name: "For Her EDP Intense (Tester)", brand: "Narciso Rodriguez", price: 1200000, original_price: 2200000, size: "100ml", gender: "Nữ", category: "Amber Woody", notes_top: "Cam đỏ", notes_heart: "Hoa nhài", notes_base: "Vani bourbon", is_tester: 1, featured: 0 },
  // Dolce & Gabbana
  { name: "The One For Men EDP Intense", brand: "Dolce & Gabbana", price: 2800000, size: "100ml", gender: "Nam", category: "Oriental Woody", notes_top: "Cam Bergamot", notes_heart: "Gừng", notes_base: "Gỗ tuyết tùng", is_tester: 0, featured: 0 },
  // Bentley
  { name: "For Men Intense EDP", brand: "Bentley", price: 1900000, size: "100ml", gender: "Nam", category: "Aromatic Woody", notes_top: "Cam đỏ", notes_heart: "Hoắc hương", notes_base: "Gỗ trầm hương", is_tester: 0, featured: 0 },
  // Montblanc
  { name: "Legend EDT", brand: "Montblanc", price: 1700000, size: "200ml", gender: "Nam", category: "Aromatic Fougere", notes_top: "Cam đỏ", notes_heart: "Lavender", notes_base: "Xạ hương", is_tester: 0, featured: 0 },
  // Hermes
  { name: "Terre d'Hermès Eau Intense Vétiver", brand: "Hermès", price: 3800000, size: "100ml", gender: "Nam", category: "Woody Aromatic", notes_top: "Cam đỏ", notes_heart: "Vetiver", notes_base: "Gỗ tuyết tùng", is_tester: 0, featured: 1 },
  // Dior Miss Dior
  { name: "ESSENCE", brand: "Dior", price: 3500000, size: "50ml", gender: "Nữ", category: "Floral Rose", notes_top: "Hoa hồng", notes_heart: "Hoa nhài", notes_base: "Đàn hương", is_tester: 0, featured: 1 },
  // Burberry Tester
  { name: "My Burberry EDP (Tester)", brand: "Burberry", price: 1500000, original_price: 2800000, size: "90ml", gender: "Nữ", category: "Floral Fresh", notes_top: "Quả lê", notes_heart: "Hoa tử đan hà", notes_base: "Gỗ tuyết tùng", is_tester: 1, featured: 0 },
  // Jimmy Choo
  { name: "I Want Choo EDP (Tester)", brand: "Jimmy Choo", price: 1300000, original_price: 2500000, size: "125ml", gender: "Nữ", category: "Floral Fruity", notes_top: "Cam đỏ", notes_heart: "Hoa nhài", notes_base: "Vani", is_tester: 1, featured: 0 },
  // YSL Tester
  { name: "Black Opium EDP (Tester)", brand: "YSL", price: 1800000, original_price: 3000000, size: "90ml", gender: "Nữ", category: "Oriental Vanilla", notes_top: "Coffee", notes_heart: "Hoa nhài", notes_base: "Vani, Đường", is_tester: 1, featured: 1 },
  // Gucci Tester
  { name: "Flora Gorgeous Gardenia Intense EDP (Tester)", brand: "Gucci", price: 1900000, original_price: 3200000, size: "100ml", gender: "Nữ", category: "Floral", notes_top: "Quả lê", notes_heart: "Hoa Gardenia", notes_base: "Đường nâu", is_tester: 1, featured: 0 },
  // YSL
  { name: "MYSLF L'Absolu (Tester)", brand: "YSL", price: 2100000, original_price: 3500000, size: "100ml", gender: "Nam", category: "Aromatic Woody", notes_top: "Bergamot", notes_heart: "Cardamom", notes_base: "Vetiver", is_tester: 1, featured: 0 },
  // Dior
  { name: "Rose N'Roses EDT (Tester)", brand: "Dior", price: 1800000, original_price: 3200000, size: "100ml", gender: "Nữ", category: "Floral Rose", notes_top: "Cam đỏ", notes_heart: "Hoa hồng", notes_base: "Xạ hương trắng", is_tester: 1, featured: 0 },
  // Narciso
  { name: "Pure Musc For Her EDP (Tester)", brand: "Narciso Rodriguez", price: 900000, original_price: 1600000, size: "100ml", gender: "Nữ", category: "Musk Floral", notes_top: "Hoa bưởi", notes_heart: "Peony", notes_base: "Xạ hương trắng", is_tester: 1, featured: 0 },
];

const insertProduct = db.prepare(`
  INSERT INTO products (name, brand, description, price, original_price, size, gender, category, notes_top, notes_heart, notes_base, featured, is_tester, stock)
  VALUES (@name, @brand, @description, @price, @original_price, @size, @gender, @category, @notes_top, @notes_heart, @notes_base, @featured, @is_tester, @stock)
`);

const checkProducts = db.prepare("SELECT COUNT(*) as count FROM products");
const count = checkProducts.get().count;
if (count === 0) {
  const insertMany = db.transaction((products) => {
    for (const p of products) {
      insertProduct.run({
        name: p.name,
        brand: p.brand,
        description: `${p.brand} ${p.name} — Nước hoa cao cấp, chai ${p.size}, phù hợp giới ${p.gender === 'Nữ' ? 'nữ' : p.gender === 'Nam' ? 'nam' : 'cả hai'}. Hương thơm đặc trưng với nốt hương đầu ${p.notes_top}, nốt giữa ${p.notes_heart} và nốt cuối ${p.notes_base}.`,
        price: p.price,
        original_price: p.original_price || null,
        size: p.size,
        gender: p.gender,
        category: p.category,
        notes_top: p.notes_top,
        notes_heart: p.notes_heart,
        notes_base: p.notes_base,
        featured: p.featured || 0,
        is_tester: p.is_tester || 0,
        stock: 10,
      });
    }
  });
  insertMany(seedProducts);
  console.log(`Seeded ${seedProducts.length} products.`);
}

module.exports = db;
