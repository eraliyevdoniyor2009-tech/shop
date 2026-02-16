"""
Telegram Mini App Bot - Professional Version
O'zbek tilida
"""

from telegram import Update, WebAppInfo, KeyboardButton, ReplyKeyboardMarkup, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, filters, ContextTypes
import json
import logging
from datetime import datetime

# Logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Sozlamalar
BOT_TOKEN = "8162367529:AAE8OOVJQVK9syCrYZbIWvzRDxcoDVzEbrg"
ADMIN_ID = 8347167027
WEB_APP_URL = "https://sizning-domen.onrender.com"  # Bu yerga Render URL ni kiriting

# Buyurtmalar bazasi (production uchun database ishlatish kerak)
orders_db = {}
order_counter = 1

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Start buyrug'i"""
    user_id = update.effective_user.id
    
    if user_id == ADMIN_ID:
        keyboard = [
            [KeyboardButton(text="🛒 Do'konni ochish", web_app=WebAppInfo(url=WEB_APP_URL))],
            [KeyboardButton(text="📊 Admin panel"), KeyboardButton(text="ℹ️ Ma'lumot")]
        ]
    else:
        keyboard = [
            [KeyboardButton(text="🛒 Do'konni ochish", web_app=WebAppInfo(url=WEB_APP_URL))],
            [KeyboardButton(text="ℹ️ Ma'lumot")]
        ]
    
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    
    await update.message.reply_text(
        "🎉 Xush kelibsiz!\n\n"
        "Bizning do'konimizdan mahsulot buyurtma qilish uchun "
        "quyidagi tugmani bosing:",
        reply_markup=reply_markup
    )

async def handle_web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Web App dan kelgan buyurtmalarni qayta ishlash"""
    global order_counter
    
    try:
        data = json.loads(update.message.web_app_data.data)
        
        items = data.get('items', [])
        customer = data.get('customer', {})
        payment = data.get('payment', {})
        total = data.get('total', 0)
        
        # Buyurtma raqami
        order_id = order_counter
        order_counter += 1
        
        # Buyurtmani saqlash
        orders_db[order_id] = {
            'data': data,
            'user_id': update.effective_user.id,
            'username': update.effective_user.username,
            'status': 'yangi',
            'timestamp': datetime.now().isoformat()
        }
        
        # Buyurtmani formatlash
        order_text = f"📦 Yangi buyurtma #{order_id}\n\n"
        order_text += "🛍 Mahsulotlar:\n"
        
        for item in items:
            order_text += f"• {item['name']} - {item['quantity']} × {item['price']:,} so'm = {item['total']:,} so'm\n"
        
        order_text += f"\n💰 Jami: {total:,} so'm\n\n"
        order_text += "👤 Mijoz ma'lumotlari:\n"
        order_text += f"📱 Telefon: {customer.get('phone', 'N/A')}\n"
        order_text += f"📍 Manzil: {customer.get('address', 'N/A')}\n"
        order_text += f"🆔 Telegram: @{customer.get('username', 'N/A')}\n"
        
        if customer.get('notes'):
            order_text += f"📝 Izoh: {customer.get('notes')}\n"
        
        order_text += f"\n💳 To'lov usuli: "
        if payment.get('method') == 'cash':
            order_text += "Naqd pul"
        else:
            order_text += "Karta orqali"
            if payment.get('hasReceipt'):
                order_text += " (Chek yuklangan)"
        
        # Foydalanuvchiga javob
        await update.message.reply_text(
            f"✅ Buyurtmangiz qabul qilindi!\n\n"
            f"Buyurtma raqami: #{order_id}\n\n"
            f"Tez orada operator siz bilan bog'lanadi.\n"
            f"Rahmat! 🙏"
        )
        
        # Adminga xabar
        try:
            keyboard = InlineKeyboardMarkup([
                [
                    InlineKeyboardButton("✅ Tasdiqlash", callback_data=f"confirm_{order_id}"),
                    InlineKeyboardButton("❌ Rad etish", callback_data=f"cancel_{order_id}")
                ]
            ])
            
            await context.bot.send_message(
                chat_id=ADMIN_ID,
                text=order_text,
                reply_markup=keyboard
            )
            
            logger.info(f"Yangi buyurtma #{order_id} admin ga yuborildi")
        except Exception as e:
            logger.error(f"Adminga yuborishda xatolik: {e}")
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON xatolik: {e}")
        await update.message.reply_text(
            "❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."
        )
    except Exception as e:
        logger.error(f"Umumiy xatolik: {e}")
        await update.message.reply_text(
            "❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."
        )

async def info(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Ma'lumot"""
    info_text = (
        "ℹ️ Do'kon haqida ma'lumot\n\n"
        "🛒 Bizdan mahsulot buyurtma qilish juda oson!\n\n"
        "1️⃣ Do'konni ochish tugmasini bosing\n"
        "2️⃣ Kerakli mahsulotlarni tanlang\n"
        "3️⃣ Savatchaga o'ting\n"
        "4️⃣ Ma'lumotlaringizni kiriting\n"
        "5️⃣ Buyurtma bering\n\n"
        "💳 To'lov usullari:\n"
        "• Naqd pul (yetkazib berilganda)\n"
        "• Karta orqali (chek yuklash kerak)\n\n"
        "🚚 Yetkazib berish: Bepul\n\n"
        "Savollar uchun adminga murojaat qiling."
    )
    
    await update.message.reply_text(info_text)

