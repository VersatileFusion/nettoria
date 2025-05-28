# Nettoria Cloud Service Provider Platform - Project Overview

## 1. Project Overview (FA)

نکتوریا یک پلتفرم جامع ارائه‌دهنده خدمات ابری است که با Node.js و Express توسعه یافته است. این سیستم به کاربران اجازه می‌دهد تا ثبت‌نام کنند، ماشین‌های مجازی (VM) را مدیریت کنند، صورتحساب‌ها را پرداخت نمایند و به خدمات پشتیبانی دسترسی داشته باشند. این پروژه با ادغام عمیق با VMware vCenter، امکان تهیه و مدیریت خودکار ماشین‌های مجازی را فراهم می‌کند. همچنین مجموعه‌ای از ابزارهای تشخیصی برای تست اتصال به محیط‌های vCenter، به ویژه از طریق VPN، ارائه می‌دهد.

## 2. Main Features (FA)

### احراز هویت و مدیریت کاربران
- ثبت‌نام کاربران با اطلاعات شخصی
- تایید شماره تلفن و ایمیل
- روش‌های ورود متعدد (رمز عبور، رمز یکبار مصرف)
- احراز هویت مبتنی بر JWT
- بازیابی امن رمز عبور
- تکمیل پروفایل با تایید کد ملی

### مدیریت سرویس و ماشین مجازی
- پلن‌های آماده و سفارشی (CPU، RAM، فضای ذخیره‌سازی و ...)
- گزینه‌های متعدد دیتاسنتر و سیستم‌عامل
- دوره‌های پرداخت منعطف (ماهانه، فصلی و ...)
- صورتحساب ساعتی با کیف پول
- ایجاد، روشن/خاموش، ریست، بازسازی و حذف خودکار VM
- تخصیص منابع بر اساس پلن

### صورتحساب و مالی
- صدور و پرداخت صورتحساب
- پشتیبانی از درگاه‌های پرداخت مختلف
- پشتیبانی از کد تخفیف
- تاریخچه تراکنش و سیستم کیف پول
- ارسال پیامک برای موجودی کم
- تعلیق سرویس‌های منقضی شده

### داشبورد کاربر
- لیست و مدیریت سرویس‌ها
- تاریخچه تراکنش‌ها
- تمدید/لغو سرویس
- مرکز اعلان‌ها

### سیستم پشتیبانی
- ایجاد و دسته‌بندی تیکت
- پیوست فایل
- اعلان ایمیلی
- پیگیری وضعیت تیکت

### داشبورد ادمین
- مدیریت کاربران، سفارشات و تیکت‌ها
- گزارش‌گیری و تحلیل
- ارسال پیام تبلیغاتی (ایمیل/پیامک)

### مجموعه تست vCenter API
- تشخیص اتصال VPN
- تست‌های اتصال شبکه و API (REST/SOAP)
- اجرای خودکار و تعاملی تست‌ها

## 3. Technical Stack (FA)

- **بک‌اند:** Node.js، Express.js (API مبتنی بر REST)
- **دیتابیس:** MySQL/PostgreSQL (سازگار با SQL Server)
- **ORM:** Sequelize
- **احراز هویت:** JWT
- **ادغام VMware:** vCenter API (node-vsphere-soap)
- **اعلان‌ها:** ایمیل (Nodemailer)، پیامک (SMS.ir)
- **مستندسازی:** Swagger
- **سایر:** dotenv، helmet، cors، morgan، axios

## 4. Project Structure (FA)

