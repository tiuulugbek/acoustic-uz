# Word fayldan mahsulotlarni import qilish

## 1. Kerakli kutubxonalarni o'rnatish

```bash
cd /root/acoustic.uz
npm install mammoth
# yoki
pnpm add mammoth
```

## 2. Word faylni JSON formatiga o'tkazish

```bash
node scripts/convert-word-to-json.js <word-file-path> [output-json-path]
```

**Misol:**
```bash
node scripts/convert-word-to-json.js products.docx products.json
```

## 3. JSON faylni import qilish

```bash
# Agar JSON fayl to'g'ri formatda bo'lsa
node scripts/import-resound-products.js products.json

# Yoki SQL fayl yaratib, keyin import qilish
node scripts/generate-import-sql.js products.json
PGPASSWORD='Acoustic##4114' psql -h localhost -U acoustic_user -d acousticwebdb -f /tmp/import-resound-products.sql
```

## Eslatma

`convert-word-to-json.js` skripti oddiy struktura uchun yozilgan. Agar Word faylingizda jadval yoki murakkab struktura bo'lsa, skriptni o'zgartirishingiz kerak bo'ladi.

Word fayl strukturasini ko'rsatsangiz, skriptni sizning strukturaga moslashtirib beraman.
