/**
 * Predefined VM Plans Configuration
 */

const vmPlans = [
  {
    id: "atlas",
    name: "اطلس",
    nameEn: "Atlas",
    specs: {
      cpu: 1,
      ram: 2, // GB
      storage: 20, // GB
      traffic: 1024, // GB (1 TB)
    },
    description: "مناسب برای وب سایت‌های کوچک و توسعه",
    descriptionEn: "Suitable for small websites and development",
  },
  {
    id: "phoenix",
    name: "ققنوس",
    nameEn: "Phoenix",
    specs: {
      cpu: 2,
      ram: 4, // GB
      storage: 60, // GB
      traffic: 1024, // GB (1 TB)
    },
    description: "مناسب برای وب سایت‌های متوسط و برنامه‌های تحت وب",
    descriptionEn: "Suitable for medium websites and web applications",
  },
  {
    id: "tahmatan",
    name: "تهمتن",
    nameEn: "Tahmatan",
    specs: {
      cpu: 4,
      ram: 8, // GB
      storage: 100, // GB
      traffic: 1024, // GB (1 TB)
    },
    description: "مناسب برای سرویس‌های تجاری و برنامه‌های پردازشی",
    descriptionEn: "Suitable for business services and processing applications",
  },
  {
    id: "garshasp",
    name: "گرشاسب",
    nameEn: "Garshasp",
    specs: {
      cpu: 8,
      ram: 16, // GB
      storage: 200, // GB
      traffic: 1024, // GB (1 TB)
    },
    description: "مناسب برای برنامه‌های سنگین و پایگاه داده‌های بزرگ",
    descriptionEn: "Suitable for heavy applications and large databases",
  },
];

module.exports = vmPlans;
