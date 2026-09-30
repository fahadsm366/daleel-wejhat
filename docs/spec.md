# مواصفات «دليل الوجهات»

## 1. الجمهور
- **المواطن السعودي**: بيانات 199 دولة جاهزة في `data/countries.json`.
- **المقيم في المملكة**: شروطه تتحدد بجنسية جوازه أولاً، ثم بمزايا الإقامة (صلاحيتها المتبقية، والمهنة المدوّنة فيها). أكبر الجنسيات: بنغلاديش، الهند، باكستان، اليمن، مصر، السودان، الفلبين، سوريا.
- **المكاتب الشريكة**: مكاتب تأشيرات ومكاتب سفريات مرخّصة (ولاحقاً شريك تأمين مرخّص).
- **فريق الإدارة**: تحديث البيانات، اعتماد المكاتب، مراجعة التقييمات والتجارب.

## 2. الخدمات ومراحلها

| # | الخدمة | المرحلة |
|---|---|---|
| 1 | دليل الدخول للدول | الأولى |
| 2 | قائمة ما قبل السفر | الأولى |
| 3 | طلب تأشيرة عبر المكاتب (عمولة) | الأولى |
| 4 | محظورات الدول (ما تحمله معك) | الأولى، لأهم 30 وجهة |
| 5 | السياسات الداخلية للدول (ما تفعله هناك) | الأولى، لأهم 30 وجهة |
| 6 | تجارب المسافرين | الأولى: تقييم المكاتب. الثانية: تجارب الدخول |
| 7 | فاحص الأهلية للمقيم | الثانية |
| 8 | حجوزات عبر مكاتب السفريات (عمولة) | الثانية |
| 9 | تأمين السفر (إحالة لشريك مرخّص) | الثالثة، بعد تأكيد نظامي |

## 3. الصفحات (App Router)

| المسار | الصفحة | التوليد |
|---|---|---|
| `/` | الرئيسية: بحث بالدولة، مرشحات نوع الدخول والمنطقة، أبرز الوجهات | ISR |
| `/countries` | كل الدول، مع بحث وتصفية | ISR |
| `/countries/[slug]` | صفحة الدولة (انظر 4) | SSG + ISR |
| `/before-you-travel` | قواعد المغادرة من المملكة للمواطن والمقيم | SSG |
| `/visa-request/[slug]` | نموذج طلب التأشيرة | ديناميكية |
| `/requests/[id]` | متابعة الطلب والعروض والدفع والتقييم | ديناميكية، تتطلب دخول |
| `/offices/[id]` | ملف المكتب: الترخيص، الدول، التقييمات | ISR |
| `/partner/*` | لوحة المكتب: الطلبات الواردة، العروض، الطلبات المدفوعة، الأرباح | ديناميكية، دور المكتب |
| `/admin/*` | لوحة الإدارة: الدول، المحظورات، السياسات، المكاتب، التقييمات، العمولات | ديناميكية، دور الإدارة |
| `/resident-check` | فاحص الأهلية للمقيم (المرحلة الثانية) | ديناميكية |

**محركات البحث**: عنوان ووصف لكل صفحة دولة بصيغة «تأشيرة [الدولة] للسعوديين 2026: نوع الدخول والشروط»، وبيانات منظمة (JSON-LD) من نوع FAQPage، وخريطة موقع تلقائية، وروابط نصية بالعربية (`/countries/georgia` مع عنوان عربي).

## 4. صفحة الدولة
بالترتيب من الأعلى:
1. الاسم، ونوع الدخول (لون + كلمة)، ومدة الإقامة، وتاريخ آخر تحقق، وشارة «تحتاج تحقق» عند اللزوم.
2. تحذير السفر الرسمي إن وُجد، بارزاً.
3. **الدخول والشروط**: الملاحظات، الرسوم، التطعيمات، التأمين (إلزامي/موصى به)، شنغن.
4. **قائمة ما قبل السفر**: تتولد تلقائياً (انظر 5).
5. **المحظورات** (ما تحمله): مقسمة حسب التصنيف، ولكل بند درجة: ممنوع / يحتاج تصريح / يجب الإفصاح.
6. **السياسات الداخلية** (ما تفعله): مقسمة حسب المحور، ولكل بند درجة: مخالفة جنائية / غرامة / تنبيه. المخالفات الجنائية أولاً.
7. **اطلب تأشيرتك**: يظهر فقط إذا كان نوع الدخول `evisa` أو `evisa_or_voa` أو `visa_required` أو `eta`، مع عدد المكاتب المتاحة وأفضل تقييم.
8. **تجارب الدخول** (المرحلة الثانية).
9. المصادر وإخلاء المسؤولية.

