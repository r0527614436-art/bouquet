

# עדכון ה-Edge Function להשתמש ב-Google Apps Script

## מה נשנה
נחליף את ה-Webhook של Zapier ב-URL החדש של Google Apps Script שיצרת.

---

## שינויים בקוד

### קובץ: `supabase/functions/send-order/index.ts`

**לפני:**
```typescript
const zapierWebhookUrl = 'https://hooks.zapier.com/hooks/catch/26280346/ulixmam/';
```

**אחרי:**
```typescript
const googleAppsScriptUrl = 'https://script.google.com/macros/s/AKfycbwwlBVM5nHD0T3HbLHEi2bOe9jipXvDCVhxbfZrxfGELgcQFaVJ9CfSbFm_DBSJsxpAsw/exec';
```

---

## מבנה הנתונים שיישלח

הנתונים יישלחו בפורמט שה-Google Apps Script מצפה לקבל:

```json
{
  "event_date": "2026-02-02",
  "event_title": "דגם 101, דגם 102",
  "customer_name": "ישראל ישראלי",
  "phone": "052-1234567",
  "phone_mechutenet": "052-7654321",
  "address": "רחוב הפרחים 10, תל אביב"
}
```

---

## יתרונות המעבר

| Zapier | Google Apps Script |
|--------|-------------------|
| תלוי בשירות חיצוני | ישירות ל-Google |
| עלות חודשית | חינם לגמרי |
| בעיות בפרשנות תאריכים | שליטה מלאה על הפורמט |
| מוגבל לפי תוכנית | ללא הגבלות |

---

## פעולות

1. עדכון ה-URL ב-Edge Function
2. עדכון שם המשתנה והלוגים
3. פריסה מחדש של ה-Function
4. ביצוע הזמנת ניסיון לבדיקה

