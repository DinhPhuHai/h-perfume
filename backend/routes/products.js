const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/products — list with filter, sort, pagination, search
router.get('/', (req, res) => {
  const { q, brand, gender, category, minPrice, maxPrice, sort, is_tester, page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = [];
  let params = {};

  if (q) {
    where.push(`(name LIKE @q OR brand LIKE @q OR category LIKE @q OR notes_top LIKE @q OR notes_heart LIKE @q OR notes_base LIKE @q)`);
    params.q = `%${q}%`;
  }
  if (brand) {
    where.push(`brand = @brand`);
    params.brand = brand;
  }
  if (gender) {
    where.push(`gender = @gender`);
    params.gender = gender;
  }
  if (category) {
    where.push(`category LIKE @category`);
    params.category = `%${category}%`;
  }
  if (is_tester) {
    where.push(`is_tester = @is_tester`);
    params.is_tester = parseInt(is_tester);
  }
  if (minPrice) {
    where.push(`price >= @minPrice`);
    params.minPrice = parseInt(minPrice);
  }
  if (maxPrice) {
    where.push(`price <= @maxPrice`);
    params.maxPrice = parseInt(maxPrice);
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  const sortMap = {
    price_asc: 'price ASC',
    price_desc: 'price DESC',
    newest: 'created_at DESC',
    popular: 'featured DESC, stock DESC',
  };
  const sortClause = sortMap[sort] || 'featured DESC, created_at DESC';

  const countSql = `SELECT COUNT(*) as total FROM products ${whereClause}`;
  const total = db.prepare(countSql).get(params).total;

  const sql = `SELECT * FROM products ${whereClause} ORDER BY ${sortClause} LIMIT @limit OFFSET @offset`;
  const products = db.prepare(sql).all({ ...params, limit: parseInt(limit), offset });

  res.json({
    products,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  });
});

// GET /api/products/brands — distinct brands
router.get('/brands', (req, res) => {
  const brands = db.prepare('SELECT DISTINCT brand FROM products ORDER BY brand').all();
  res.json(brands.map(b => b.brand));
});

// GET /api/products/featured
router.get('/featured', (req, res) => {
  const featured = db.prepare('SELECT * FROM products WHERE featured = 1 LIMIT 8').all();
  res.json(featured);
});

// GET /api/products/collections
router.get('/collections', (req, res) => {
  try {
    const collections = db.prepare('SELECT * FROM collections').all();
    res.json(collections);
  } catch {
    res.json([]);
  }
});

// GET /api/products/search?q=
router.get('/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const products = db.prepare(`
    SELECT * FROM products
    WHERE name LIKE @q OR brand LIKE @q OR category LIKE @q OR notes_top LIKE @q
    LIMIT 10
  `).all({ q: `%${q}%` });
  res.json(products);
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const related = db.prepare(`
    SELECT * FROM products WHERE (brand = ? OR gender = ?) AND id != ? LIMIT 4
  `).all(product.brand, product.gender, product.id);
  res.json({ ...product, related });
});

// POST /api/products — create new product
router.post('/', (req, res) => {
  const {
    name, brand, description, price, original_price,
    size, category, gender, notes_top, notes_heart, notes_base,
    featured, is_tester, stock, image
  } = req.body;

  if (!name || !brand || !price || !gender) {
    return res.status(400).json({ error: 'Thiếu trường bắt buộc: name, brand, price, gender' });
  }

  const result = db.prepare(`
    INSERT INTO products (name, brand, description, price, original_price, size, category, gender,
      notes_top, notes_heart, notes_base, featured, is_tester, stock, image)
    VALUES (@name, @brand, @description, @price, @original_price, @size, @category, @gender,
      @notes_top, @notes_heart, @notes_base, @featured, @is_tester, @stock, @image)
  `).run({
    name, brand, description: description || '',
    price: parseInt(price), original_price: original_price ? parseInt(original_price) : null,
    size: size || '', category: category || '', gender,
    notes_top: notes_top || '', notes_heart: notes_heart || '', notes_base: notes_base || '',
    featured: featured ? 1 : 0, is_tester: is_tester ? 1 : 0,
    stock: parseInt(stock) || 10, image: image || ''
  });

  const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id — update product
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Sản phẩm không tồn tại' });

  const {
    name, brand, description, price, original_price,
    size, category, gender, notes_top, notes_heart, notes_base,
    featured, is_tester, stock, image
  } = req.body;

  db.prepare(`
    UPDATE products SET
      name = @name, brand = @brand, description = @description,
      price = @price, original_price = @original_price, size = @size,
      category = @category, gender = @gender,
      notes_top = @notes_top, notes_heart = @notes_heart, notes_base = @notes_base,
      featured = @featured, is_tester = @is_tester, stock = @stock, image = @image
    WHERE id = @id
  `).run({
    id: parseInt(id),
    name: name ?? existing.name,
    brand: brand ?? existing.brand,
    description: description ?? existing.description,
    price: price !== undefined ? parseInt(price) : existing.price,
    original_price: original_price !== undefined ? (original_price ? parseInt(original_price) : null) : existing.original_price,
    size: size ?? existing.size,
    category: category ?? existing.category,
    gender: gender ?? existing.gender,
    notes_top: notes_top ?? existing.notes_top,
    notes_heart: notes_heart ?? existing.notes_heart,
    notes_base: notes_base ?? existing.notes_base,
    featured: featured !== undefined ? (featured ? 1 : 0) : existing.featured,
    is_tester: is_tester !== undefined ? (is_tester ? 1 : 0) : existing.is_tester,
    stock: stock !== undefined ? parseInt(stock) : existing.stock,
    image: image !== undefined ? image : existing.image,
  });

  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(parseInt(id));
  res.json(updated);
});

// DELETE /api/products/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  res.json({ success: true, deleted: id });
});

module.exports = router;