![Discord.js v14](https://img.shields.io/badge/Discord.js-v14-blue)
![Node.js v16+](https://img.shields.io/badge/Node.js-v16%2B-brightgreen)
![License MIT](https://img.shields.io/badge/license-MIT-green)

### heecsbot-v14 — Template Bot Discord Slash Command

**heecsbot-v14** là bot Discord mạnh mẽ được xây dựng trên Discord.js v14, tối ưu cho việc xử lý slash command nhanh và ổn định. Đây là template lý tưởng cho dev muốn làm bot dễ mở rộng, bảo trì và code sạch.

---

### Mục Lục

* [Tính năng](#tính-năng)
* [Yêu cầu trước khi bắt đầu](#yêu-cầu-trước-khi-bắt-đầu)
* [Cài đặt & Thiết lập](#cài-đặt--thiết-lập)
* [Sử dụng](#sử-dụng)
* [Đóng góp](#đóng-góp)
* [Giấy phép](#giấy-phép)
* [Liên hệ](#liên-hệ)
* [Lời cảm ơn](#lời-cảm-ơn)

---

### Tính năng ✨

* Quản lý slash command hiệu quả, sạch sẽ.
* Kiến trúc module giúp mở rộng và bảo trì dễ dàng.
* Hỗ trợ biến môi trường `.env` để bảo mật cấu hình.
* Hỗ trợ xử lý event Discord phổ biến.
* Liên tục cập nhật tính năng mới.

---

### Yêu cầu trước khi bắt đầu 🚦

* Cài Node.js từ phiên bản 16 trở lên.
* Có bot token lấy từ [Discord Developer Portal](https://discord.com/developers/applications).
* Các biến môi trường: `CLIENT_ID`, `GUILD_ID`, `DEV_ID` và MongoDB URI nếu có sử dụng.

---

### Cài đặt & Thiết lập ⚙️

```bash
git clone https://github.com/Hoocs151/heecsbot-v14.git
cd heecsbot-v14
npm install
```

Tạo file `.env` trong thư mục gốc, điền các thông số:

```env
DISCORD_TOKEN=your-bot-token
CLIENT_ID=your-client-id
GUILD_ID=your-guild-id
DEV_ID=your-dev-id
MONGODB=your-mongodb-uri
```

Khởi động bot:

```bash
npm start
```

---

### Sử dụng 📌

* Thêm slash command mới trong `src/commands`.
* Thêm hoặc chỉnh sửa event handler trong `src/events`.
* Mở rộng và tùy biến theo nhu cầu dự án.

---

### Đóng góp 🤝

Mọi đóng góp, báo lỗi hoặc đề xuất tính năng đều rất được hoan nghênh! Mở issue hoặc gửi pull request thoải mái nhé.

---

### Giấy phép 📜

Dự án được cấp phép MIT — thoải mái sử dụng, sửa đổi và phân phối.

---

### Liên hệ 📬

Tìm mình trên GitHub: [Hoocs151](https://github.com/Hoocs151)

---

### Lời cảm ơn 🙏

Lấy cảm hứng từ [DiscordBotV14-template](https://github.com/Kkkermit/DiscordBotV14-template). Xin cảm ơn cộng đồng mã nguồn mở!

---

![GitHub stars](https://img.shields.io/github/stars/Hoocs151/heecsbot-v14?style=social)
![GitHub forks](https://img.shields.io/github/forks/Hoocs151/heecsbot-v14?style=social)
![GitHub issues](https://img.shields.io/github/issues/Hoocs151/heecsbot-v14)