## 5. قائمة ما قبل السفر (منطق التوليد)
- `gcc`: «هوية وطنية أصلية صالحة أكثر من 3 أشهر، أو الجواز». غير ذلك: «جواز صالح 3 أشهر» إذا `arabCountry`، وإلا «6 أشهر»، محسوبة من تاريخ المغادرة.
- `eta`: «استخرج التصريح الإلكتروني قبل السفر». `evisa`: «قدّم على التأشيرة الإلكترونية واطبعها». `visa_required`: «احجز موعد السفارة أو مركز التأشيرات مبكراً».
- `schengen`: «وثيقة تأمين شنغن بتغطية 30,000 يورو». غير ذلك: «تأمين سفر يغطي العلاج الطارئ».
- غير `gcc`: «حجز عودة أو مغادرة، وحجز الإقامة».
- `vaccination`: يُضاف كما هو.
- دائماً: «تأكد في أبشر من عدم وجود منع سفر أو تصريح مطلوب». للمقيم: «تأشيرة خروج وعودة، وجواز صالح 90 يوماً على الأقل».
- أهم بندين من المحظورات والسياسات للدولة.

## 6. مسار طلب التأشيرة (الخدمة التي تحقق الدخل)
حالات الطلب: `draft → submitted → offers_received → offer_accepted → paid → in_progress → completed | rejected_by_embassy | cancelled | refunded`.

1. المسافر يعبّئ: الوجهة، نوع التأشيرة، تاريخ السفر، عدد المسافرين، الجنسية، مدينة التقديم. لا مستندات في هذه المرحلة.
2. يُرسل الطلب لكل مكتب معتمد يغطي هذه الدولة، **دون بيانات تواصل المسافر**.
3. المكاتب ترسل عروضاً: السعر الكلي، المدة المتوقعة، ما يشمله العرض، صلاحية العرض.
4. المسافر يقارن العروض (السعر، المدة، التقييم) ويقبل واحداً.
5. **الدفع داخل المنصة** عبر بوابة الدفع مع تقسيم المبلغ: العمولة للمنصة والباقي لحساب المكتب لدى البوابة.
6. بعد الدفع فقط: تنكشف بيانات التواصل للطرفين، ويرفع المسافر المستندات (مشفرة).
7. المكتب يحدّث الحالة حتى الإنجاز.
8. عند `completed` أو `rejected_by_embassy`: يُفتح التقييم للمسافر.

**العمولة**: نسبة مئوية لكل مكتب (قابلة للتعديل من الإدارة، وقيمة افتراضية عامة)، تُحفظ في العرض وقت قبوله ولا تتغير بعدها. تصدر فاتورة إلكترونية للعمولة على كل عملية.

**الاسترداد**: سياسة مكتوبة تحدد متى يُسترد المبلغ (قبل بدء المكتب بالعمل)، ويتم الاسترداد عبر البوابة نفسها.

## 7. نموذج البيانات (Prisma، مبدئي)

