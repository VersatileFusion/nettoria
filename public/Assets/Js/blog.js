// Blog system functionality
class BlogSystem {
  constructor() {
    this.posts = [];
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 1;
    this.container = document.querySelector(".blog-container");
    this.postsList = document.querySelector(".blog-posts");
    this.paginationContainer = document.querySelector(".pagination");
  }

  async init() {
    try {
      Utils.showLoading(this.container);
      await this.loadPosts();
    } catch (error) {
      Utils.handleApiError(error);
    } finally {
      Utils.hideLoading(this.container);
    }
  }

  async loadPosts(page = 1) {
    try {
      Utils.showLoading(this.postsList);
      const response = await apiService.getBlogs(page, this.itemsPerPage);
      this.posts = response.posts;
      this.totalPages = response.pagination.pages;
      this.currentPage = page;
      this.renderPosts();
      this.renderPagination();
    } catch (error) {
      Utils.handleApiError(error);
    } finally {
      Utils.hideLoading(this.postsList);
    }
  }

  renderPosts() {
    if (!this.postsList) return;

    // Clear container
    this.postsList.innerHTML = "";

    if (this.posts.length === 0) {
      this.postsList.innerHTML = `
                <div class="empty-posts">
                    <i class="bx bx-book-content"></i>
                    <p>هیچ مقاله‌ای یافت نشد</p>
                </div>
            `;
      return;
    }

    // Create posts grid
    const grid = document.createElement("div");
    grid.className = "blog-grid";

    this.posts.forEach((post) => {
      const card = document.createElement("article");
      card.className = "blog-card";
      card.innerHTML = `
                <div class="blog-image">
                    <img src="${
                      post.image || "/Assets/img/blog-placeholder.jpg"
                    }" alt="${post.title}">
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <span class="date">${Utils.formatDate(post.date)}</span>
                        <span class="category">${post.category}</span>
                    </div>
                    <h2 class="blog-title">
                        <a href="/blog-post.html?id=${post.id}">${
        post.title
      }</a>
                    </h2>
                    <p class="blog-excerpt">${post.excerpt}</p>
                    <div class="blog-footer">
                        <a href="/blog-post.html?id=${
                          post.id
                        }" class="read-more">
                            ادامه مطلب
                            <i class="bx bx-left-arrow-alt"></i>
                        </a>
                        <div class="blog-stats">
                            <span class="views">
                                <i class="bx bx-show"></i>
                                ${post.views}
                            </span>
                            <span class="comments">
                                <i class="bx bx-comment"></i>
                                ${post.comments}
                            </span>
                        </div>
                    </div>
                </div>
            `;
      grid.appendChild(card);
    });

    this.postsList.appendChild(grid);
  }

  renderPagination() {
    if (!this.paginationContainer) return;

    // Clear container
    this.paginationContainer.innerHTML = "";

    // Create pagination
    const pagination = Utils.createPagination(
      this.currentPage,
      this.totalPages,
      (page) => this.loadPosts(page)
    );

    this.paginationContainer.appendChild(pagination);
  }
}

// Blog post functionality
class BlogPost {
  constructor() {
    this.post = null;
    this.comments = [];
    this.container = document.querySelector(".blog-post-container");
    this.commentsList = document.querySelector(".comments-list");
  }

  async init() {
    try {
      Utils.showLoading(this.container);
      const postId = new URLSearchParams(window.location.search).get("id");
      if (!postId) {
        throw new Error("شناسه مقاله یافت نشد");
      }
      await this.loadPost(postId);
      await this.loadComments(postId);
    } catch (error) {
      Utils.handleApiError(error);
    } finally {
      Utils.hideLoading(this.container);
    }
  }

  async loadPost(postId) {
    try {
      const response = await apiService.getBlogPost(postId);
      this.post = response;
      this.renderPost();
    } catch (error) {
      Utils.handleApiError(error);
    }
  }

  async loadComments(postId) {
    try {
      const response = await apiService.getBlogComments(postId);
      this.comments = response.comments;
      this.renderComments();
    } catch (error) {
      Utils.handleApiError(error);
    }
  }

