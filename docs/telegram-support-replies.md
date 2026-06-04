# Telegram support replies

## Variables

```env
TELEGRAM_BOT_TOKEN=123456:abc
TELEGRAM_ORDERS_CHAT_ID=-1001111111111
TELEGRAM_CONTACT_CHAT_ID=-1002222222222
TELEGRAM_WEBHOOK_SECRET=long-random-secret
TELEGRAM_ADMIN_USER_IDS=123456789,987654321
```

`TELEGRAM_CHAT_ID` is still supported as a fallback, but new deployments should use the two explicit chat IDs above.

## Telegram setup

1. Add the same bot as admin in both Telegram channels.
2. Ask every support admin to open the bot in a private chat and send `/start`.
3. Get each admin user ID from Telegram, then add the comma-separated list to `TELEGRAM_ADMIN_USER_IDS`.
4. Register the webhook after deployment:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -d "url=https://www.maillotaddict.fr/api/telegram/webhook" \
  -d "secret_token=$TELEGRAM_WEBHOOK_SECRET" \
  -d 'allowed_updates=["message","callback_query"]'
```

## Flow

Contact messages create a `support_tickets` row, then Telegram receives a support-channel message with a `Repondre par mail` button.

When an allowed admin clicks the button, the bot asks for the reply in private. The next private message is sent to the customer through Resend and the ticket is marked as `reply_sent`.
