import { sendSupportReplyEmail } from '@/lib/email'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

export type SupportTicketStatus = 'open' | 'awaiting_reply' | 'reply_sent' | 'closed'

export type SupportTicket = {
  id: string
  customer_name: string
  customer_email: string
  order_number?: string | null
  subject: string
  message: string
  status: SupportTicketStatus
  telegram_chat_id?: string | null
  telegram_message_id?: number | null
  reply_admin_telegram_id?: string | null
  reply_admin_name?: string | null
  reply_subject?: string | null
  reply_body?: string | null
  reply_sent_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

type CreateSupportTicketParams = {
  name: string
  email: string
  orderNumber?: string
  subject: string
  message: string
}

type SupportAdmin = {
  telegramId: string
  name: string
}

function service() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getSupabaseServiceClient() as any
}

export async function createSupportTicket(params: CreateSupportTicketParams): Promise<SupportTicket | null> {
  const { data, error } = await service()
    .from('support_tickets')
    .insert({
      customer_name: params.name,
      customer_email: params.email,
      order_number: params.orderNumber?.trim() || null,
      subject: params.subject,
      message: params.message,
    })
    .select('*')
    .single()

  if (error || !data) {
    console.error('Failed to create support ticket:', error)
    return null
  }

  return data as SupportTicket
}

export async function setSupportTicketTelegramMessage(params: {
  ticketId: string
  chatId: string
  messageId: number
}): Promise<void> {
  const { error } = await service()
    .from('support_tickets')
    .update({
      telegram_chat_id: params.chatId,
      telegram_message_id: params.messageId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.ticketId)

  if (error) {
    console.error('Failed to attach Telegram message to support ticket:', error)
  }
}

export async function getSupportTicketById(ticketId: string): Promise<SupportTicket | null> {
  const { data, error } = await service()
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .maybeSingle()

  if (error) {
    console.error('Failed to load support ticket:', error)
    return null
  }

  return (data as SupportTicket | null) ?? null
}

export async function startSupportTicketReply(params: {
  ticketId: string
  admin: SupportAdmin
}): Promise<{ ticket: SupportTicket | null; blockedBy?: string }> {
  const ticket = await getSupportTicketById(params.ticketId)
  if (!ticket) return { ticket: null }

  if (ticket.status === 'reply_sent') {
    return { ticket, blockedBy: 'reply_sent' }
  }

  if (
    ticket.status === 'awaiting_reply' &&
    ticket.reply_admin_telegram_id &&
    ticket.reply_admin_telegram_id !== params.admin.telegramId
  ) {
    return { ticket, blockedBy: ticket.reply_admin_name ?? ticket.reply_admin_telegram_id }
  }

  const { data, error } = await service()
    .from('support_tickets')
    .update({
      status: 'awaiting_reply',
      reply_admin_telegram_id: params.admin.telegramId,
      reply_admin_name: params.admin.name,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.ticketId)
    .select('*')
    .single()

  if (error || !data) {
    console.error('Failed to start support ticket reply:', error)
    return { ticket: null }
  }

  return { ticket: data as SupportTicket }
}

export async function getPendingSupportReplyForAdmin(telegramId: string): Promise<SupportTicket | null> {
  const { data, error } = await service()
    .from('support_tickets')
    .select('*')
    .eq('status', 'awaiting_reply')
    .eq('reply_admin_telegram_id', telegramId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Failed to load pending support reply:', error)
    return null
  }

  return (data as SupportTicket | null) ?? null
}

export async function cancelSupportTicketReply(ticketId: string, telegramId: string): Promise<boolean> {
  const { error } = await service()
    .from('support_tickets')
    .update({
      status: 'open',
      reply_admin_telegram_id: null,
      reply_admin_name: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ticketId)
    .eq('reply_admin_telegram_id', telegramId)
    .eq('status', 'awaiting_reply')

  if (error) {
    console.error('Failed to cancel support ticket reply:', error)
    return false
  }

  return true
}

export async function sendSupportTicketReply(params: {
  ticket: SupportTicket
  admin: SupportAdmin
  body: string
}): Promise<boolean> {
  const replySubject = `Re: ${params.ticket.subject}`
  const sent = await sendSupportReplyEmail({
    to: params.ticket.customer_email,
    customerName: params.ticket.customer_name,
    originalSubject: params.ticket.subject,
    orderNumber: params.ticket.order_number ?? undefined,
    replySubject,
    replyBody: params.body,
  })

  if (!sent) return false

  const { error } = await service()
    .from('support_tickets')
    .update({
      status: 'reply_sent',
      reply_admin_telegram_id: params.admin.telegramId,
      reply_admin_name: params.admin.name,
      reply_subject: replySubject,
      reply_body: params.body,
      reply_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.ticket.id)

  if (error) {
    console.error('Failed to mark support reply as sent:', error)
  }

  return true
}
