# JSON Fayllar Qayerda Shakllanadi?

## Joylashuvi

### Development (Local)

**Papka:**
```
apps/frontend/public/data/
```

**To'liq yo'l:**
```
/Users/tiuulugbek/acoustic-uz/apps/frontend/public/data/
```

**Fayl nomlari:**
```
banners-uz.json
banners-ru.json
homepage-services-uz.json
homepage-services-ru.json
catalogs-uz.json
catalogs-ru.json
showcase-interacoustics-uz.json
showcase-interacoustics-ru.json
va hokazo...
```

### Production (Server)

**Variant 1: Environment variable bo'lsa**
```bash
JSON_DATA_DIR=/var/www/acousticuz/data/json-cache
```

**Variant 2: Environment variable bo'lmasa**
```
data/  (project root'da)
```

**To'liq yo'l:**
```
/var/www/acousticuz/data/json-cache/  (agar JSON_DATA_DIR bo'lsa)
yoki
/var/www/acousticuz/data/  (agar JSON_DATA_DIR bo'lmasa)
```

## Kodda Qayerda?

### 1. Papka Yaratish

**Fayl:** `apps/frontend/src/lib/json-data.ts`

```typescript
const DATA_DIR = process.env.JSON_DATA_DIR 
  ? process.env.JSON_DATA_DIR 
  : join(process.cwd(), process.env.NODE_ENV === 'production' ? 'data' : 'public', 'data');

async function ensureDataDir(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}
```

### 2. Fayl Yo'li

```typescript
function getJsonPath(key: string, locale: string = 'uz'): string {
  return join(DATA_DIR, `${key}-${locale}.json`);
}
```

**Misol:**
- `key = "banners"`, `locale = "uz"` → `banners-uz.json`
- `key = "banners"`, `locale = "ru"` → `banners-ru.json`

### 3. Fayl Yozish

```typescript
export async function writeJsonData<T>(
  key: string,
  data: T,
  locale: string = 'uz',
): Promise<void> {
  await ensureDataDir();
  const filePath = getJsonPath(key, locale);
  await writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
}
```

## Qachon Yaratiladi?

### Avtomatik (Birinchi So'rovda)

1. Frontend ishga tushadi
2. Birinchi so'rovda backend'dan ma'lumotlar olinadi
3. `writeJsonData()` chaqiriladi
4. `ensureDataDir()` papka yaratadi (agar yo'q bo'lsa)
5. JSON fayl yoziladi

### Manual (Script Orqali)

```bash
npm run generate-json
```

Bu script barcha ma'lumotlarni backend'dan oladi va JSON fayllarga yozadi.

## Ko'rish

### Development'da

```bash
# JSON fayllarni ko'rish
ls -la apps/frontend/public/data/

# Tarkibini ko'rish
cat apps/frontend/public/data/banners-uz.json
```

### Production'da

```bash
# Agar JSON_DATA_DIR bo'lsa
ls -la /var/www/acousticuz/data/json-cache/

# Agar JSON_DATA_DIR bo'lmasa
ls -la /var/www/acousticuz/data/
```

## Xulosa

**Development:**
- `apps/frontend/public/data/` papkasida
- Avtomatik yaratiladi (birinchi so'rovda)

**Production:**
- `JSON_DATA_DIR` environment variable bo'lsa → u yerda
- Bo'lmasa → `data/` papkasida (project root'da)





