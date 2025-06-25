// Admin Panel JS: Dynamically list and interact with admin/internal backend endpoints

const endpoints = [
  // Add all admin/internal endpoints here (examples)
  {
    method: "GET",
    url: "/api/blogs/admin/all",
    description: "List all blogs (admin)",
  },
  {
    method: "PUT",
    url: "/api/blogs/admin/:id/status",
    description: "Update blog status (admin)",
  },
  {
    method: "POST",
    url: "/api/blogs/posts",
    description: "Create blog post (admin)",
  },
  {
    method: "PUT",
    url: "/api/blogs/posts/:postId",
    description: "Update blog post (admin)",
  },
  {
    method: "DELETE",
    url: "/api/blogs/posts/:postId",
    description: "Delete blog post (admin)",
  },
  {
    method: "GET",
    url: "/api/payments/demo",
    description: "Demo payment endpoint",
  },
  // Add more endpoints as needed
];

const container = document.getElementById("admin-endpoints");

endpoints.forEach((endpoint) => {
  const div = document.createElement("div");
  div.className = "endpoint-block";
  div.innerHTML = `
    <strong>${endpoint.method}</strong> <code>${endpoint.url}</code> - ${endpoint.description}<br>
    <button>Send Request</button>
    <pre class="response"></pre>
  `;
  const button = div.querySelector("button");
  const responseBox = div.querySelector(".response");
  button.onclick = async () => {
    let url = endpoint.url;
    // Prompt for path params if needed
    if (url.includes(":")) {
      url =
        prompt("Enter full endpoint URL (replace path params):", url) || url;
    }
    try {
      const res = await fetch(url, { method: endpoint.method });
      const data = await res.json();
      responseBox.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      responseBox.textContent = "Error: " + err;
    }
  };
  container.appendChild(div);
});

// Admin Dashboard Navigation and Section Loader

document.addEventListener("DOMContentLoaded", () => {
  // Navigation logic
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".admin-section");

  function showSection(hash) {
    sections.forEach((sec) => (sec.style.display = "none"));
    navLinks.forEach((link) => link.classList.remove("active"));
    let sectionId = hash
      ? hash.replace("#", "") + "-section"
      : "dashboard-section";
    const section =
      document.getElementById(sectionId) ||
      document.getElementById("dashboard-section");
    section.style.display = "block";
    const activeLink = Array.from(navLinks).find(
      (l) => l.getAttribute("href") === hash
    );
    if (activeLink) activeLink.classList.add("active");
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const hash = link.getAttribute("href");
      window.location.hash = hash;
      showSection(hash);
    });
  });

  // On load, show correct section
  showSection(window.location.hash || "#dashboard");

  // Dashboard Overview (real data)
  loadDashboardStats();
  // Users (stub)
  loadAdminUsers();
  // Blogs (stub)
  loadAdminBlogs();
});

async function loadDashboardStats() {
  const el = document.getElementById("dashboard-overview");
  el.innerHTML = "در حال بارگذاری...";
  try {
    // Fetch user count
    const usersRes = await fetch("/api/users", {
      headers: {
        Authorization: localStorage.getItem("token")
          ? "Bearer " + localStorage.getItem("token")
          : "",
      },
    });
    const usersData = await usersRes.json();
    const userCount =
      usersData.data && usersData.data.users ? usersData.data.users.length : 0;

    // Fetch order count
    const ordersRes = await fetch("/api/orders", {
      headers: {
        Authorization: localStorage.getItem("token")
          ? "Bearer " + localStorage.getItem("token")
          : "",
      },
    });
    const ordersData = await ordersRes.json();
    const orderCount =
      ordersData.data && ordersData.data.orders
        ? ordersData.data.orders.length
        : 0;

    // Fetch revenue (sum of completed payments)
    const txRes = await fetch("/api/wallet/transactions", {
      headers: {
        Authorization: localStorage.getItem("token")
          ? "Bearer " + localStorage.getItem("token")
          : "",
      },
    });
    const txData = await txRes.json();
    let revenue = 0;
    if (txData.data && txData.data.transactions) {
      revenue = txData.data.transactions
        .filter((tx) => tx.status === "completed" && tx.amount > 0)
        .reduce((sum, tx) => sum + tx.amount, 0);
    }

    // Fetch message count
    const msgRes = await fetch("/api/contact", {
      headers: {
        Authorization: localStorage.getItem("token")
          ? "Bearer " + localStorage.getItem("token")
          : "",
      },
    });
    const msgData = await msgRes.json();
    const msgCount =
      msgData.data && Array.isArray(msgData.data)
        ? msgData.data.length
        : msgData.length || 0;

    el.innerHTML = `
      <div class="admin-table" style="font-size:1.2rem">
        <b>تعداد کاربران:</b> ${userCount.toLocaleString("fa-IR")}<br>
        <b>تعداد سفارش‌ها:</b> ${orderCount.toLocaleString("fa-IR")}<br>
        <b>درآمد کل:</b> ${revenue.toLocaleString("fa-IR")}<br>
        <b>پیام‌های پشتیبانی:</b> ${msgCount.toLocaleString("fa-IR")}
      </div>
    `;
  } catch (err) {
    el.innerHTML = "خطا در دریافت آمار";
  }
}

