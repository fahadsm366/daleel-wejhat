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
| `/` | الرئيسية: بحث بالدولة، مرشحات نوع الدخول والمنطقة (محفوظة في الرابط `?q=&type=&region=`)، أبرز الوجهات (الدول ذات `featuredOrder`، مرتبة به) | ISR |
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
1. الاسم، ونوع الدخول (لون + كلمة)، ومدة الإقامة، والمصدر وتاريخ آخر تحقق، وشارة «تحتاج تحقق» عند اللزوم، وتنبيه انتهاء الإعفاء المؤقت إن وُجد (انظر 4.2).
2. تحذير السفر الرسمي إن وُجد، بارزاً (انظر 4.1).
3. **الدخول والشروط**: الملاحظات، الرسوم، التطعيمات، التأمين (إلزامي/موصى به)، شنغن.
4. **قائمة ما قبل السفر**: تتولد تلقائياً (انظر 5).
5. **المحظورات** (ما تحمله): مقسمة حسب التصنيف، ولكل بند درجة: ممنوع / يحتاج تصريح / يجب الإفصاح.
6. **السياسات الداخلية** (ما تفعله): مقسمة حسب المحور، ولكل بند درجة: مخالفة جنائية / غرامة / تنبيه. المخالفات الجنائية أولاً.
7. **اطلب تأشيرتك**: يظهر فقط إذا كان نوع الدخول `evisa` أو `evisa_or_voa` أو `visa_required` أو `eta`، **ولم يكن على الدولة تحذير سفر** (`travelAdvisory`)، مع عدد المكاتب المتاحة وأفضل تقييم.
8. **تجارب الدخول** (المرحلة الثانية).
9. المصادر وإخلاء المسؤولية.

### 4.1 الدول المحذّر منها (`travelAdvisory = true`)
- صفحة الدولة موجودة ومفهرسة، والتحذير بارز أعلاها.
- تُستبعد من «أبرز الوجهات» ومن القائمة الافتراضية في الصفحة الرئيسية، حتى لو كان لها `featuredOrder`.
- تظهر في نتائج البحث عند كتابة اسمها، مع شارة التحذير.
- **طلب التأشيرة معطّل** لها: لا يظهر قسم «اطلب تأشيرتك»، ويرفض الخادم أي طلب لها.

### 4.2 الإعفاءات المؤقتة (`validUntil` و `entryTypeAfter`)
- `validUntil`: آخر يوم تصح فيه الحالة الحالية. `entryTypeAfter`: الحالة بعده إن كانت معروفة.
- **تنبيه في لوحة الإدارة قبل الانتهاء**: قائمة «إعفاءات تقترب من الانتهاء» تظهر فيها الدولة قبل 30 يوماً من `validUntil` مع عدد الأيام المتبقية، ويصبح التنبيه عاجلاً قبل 7 أيام. مدة التنبيه إعداد قابل للتعديل، لا رقم ثابت في الكود.
- **خلال الثلاثين يوماً**: صفحة الدولة تعرض للمسافر «هذا الإعفاء ينتهي في [التاريخ]».
- **بعد الانتهاء، إذا كانت `entryTypeAfter` معروفة**: تعرض الصفحة الحالة الجديدة تلقائياً، مع «انتهى الإعفاء في [التاريخ]» وشارة «تحتاج تحقق» حتى يُحدَّث السجل. مدة الإقامة المخزنة لا تُعرض لأنها تخص الحالة السابقة.
- **بعد الانتهاء، إذا لم تكن معروفة**: تختفي الحالة القديمة، ويظهر «انتهى الإعفاء في [التاريخ]، والحالة الحالية قيد التحقق» مع شارة «تحتاج تحقق»، وتبقى الدولة في قائمة الإدارة حتى يُحدَّث سجلها.
- إعادة توليد صفحات الدول (ISR) يومية على الأقل، حتى يتغير العرض في يوم الانتهاء دون تدخل يدوي.
- اليوم يُحسب بتوقيت الرياض، و`validUntil` نفسه آخر يوم سارٍ.
- المنطق دالة واحدة مختبرة (`src/lib/entry-validity.ts`): قبل التنبيه، داخل التنبيه، داخل التنبيه العاجل، بعد الانتهاء مع حالة معروفة، بعده بلا حالة معروفة.

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

## 7. نموذج البيانات (Prisma)