```
/ (root)
├── node_modules/                # وابستگی‌های پروژه اصلی
├── scripts/                     # اسکریپت‌های مدیریتی و تست دیتابیس/ادمین
│   ├── test-pg-connection.js
│   ├── admin-setup-full.js
│   ├── register-admin-user.js
│   ├── get-admin-jwt.js
│   ├── promote-admin-user.js
│   └── verify-test-user.js
├── server/                      # سرور و بک‌اند اصلی
│   ├── node_modules/            # وابستگی‌های سرور
│   ├── test-vcenter.js
│   ├── test-vcenter-api.js
│   ├── test-suite.js
│   ├── README.md
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── app.js
│       ├── setup-db.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── ticket.controller.js
│       │   ├── service.controller.js
│       │   ├── vcenter.controller.js
│       │   └── sms.controller.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── sms.routes.js
│       │   ├── payment.routes.js
│       │   ├── service.routes.js
│       │   ├── order.routes.js
│       │   ├── ticket.routes.js
│       │   ├── wallet.routes.js
│       │   ├── user.routes.js
│       │   └── vcenter.routes.js
│       ├── services/
│       │   ├── vcenter.service.js
│       │   ├── sms.service.js
│       │   └── sms-test.js
│       ├── models/
│       │   ├── user.model.js
│       │   ├── ticket.model.js
│       │   ├── comment.model.js
│       │   ├── index.js
│       │   ├── service.model.js
│       │   ├── order.model.js
│       │   ├── wallet.model.js
│       │   └── vm.model.js
│       ├── config/
│       │   ├── index.js
│       │   ├── database.js
│       │   ├── operating-systems.js
│       │   └── vm-plans.js
│       ├── middleware/
│       │   └── auth.middleware.js
│       ├── utils/
│       │   ├── error.js
│       │   ├── logger.js
│       │   ├── notification.util.js
│       │   ├── setup-db.js
│       │   └── auth.utils.js
│       └── views/
│           └── payment/
├── src/                         # (نمونه اولیه یا ماژولار، فقط کنترلر، روت و سرویس)
│   ├── controllers/
│   ├── routes/
│   └── services/
├── test/                        # اسکریپت‌ها و ابزارهای تست و عیب‌یابی
│   ├── helpers/
│   │   └── setup-test-user.js
│   ├── test-vm-feature.js
│   ├── run-feature-tests.js
│   ├── test-auth-feature.js
│   ├── test-admin-feature.js
│   ├── test-support-feature.js
│   ├── test-dashboard-feature.js
│   ├── test-billing-feature.js
│   ├── test-vcenter-suite-feature.js
│   ├── vcenter-test.env
│   ├── vcenter-test.env.example
│   ├── test-vcenter-auto.js
│   ├── test-vcenter-rest-auto.js
│   ├── test-vpn-connection.js
│   ├── run-api-test.js
│   ├── test-internal-ip.js
│   ├── test-vcenter-connectivity.js
│   ├── vpn-solution-summary.md
│   ├── vmware-connectivity-report.md
│   ├── advanced-vmware-test.js
│   ├── test-esxi-direct.js
│   ├── test-vcenter-security.js
│   ├── simple-test.js
│   ├── test-vcenter-ping.js
│   ├── vcenter-proxy-test.env
│   ├── tls-version-test.js
│   ├── http-test.js
│   ├── vcenter-direct-ip-test.js
│   ├── vcenter-socks-test.js
│   ├── port-scanner.js
│   ├── vcenter-rest-test.js
│   ├── vcenter-connection-test-with-proxy.js
│   ├── vcenter-test-readme.md
│   ├── vcenter-connection-test.js
│   ├── test-vcenter-fix.js
│   ├── test-vcenter-rest.js
│   ├── test-vcenter.js
│   ├── test-auth-fix.js
│   └── test-api.js
├── .gitignore
├── PROJECT_OVERVIEW.md
├── README.md
├── reset-test-db.js
├── setup-nettoria-db.js
├── check-schema.js
├── test-db-connection.js
├── db-config.js
```

**English:**

- `/ (root)`: Main project root, contains configuration, scripts, documentation, and entry points.
- `node_modules/`: Project dependencies.
- `scripts/`: Utility and admin scripts for database and user management.
- `server/`: Main backend application, with its own dependencies, entry point, and all backend source code under `src/`.
- `src/` (root): (Legacy or modular, contains only controllers, routes, and services.)
- `test/`: All test and diagnostic scripts, helpers, and environment files.
- `.gitignore`, `README.md`, `PROJECT_OVERVIEW.md`, etc.: Standard project files.

**فارسی:**

- `/ (ریشه)`: ریشه اصلی پروژه، شامل پیکربندی، اسکریپت‌ها، مستندات و نقاط ورود.
- `node_modules/`: وابستگی‌های پروژه.
- `scripts/`: اسکریپت‌های کمکی و مدیریتی برای دیتابیس و کاربران.
- `server/`: برنامه اصلی بک‌اند، با وابستگی‌ها، نقطه ورود و سورس کامل در `src/`.
- `src/` (ریشه): (نمونه اولیه یا ماژولار، فقط کنترلر، روت و سرویس دارد.)
- `test/`: همه اسکریپت‌ها و ابزارهای تست و عیب‌یابی.
- `.gitignore`، `README.md`، `PROJECT_OVERVIEW.md` و ...: فایل‌های استاندارد پروژه.

