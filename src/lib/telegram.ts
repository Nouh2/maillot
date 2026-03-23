import type { Order } from '@/types/order'
import { formatOrderMessage } from './formatOrder'

export async function sendTelegramNotification(order: Order): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.error('Telegram env vars missing')
    return false
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatOrderMessage(order),
        parse_mode: 'HTML',
      }),
    })
    return res.ok
  } catch (err) {
    console.error('Telegram notification failed:', err)
    return false
  }
}
