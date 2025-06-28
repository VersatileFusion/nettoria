const Content = require("../models/content.js");
const logger = require("../utils/logger");

/**
 * Get content by type
 */
exports.getContentByType = async (req, res) => {
    try {
        const { type } = req.params;

        const content = await Content.findOne({
            where: { type },
            attributes: ['id', 'type', 'title', 'content', 'updatedAt']
        });

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "محتوای مورد نظر یافت نشد"
            });
        }

        res.json({
            success: true,
            data: { content }
        });
    } catch (error) {
        logger.error("Error getting content by type:", error);
        res.status(500).json({
            success: false,
            message: "خطا در دریافت محتوا",
            error: error.message
        });
    }
};

/**
 * Get all content (admin only)
 */
exports.getAllContent = async (req, res) => {
    try {
        const content = await Content.findAll({
            attributes: ['id', 'type', 'title', 'updatedAt'],
            order: [['updatedAt', 'DESC']]
        });

        res.json({
            success: true,
            data: { content }
        });
    } catch (error) {
        logger.error("Error getting all content:", error);
        res.status(500).json({
            success: false,
            message: "خطا در دریافت لیست محتوا",
            error: error.message
        });
    }
};

/**
 * Create or update content (admin only)
 */
exports.createOrUpdateContent = async (req, res) => {
    try {
        const { type, title, content } = req.body;

        // Validate required fields
        if (!type || !title || !content) {
            return res.status(400).json({
                success: false,
                message: "نوع، عنوان و محتوا الزامی است"
            });
        }

        // Check if content exists
        let existingContent = await Content.findOne({ where: { type } });

        if (existingContent) {
            // Update existing content
            existingContent.title = title;
            existingContent.content = content;
            existingContent.updatedAt = new Date();
            await existingContent.save();

            res.json({
                success: true,
                message: "محتوا با موفقیت به‌روزرسانی شد",
                data: { content: existingContent }
            });
        } else {
            // Create new content
            const newContent = await Content.create({
                type,
                title,
                content
            });

            res.status(201).json({
                success: true,
                message: "محتوا با موفقیت ایجاد شد",
                data: { content: newContent }
            });
        }
    } catch (error) {
        logger.error("Error creating/updating content:", error);
        res.status(500).json({
            success: false,
            message: "خطا در ایجاد/به‌روزرسانی محتوا",
            error: error.message
        });
    }
};

/**
 * Delete content (admin only)
 */
exports.deleteContent = async (req, res) => {
    try {
        const { id } = req.params;

        const content = await Content.findByPk(id);
        if (!content) {
            return res.status(404).json({
                success: false,
                message: "محتوا یافت نشد"
            });
        }

        await content.destroy();

        res.json({
            success: true,
            message: "محتوا با موفقیت حذف شد"
        });
    } catch (error) {
        logger.error("Error deleting content:", error);
        res.status(500).json({
            success: false,
            message: "خطا در حذف محتوا",
            error: error.message
        });
    }
};

/**
 * Get terms and conditions
 */
exports.getTerms = async (req, res) => {
    try {
        const content = await Content.findOne({
            where: { type: 'terms' },
            attributes: ['id', 'title', 'content', 'updatedAt']
        });

        if (!content) {
            // Return default terms if not found
            const defaultTerms = {
                title: "قوانین و شرایط استفاده",
                content: `
          <h1>قوانین و شرایط استفاده از نتوریا</h1>
          <p>با استفاده از خدمات نتوریا، شما موافقت می‌کنید که:</p>
          <ul>
            <li>از خدمات به صورت قانونی استفاده کنید</li>
            <li>از ارسال محتوای غیرقانونی یا مضر خودداری کنید</li>
            <li>به حریم خصوصی سایر کاربران احترام بگذارید</li>
            <li>از سیستم‌های امنیتی ما سوء استفاده نکنید</li>
          </ul>
          <p>نتوریا حق تغییر این قوانین را در هر زمان محفوظ می‌دارد.</p>
        `,
                updatedAt: new Date()
            };

            return res.json({
                success: true,
                data: { content: defaultTerms }
            });
        }

        res.json({
            success: true,
            data: { content }
        });
    } catch (error) {
        logger.error("Error getting terms:", error);
        res.status(500).json({
            success: false,
            message: "خطا در دریافت قوانین و شرایط",
            error: error.message
        });
    }
};

/**
 * Get privacy policy
 */