  renderPost() {
    if (!this.container) return;

    const article = document.createElement("article");
    article.className = "blog-post";
    article.innerHTML = `
            <header class="post-header">
                <div class="post-meta">
                    <span class="date">${Utils.formatDate(
                      this.post.date
                    )}</span>
                    <span class="category">${this.post.category}</span>
                    <span class="author">نویسنده: ${this.post.author}</span>
                </div>
                <h1 class="post-title">${this.post.title}</h1>
            </header>
            <div class="post-image">
                <img src="${
                  this.post.image || "/Assets/img/blog-placeholder.jpg"
                }" alt="${this.post.title}">
            </div>
            <div class="post-content">
                ${this.post.content}
            </div>
            <footer class="post-footer">
                <div class="post-tags">
                    ${this.post.tags
                      .map(
                        (tag) => `
                        <a href="/blogs.html?tag=${tag}" class="tag">${tag}</a>
                    `
                      )
                      .join("")}
                </div>
                <div class="post-stats">
                    <span class="views">
                        <i class="bx bx-show"></i>
                        ${this.post.views} بازدید
                    </span>
                    <span class="comments">
                        <i class="bx bx-comment"></i>
                        ${this.post.comments} نظر
                    </span>
                </div>
            </footer>
        `;

    this.container.appendChild(article);
  }

  renderComments() {
    if (!this.commentsList) return;

    // Clear container
    this.commentsList.innerHTML = "";

    if (this.comments.length === 0) {
      this.commentsList.innerHTML = `
                <div class="empty-comments">
                    <i class="bx bx-comment-x"></i>
                    <p>هنوز نظری ثبت نشده است</p>
                </div>
            `;
      return;
    }

    // Create comments list
    const list = document.createElement("div");
    list.className = "comments";

    this.comments.forEach((comment) => {
      const commentElement = document.createElement("div");
      commentElement.className = "comment";
      commentElement.innerHTML = `
                <div class="comment-header">
                    <div class="comment-author">
                        <img src="${
                          comment.avatar || "/Assets/img/avatar-placeholder.jpg"
                        }" alt="${comment.author}">
                        <span class="name">${comment.author}</span>
                    </div>
                    <span class="date">${Utils.formatDate(comment.date)}</span>
                </div>
                <div class="comment-content">
                    ${comment.content}
                </div>
                <div class="comment-actions">
                    <button class="reply-btn" data-id="${comment.id}">
                        <i class="bx bx-reply"></i>
                        پاسخ
                    </button>
                </div>
            `;
      list.appendChild(commentElement);
    });

    this.commentsList.appendChild(list);
    this.addCommentEventListeners();
  }

  addCommentEventListeners() {
    // Reply buttons
    this.commentsList.querySelectorAll(".reply-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const commentId = e.target.closest(".reply-btn").dataset.id;
        this.showReplyForm(commentId);
      });
    });
  }

  showReplyForm(commentId = null) {
    const form = document.createElement("form");
    form.className = "comment-form";
    form.innerHTML = `
            <div class="form-group">
                <label for="comment">نظر شما</label>
                <textarea id="comment" name="comment" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">ارسال نظر</button>
        `;

    // Insert form after the comment if replying
    if (commentId) {
      const comment = this.commentsList
        .querySelector(`[data-id="${commentId}"]`)
        .closest(".comment");
      comment.appendChild(form);
    } else {
      this.commentsList.insertBefore(form, this.commentsList.firstChild);
    }

    // Handle form submission
    Utils.handleFormSubmit(form, async (form) => {
      const formData = new FormData(form);
      const content = formData.get("comment");

      try {
        await apiService.addBlogComment(this.post.id, content, commentId);
        Utils.showNotification("نظر شما با موفقیت ثبت شد", "success");
        form.remove();
        await this.loadComments(this.post.id); // Refresh comments
      } catch (error) {
        Utils.handleApiError(error);
      }
    });
  }
}

// Initialize blog system when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if we're on the blog post page
  if (window.location.pathname.includes("blog-post.html")) {
    const blogPost = new BlogPost();
    blogPost.init();
  } else {
    const blogSystem = new BlogSystem();
    blogSystem.init();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  initializeBlog();
  loadBlogs();
  loadCategories();
  loadTags();
});

// Initialize blog functionality
function initializeBlog() {
  const searchForm = document.getElementById("blogSearchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", handleBlogSearch);
  }

  const categoryFilter = document.getElementById("categoryFilter");
  if (categoryFilter) {
    categoryFilter.addEventListener("change", handleCategoryFilter);
  }

  const tagFilter = document.getElementById("tagFilter");
  if (tagFilter) {
    tagFilter.addEventListener("change", handleTagFilter);
  }
}

