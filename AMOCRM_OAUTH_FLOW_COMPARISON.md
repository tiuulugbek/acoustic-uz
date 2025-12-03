# AmoCRM OAuth Flow - PHP vs Node.js Comparison

## PHP Library Pattern (thephpleague/oauth2-client)

PHP library'da OAuth flow quyidagicha:

```php
use AmoCRM\OAuth2\Client\Provider\AmoCRM;

$provider = new AmoCRM([
    'clientId'     => 'YOUR_CLIENT_ID',
    'clientSecret' => 'YOUR_CLIENT_SECRET',
    'redirectUri'  => 'http://your-redirect-uri',
]);

// Authorization URL olish va redirect qilish
if (!isset($_GET['code'])) {
    $authUrl = $provider->getAuthorizationUrl();
    header('Location: ' . $authUrl);
    exit;
}

// Callback'da code olish va token exchange
if (isset($_GET['code'])) {
    $token = $provider->getAccessToken('authorization_code', [
        'code' => $_GET['code']
    ]);
    // Token'larni saqlash
}
```

**Muhim:** PHP'da `header('Location: ...')` orqali to'g'ridan-to'g'ri browser redirect qilinadi.

## Node.js/NestJS Pattern (Bizning Kodimiz)

Bizning kodimiz ham shu pattern'ga mos keladi:

### Backend (`amocrm.controller.ts`):

```typescript
@Get('authorize')
async getAuthorizationUrl(@Res() res: Response) {
  // ... settings olish ...
  
  const authUrl = `https://${cleanDomain}/oauth2/authorize?client_id=${clientId}&...`;
  
  // To'g'ridan-to'g'ri redirect (PHP'dagi header('Location') kabi)
  return res.redirect(authUrl);
}
```

### Frontend (`Settings.tsx`):

```typescript
const handleAmoCRMAuthorize = () => {
  // To'g'ridan-to'g'ri browser redirect (PHP'dagi header('Location') kabi)
  window.location.href = `${API_BASE}/amocrm/authorize`;
};
```

## Qiyoslash

| PHP Library | Bizning Kodimiz | Status |
|------------|-----------------|--------|
| `header('Location: ...')` | `res.redirect(...)` | ✅ Mos |
| To'g'ridan-to'g'ri browser redirect | `window.location.href` | ✅ Mos |
| Cookie'lar avtomatik yuboriladi | Cookie'lar avtomatik yuboriladi | ✅ Mos |
| State parameter (CSRF) | State parameter (CSRF) | ✅ Mos |
| Token exchange | Token exchange | ✅ Mos |

## Xulosa

Bizning kodimiz PHP library pattern'iga mos keladi va to'g'ri ishlashi kerak. 405 xatosi muammosi hal qilindi, chunki endi to'g'ridan-to'g'ri browser redirect ishlatilmoqda.