exports.getPrivacy = async (req, res) => {
    try {
        const content = await Content.findOne({
            where: { type: 'privacy' },
            attributes: ['id', 'title', 'content', 'updatedAt']
        });

        if (!content) {
            // Return default privacy policy if not found
            const defaultPrivacy = {
                title: "حریم خصوصی",
                content: `
          <h1>سیاست حریم خصوصی نتوریا</h1>
          <p>نتوریا متعهد به حفظ حریم خصوصی کاربران خود است:</p>
          <ul>
            <li>اطلاعات شخصی شما محفوظ و امن نگه داشته می‌شود</li>
            <li>اطلاعات شما با اشخاص ثالث به اشتراک گذاشته نمی‌شود</li>
            <li>از کوکی‌ها برای بهبود تجربه کاربری استفاده می‌کنیم</li>
            <li>شما می‌توانید درخواست حذف اطلاعات خود را بدهید</li>
          </ul>
          <p>برای اطلاعات بیشتر با ما تماس بگیرید.</p>
        `,
                updatedAt: new Date()
            };

            return res.json({
                success: true,
                data: { content: defaultPrivacy }
            });
        }

        res.json({
            success: true,
            data: { content }
        });
    } catch (error) {
        logger.error("Error getting privacy policy:", error);
        res.status(500).json({
            success: false,
            message: "خطا در دریافت سیاست حریم خصوصی",
            error: error.message
        });
    }
};

/**
 * Get about us
 */
exports.getAboutUs = async (req, res) => {
    try {
        const content = await Content.findOne({
            where: { type: 'about-us' },
            attributes: ['id', 'title', 'content', 'updatedAt']
        });

        if (!content) {
            // Return default about us if not found
            const defaultAbout = {
                title: "درباره نتوریا",
                content: `
          <h1>درباره نتوریا</h1>
          <p>نتوریا یک ارائه‌دهنده خدمات ابری پیشرو است که:</p>
          <ul>
            <li>خدمات هاستینگ و سرور مجازی ارائه می‌دهد</li>
            <li>از جدیدترین تکنولوژی‌ها استفاده می‌کند</li>
            <li>پشتیبانی 24/7 ارائه می‌دهد</li>
            <li>به امنیت و پایداری متعهد است</li>
          </ul>
          <p>ما متعهد به ارائه بهترین خدمات به مشتریان خود هستیم.</p>
        `,
                updatedAt: new Date()
            };

            return res.json({
                success: true,
                data: { content: defaultAbout }
            });
        }

        res.json({
            success: true,
            data: { content }
        });
    } catch (error) {
        logger.error("Error getting about us:", error);
        res.status(500).json({
            success: false,
            message: "خطا در دریافت اطلاعات درباره ما",
            error: error.message
        });
    }
};

/**
 * Get contact information
 */
exports.getContactUs = async (req, res) => {
    try {
        const content = await Content.findOne({
            where: { type: 'contact-us' },
            attributes: ['id', 'title', 'content', 'updatedAt']
        });

        if (!content) {
            // Return default contact info if not found
            const defaultContact = {
                title: "ارتباط با ما",
                content: `
          <h1>ارتباط با نتوریا</h1>
          <p>برای ارتباط با ما می‌توانید از روش‌های زیر استفاده کنید:</p>
          <ul>
            <li><strong>ایمیل:</strong> support@nettoria.com</li>
            <li><strong>تلفن:</strong> +98-21-12345678</li>
            <li><strong>آدرس:</strong> تهران، ایران</li>
            <li><strong>ساعات کاری:</strong> 24/7</li>
          </ul>
          <p>تیم پشتیبانی ما آماده پاسخگویی به سوالات شما است.</p>
        `,
                updatedAt: new Date()
            };

            return res.json({
                success: true,
                data: { content: defaultContact }
            });
        }

        res.json({
            success: true,
            data: { content }
        });
    } catch (error) {
        logger.error("Error getting contact us:", error);
        res.status(500).json({
            success: false,
            message: "خطا در دریافت اطلاعات تماس",
            error: error.message
        });
    }
};

/**
 * Get FAQ
 */
exports.getFAQ = async (req, res) => {
    try {
        const content = await Content.findOne({
            where: { type: 'faq' },
            attributes: ['id', 'title', 'content', 'updatedAt']
        });

        if (!content) {
            // Return default FAQ if not found
            const defaultFAQ = {
                title: "سوالات متداول",
                content: `
          <h1>سوالات متداول</h1>
          <div class="faq-item">
            <h3>چگونه می‌توانم سرور مجازی خریداری کنم؟</h3>
            <p>برای خرید سرور مجازی، ابتدا ثبت‌نام کنید، سپس از بخش خدمات، سرور مورد نظر خود را انتخاب و خریداری کنید.</p>
          </div>
          <div class="faq-item">
            <h3>آیا پشتیبانی 24/7 دارید؟</h3>
            <p>بله، تیم پشتیبانی ما 24 ساعت شبانه‌روز آماده پاسخگویی به سوالات شما است.</p>
          </div>
          <div class="faq-item">
            <h3>چگونه می‌توانم از کیف پول استفاده کنم؟</h3>
            <p>پس از ورود به حساب کاربری، از بخش کیف پول می‌توانید موجودی خود را مدیریت کنید.</p>
          </div>
        `,
                updatedAt: new Date()
            };

            return res.json({
                success: true,
                data: { content: defaultFAQ }
            });
        }

        res.json({
            success: true,
            data: { content }
        });
    } catch (error) {
        logger.error("Error getting FAQ:", error);
        res.status(500).json({
            success: false,
            message: "خطا در دریافت سوالات متداول",
            error: error.message
        });
    }
};