async function loadAdminUsers() {
  const el = document.getElementById("admin-users");
  el.innerHTML = "در حال بارگذاری کاربران...";
  try {
    const usersRes = await fetch("/api/users", {
      headers: {
        Authorization: localStorage.getItem("token") ? "Bearer " + localStorage.getItem("token") : "",
      },
    });
    const usersData = await usersRes.json();
    const users = usersData.data && usersData.data.users ? usersData.data.users : [];
    if (!users.length) {
      el.innerHTML = "کاربری یافت نشد.";
      return;
    }
    let rows = users.map(user => `
      <tr>
        <td>${user.id}</td>
        <td>${user.name || user.firstName + ' ' + user.lastName || ''}</td>
        <td>${user.email}</td>
        <td>${user.role === 'admin' ? 'مدیر' : user.role === 'support' ? 'پشتیبان' : 'کاربر'}</td>
        <td>${user.status === 'active' ? 'فعال' : user.status === 'inactive' ? 'غیرفعال' : 'معلق'}</td>
        <td>
          <button onclick="editUser(${user.id})">ویرایش</button>
          <button onclick="suspendUser(${user.id})">تعلیق</button>
          <button onclick="promoteUser(${user.id})">ارتقاء</button>
        </td>
      </tr>
    `).join('');
    el.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>شناسه</th><th>نام</th><th>ایمیل</th><th>نقش</th><th>وضعیت</th><th>عملیات</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  } catch (err) {
    el.innerHTML = "خطا در دریافت کاربران";
  }
}

