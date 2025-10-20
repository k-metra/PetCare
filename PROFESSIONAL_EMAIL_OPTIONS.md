# Professional Email Service Setup

## SendGrid Configuration (Recommended for Production)

### Benefits:
- ✅ Complete control over FROM address
- ✅ Better deliverability 
- ✅ Professional appearance
- ✅ Email analytics and tracking
- ✅ 100 emails/day free tier

### Setup Steps:

1. **Sign up at SendGrid**: https://sendgrid.com
2. **Create API Key**:
   - Go to Settings → API Keys
   - Create key with "Mail Send" permissions
3. **Update .env**:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key-here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="PetCare Veterinary Clinic"
```

## Mailgun Configuration (Alternative)

### Benefits:
- ✅ Laravel-friendly
- ✅ Good documentation
- ✅ 5000 emails/month free

### Setup Steps:

1. **Sign up at Mailgun**: https://mailgun.com
2. **Add domain** (or use sandbox domain for testing)
3. **Update .env**:

```env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=your-domain.com
MAILGUN_SECRET=your-mailgun-api-key
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="PetCare Veterinary Clinic"
```

## Comparison

| Service | Free Tier | From Address Control | Setup Difficulty |
|---------|-----------|---------------------|------------------|
| Gmail | 500/day | Limited (aliases only) | Easy |
| SendGrid | 100/day | Full Control | Medium |
| Mailgun | 5000/month | Full Control | Medium |
| Dedicated Gmail | Unlimited | Full Control | Easy |

## Recommendation

**For Development/Testing**: Use Gmail with plus addressing (`metrakurt+petcare@gmail.com`)
**For Production**: Use SendGrid or create dedicated Gmail account