async def admin_panel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Admin panel - faqat admin uchun"""
    user_id = update.effective_user.id
    
    if user_id != ADMIN_ID:
        await update.message.reply_text("❌ Sizda bu buyruq uchun ruxsat yo'q.")
        return
    
    total_orders = len(orders_db)
    new_orders = sum(1 for order in orders_db.values() if order['status'] == 'yangi')
    confirmed = sum(1 for order in orders_db.values() if order['status'] == 'tasdiqlangan')
    cancelled = sum(1 for order in orders_db.values() if order['status'] == 'bekor_qilingan')
    
    text = (
        f"📊 Admin Panel\n\n"
        f"📦 Jami buyurtmalar: {total_orders}\n"
        f"🆕 Yangi: {new_orders}\n"
        f"✅ Tasdiqlangan: {confirmed}\n"
        f"❌ Bekor qilingan: {cancelled}\n\n"
        f"Buyurtmalarni ko'rish uchun /orders buyrug'idan foydalaning."
    )
    
    await update.message.reply_text(text)

async def list_orders(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Buyurtmalarni ko'rsatish - faqat admin uchun"""
    user_id = update.effective_user.id
    
    if user_id != ADMIN_ID:
        await update.message.reply_text("❌ Sizda bu buyruq uchun ruxsat yo'q.")
        return
    
    if not orders_db:
        await update.message.reply_text("📭 Buyurtmalar mavjud emas.")
        return
    
    # So'nggi 10 ta buyurtmani ko'rsatish
    recent_orders = sorted(orders_db.items(), reverse=True)[:10]
    
    text = "📋 So'nggi buyurtmalar:\n\n"
    
    for order_id, order in recent_orders:
        status_emoji = {
            'yangi': '🆕',
            'tasdiqlangan': '✅',
            'bekor_qilingan': '❌'
        }.get(order['status'], '❓')
        
        total = order['data'].get('total', 0)
        customer = order['data'].get('customer', {})
        
        text += f"{status_emoji} #{order_id} - {total:,} so'm\n"
        text += f"   👤 {customer.get('first_name', 'N/A')}\n"
        text += f"   📱 {customer.get('phone', 'N/A')}\n\n"
    
    await update.message.reply_text(text)

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Inline button callback"""
    query = update.callback_query
    await query.answer()
    
    user_id = update.effective_user.id
    
    if user_id != ADMIN_ID:
        await query.edit_message_text("❌ Sizda bu amal uchun ruxsat yo'q.")
        return
    
    data = query.data
    action, order_id = data.split('_')
    order_id = int(order_id)
    
    if order_id not in orders_db:
        await query.edit_message_text("❌ Buyurtma topilmadi.")
        return
    
    order = orders_db[order_id]
    
    if action == 'confirm':
        orders_db[order_id]['status'] = 'tasdiqlangan'
        
        # Mijozga xabar
        try:
            await context.bot.send_message(
                chat_id=order['user_id'],
                text=f"✅ Buyurtmangiz #{order_id} tasdiqlandi!\n\n"
                     f"Mahsulotlar tez orada yetkazib beriladi. Rahmat! 🙏"
            )
        except Exception as e:
            logger.error(f"Mijozga xabar yuborishda xatolik: {e}")
        
        await query.edit_message_text(
            f"{query.message.text}\n\n✅ Tasdiqlandi - {datetime.now().strftime('%H:%M')}"
        )
        
    elif action == 'cancel':
        orders_db[order_id]['status'] = 'bekor_qilingan'
        
        # Mijozga xabar
        try:
            await context.bot.send_message(
                chat_id=order['user_id'],
                text=f"❌ Kechirasiz, buyurtmangiz #{order_id} bekor qilindi.\n\n"
                     f"Qo'shimcha ma'lumot uchun biz bilan bog'laning."
            )
        except Exception as e:
            logger.error(f"Mijozga xabar yuborishda xatolik: {e}")
        
        await query.edit_message_text(
            f"{query.message.text}\n\n❌ Bekor qilindi - {datetime.now().strftime('%H:%M')}"
        )

async def handle_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Oddiy matnli xabarlar"""
    text = update.message.text
    
    if text == "ℹ️ Ma'lumot":
        await info(update, context)
    elif text == "📊 Admin panel":
        await admin_panel(update, context)
    else:
        await update.message.reply_text(
            "Buyurtma berish uchun '🛒 Do'konni ochish' tugmasini bosing."
        )

def main():
    """Botni ishga tushirish"""
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Handlerlar
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("orders", list_orders))
    application.add_handler(MessageHandler(
        filters.StatusUpdate.WEB_APP_DATA,
        handle_web_app_data
    ))
    application.add_handler(CallbackQueryHandler(button_callback))
    application.add_handler(MessageHandler(
        filters.TEXT & ~filters.COMMAND,
        handle_text
    ))
    
    logger.info("Bot ishga tushdi!")
    logger.info(f"Admin ID: {ADMIN_ID}")
    logger.info(f"Web App URL: {WEB_APP_URL}")
    
    # Polling
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
