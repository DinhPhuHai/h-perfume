const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, { ...options, headers: { ...options.headers } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  getFeatured: () => request('/products/featured'),
  getBrands: () => request('/products/brands'),
  searchProducts: (q) => request(`/products/search?q=${encodeURIComponent(q)}`),
  chat: (messages) => request('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  }),
};

export function formatPrice(num) {
  if (num === undefined || num === null) return '';
  return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
}

export function buildZaloOrderMessage(items, customerInfo, totalPrice) {
  const lines = items.map((item, i) =>
    `${i + 1}. ${item.brand} ${item.name} (${item.size}) × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`
  );

  const message = `🛍️ ĐƠN HÀNG H PERFUME

📦 Sản phẩm:
${lines.join('\n')}

💰 Tổng: ${formatPrice(totalPrice)}

👤 Khách hàng:
• Họ tên: ${customerInfo.name}
• SĐT: ${customerInfo.phone}
• Địa chỉ: ${customerInfo.address}
${customerInfo.note ? `• Ghi chú: ${customerInfo.note}` : ''}

Shop sẽ liên hệ xác nhận đơn trong 30 phút. Cảm ơn bạn! 💛`;

  return encodeURIComponent(message);
}
