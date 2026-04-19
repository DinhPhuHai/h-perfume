# H PERFUME — Hướng Dẫn Triển Khai

---

## 🔐 Mật khẩu Admin

```
Mật khẩu hiện tại: hperfume2025
```

Truy cập trang Admin: `http://<domain>/admin`

---

## 🖥️ 1. Chạy Local (máy tính cá nhân)

```bash
# Terminal 1 — Backend
cd ~/perfume-shop/backend
node server.js

# Terminal 2 — Frontend
cd ~/perfume-shop/frontend
npm run dev -- --host --port 5173
```

- Cửa hàng: http://localhost:5173
- Admin: http://localhost:5173/admin
- API: http://localhost:3001/api

---

## 🌐 2. Triển khai Miễn Phí (Khuyến nghị)

### Cách A: Render.com (Backend + Database)

**Bước 1 — Deploy Backend**
1. Push code lên GitHub:
   ```bash
   cd ~/perfume-shop
   git init
   git add .
   git commit -m "H Perfume initial"
   # Tạo repo trên GitHub, rồi:
   git remote add origin https://github.com/<username>/h-perfume.git
   git push -u origin main
   ```

2. Vào https://render.com → Sign up → New → **Web Service**
3. Connect repo, cấu hình:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add Environment Variable: `PORT = 3001`
5. Nhấn **Deploy**

→ Bạn sẽ có URL backend, ví dụ: `https://h-perfume.onrender.com`

**Bước 2 — Deploy Frontend lên Vercel**
1. `cd ~/perfume-shop/frontend`
2. Tạo file `vercel.json`:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://h-perfume.onrender.com/api/$1" },
       { "source": "/uploads/(.*)", "destination": "https://h-perfume.onrender.com/uploads/$1" }
     ]
   }
   ```
3. Push frontend lên GitHub riêng
4. Vào https://vercel.com → Import → deploy

---

### Cách B: Railway.app (Nhanh nhất)

1. Vào https://railway.app → New Project → Deploy from GitHub
2. Chọn repo → tự động nhận diện Node.js
3. Override Start Command: `node server.js`
4. Deploy → lấy URL backend

---

### Cách C: Chạy trên máy tính cá nhân (không cần server ngoài)

Dùng **ngrok** để public localhost:
```bash
# Cài ngrok
# Terminal 1: chạy backend + frontend
# Terminal 2:
ngrok http 5173
```
→ Copy URL ngrok (ví dụ `https://xxxx.ngrok.io`) → Dùng làm domain.

---

## ⚙️ 3. Đổi mật khẩu Admin

Mở file:
```
perfume-shop/frontend/src/pages/Admin.jsx
```

Tìm dòng:
```js
const ADMIN_PASSWORD = 'hperfume2025';
```

Đổi thành mật khẩu bạn muốn:
```js
const ADMIN_PASSWORD = 'matkhaucuaban123';
```

→ Build lại và deploy lại frontend.

---

## 📦 4. Quản lý sản phẩm

Truy cập `/admin` → nhập mật khẩu → quản lý:

| Thao tác | Cách |
|---|---|
| Thêm sản phẩm | Nhấn **"+ Thêm sản phẩm"** |
| Sửa sản phẩm | Nhấn icon ✏️ |
| Xóa sản phẩm | Nhấn icon 🗑️ |
| Upload ảnh | Dán URL hoặc nhấn icon 📎 |
| Đánh dấu Nổi bật | Nhấn icon ⭐ (hiện ở trang chủ) |
| Sắp xếp | Bộ lọc bên trái (Giá, Thương hiệu…) |

---

## 💡 5. Thêm sản phẩm — Checklist

| Trường | Bắt buộc? | Ghi chú |
|---|---|---|
| Tên sản phẩm | ✅ | VD: Coco Mademoiselle EDP |
| Thương hiệu | ✅ | VD: Chanel |
| Giá bán | ✅ | Nhập số, VD: 2800000 |
| Giới tính | ✅ | Nữ / Nam / Unisex |
| Dung tích | | VD: 100ml |
| Hình ảnh | | Dán URL hoặc upload |
| Tester | | Tick nếu là chai thử nghiệm |
| Nổi bật | | Tick để hiện ở trang chủ |
