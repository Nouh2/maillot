import type { Order } from '@/types/order'
import { formatOrderMessage } from './formatOrder'

const TELEGRAM_CAPTION_LIMIT = 1024

async function telegramRequest(
  token: string,
  method: string,
  body: Record<string, unknown>
): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`Telegram ${method} failed with status ${res.status}: ${await res.text()}`)
  }
}

function getOrderPhotos(order: Order): string[] {
  const seen = new Set<string>()

  return order.items
    .map((item) => item.photo?.trim())
    .filter((photo): photo is string => Boolean(photo?.startsWith('http')))
    .filter((photo) => {
      if (seen.has(photo)) return false
      seen.add(photo)
      return true
    })
    .slice(0, 10)
}

async function sendTelegramMessage(token: string, chatId: string, text: string): Promise<void> {
  await telegramRequest(token, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
  })
}

function escapeTelegramHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

async function sendTelegramPhoto(token: string, chatId: string, photo: string, caption: string): Promise<void> {
  await telegramRequest(token, 'sendPhoto', {
    chat_id: chatId,
    photo,
    caption,
    parse_mode: 'HTML',
  })
}

async function sendTelegramMediaGroup(token: string, chatId: string, photos: string[], caption: string): Promise<void> {
  await telegramRequest(token, 'sendMediaGroup', {
    chat_id: chatId,
    media: photos.map((photo, index) => ({
      type: 'photo',
      media: photo,
      ...(index === 0 ? { caption, parse_mode: 'HTML' } : {}),
    })),
  })
}

export async function sendTelegramContactNotification(params: {
  name: string
  email: string
  orderNumber?: string
  subject: string
  message: string
}): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.error('Telegram env vars missing')
    return false
  }

  const orderNumber = params.orderNumber?.trim()
  const message = [
    '📩 <b>NOUVEAU MESSAGE CONTACT</b>',
    '',
    `<b>Nom :</b> ${escapeTelegramHtml(params.name)}`,
    `<b>Email :</b> ${escapeTelegramHtml(params.email)}`,
    `<b>Commande :</b> ${orderNumber ? escapeTelegramHtml(orderNumber) : 'Non renseignée'}`,
    '',
    `<b>Sujet :</b> ${escapeTelegramHtml(params.subject)}`,
    '',
    escapeTelegramHtml(params.message),
  ].join('\n')

  try {
    await sendTelegramMessage(token, chatId, message)
    return true
  } catch (error) {
    console.error('Telegram contact notification failed:', error)
    return false
  }
}

export async function sendTelegramNotification(order: Order): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.error('Telegram env vars missing')
    return false
  }

  try {
    const message = formatOrderMessage(order)
    const photos = getOrderPhotos(order)

    if (photos.length === 0) {
      await sendTelegramMessage(token, chatId, message)
      return true
    }

    if (message.length <= TELEGRAM_CAPTION_LIMIT) {
      try {
        if (photos.length === 1) {
          await sendTelegramPhoto(token, chatId, photos[0], message)
        } else {
          await sendTelegramMediaGroup(token, chatId, photos, message)
        }
        return true
      } catch (photoErr) {
        console.error('Telegram photo delivery failed, falling back to text:', photoErr)
      }
    }

    await sendTelegramMessage(token, chatId, message)

    try {
      if (photos.length === 1) {
        await sendTelegramPhoto(token, chatId, photos[0], '<b>Photo maillot</b>')
      } else {
        await sendTelegramMediaGroup(token, chatId, photos, '<b>Photos maillots</b>')
      }
    } catch (photoErr) {
      console.error('Telegram supplementary photos failed:', photoErr)
    }

    return true
  } catch (err) {
    console.error('Telegram notification failed:', err)
    return false
  }
}