window.editUser = function(id) {
  alert('ویرایش کاربر: ' + id);
};
window.suspendUser = async function(id) {
  if (!confirm('آیا مطمئن هستید که می‌خواهید این کاربر را معلق کنید؟')) return;
  try {
    const res = await fetch(`/api/users/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem("token") ? "Bearer " + localStorage.getItem("token") : "",
      },
      body: JSON.stringify({ status: 'suspended' })
    });
    if (res.ok) {
      alert('کاربر معلق شد.');
      loadAdminUsers();
    } else {
      alert('خطا در تعلیق کاربر');
    }
  } catch {
    alert('خطا در تعلیق کاربر');
  }
};
window.promoteUser = async function(id) {
  alert('ارتقاء کاربر (نیاز به پیاده‌سازی سمت سرور): ' + id);
};

async function loadAdminBlogs() {
  const el = document.getElementById("admin-blogs");
  el.innerHTML = "در حال بارگذاری بلاگ‌ها...";
  try {
    const blogsRes = await fetch("/api/blogs", {
      headers: {
        Authorization: localStorage.getItem("token") ? "Bearer " + localStorage.getItem("token") : "",
      },
    });
    const blogsData = await blogsRes.json();
    const blogs = blogsData.data && blogsData.data.blogs ? blogsData.data.blogs : [];
    if (!blogs.length) {
      el.innerHTML = "بلاگی یافت نشد.";
      return;
    }
    let rows = blogs.map(blog => `
      <tr>
        <td>${blog.id}</td>
        <td>${blog.title}</td>
        <td>${blog.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}</td>
        <td>
          <button onclick="editBlog(${blog.id})">ویرایش</button>
          <button onclick="deleteBlog(${blog.id})">حذف</button>
          <button onclick="toggleBlogStatus(${blog.id}, '${blog.status}')">${blog.status === 'published' ? 'عدم انتشار' : 'انتشار'}</button>
        </td>
      </tr>
    `).join('');
    el.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>شناسه</th><th>عنوان</th><th>وضعیت</th><th>عملیات</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  } catch (err) {
    el.innerHTML = "خطا در دریافت بلاگ‌ها";
  }
}

window.editBlog = function(id) {
  alert('ویرایش بلاگ: ' + id);
};
window.deleteBlog = async function(id) {
  if (!confirm('آیا مطمئن هستید که می‌خواهید این بلاگ را حذف کنید؟')) return;
  try {
    const res = await fetch(`/api/blogs/posts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: localStorage.getItem("token") ? "Bearer " + localStorage.getItem("token") : "",
      },
    });
    if (res.ok) {
      alert('بلاگ حذف شد.');
      loadAdminBlogs();
    } else {
      alert('خطا در حذف بلاگ');
    }
  } catch {
    alert('خطا در حذف بلاگ');
  }
};
window.toggleBlogStatus = async function(id, status) {
  const newStatus = status === 'published' ? 'draft' : 'published';
  try {
    const res = await fetch(`/api/blogs/admin/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem("token") ? "Bearer " + localStorage.getItem("token") : "",
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      alert('وضعیت بلاگ تغییر کرد.');
      loadAdminBlogs();
    } else {
      alert('خطا در تغییر وضعیت بلاگ');
    }
  } catch {
    alert('خطا در تغییر وضعیت بلاگ');
  }
};

async function loadAdminComments() {
  const el = document.getElementById("admin-comments");
  el.innerHTML = "در حال بارگذاری نظرات...";
  try {
    const commentsRes = await fetch("/api/blogs/comments", {
      headers: {
        Authorization: localStorage.getItem("token") ? "Bearer " + localStorage.getItem("token") : "",
      },
    });
    const commentsData = await commentsRes.json();
    const comments = commentsData.data && commentsData.data.comments ? commentsData.data.comments : [];
    if (!comments.length) {
      el.innerHTML = "نظری یافت نشد.";
      return;
    }
    let rows = comments.map(comment => `
      <tr>
        <td>${comment.id}</td>
        <td>${comment.author || comment.userName || ''}</td>
        <td>${comment.content}</td>
        <td>${comment.status === 'approved' ? 'تایید شده' : comment.status === 'pending' ? 'در انتظار' : 'رد شده'}</td>
        <td>
          <button onclick="approveComment(${comment.id})">تایید</button>
          <button onclick="rejectComment(${comment.id})">رد</button>
          <button onclick="deleteComment(${comment.id})">حذف</button>
        </td>
      </tr>
    `).join('');
    el.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>شناسه</th><th>نویسنده</th><th>متن</th><th>وضعیت</th><th>عملیات</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  } catch (err) {
    el.innerHTML = "خطا در دریافت نظرات";
  }
}

window.approveComment = async function(id) {
  try {
    const res = await fetch(`/api/comment/admin/comments/${id}/moderate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem("token") ? "Bearer " + localStorage.getItem("token") : "",
      },
      body: JSON.stringify({ status: 'approved' })
    });
    if (res.ok) {
      alert('نظر تایید شد.');
      loadAdminComments();
    } else {
      alert('خطا در تایید نظر');
    }
  } catch {
    alert('خطا در تایید نظر');
  }
};
window.rejectComment = async function(id) {
  try {
    const res = await fetch(`/api/comment/admin/comments/${id}/moderate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem("token") ? "Bearer " + localStorage.getItem("token") : "",
      },
      body: JSON.stringify({ status: 'rejected' })
    });
    if (res.ok) {
      alert('نظر رد شد.');
      loadAdminComments();
    } else {
      alert('خطا در رد نظر');
    }
  } catch {
    alert('خطا در رد نظر');
  }
};
window.deleteComment = async function(id) {
  if (!confirm('آیا مطمئن هستید که می‌خواهید این نظر را حذف کنید؟')) return;
  try {
    const res = await fetch(`/api/comment/admin/comments/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: localStorage.getItem("token") ? "Bearer " + localStorage.getItem("token") : "",
      },
    });
    if (res.ok) {
      alert('نظر حذف شد.');
      loadAdminComments();
    } else {
      alert('خطا در حذف نظر');
    }
  } catch {
    alert('خطا در حذف نظر');
  }
};

// Stubs for other sections (to be implemented)
// function loadAdminOrders() { ... }