/**
 * Get success password page content
 */
exports.getSuccessPassword = async (req, res) => {
    try {
        const content = await Content.findOne({
            where: { type: 'success-password' },
            attributes: ['id', 'title', 'content', 'updatedAt']
        });

        if (!content) {
            // Return default success password content if not found
            const defaultSuccessPassword = {
                title: "رمز عبور با موفقیت تغییر یافت",
                content: `
          <h1>رمز عبور شما با موفقیت تغییر یافت</h1>
          <p>رمز عبور جدید شما فعال شده است. می‌توانید با رمز عبور جدید وارد حساب کاربری خود شوید.</p>
          <p>برای امنیت بیشتر، توصیه می‌کنیم:</p>
          <ul>
            <li>رمز عبور قوی انتخاب کنید</li>
            <li>احراز هویت دو مرحله‌ای را فعال کنید</li>
            <li>رمز عبور خود را با کسی به اشتراک نگذارید</li>
          </ul>
          <a href="/login.html" class="btn">ورود به حساب کاربری</a>
        `,
                updatedAt: new Date()
            };

            return res.json({
                success: true,
                data: { content: defaultSuccessPassword }
            });
        }

        res.json({
            success: true,
            data: { content }
        });
    } catch (error) {
        logger.error("Error getting success password content:", error);
        res.status(500).json({
            success: false,
            message: "خطا در دریافت محتوای صفحه موفقیت",
            error: error.message
        });
    }
};

/**
 * Get layout content (for common elements)
 */
exports.getLayout = async (req, res) => {
    try {
        const content = await Content.findOne({
            where: { type: 'layout' },
            attributes: ['id', 'title', 'content', 'updatedAt']
        });

        if (!content) {
            // Return default layout content if not found
            const defaultLayout = {
                title: "Layout Content",
                content: {
                    header: {
                        logo: "Netto<span>ria</span>",
                        navigation: [
                            { text: "دامنه", url: "/domain.html" },
                            { text: "هاست", url: "/cloud-host.html" },
                            { text: "سرور مجازی", url: "/virtual-server.html" },
                            { text: "سرور ابری", url: "/cloud-server.html" },
                            { text: "وبلاگ", url: "/blogs.html" },
                            { text: "ارتباط باما", url: "/Contact-us.html" }
                        ]
                    },
                    footer: {
                        copyright: "© 2024 نتوریا. تمامی حقوق محفوظ است.",
                        links: [
                            { text: "قوانین", url: "/terms.html" },
                            { text: "حریم خصوصی", url: "/privacy.html" },
                            { text: "درباره ما", url: "/about-us.html" },
                            { text: "پشتیبانی", url: "/support.html" }
                        ]
                    }
                },
                updatedAt: new Date()
            };

            return res.json({
                success: true,
                data: { content: defaultLayout }
            });
        }

        res.json({
            success: true,
            data: { content }
        });
    } catch (error) {
        logger.error("Error getting layout content:", error);
        res.status(500).json({
            success: false,
            message: "خطا در دریافت محتوای layout",
            error: error.message
        });
    }
};

/**
 * Get index page content
 */
exports.getIndex = async (req, res) => {
    try {
        const content = await Content.findOne({
            where: { type: 'index' },
            attributes: ['id', 'title', 'content', 'updatedAt']
        });

        if (!content) {
            // Return default index content if not found
            const defaultIndex = {
                title: "نتوریا - ارائه‌دهنده خدمات ابری",
                content: {
                    hero: {
                        title: "تو مسیر موفقیت,پیشرفت خود را به ما بسپارید",
                        subtitle: "با استفاده از جدیدترین تکنولوژی های موجود, تجربه جدیدی رو از ارائه خدمات برای شما به ارمغان میاریم",
                        cta: "ورود به پنل کاربری"
                    },
                    features: [
                        {
                            title: "پایداری و آپتایم بی‌وقفه",
                            description: "ما در نتوریا به شما تجربه‌ای بدون وقفه و با آپتایم 99.9% ارائه می‌دهیم."
                        },
                        {
                            title: "امنیت بالا",
                            description: "با استفاده از آخرین تکنولوژی‌های امنیتی، اطلاعات شما محفوظ است."
                        },
                        {
                            title: "پشتیبانی 24/7",
                            description: "تیم پشتیبانی ما در تمام ساعات شبانه‌روز آماده کمک به شما است."
                        }
                    ]
                },
                updatedAt: new Date()
            };

            return res.json({
                success: true,
                data: { content: defaultIndex }
            });
        }

        res.json({
            success: true,
            data: { content }
        });
    } catch (error) {
        logger.error("Error getting index content:", error);
        res.status(500).json({
            success: false,
            message: "خطا در دریافت محتوای صفحه اصلی",
            error: error.message
        });
    }
}; 