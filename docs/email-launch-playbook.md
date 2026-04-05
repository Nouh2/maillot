# Email Launch Playbook

## Stack

- Transactional emails: Resend
- Auth / magic link: Supabase SMTP branché sur Resend
- Marketing lifecycle: Brevo
- Internal previews and test sends: `/ops/emails`

## Active transactional emails in code

- `order_paid`
  - Trigger: paiement Stripe confirmé
  - Purpose: confirmer la commande et rediriger vers le suivi
- `tracking`
  - Trigger: tracking ajouté puis envoyé depuis `/ops`
  - Purpose: partager le lien/numéro de suivi
- `support_ack`
  - Trigger: formulaire de contact
  - Purpose: accuser réception de la demande

## Ready-to-use lifecycle emails

- `account_welcome`
  - Use case: après création / première connexion compte
- `delivered`
  - Use case: quand la commande est marquée livrée
- `abandoned_cart`
  - Use case: flow Brevo panier abandonné
- `post_purchase`
  - Use case: flow Brevo 7 jours après achat
- `win_back`
  - Use case: flow Brevo 30-45 jours après dernier achat

## Suggested launch flows

### Brevo

1. `abandoned_cart`
   - Trigger: contact avec opt-in marketing + checkout non finalisé
   - Delay: 1 heure
2. `post_purchase`
   - Trigger: achat confirmé
   - Delay: 7 jours
3. `win_back`
   - Trigger: aucun nouvel achat
   - Delay: 45 jours

### Supabase auth template

Suggested subject:

`Connexion a ton compte Maillot Addict`

Suggested body copy:

`Bonjour,`

`Clique sur le bouton ci-dessous pour te connecter a ton compte Maillot Addict et retrouver tes commandes.`

CTA:

`Ouvrir mon compte`

Footer:

`Si tu n es pas a l origine de cette demande, ignore simplement cet email.`

## Internal usage

- Preview all templates: `/ops/emails`
- Send a real test email from the internal lab
- Manage tracking sends from `/ops`