## 5. How It Works (High-Level Flow) (FA)

۱. **ثبت‌نام کاربر:** کاربران ثبت‌نام می‌کنند، شماره تلفن/ایمیل را تایید و پروفایل را تکمیل می‌کنند.
۲. **انتخاب سرویس:** کاربران یک پلن سرویس VM انتخاب یا پیکربندی می‌کنند.
۳. **سفارش و پرداخت:** کاربران سفارش ثبت می‌کنند، صورتحساب پرداخت یا از کیف پول استفاده می‌کنند.
۴. **تهیه VM:** سیستم بر اساس مشخصات کاربر، VM را از طریق vCenter API تهیه می‌کند.
۵. **مدیریت VM:** کاربران می‌توانند VM را روشن/خاموش، ریست، بازسازی یا حذف کنند.
۶. **صورتحساب:** صورتحساب صادر و موجودی کیف پول برای صورتحساب ساعتی مدیریت می‌شود.
۷. **پشتیبانی:** کاربران می‌توانند تیکت پشتیبانی ایجاد و اعلان دریافت کنند.
۸. **ادمین:** ادمین‌ها کاربران، سفارشات، تیکت‌ها را مدیریت و اعلان ارسال می‌کنند.

## 6. API Endpoints (Examples) (FA)

- `POST /api/auth/register` - ثبت‌نام کاربر
- `POST /api/auth/login` - ورود
- `GET /api/services` - لیست سرویس‌ها
- `POST /api/orders` - ثبت سفارش
- `GET /api/vcenter/vms` - لیست VMها
- `POST /api/vcenter/vms/:id/power` - روشن/خاموش کردن VM
- `GET /api/wallet` - اطلاعات کیف پول
- `POST /api/tickets` - ایجاد تیکت پشتیبانی
- `GET /api/admin/users` - ادمین: لیست کاربران

(برای مشاهده کامل API به مستندات Swagger در `/api-docs` مراجعه کنید)

## 7. Configuration & Setup (FA)

۱. **کلون کردن مخزن**
۲. **نصب وابستگی‌ها:**
   ```bash
   npm install
   cd server && npm install
   ```
۳. **پیکربندی متغیرهای محیطی:**
   - فایل `.env.example` را به `.env` کپی و مقادیر دیتابیس، JWT، پیامک، ایمیل و vCenter را وارد کنید
۴. **راه‌اندازی دیتابیس:**
   ```bash
   npm run setup-db
   ```
۵. **اجرای سرور:**
   ```bash
   npm run dev
   # یا برای محیط عملیاتی
   npm start
   ```
۶. **دسترسی به مستندات API:**
   - آدرس `http://localhost:5000/api-docs` را باز کنید

## 8. Testing & Troubleshooting (FA)

- **اجرای تست‌ها:**
  ```bash
  node server/test-suite.js
  ```
- **تست‌های اتصال:**
  - از اسکریپت‌هایی مانند `test-vpn-connection.js`، `test-vcenter-rest-auto.js` و ... استفاده کنید
- **مشکلات رایج:**
  - عدم اتصال VPN، اطلاعات ورود اشتباه، فایروال، خطاهای SSL

## 9. Security & Best Practices (FA)

- احراز هویت JWT برای همه مسیرهای محافظت‌شده
- رمزنگاری رمز عبور با bcrypt
- استفاده از Helmet برای هدرهای امنیتی HTTP
- فعال بودن CORS
- نگهداری اطلاعات حساس در فایل‌های `.env`
- اعتبارسنجی ورودی و مدیریت خطا در کنترلرها

## 10. Additional Notes (FA)

- **ادغام پیامک:** استفاده از SMS.ir برای تایید شماره و اعلان‌ها
- **ادغام ایمیل:** Nodemailer برای تایید ایمیل و اعلان تیکت
- **ادغام VMware:** مدیریت خودکار چرخه عمر VM از طریق vCenter API
- **Swagger:** مستندسازی کامل API در `/api-docs`
- **لایسنس:** ISC (سرور)، MIT (مجموعه تست)

