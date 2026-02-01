
# תוכנית לתיקון בעיית Zapier ויומן גוגל

## סיכום הבעיה
במקום שייווצר אירוע בודד בתאריך ההזמנה, Zapier יוצר אירועים בכל הימים ביומן.

---

## שלב 1: תיקון פורמט התאריך בקוד

כרגע התאריך נשלח בפורמט ISO מלא:
```
"2026-02-02T00:00:00.000Z"
```

נשנה אותו לפורמט פשוט יותר שGoogle Calendar מבין טוב יותר:
```
"2026-02-02"
```

### שינוי בקובץ `supabase/functions/send-order/index.ts`:
```typescript
// לפני:
event_date: orderData.event_date,

// אחרי - המרה לפורמט תאריך בלבד:
event_date: orderData.event_date.split('T')[0],  // "2026-02-02"
```

---

## שלב 2: הוספת שדות נוספים לדיוק

נוסיף שדות נפרדים שיעזרו ל-Zapier למפות נכון:

```typescript
const zapierPayload = {
  // תאריך בפורמט YYYY-MM-DD בלבד
  event_date: orderData.event_date.split('T')[0],
  
  // שדות נוספים לגיבוי
  start_date: orderData.event_date.split('T')[0],
  start_time: "09:00",  // שעת התחלה קבועה
  end_time: "10:00",    // שעת סיום קבועה
  all_day: true,        // אירוע של יום שלם
  
  // שאר השדות
  event_title: eventTitle,
  event_description: eventDescription,
  customer_name: orderData.customer_name,
  phone: orderData.phone,
  address: orderData.address || ''
};
```

---

## שלב 3: הוראות למיפוי נכון ב-Zapier

לאחר השינוי, יש לוודא את ההגדרות הבאות ב-Zap:

| שדה ב-Google Calendar | מיפוי מהWebhook |
|----------------------|-----------------|
| **Summary** | `event_title` |
| **Start Date & Time** | `event_date` או `start_date` |
| **All Day Event** | Yes / `all_day` |
| **Description** | `event_description` |
| **Repeat** | None (חשוב! לא לבחור חזרה) |

---

## שלב 4: פריסה ובדיקה

1. עדכון ופריסה מחדש של Edge Function
2. ביצוע הזמנת ניסיון
3. בדיקה שנוצר אירוע בודד בתאריך הנכון

---

## פרטים טכניים

### קובץ לעריכה:
- `supabase/functions/send-order/index.ts`

### שינויים עיקריים:
1. המרת `event_date` מפורמט ISO לפורמט תאריך פשוט
2. הוספת שדות `start_date`, `all_day` לגיבוי
3. פריסה מחדש של ה-Edge Function

### זמן משוער: 5 דקות
