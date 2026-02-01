

# עדכון פורמט התאריך ב-Webhook לזפייר

## מה נשנה
נעדכן את ה-payload שנשלח ל-Zapier כך שיכלול תאריך ושעת התחלה וסיום מפורשים:
- **התחלה**: 00:01 בלילה (תחילת היום)
- **סיום**: 23:59 (סוף היום)

---

## שינויים בקוד

### קובץ: `supabase/functions/send-order/index.ts`

**לפני:**
```typescript
const zapierPayload = {
  event_date: eventDateOnly,
  start_date: eventDateOnly,
  all_day: true,
  start_time: "09:00",
  end_time: "10:00",
  ...
};
```

**אחרי:**
```typescript
const zapierPayload = {
  // תאריך בלבד
  event_date: eventDateOnly,
  
  // תאריך ושעת התחלה - תחילת היום
  start_date: eventDateOnly,
  start_time: "00:01",
  start_datetime: `${eventDateOnly}T00:01:00`,
  
  // תאריך ושעת סיום - סוף היום
  end_date: eventDateOnly,
  end_time: "23:59",
  end_datetime: `${eventDateOnly}T23:59:00`,
  
  // אירוע של יום שלם
  all_day: true,
  ...
};
```

---

## הפורמט החדש שיישלח ל-Zapier

```json
{
  "event_date": "2026-02-02",
  "start_date": "2026-02-02",
  "start_time": "00:01",
  "start_datetime": "2026-02-02T00:01:00",
  "end_date": "2026-02-02",
  "end_time": "23:59",
  "end_datetime": "2026-02-02T23:59:00",
  "all_day": true,
  "event_title": "דגם 101",
  "event_description": "שם המזמין: ...",
  ...
}
```

---

## מיפוי ב-Zapier

| שדה ב-Google Calendar | מיפוי מה-Webhook |
|----------------------|------------------|
| **Start Date & Time** | `start_datetime` |
| **End Date & Time** | `end_datetime` |
| **All Day Event** | Yes |

---

## פעולות

1. עדכון הקוד ב-Edge Function
2. פריסה מחדש
3. ביצוע הזמנת ניסיון לבדיקה