## 11. File-by-File Codebase Overview (FA)

در ادامه، شرح دقیقی از فایل‌ها و دایرکتوری‌های اصلی پروژه نکتوریا ارائه شده است. از این بخش برای آشنایی با ساختار کد و ارائه آن به ذینفعان استفاده کنید.

### Root Directory (دایرکتوری ریشه)

- **package.json**: تعریف پروژه اصلی به عنوان مجموعه تست vCenter API و لیست وابستگی‌ها و اسکریپت‌های تست و تشخیص اتصال.
- **package-lock.json**: قفل کردن نسخه دقیق وابستگی‌ها به صورت خودکار.
- **README.md**: مستندات مجموعه تست vCenter API شامل راه‌اندازی، استفاده و رفع اشکال اسکریپت‌های اتصال.
- **PROJECT_OVERVIEW.md**: این سند که نمای کلی و جزئیات پروژه را ارائه می‌دهد.
- **reset-test-db.js**: اسکریپت حذف کاربران تستی از دیتابیس PostgreSQL برای ریست محیط تست.
- **setup-nettoria-db.js**: اسکریپت ایجاد و به‌روزرسانی دیتابیس اصلی PostgreSQL و اطمینان از وجود جداول و ستون‌های مورد نیاز.
- **check-schema.js**: اسکریپت بررسی ساختار جدول Users و گزارش ستون‌های مفقود.
- **test-db-connection.js**: اسکریپت ساده برای تست اتصال به دیتابیس PostgreSQL.
- **db-config.js**: خروجی گرفتن از pool اتصال PostgreSQL و توابع کمکی برای کوئری گرفتن از دیتابیس.

### scripts/ (اسکریپت‌ها)

- **test-pg-connection.js**: بررسی اجرای صحیح و دسترسی به PostgreSQL با استفاده از متغیرهای محیطی.
- **admin-setup-full.js**: خودکارسازی ثبت، ارتقا و دریافت JWT برای کاربر ادمین.
- **register-admin-user.js**: ثبت کاربر ادمین جدید از طریق API.
- **get-admin-jwt.js**: ورود به عنوان ادمین و چاپ توکن JWT.
- **promote-admin-user.js**: ارتقا کاربر به سطح ادمین و تایید آن در دیتابیس.
- **verify-test-user.js**: تایید کامل و فعال‌سازی کاربر تستی در دیتابیس.

### test/ (تست)

- **test-vm-feature.js, test-auth-feature.js, ...**: اسکریپت‌های تست فیچر برای بخش‌های مختلف پلتفرم (ماشین مجازی، احراز هویت، صورتحساب، داشبورد، پشتیبانی، ادمین، مجموعه vCenter).
- **run-feature-tests.js**: اجرای همه تست‌های اصلی به صورت متوالی.
- **helpers/setup-test-user.js**: ایجاد و تایید کاربر تستی در دیتابیس برای تست API.
- **run-api-test.js**: منوی تعاملی برای مدیریت اتصال VPN و اجرای تست‌های vCenter.
- **test-vpn-connection.js**: اسکریپت تشخیص جامع اتصال VPN.
- **test-internal-ip.js**: تست اتصال پایه به IP داخلی vCenter.
- **test-vcenter-rest-auto.js**: تست خودکار اتصال REST API vCenter.
- **test-vcenter-auto.js**: تست خودکار اتصال SOAP API vCenter.
- **test-vcenter-ping.js**: بررسی دسترسی به vCenter (پینگ، DNS، TCP، HTTPS).
- **test-vcenter-rest-test.js, ...**: اسکریپت‌های مختلف تشخیصی و اتصال برای vCenter و ESXi شامل سناریوهای مستقیم، پروکسی و VPN و همچنین اسکن پورت و تست نسخه TLS.
- **vpn-solution-summary.md, ...**: گزارش‌ها و خلاصه‌های راهکار اتصال و یافته‌های تست.
- **vcenter-test.env, ...**: فایل‌های متغیر محیطی برای پیکربندی اطلاعات تست و اتصال.

### server/ (سرور)

