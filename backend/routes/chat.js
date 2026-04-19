const express = require('express');
const db = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const router = express.Router();

function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function getFallbackResponse(normalizedMsg) {
  if (/(nam|cho nam|men|con trai)/.test(normalizedMsg) && !/(nu|women|gai)/.test(normalizedMsg)) {
    const prods = db.prepare("SELECT name, brand, price FROM products WHERE gender = 'Nam' LIMIT 4").all();
    if (prods.length > 0) return "Hệ thống AI đang bị lỗi (API Key không hợp lệ), nhưng cửa hàng đang có các mẫu Nam nổi bật:\n" + prods.map(p => `👉 ${p.brand} ${p.name}: ${p.price.toLocaleString('vi-VN')}đ`).join('\n');
  } else if (/(nu|cho nu|women|con gai|phu nu)/.test(normalizedMsg)) {
    const prods = db.prepare("SELECT name, brand, price FROM products WHERE gender = 'Nữ' LIMIT 4").all();
    if (prods.length > 0) return "Hệ thống AI đang bị lỗi (API Key không hợp lệ), nhưng cửa hàng đang có các mẫu Nữ nổi bật:\n" + prods.map(p => `👉 ${p.brand} ${p.name}: ${p.price.toLocaleString('vi-VN')}đ`).join('\n');
  }
  return "AI đang tạm lỗi kết nối do API Key không hợp lệ 🥲. Xin vui lòng liên hệ admin cấp lại nhé!";
}

router.post('/', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Invalid messages' });
  
  const apiKey = process.env.GEMINI_API_KEY;
  const lastMessage = messages[messages.length - 1].content;
  const normalizedMsg = removeAccents(lastMessage);

  if (!apiKey) {
    return res.json({
      role: 'assistant',
      content: 'Chưa có cấu hình GEMINI_API_KEY trong file .env!'
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Lấy context sản phẩm đưa cho AI
    const products = db.prepare('SELECT name, brand, price, notes_top, notes_heart, notes_base, gender FROM products LIMIT 30').all();
    const productContext = products.map(p => `- ${p.brand} ${p.name} (${p.gender}): ${p.price?.toLocaleString('vi-VN')}đ. Nhóm hương: ${p.notes_top}, ${p.notes_heart}, ${p.notes_base}`).join('\n');

    const systemPrompt = `Bạn là chuyên viên tư vấn nước hoa thân thiện của cửa hàng H PERFUME. Hãy tư vấn ngắn gọn, nhiệt tình giúp khách chọn nước hoa thích hợp từ danh sách có sẵn của cửa hàng sau đây:
\n${productContext}`;

    const modelWithSystem = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest",
      systemInstruction: systemPrompt 
    });

    const chatHistory = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const chat = modelWithSystem.startChat({ history: chatHistory });
    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();

    res.json({ role: 'assistant', content: responseText });
  } catch (error) {
    console.error('[AI Chat Error]:', error.message);
    // Lùi về fallback message nếu API Key fail
    res.json({ role: 'assistant', content: getFallbackResponse(normalizedMsg) });
  }
});

module.exports = router;
