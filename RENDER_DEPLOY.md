# Render.com ga Deploy Qilish

## 1-qadam: GitHub ga yuklash

### GitHub Repository yaratish

1. [GitHub.com](https://github.com) ga kiring
2. "New repository" tugmasini bosing
3. Repository nomi: `telegram-mini-app`
4. Public yoki Private tanlang
5. "Create repository" bosing

### Fayllarni yuklash

```bash
git init
git add index.html app.js bot.py requirements.txt render.yaml
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/telegram-mini-app.git
git push -u origin main
```

## 2-qadam: Render.com sozlash

### Ro'yxatdan o'tish

1. [Render.com](https://render.com) ga kiring
2. GitHub akkaunt bilan kirish
3. Repository ruxsatini bering

### Web Service yaratish (Mini App uchun)

1. Dashboard → "New" → "Static Site"
2. GitHub repository ni tanlang
3. Sozlamalar:
   - **Name**: telegram-mini-app
   - **Branch**: main
   - **Build Command**: (bo'sh qoldiring)
   - **Publish Directory**: `.` (nuqta)
4. "Create Static Site" bosing

### URL ni olish

Deploy tugagach, URL ko'rinadi:
```
https://telegram-mini-app-XXXX.onrender.com
```

**MUHIM**: Bu URL ni `bot.py` faylidagi `WEB_APP_URL` ga kiriting!

## 3-qadam: Bot Worker yaratish

### Worker Service yaratish

1. Dashboard → "New" → "Background Worker"
2. Xuddi shu repository ni tanlang
3. Sozlamalar:
   - **Name**: telegram-bot
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python bot.py`
   - **Plan**: Free
4. "Create Background Worker" bosing

## 4-qadam: Bot sozlamalari

### BotFather'da Web App sozlash

1. [@BotFather](https://t.me/BotFather) ga boring
2. `/mybots` → Botingizni tanlang
3. "Bot Settings" → "Menu Button" → "Edit menu button URL"
4. Render URL ni kiriting:
   ```
   https://telegram-mini-app-XXXX.onrender.com
   ```
5. "Edit menu button text" → "🛒 Do'konni ochish"

## 5-qadam: Tekshirish

1. Telegram botingizni oching
2. `/start` buyrug'ini yuboring
3. "🛒 Do'konni ochish" tugmasini bosing
4. Mini App ochilishi kerak
5. Mahsulot qo'shing va buyurtma bering
6. Admin sifatida buyurtmani ko'rishingiz kerak

## Admin Funksiyalari

Siz (Admin ID: 8347167027) quyidagilarni qila olasiz:

### Buyurtmalarni ko'rish
```
/orders
```

### Admin Panel
Tugmadan: "📊 Admin panel"

### Buyurtmalarni boshqarish
- ✅ Tasdiqlash - Mijozga tasdiqlash xabari yuboriladi
- ❌ Bekor qilish - Mijozga bekor qilish xabari yuboriladi

## Muammolarni Hal Qilish

### Mini App ochilmayapti
1. Render Deploy muvaffaqiyatli bo'lganini tekshiring
2. URL HTTPS bilan boshlanishini tasdiqlang
3. BotFather'da to'g'ri URL kiritilganini tekshiring

### Bot javob bermayapti
1. Render Worker "Active" holatida ekanligini tekshiring
2. Logs'ni ko'ring: Dashboard → telegram-bot → Logs
3. TOKEN to'g'riligini tasdiqlang

### Buyurtmalar kelmayapti
1. Bot Logs'da xatolar borligini tekshiring
2. Web App console'ni tekshiring (F12)
3. Telegram'da "Send Data" ruxsati berilganligini tasdiqlang

## Yangilashlar

### Kod yangilanganida

```bash
git add .
git commit -m "Yangilanish"
git push
```

Render avtomatik ravishda qayta deploy qiladi!

## Xavfsizlik

- ✅ Bot TOKEN GitHub'da public qilinmagan
- ✅ Admin ID kod ichida
- ✅ HTTPS ishlatilmoqda
- ✅ Render bepul SSL sertifikat beradi

## Render Free Plan Cheklovlar

- Static Site: Har doim ishlab turadi
- Worker: 750 soat/oy (bir bot uchun yetarli)
- Bir necha daqiqa ishlatilmaganda uyquga ketadi
- Birinchi so'rovda 1-2 soniya kechikish bo'lishi mumkin

## Qo'shimcha Sozlamalar

### Domen qo'shish (ixtiyoriy)

1. Render Dashboard → telegram-mini-app → Settings
2. "Custom Domain" → Domain qo'shing
3. DNS sozlamalarini yangilang

### Environment Variables (kelajakda)

1. `bot.py` da tokenni o'chirish
2. Render'da Environment Variables qo'shish
3. `os.getenv('BOT_TOKEN')` ishlatish

## Yordam

Muammo yuzaga kelsa:
1. Render Logs'ni tekshiring
2. Browser Console'ni tekshiring (F12)
3. Bot Logs'ni kuzating

---

**Omad tilaymiz! Botingiz tayyor! 🎉**

Admin: @sizning_username