المرجع التنفيذي هو `prisma/schema.prisma`، وهذا القسم يُحدَّث معه. قرارات النموذج:
- **المصدر لكل معلومة**: `sourceName` إلزامي و `sourceUrl` اختياري. السجل بلا رابط رسمي يظهر في قائمة الإدارة «يحتاج مصدراً رسمياً».
- **الجنسية إلزامية** في `EntryRule`، والمواطن السعودي = `"SA"`، حتى يعمل القيد الفريد (PostgreSQL لا يعدّ القيم الفارغة مكررة).
- **الحالات والتصنيفات أنواع محددة (enum)** لا نص حر. ودرجات المحظورات (`ProhibitionSeverity`) منفصلة عن درجات السياسات (`PolicySeverity`).
- **العلاقات صريحة**، والحذف مقيّد (`Restrict`) لكل ما يتصل بالطلبات والمال، فلا يُحذف سجل مالي بالتسلسل.
- **`Office.commissionRate` فارغة** تعني النسبة الافتراضية العامة. النسبة تُنسخ في `Offer` وقت الإرسال ولا تتغير بعدها.
- **قيود CHECK في قاعدة البيانات** (ملف الترحيل `init`): المبالغ بالهللات موجبة، والعمولة لا تتجاوز المبلغ، والنسب بين 0 و 1، والتقييم من 1 إلى 5، وعدد المسافرين 1 فأكثر، والجنسية رمز من حرفين، و `entryTypeAfter` لا يوجد دون `validUntil`، ورد المكتب ووقته يأتيان معاً.
- **جداول تنفّذ قواعد CLAUDE.md**: `Message` (التواصل قبل الدفع داخل المنصة)، `Document` (مرجع المستند المشفّر وموعد حذفه)، `AuditLog` (سجل التدقيق).
- **مؤجلة إلى مهامها**: رموز التحقق والجلسات (المهمة 12)، الإشعارات (19)، تفاصيل الفاتورة الإلكترونية (20)، النسبة الافتراضية للعمولة (13).
- **ترجمات المناطق وأنواع الدخول** في `messages/ar.json` لا في قاعدة البيانات.