// Load blogs with pagination
async function loadBlogs(page = 1) {
  try {
    showLoading();
    const response = await fetch(`/api/blogs?page=${page}`);
    const data = await response.json();

    if (response.ok) {
      renderBlogs(data.blogs);
      renderPagination(data.currentPage, data.totalPages);
    } else {
      throw new Error(data.message || "Failed to load blogs");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Render blogs
function renderBlogs(blogs) {
  const blogsContainer = document.getElementById("blogsList");
  if (!blogsContainer) return;

  if (blogs.length === 0) {
    blogsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <p>No blogs found</p>
            </div>
        `;
    return;
  }

  blogsContainer.innerHTML = blogs
    .map(
      (blog) => `
        <article class="blog-card">
            <div class="blog-image">
                <img src="${
                  blog.featuredImage || "Assets/images/default-blog.jpg"
                }" alt="${blog.title}">
            </div>
            <div class="blog-content">
                <h2><a href="/blog-post.html?slug=${blog.slug}">${
        blog.title
      }</a></h2>
                <div class="blog-meta">
                    <span><i class="fas fa-user"></i> ${blog.author.name}</span>
                    <span><i class="fas fa-calendar"></i> ${new Date(
                      blog.publishedAt
                    ).toLocaleDateString()}</span>
                    <span><i class="fas fa-eye"></i> ${
                      blog.viewCount
                    } views</span>
                </div>
                <p>${blog.excerpt || blog.content.substring(0, 150)}...</p>
                <div class="blog-tags">
                    ${blog.tags
                      .map((tag) => `<span class="tag">${tag}</span>`)
                      .join("")}
                </div>
                <a href="/blog-post.html?slug=${
                  blog.slug
                }" class="read-more">Read More</a>
            </div>
        </article>
    `
    )
    .join("");
}

// Load blog categories
async function loadCategories() {
  try {
    const response = await fetch("/api/categories");
    const categories = await response.json();

    if (response.ok) {
      renderCategories(categories);
    }
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

// Render categories
function renderCategories(categories) {
  const categoriesContainer = document.getElementById("categoriesList");
  if (!categoriesContainer) return;

  categoriesContainer.innerHTML = categories
    .map(
      (category) => `
        <li>
            <a href="#" onclick="handleCategoryFilter('${category}')">
                ${category}
            </a>
        </li>
    `
    )
    .join("");
}

// Load blog tags
async function loadTags() {
  try {
    const response = await fetch("/api/tags");
    const tags = await response.json();

    if (response.ok) {
      renderTags(tags);
    }
  } catch (error) {
    console.error("Error loading tags:", error);
  }
}

// Render tags
function renderTags(tags) {
  const tagsContainer = document.getElementById("tagsList");
  if (!tagsContainer) return;

  tagsContainer.innerHTML = tags
    .map(
      (tag) => `
        <span class="tag" onclick="handleTagFilter('${tag}')">
            ${tag}
        </span>
    `
    )
    .join("");
}

// Handle blog search
async function handleBlogSearch(event) {
  event.preventDefault();
  const searchQuery = event.target.search.value;

  try {
    showLoading();
    const response = await fetch(
      `/api/blogs?search=${encodeURIComponent(searchQuery)}`
    );
    const data = await response.json();

    if (response.ok) {
      renderBlogs(data.blogs);
      renderPagination(data.currentPage, data.totalPages);
    } else {
      throw new Error(data.message || "Failed to search blogs");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Handle category filter
async function handleCategoryFilter(category) {
  try {
    showLoading();
    const response = await fetch(
      `/api/blogs?category=${encodeURIComponent(category)}`
    );
    const data = await response.json();

    if (response.ok) {
      renderBlogs(data.blogs);
      renderPagination(data.currentPage, data.totalPages);
    } else {
      throw new Error(data.message || "Failed to filter blogs");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Handle tag filter
async function handleTagFilter(tag) {
  try {
    showLoading();
    const response = await fetch(`/api/blogs?tag=${encodeURIComponent(tag)}`);
    const data = await response.json();

    if (response.ok) {
      renderBlogs(data.blogs);
      renderPagination(data.currentPage, data.totalPages);
    } else {
      throw new Error(data.message || "Failed to filter blogs");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Render pagination
function renderPagination(currentPage, totalPages) {
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) return;

  let paginationHTML = "";

  // Previous button
  paginationHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? "disabled" : ""} 
                onclick="loadBlogs(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 2 && i <= currentPage + 2)
    ) {
      paginationHTML += `
                <button class="pagination-btn ${
                  i === currentPage ? "active" : ""
                }"
                        onclick="loadBlogs(${i})">
                    ${i}
                </button>
            `;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      paginationHTML += '<span class="pagination-ellipsis">...</span>';
    }
  }

  // Next button
  paginationHTML += `
        <button class="pagination-btn" ${
          currentPage === totalPages ? "disabled" : ""
        }
                onclick="loadBlogs(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

  paginationContainer.innerHTML = paginationHTML;
}

// Utility functions
function showLoading() {
  const loading = document.createElement("div");
  loading.className = "loading-spinner";
  loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  document.body.appendChild(loading);
}

function hideLoading() {
  const loading = document.querySelector(".loading-spinner");
  if (loading) {
    loading.remove();
  }
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