// Content Management
async function loadAdminContent() {
  const el = document.getElementById("admin-content");
  el.innerHTML = "در حال بارگذاری محتوا...";
  try {
    const res = await fetch("/api/content", {
      headers: {
        Authorization: localStorage.getItem("token") ? "Bearer " + localStorage.getItem("token") : "",
      },
    });
    const data = await res.json();
    const contents = data.data && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
    if (!contents.length) {
      el.innerHTML = "محتوایی یافت نشد.";
      return;
    }
    let rows = contents.map(content => `
      <tr>
        <td>${content.id || ''}</td>
        <td>${content.title || ''}</td>
        <td>${content.type || ''}</td>
        <td>
          <button onclick="editContent('${content.id}')">ویرایش</button>
          <button onclick="deleteContent('${content.id}')">حذف</button>
        </td>
      </tr>
    `).join('');
    el.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>شناسه</th><th>عنوان</th><th>نوع</th><th>عملیات</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  } catch (err) {
    el.innerHTML = "خطا در دریافت محتوا";
  }
}
window.editContent = function(id) {
  alert('ویرایش محتوا: ' + id);
};
window.deleteContent = async function(id) {
  if (!confirm('آیا مطمئن هستید که می‌خواهید این محتوا را حذف کنید؟')) return;
  try {
    const res = await fetch(`/api/content/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: localStorage.getItem("token") ? "Bearer " + localStorage.getItem("token") : "",
      },
    });
    if (res.ok) {
      alert('محتوا حذف شد.');
      loadAdminContent();
    } else {
      alert('خطا در حذف محتوا');
    }
  } catch {
    alert('خطا در حذف محتوا');
  }
};

// Contact Messages
async function loadAdminContact() {
  const el = document.getElementById("admin-contact");
  el.innerHTML = "در حال بارگذاری پیام‌ها...";
  try {
    const res = await fetch("/api/contact", {
      headers: {
        Authorization: localStorage.getItem("token") ? "Bearer " + localStorage.getItem("token") : "",
      },
    });
    const data = await res.json();
    const messages = data.data && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
    if (!messages.length) {
      el.innerHTML = "پیامی یافت نشد.";
      return;
    }
    let rows = messages.map(msg => `
      <tr>
        <td>${msg.id || ''}</td>
        <td>${msg.name || ''}</td>
        <td>${msg.email || ''}</td>
        <td>${msg.subject || ''}</td>
        <td>${msg.status === 'replied' ? 'پاسخ داده شده' : msg.status === 'read' ? 'خوانده شده' : 'جدید'}</td>
        <td>
          <button onclick="viewMessage('${msg.id}')">مشاهده</button>
          <button onclick="replyMessage('${msg.id}')">پاسخ</button>
        </td>
      </tr>
    `).join('');
    el.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>شناسه</th><th>نام</th><th>ایمیل</th><th>موضوع</th><th>وضعیت</th><th>عملیات</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  } catch (err) {
    el.innerHTML = "خطا در دریافت پیام‌ها";
  }
}
window.viewMessage = function(id) {
  alert('مشاهده پیام: ' + id);
};
window.replyMessage = function(id) {
  alert('پاسخ به پیام (نیاز به پیاده‌سازی فرم پاسخ): ' + id);
};

// Services Management
async function loadAdminServices() {
  const el = document.getElementById("admin-services");
  el.innerHTML = "در حال بارگذاری سرویس‌ها...";
  try {
    const res = await fetch("/api/services", {
      headers: {
        Authorization: localStorage.getItem("token") ? "Bearer " + localStorage.getItem("token") : "",
      },
    });
    const data = await res.json();
    const services = data.data && data.data.services ? data.data.services : [];
    if (!services.length) {
      el.innerHTML = "سرویسی یافت نشد.";
      return;
    }
    let rows = services.map(service => `
      <tr>
        <td>${service.id}</td>
        <td>${service.name}</td>
        <td>${service.type}</td>
        <td>${service.status === 'active' ? 'فعال' : service.status === 'pending' ? 'در انتظار' : 'غیرفعال'}</td>
        <td>
          <button onclick="editService('${service.id}')">ویرایش</button>
          <button onclick="deleteService('${service.id}')">حذف</button>
        </td>
      </tr>
    `).join('');
    el.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>شناسه</th><th>نام</th><th>نوع</th><th>وضعیت</th><th>عملیات</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  } catch (err) {
    el.innerHTML = "خطا در دریافت سرویس‌ها";
  }
}
window.editService = function(id) {
  alert('ویرایش سرویس: ' + id);
};
window.deleteService = async function(id) {
  if (!confirm('آیا مطمئن هستید که می‌خواهید این سرویس را حذف کنید؟')) return;
  try {
    const res = await fetch(`/api/services/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: localStorage.getItem("token") ? "Bearer " + localStorage.getItem("token") : "",
      },
    });
    if (res.ok) {
      alert('سرویس حذف شد.');
      loadAdminServices();
    } else {
      alert('خطا در حذف سرویس');
    }
  } catch {
    alert('خطا در حذف سرویس');
  }
};

// Analytics (stub with chart placeholder)
async function loadAdminAnalytics() {
  const el = document.getElementById("admin-analytics");
  el.innerHTML = `<div style="text-align:center; font-size:1.2rem;">نمودارها و آمار پیشرفته به زودی...</div>`;
}

// Navigation: load section data on tab click
const navSectionLoaders = {
  '#dashboard': loadDashboardStats,
  '#users': loadAdminUsers,
  '#blogs': loadAdminBlogs,
  '#comments': loadAdminComments,
  '#orders': loadAdminOrders,
  '#content': loadAdminContent,
  '#contact': loadAdminContact,
  '#services': loadAdminServices,
  '#analytics': loadAdminAnalytics,
};

// Patch navigation logic to call section loader
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    const hash = link.getAttribute('href');
    if (navSectionLoaders[hash]) setTimeout(navSectionLoaders[hash], 0);
  });
});
// Also call loader on initial load
if (navSectionLoaders[window.location.hash]) setTimeout(navSectionLoaders[window.location.hash], 0);
