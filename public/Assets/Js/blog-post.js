// API endpoints
const API_BASE_URL = "/api";
const BLOG_ENDPOINTS = {
  GET_ONE: (id) => `${API_BASE_URL}/blogs/${id}`,
  GET_RELATED: (id) => `${API_BASE_URL}/blogs/${id}/related`,
};

// DOM Elements
const blogTitle = document.getElementById("blog-title");
const blogDate = document.getElementById("blog-date");
const blogAuthor = document.getElementById("blog-author");
const blogCategory = document.getElementById("blog-category");
const blogImage = document.getElementById("blog-image");
const blogContent = document.getElementById("blog-content");
const relatedPosts = document.getElementById("related-posts");

// Get blog ID from URL
const urlParams = new URLSearchParams(window.location.search);
const blogId = urlParams.get("id");

// Format date
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("fa-IR", options);
}

// Fetch and display blog post
async function fetchAndDisplayBlogPost() {
  if (!blogId) {
    window.location.href = "./blogs.html";
    return;
  }

  try {
    const response = await fetch(BLOG_ENDPOINTS.GET_ONE(blogId));
    const data = await response.json();

    if (data.success) {
      displayBlogPost(data.data);
      fetchRelatedPosts();
    } else {
      console.error("Failed to fetch blog post:", data.error);
      blogContent.innerHTML =
        '<p class="error">Failed to load blog post. Please try again later.</p>';
    }
  } catch (error) {
    console.error("Error fetching blog post:", error);
    blogContent.innerHTML =
      '<p class="error">An error occurred while loading the blog post.</p>';
  }
}

// Display blog post
function displayBlogPost(blog) {
  // Update page title
  document.title = `${blog.title} - Nettoria Blog`;

  // Update blog content
  blogTitle.textContent = blog.title;
  blogDate.textContent = formatDate(blog.createdAt);
  blogAuthor.textContent = `نویسنده: ${blog.authorName || "Admin"}`;
  blogCategory.textContent = blog.category;
  blogImage.src = blog.featuredImage || "./Assets/img/default-blog.jpg";
  blogImage.alt = blog.title;
  blogContent.innerHTML = blog.content;
}

// Fetch and display related posts
async function fetchRelatedPosts() {
  try {
    const response = await fetch(BLOG_ENDPOINTS.GET_RELATED(blogId));
    const data = await response.json();

    if (data.success) {
      displayRelatedPosts(data.data);
    } else {
      console.error("Failed to fetch related posts:", data.error);
      relatedPosts.innerHTML =
        '<p class="error">Failed to load related posts.</p>';
    }
  } catch (error) {
    console.error("Error fetching related posts:", error);
    relatedPosts.innerHTML =
      '<p class="error">Failed to load related posts.</p>';
  }
}

// Display related posts
function displayRelatedPosts(posts) {
  if (posts.length === 0) {
    relatedPosts.innerHTML = "<p>No related posts found.</p>";
    return;
  }

  const postsHTML = posts
    .map(
      (post) => `
        <div class="related-post-card">
            <img src="${
              post.featuredImage || "./Assets/img/default-blog.jpg"
            }" alt="${post.title}">
            <h3>${post.title}</h3>
            <p>${post.metaDescription || post.content.substring(0, 100)}...</p>
            <a href="./blog-post.html?id=${
              post.id
            }" class="read-more">ادامه مطلب</a>
        </div>
    `
    )
    .join("");

  relatedPosts.innerHTML = postsHTML;
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplayBlogPost();
});