```prisma
enum EntryType { gcc visa_free eta visa_on_arrival evisa_or_voa evisa visa_required }
enum Audience  { saudi_citizen resident }
enum Severity  { prohibited permit_required declare criminal fine notice }
enum Role      { traveler office admin }

model Country {
  id               String   @id @default(cuid())
  slug             String   @unique
  nameAr           String
  nameEn           String
  region           String
  arabCountry      Boolean  @default(false)
  schengen         Boolean  @default(false)
  travelAdvisory   Boolean  @default(false)
  entryRules       EntryRule[]
  prohibitions     Prohibition[]
  policies         LocalPolicy[]
  offices          OfficeCountry[]
}

model EntryRule {
  id                String    @id @default(cuid())
  countryId         String
  country           Country   @relation(fields: [countryId], references: [id])
  audience          Audience
  nationality       String?   // ISO-3166 alpha-2, للمقيم فقط
  entryType         EntryType
  stay              String?
  notes             String?
  fees              String?
  vaccination       String?
  insurance         String    // mandatory_for_visa | required_on_entry_verify | recommended
  residencyMinMonths Int?     // للمقيم: أقل صلاحية إقامة متبقية
  professions       String[]  // للمقيم: المهن المشروطة إن وُجدت
  needsVerification Boolean   @default(false)
  sourceUrl         String?
  verifiedAt        DateTime
  @@unique([countryId, audience, nationality])
}

model Prohibition {  // ما تحمله
  id         String   @id @default(cuid())
  countryId  String
  country    Country  @relation(fields: [countryId], references: [id])
  category   String   // medicine | devices | food | cash | other
  item       String
  severity   Severity // prohibited | permit_required | declare
  details    String?
  sourceUrl  String
  verifiedAt DateTime
}

model LocalPolicy {  // ما تفعله
  id         String   @id @default(cuid())
  countryId  String
  country    Country  @relation(fields: [countryId], references: [id])
  topic      String   // registration | driving | conduct | work | money | telecom | emergency
  title      String
  severity   Severity // criminal | fine | notice
  details    String
  sourceUrl  String
  verifiedAt DateTime
}

model User {
  id        String  @id @default(cuid())
  phone     String  @unique
  name      String?
  role      Role    @default(traveler)
  officeId  String?
}

model Office {
  id              String   @id @default(cuid())
  nameAr          String
  kind            String   // visa | travel | insurance
  licenseNumber   String   @unique
  licenseVerified Boolean  @default(false)
  commissionRate  Decimal  // مثال 0.10
  payoutAccountId String?  // معرّف الحساب لدى بوابة الدفع
  active          Boolean  @default(false)
  countries       OfficeCountry[]
}

model OfficeCountry {
  officeId  String
  countryId String
  office    Office  @relation(fields: [officeId], references: [id])
  country   Country @relation(fields: [countryId], references: [id])
  @@id([officeId, countryId])
}

model VisaRequest {
  id           String   @id @default(cuid())
  travelerId   String
  countryId    String
  visaType     String
  travelDate   DateTime
  travelers    Int
  nationality  String
  city         String
  status       String   // انظر حالات الطلب في القسم 6
  acceptedOfferId String?
  createdAt    DateTime @default(now())
}

model Offer {
  id             String   @id @default(cuid())
  requestId      String
  officeId       String
  priceHalalas   Int      // المبالغ بالهللات دائماً، لا أرقام عشرية
  commissionRate Decimal  // تُنسخ من المكتب وقت الإرسال
  durationDays   Int
  includes       String
  validUntil     DateTime
}

model Payment {
  id               String  @id @default(cuid())
  requestId        String  @unique
  gatewayRef       String  @unique
  amountHalalas    Int
  commissionHalalas Int
  status           String  // pending | captured | refunded | failed
  invoiceNumber    String?
}

model Review {
  id          String   @id @default(cuid())
  requestId   String   @unique   // تقييم واحد لكل طلب مدفوع
  officeId    String
  speed       Int
  priceKept   Int
  communication Int
  outcome     String   // approved | rejected
  text        String?
  officeReply String?
  status      String   // pending | published | hidden
}
```

## 8. استيراد البيانات
- `data/countries.json` يُستورد عبر سكربت `prisma/seed.ts` إلى `Country` و `EntryRule` (audience = saudi_citizen).
- المحظورات والسياسات تُدخل من لوحة الإدارة، مصدراً رسمياً لكل بند.
- لوحة الإدارة تعرض قائمة «تحتاج تحقق» وقائمة «أقدم تحقق» لتحديث البيانات دورياً.

## 9. الأمان والامتثال
- الدخول برقم الجوال ورمز تحقق (OTP). الأدوار: مسافر، مكتب، إدارة.
- المستندات المرفوعة في تخزين خاص مشفر، بروابط مؤقتة، وتُحذف بعد انتهاء الطلب بمدة محددة.
- سجل تدقيق لكل تغيير في بيانات الدول والعمولات والمدفوعات.
- صفحات إلزامية: الشروط والأحكام، سياسة الخصوصية، سياسة الاسترداد، سياسة التقييمات، اتفاقية المكاتب الشريكة.

## 10. نقاط مفتوحة (تُسأل لصاحب المشروع)
- اختيار بوابة الدفع التي تدعم تقسيم المبلغ.
- نسبة العمولة الافتراضية.
- مزود رسائل الـ OTP.
- الاستضافة النهائية.
- النموذج النظامي لإحالة التأمين (المرحلة الثالثة).
