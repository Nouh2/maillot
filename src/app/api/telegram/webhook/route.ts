import { NextRequest, NextResponse } from 'next/server'
import {
  answerTelegramCallbackQuery,
  sendTelegramChannelMessage,
  sendTelegramPrivateMessage,
  updateTelegramSupportReplyButton,
} from '@/lib/telegram'
import {
  cancelSupportTicketReply,
  getPendingSupportReplyForAdmin,
  sendSupportTicketReply,
  startSupportTicketReply,
} from '@/lib/support'

const SUPPORT_REPLY_CALLBACK_PREFIX = 'support_reply:'

type TelegramUser = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
}

type TelegramMessage = {
  message_id: number
  text?: string
  chat: {
    id: number | string
    type?: string
  }
  from?: TelegramUser
}

type TelegramCallbackQuery = {
  id: string
  from: TelegramUser
  data?: string
  message?: TelegramMessage
}

type TelegramUpdate = {
  callback_query?: TelegramCallbackQuery
  message?: TelegramMessage
}

function isValidTelegramWebhook(request: NextRequest): boolean {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim()
  if (!expectedSecret) return false

  return request.headers.get('x-telegram-bot-api-secret-token') === expectedSecret
}

function getAdminTelegramIds(): Set<string> {
  return new Set(
    (process.env.TELEGRAM_ADMIN_USER_IDS ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  )
}

function isTelegramAdmin(userId: number): boolean {
  return getAdminTelegramIds().has(String(userId))
}

function getTelegramUserDisplayName(user: TelegramUser): string {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
  return fullName || user.username || String(user.id)
}

function escapeTelegramHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

async function safeAnswerCallback(params: {
  callbackQueryId: string
  text?: string
  showAlert?: boolean
}) {
  try {
    await answerTelegramCallbackQuery(params)
  } catch (error) {
    console.error('Failed to answer Telegram callback:', error)
  }
}

async function handleSupportReplyCallback(callback: TelegramCallbackQuery): Promise<void> {
  const ticketId = callback.data?.slice(SUPPORT_REPLY_CALLBACK_PREFIX.length).trim()
  if (!ticketId) {
    await safeAnswerCallback({
      callbackQueryId: callback.id,
      text: 'Ticket introuvable.',
      showAlert: true,
    })
    return
  }

  if (!isTelegramAdmin(callback.from.id)) {
    await safeAnswerCallback({
      callbackQueryId: callback.id,
      text: 'Tu n es pas autorise a repondre.',
      showAlert: true,
    })
    return
  }

  const admin = {
    telegramId: String(callback.from.id),
    name: getTelegramUserDisplayName(callback.from),
  }

  const result = await startSupportTicketReply({ ticketId, admin })
  if (!result.ticket) {
    await safeAnswerCallback({
      callbackQueryId: callback.id,
      text: 'Impossible de charger ce ticket.',
      showAlert: true,
    })
    return
  }

  if (result.blockedBy === 'reply_sent') {
    await safeAnswerCallback({
      callbackQueryId: callback.id,
      text: 'Une reponse a deja ete envoyee.',
      showAlert: true,
    })
    return
  }

  if (result.blockedBy) {
    await safeAnswerCallback({
      callbackQueryId: callback.id,
      text: `Deja pris par ${result.blockedBy}.`,
      showAlert: true,
    })
    return
  }

  const privateMessage = [
    `<b>Reponse support</b>`,
    '',
    `<b>Client :</b> ${escapeTelegramHtml(result.ticket.customer_name)} (${escapeTelegramHtml(result.ticket.customer_email)})`,
    `<b>Sujet :</b> ${escapeTelegramHtml(result.ticket.subject)}`,
    result.ticket.order_number ? `<b>Commande :</b> ${escapeTelegramHtml(result.ticket.order_number)}` : '',
    '',
    'Ecris maintenant le texte du mail a envoyer au client.',
    'Envoie /annuler pour abandonner la reponse.',
  ].filter(Boolean).join('\n')

  const privateDelivered = await sendTelegramPrivateMessage(admin.telegramId, privateMessage)
  if (!privateDelivered) {
    await cancelSupportTicketReply(result.ticket.id, admin.telegramId)
    await safeAnswerCallback({
      callbackQueryId: callback.id,
      text: 'Ouvre d abord le bot en prive avec /start, puis reclique sur le bouton.',
      showAlert: true,
    })
    return
  }

  await safeAnswerCallback({
    callbackQueryId: callback.id,
    text: 'Je t ai envoye le ticket en prive.',
  })

  if (result.ticket.telegram_chat_id && result.ticket.telegram_message_id) {
    await updateTelegramSupportReplyButton({
      chatId: result.ticket.telegram_chat_id,
      messageId: result.ticket.telegram_message_id,
      label: `Reponse en cours: ${admin.name}`,
      ticketId: result.ticket.id,
    }).catch((error) => {
      console.error('Failed to update support reply button:', error)
    })
  }
}

async function handlePrivateAdminMessage(message: TelegramMessage): Promise<void> {
  if (message.chat.type !== 'private' || !message.from || !message.text?.trim()) return
  if (!isTelegramAdmin(message.from.id)) return

  const admin = {
    telegramId: String(message.from.id),
    name: getTelegramUserDisplayName(message.from),
  }

  const ticket = await getPendingSupportReplyForAdmin(admin.telegramId)
  if (!ticket) {
    await sendTelegramPrivateMessage(
      admin.telegramId,
      'Aucun ticket support en attente. Clique sur "Repondre par mail" depuis le canal reclamations.'
    )
    return
  }

  const text = message.text.trim()
  if (text.toLowerCase() === '/annuler') {
    await cancelSupportTicketReply(ticket.id, admin.telegramId)
    await sendTelegramPrivateMessage(admin.telegramId, 'Reponse annulee. Le ticket est de nouveau disponible.')
    return
  }

  if (text.length < 10) {
    await sendTelegramPrivateMessage(admin.telegramId, 'La reponse est trop courte. Envoie un mail plus complet ou /annuler.')
    return
  }

  if (text.length > 5000) {
    await sendTelegramPrivateMessage(admin.telegramId, 'La reponse est trop longue. Reste sous 5000 caracteres.')
    return
  }

  const sent = await sendSupportTicketReply({
    ticket,
    admin,
    body: text,
  })

  if (!sent) {
    await sendTelegramPrivateMessage(admin.telegramId, 'Impossible d envoyer le mail pour le moment. Reessaie dans quelques minutes.')
    return
  }

  await sendTelegramPrivateMessage(
    admin.telegramId,
    `Mail envoye a ${escapeTelegramHtml(ticket.customer_email)} pour le ticket ${ticket.id.slice(0, 8)}.`
  )

  if (ticket.telegram_chat_id) {
    await sendTelegramChannelMessage({
      chatId: ticket.telegram_chat_id,
      replyToMessageId: ticket.telegram_message_id ?? undefined,
      text: `Reponse envoyee par <b>${escapeTelegramHtml(admin.name)}</b> a ${escapeTelegramHtml(ticket.customer_email)}.`,
    })
  }
}

export async function POST(request: NextRequest) {
  if (!isValidTelegramWebhook(request)) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  let update: TelegramUpdate
  try {
    update = await request.json()
  } catch {
    return NextResponse.json({ error: 'Requete invalide' }, { status: 400 })
  }

  if (update.callback_query?.data?.startsWith(SUPPORT_REPLY_CALLBACK_PREFIX)) {
    await handleSupportReplyCallback(update.callback_query)
  } else if (update.message) {
    await handlePrivateAdminMessage(update.message)
  }

  return NextResponse.json({ ok: true })
}
