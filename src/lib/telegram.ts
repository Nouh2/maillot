import type { Order } from '@/types/order'
import { formatOrderCustomerDetails, formatOrderMessage } from './formatOrder'

const TELEGRAM_COPY_TEXT_LIMIT = 256
const SUPPORT_REPLY_CALLBACK_PREFIX = 'support_reply:'

type TelegramMessageResult = {
  message_id: number
  chat?: {
    id: number | string
  }
}

async function telegramRequest(
  token: string,
  method: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`Telegram ${method} failed with status ${res.status}: ${await res.text()}`)
  }

  const payload = await res.json().catch(() => null)
  return payload?.result
}

function getTelegramToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || null
}

function getOrdersChatId(): string | null {
  return process.env.TELEGRAM_ORDERS_CHAT_ID?.trim() || process.env.TELEGRAM_CHAT_ID?.trim() || null
}

function getContactChatId(): string | null {
  return process.env.TELEGRAM_CONTACT_CHAT_ID?.trim() || process.env.TELEGRAM_CHAT_ID?.trim() || null
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

async function sendTelegramMessage(
  token: string,
  chatId: string,
  text: string,
  options?: {
    replyMarkup?: Record<string, unknown>
    replyToMessageId?: number
  }
): Promise<TelegramMessageResult> {
  return await telegramRequest(token, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...(options?.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
    ...(options?.replyToMessageId ? { reply_to_message_id: options.replyToMessageId } : {}),
  }) as TelegramMessageResult
}

function escapeTelegramHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function truncateTelegramCopyText(text: string): string {
  const chars = Array.from(text)
  if (chars.length <= TELEGRAM_COPY_TEXT_LIMIT) return text
  return `${chars.slice(0, TELEGRAM_COPY_TEXT_LIMIT - 3).join('')}...`
}

function getOrderCopyReplyMarkup(order: Order): Record<string, unknown> {
  return {
    inline_keyboard: [[{
      text: 'Copier infos client',
      copy_text: {
        text: truncateTelegramCopyText(formatOrderCustomerDetails(order)),
      },
    }]],
  }
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

export async function sendTelegramPrivateMessage(chatId: string, text: string): Promise<boolean> {
  const token = getTelegramToken()
  if (!token) return false

  try {
    await sendTelegramMessage(token, chatId, text)
    return true
  } catch (error) {
    console.error('Telegram private message failed:', error)
    return false
  }
}

export async function sendTelegramChannelMessage(params: {
  chatId: string
  text: string
  replyToMessageId?: number
}): Promise<boolean> {
  const token = getTelegramToken()
  if (!token) return false

  try {
    await sendTelegramMessage(token, params.chatId, params.text, {
      replyToMessageId: params.replyToMessageId,
    })
    return true
  } catch (error) {
    console.error('Telegram channel message failed:', error)
    return false
  }
}

export async function answerTelegramCallbackQuery(params: {
  callbackQueryId: string
  text?: string
  showAlert?: boolean
}): Promise<void> {
  const token = getTelegramToken()
  if (!token) return

  await telegramRequest(token, 'answerCallbackQuery', {
    callback_query_id: params.callbackQueryId,
    ...(params.text ? { text: params.text } : {}),
    ...(params.showAlert ? { show_alert: true } : {}),
  })
}

export async function updateTelegramSupportReplyButton(params: {
  chatId: string
  messageId: number
  label: string
  ticketId: string
}): Promise<void> {
  const token = getTelegramToken()
  if (!token) return

  await telegramRequest(token, 'editMessageReplyMarkup', {
    chat_id: params.chatId,
    message_id: params.messageId,
    reply_markup: {
      inline_keyboard: [[{
        text: params.label,
        callback_data: `${SUPPORT_REPLY_CALLBACK_PREFIX}${params.ticketId}`,
      }]],
    },
  })
}

export async function sendTelegramContactNotification(params: {
  ticketId?: string
  name: string
  email: string
  orderNumber?: string
  subject: string
  message: string
}): Promise<{ delivered: boolean; chatId?: string; messageId?: number }> {
  const token = getTelegramToken()
  const chatId = getContactChatId()

  if (!token || !chatId) {
    console.error('Telegram env vars missing')
    return { delivered: false }
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
    const result = await sendTelegramMessage(token, chatId, message, {
      replyMarkup: params.ticketId
        ? {
            inline_keyboard: [[{
              text: 'Repondre par mail',
              callback_data: `${SUPPORT_REPLY_CALLBACK_PREFIX}${params.ticketId}`,
            }]],
          }
        : undefined,
    })
    return { delivered: true, chatId, messageId: result.message_id }
  } catch (error) {
    console.error('Telegram contact notification failed:', error)
    return { delivered: false }
  }
}

export async function sendTelegramNotification(order: Order): Promise<boolean> {
  const token = getTelegramToken()
  const chatId = getOrdersChatId()

  if (!token || !chatId) {
    console.error('Telegram env vars missing')
    return false
  }

  try {
    const message = formatOrderMessage(order)
    const photos = getOrderPhotos(order)
    const copyReplyMarkup = getOrderCopyReplyMarkup(order)

    await sendTelegramMessage(token, chatId, message, {
      replyMarkup: copyReplyMarkup,
    })

    if (photos.length === 0) {
      return true
    }

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