- **server.js**: نقطه ورود اصلی سرور و مدیریت سناریوهای جایگزین در صورت خطا در بارگذاری برنامه اصلی.
- **package.json**: تعریف برنامه سمت سرور، وابستگی‌ها و اسکریپت‌های اجرا و مدیریت دیتابیس.
- **package-lock.json**: قفل کردن نسخه وابستگی‌های سمت سرور.
- **README.md**: مستندات جامع برنامه سمت سرور شامل ویژگی‌ها، راه‌اندازی، نقاط API و پیکربندی محیطی.
- **test-vcenter.js, ...**: اسکریپت‌های تست سمت سرور برای vCenter API و عملکرد کلی سرور.
- **src/**: شامل تمام سورس کد سمت سرور (در ادامه توضیح داده شده).

### server/src/ (سورس سرور)

- **app.js**: مقداردهی اولیه برنامه Express، پیکربندی میدل‌ویرها، راه‌اندازی مستندات Swagger و بارگذاری مسیرهای API.
- **setup-db.js**: اسکریپت راه‌اندازی یا ریست دیتابیس سمت سرور.

#### server/src/controllers/ (کنترلرها)
- **auth.controller.js**: مدیریت منطق احراز هویت (ثبت‌نام، ورود، تایید، بازیابی رمز و ...).
- **ticket.controller.js**: مدیریت ایجاد، به‌روزرسانی و پیگیری تیکت‌های پشتیبانی.
- **service.controller.js**: منطق تجاری مدیریت سرویس‌های ابری (VM، پلن‌ها و ...).
- **vcenter.controller.js**: مدیریت ادغام و عملیات با VMware vCenter (تهیه و مدیریت VM).
- **sms.controller.js**: مدیریت ارسال و تایید پیامک.

#### server/src/routes/ (مسیرها)
- **auth.routes.js, ...**: تعریف نقاط پایانی API برای هر دامنه (احراز هویت، کاربران، سرویس‌ها، سفارشات، کیف پول، تیکت‌ها، vCenter، پرداخت، پیامک).

#### server/src/services/ (سرویس‌ها)
- **vcenter.service.js**: منطق اصلی تعامل با APIهای vCenter (SOAP/REST) و مدیریت چرخه عمر VM.
- **sms.service.js**: مدیریت ارسال پیامک از طریق SMS.ir.
- **sms-test.js**: اسکریپت تست عملکرد پیامک.

#### server/src/models/ (مدل‌ها)
- **user.model.js, ...**: مدل‌های Sequelize برای موجودیت‌های اصلی سیستم (کاربر، سرویس، سفارش، کیف پول، تیکت، کامنت، ماشین مجازی).
- **index.js**: خروجی گرفتن همه مدل‌ها برای استفاده در برنامه.

#### server/src/config/ (پیکربندی)
- **index.js**: متمرکزسازی همه متغیرهای پیکربندی (دیتابیس، JWT، پیامک، ایمیل، vCenter و ...).
- **database.js**: راه‌اندازی اتصال دیتابیس با Sequelize.
- **operating-systems.js, vm-plans.js**: تعریف سیستم‌عامل‌ها و پلن‌های VM قابل ارائه.

#### server/src/middleware/ (میدل‌ویر)
- **auth.middleware.js**: میدل‌ویر Express برای احراز هویت و مجوزدهی درخواست‌های API.

#### server/src/utils/ (ابزارها)
- **auth.utils.js**: توابع کمکی برای احراز هویت، JWT و ارسال ایمیل/پیامک.
- **error.js**: ابزارهای مدیریت خطا به صورت متمرکز.
- **logger.js**: ابزار ساده لاگ‌گیری برای پیام‌های info، error و debug.
- **notification.util.js**: ابزار ارسال اعلان (ایمیل، پیامک و ...).
- **setup-db.js**: (یک خطی، احتمالاً بلااستفاده یا برای توسعه آینده.)

#### server/src/views/ (نماها)
- **payment/**: (خالی یا محل نگهداری نماهای مرتبط با پرداخت.)

---

این بخش، شرح فایل به فایل پروژه را ارائه می‌دهد تا بتوانید به سرعت با نقش و هدف هر بخش از کد نکتوریا آشنا شوید. از این بخش برای آموزش، ارائه یا بررسی فنی استفاده کنید.

---

*This document provides a high-level yet comprehensive overview of the Nettoria project for employer or stakeholder review. For detailed code-level documentation, see inline comments and Swagger API docs.* 