```prisma
// ───────────── الأنواع ─────────────

enum EntryType {
  gcc
  visa_free
  eta
  visa_on_arrival
  evisa_or_voa
  evisa
  visa_required
}

enum Audience {
  saudi_citizen
  resident
}

enum Region {
  gulf
  middle_east
  africa
  europe
  asia
  north_central_america
  caribbean
  south_america
  oceania
}

enum InsuranceRequirement {
  mandatory_for_visa
  required_on_entry_verify
  recommended
}

enum ProhibitionCategory {
  medicine
  devices
  food
  cash
  other
}

/// ما تحمله: ممنوع / يحتاج تصريح / يجب الإفصاح
enum ProhibitionSeverity {
  prohibited
  permit_required
  declare
}

enum PolicyTopic {
  registration
  driving
  conduct
  work
  money
  telecom
  emergency
}

/// ما تفعله: مخالفة جنائية / غرامة / تنبيه
enum PolicySeverity {
  criminal
  fine
  notice
}

enum Role {
  traveler
  office
  admin
}

enum OfficeKind {
  visa
  travel
  insurance
}

enum RequestStatus {
  draft
  submitted
  offers_received
  offer_accepted
  paid
  in_progress
  completed
  rejected_by_embassy
  cancelled
  refunded
}

enum OfferStatus {
  pending
  accepted
  declined
  expired
  withdrawn
}

enum PaymentStatus {
  pending
  captured
  refunded
  failed
}

enum ReviewOutcome {
  approved
  rejected
}

enum ReviewStatus {
  pending
  published
  hidden
}

enum DocumentKind {
  passport
  residence_permit
  photo
  other
}

enum AuditAction {
  create
  update
  delete
}

// ───────────── الدول ومعلومات الدخول ─────────────

model Country {
  id             String          @id @default(cuid())
  slug           String          @unique
  nameAr         String
  nameEn         String
  region         Region
  arabCountry    Boolean         @default(false)
  schengen       Boolean         @default(false)
  travelAdvisory Boolean         @default(false)
  /// ترتيب الدولة في «أبرز الوجهات» بالرئيسية (1 أولاً). null = غير مميزة.
  /// الدولة التي عليها تحذير سفر لا تظهر هناك حتى لو كان لها ترتيب.
  featuredOrder  Int?            @unique
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  entryRules     EntryRule[]
  prohibitions   Prohibition[]
  policies       LocalPolicy[]
  offices        OfficeCountry[]
  visaRequests   VisaRequest[]

  @@index([region])
}

model EntryRule {
  id                 String               @id @default(cuid())
  countryId          String
  country            Country              @relation(fields: [countryId], references: [id], onDelete: Cascade)
  audience           Audience
  /// ISO-3166 alpha-2 لجواز المسافر. المواطن السعودي = "SA".
  nationality        String
  entryType          EntryType
  stay               String?
  notes              String?
  fees               String?
  vaccination        String?
  insurance          InsuranceRequirement
  /// للمقيم: أقل صلاحية إقامة متبقية بالأشهر
  residencyMinMonths Int?
  /// للمقيم: المهن المشروطة إن وجدت
  professions        String[]
  needsVerification  Boolean              @default(false)
  /// آخر يوم تصح فيه الحالة الحالية (إعفاء مؤقت)
  validUntil         DateTime?            @db.Date
  /// الحالة بعد validUntil إن كانت معروفة
  entryTypeAfter     EntryType?
  sourceName         String
  sourceUrl          String?
  verifiedAt         DateTime             @db.Date
  createdAt          DateTime             @default(now())
  updatedAt          DateTime             @updatedAt

  @@unique([countryId, audience, nationality])
  @@index([entryType])
  @@index([validUntil])
}

/// ما تحمله
model Prohibition {
  id         String              @id @default(cuid())
  countryId  String
  country    Country             @relation(fields: [countryId], references: [id], onDelete: Cascade)
  category   ProhibitionCategory
  item       String
  severity   ProhibitionSeverity
  details    String?
  sourceUrl  String
  verifiedAt DateTime            @db.Date
  createdAt  DateTime            @default(now())
  updatedAt  DateTime            @updatedAt

  @@index([countryId])
}

/// ما تفعله
model LocalPolicy {
  id         String         @id @default(cuid())
  countryId  String
  country    Country        @relation(fields: [countryId], references: [id], onDelete: Cascade)
  topic      PolicyTopic
  title      String
  severity   PolicySeverity
  details    String
  sourceUrl  String
  verifiedAt DateTime       @db.Date
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt

  @@index([countryId])
}

// ───────────── المستخدمون والمكاتب ─────────────

model User {
  id           String        @id @default(cuid())
  /// بصيغة E.164، مثال +9665XXXXXXXX
  phone        String        @unique
  name         String?
  role         Role          @default(traveler)
  officeId     String?
  office       Office?       @relation(fields: [officeId], references: [id], onDelete: Restrict)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  visaRequests VisaRequest[]
  reviews      Review[]
  messages     Message[]
  documents    Document[]
  auditLogs    AuditLog[]

  @@index([officeId])
}

model Office {
  id              String          @id @default(cuid())
  nameAr          String
  kind            OfficeKind
  licenseNumber   String          @unique
  licenseVerified Boolean         @default(false)
  /// فارغة = تستخدم النسبة الافتراضية العامة. مثال 0.1000 = 10%
  commissionRate  Decimal?        @db.Decimal(5, 4)
  /// معرّف الحساب لدى بوابة الدفع
  payoutAccountId String?
  active          Boolean         @default(false)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  users           User[]
  countries       OfficeCountry[]
  offers          Offer[]
  reviews         Review[]
  messages        Message[]
}

model OfficeCountry {
  officeId  String
  countryId String
  office    Office  @relation(fields: [officeId], references: [id], onDelete: Cascade)
  country   Country @relation(fields: [countryId], references: [id], onDelete: Cascade)

  @@id([officeId, countryId])
  @@index([countryId])
}

// ───────────── طلب التأشيرة والعروض والدفع ─────────────

model VisaRequest {
  id              String        @id @default(cuid())
  travelerId      String
  traveler        User          @relation(fields: [travelerId], references: [id], onDelete: Restrict)
  countryId       String
  country         Country       @relation(fields: [countryId], references: [id], onDelete: Restrict)
  visaType        String
  travelDate      DateTime      @db.Date
  travelers       Int
  /// ISO-3166 alpha-2
  nationality     String
  city            String
  status          RequestStatus @default(draft)
  acceptedOfferId String?       @unique
  acceptedOffer   Offer?        @relation("AcceptedOffer", fields: [acceptedOfferId], references: [id], onDelete: Restrict)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  offers          Offer[]       @relation("RequestOffers")
  payment         Payment?
  review          Review?
  messages        Message[]
  documents       Document[]

  @@index([travelerId])
  @@index([countryId])
  @@index([status])
}

model Offer {
  id             String       @id @default(cuid())
  requestId      String
  request        VisaRequest  @relation("RequestOffers", fields: [requestId], references: [id], onDelete: Restrict)
  officeId       String
  office         Office       @relation(fields: [officeId], references: [id], onDelete: Restrict)
  /// المبالغ بالهللات دائماً، لا أرقام عشرية
  priceHalalas   Int
  /// تنسخ من المكتب أو من النسبة الافتراضية وقت الإرسال، ولا تتغير بعدها
  commissionRate Decimal      @db.Decimal(5, 4)
  durationDays   Int
  includes       String
  validUntil     DateTime
  status         OfferStatus  @default(pending)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  acceptedFor    VisaRequest? @relation("AcceptedOffer")
  payment        Payment?

  @@unique([requestId, officeId])
  @@index([officeId])
}

model Payment {
  id                String        @id @default(cuid())
  requestId         String        @unique
  request           VisaRequest   @relation(fields: [requestId], references: [id], onDelete: Restrict)
  offerId           String        @unique
  offer             Offer         @relation(fields: [offerId], references: [id], onDelete: Restrict)
  gatewayRef        String        @unique
  amountHalalas     Int
  commissionHalalas Int
  status            PaymentStatus @default(pending)
  invoiceNumber     String?       @unique
  createdAt         DateTime      @default(now())
  capturedAt        DateTime?
  updatedAt         DateTime      @updatedAt
}

/// تقييم واحد لكل طلب مدفوع
model Review {
  id            String        @id @default(cuid())
  requestId     String        @unique
  request       VisaRequest   @relation(fields: [requestId], references: [id], onDelete: Restrict)
  officeId      String
  office        Office        @relation(fields: [officeId], references: [id], onDelete: Restrict)
  travelerId    String
  traveler      User          @relation(fields: [travelerId], references: [id], onDelete: Restrict)
  speed         Int
  priceKept     Int
  communication Int
  outcome       ReviewOutcome
  text          String?
  /// رد المكتب مرة واحدة: لا يكتب إذا كان officeReplyAt موجوداً
  officeReply   String?
  officeReplyAt DateTime?
  status        ReviewStatus  @default(pending)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([officeId, status])
}

// ───────────── الرسائل والمستندات والتدقيق ─────────────

/// رسائل ما قبل الدفع داخل المنصة. المحادثة = طلب + مكتب.
model Message {
  id        String      @id @default(cuid())
  requestId String
  request   VisaRequest @relation(fields: [requestId], references: [id], onDelete: Restrict)
  officeId  String
  office    Office      @relation(fields: [officeId], references: [id], onDelete: Restrict)
  senderId  String
  sender    User        @relation(fields: [senderId], references: [id], onDelete: Restrict)
  body      String
  createdAt DateTime    @default(now())

  @@index([requestId, officeId, createdAt])
}

/// المستند نفسه في تخزين خاص مشفر، وهنا مرجعه فقط.
model Document {
  id           String       @id @default(cuid())
  requestId    String
  request      VisaRequest  @relation(fields: [requestId], references: [id], onDelete: Restrict)
  uploadedById String
  uploadedBy   User         @relation(fields: [uploadedById], references: [id], onDelete: Restrict)
  kind         DocumentKind
  storageKey   String       @unique
  mimeType     String
  sizeBytes    Int
  createdAt    DateTime     @default(now())
  /// موعد الحذف المقرر حسب سياسة الاحتفاظ
  deleteAfter  DateTime?
  deletedAt    DateTime?

  @@index([requestId])
  @@index([deleteAfter])
}

model AuditLog {
  id        String      @id @default(cuid())
  actorId   String?
  actor     User?       @relation(fields: [actorId], references: [id], onDelete: SetNull)
  entity    String
  entityId  String
  action    AuditAction
  before    Json?
  after     Json?
  createdAt DateTime    @default(now())

  @@index([entity, entityId])
  @@index([createdAt])
}
```

## 8. استيراد البيانات
- `data/countries.json` يُستورد عبر سكربت `prisma/seed.ts` إلى `Country` و `EntryRule` (audience = saudi_citizen، nationality = SA). `sourceName` = المصدر العام في الملف حتى يُستبدل بمصدر رسمي.
- تواريخ الإعفاءات المؤقتة المعروفة تُعبّأ في الاستيراد: الجبل الأسود حتى 2026-10-31 ثم `visa_required`، الصين حتى 2026-12-31، أذربيجان حتى 2027-02-15.
- المحظورات والسياسات تُدخل من لوحة الإدارة، مصدراً رسمياً لكل بند.
- لوحة الإدارة تعرض قوائم: «تحتاج تحقق»، «أقدم تحقق»، «يحتاج مصدراً رسمياً»، «إعفاءات تقترب من الانتهاء» (انظر 4.2).

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
