const menuIcon = document.querySelector(".bx-menu");
const navbar = document.querySelector(".navbar");

// Open menu
menuIcon.addEventListener("click", () => {
  navbar.classList.toggle("active");
  menuIcon.classList.toggle("menu-fixed");
  // Hide menu icon when menu is open
  menuIcon.style.visibility = menuIcon.classList.contains("bx-menu")
    ? "hidden"
    : "visible";
});

// Close menu when clicking anywhere outside
document.addEventListener("click", (e) => {
  // Check if click is outside both navbar and menu icon
  if (!navbar.contains(e.target) && !menuIcon.contains(e.target)) {
    navbar.classList.remove("active");
    menuIcon.classList.remove("menu-fixed");
    // Show menu icon when menu is closed
    menuIcon.style.visibility = "visible";
  }
});

// Close menu when clicking on links
document.querySelectorAll(".navbar a").forEach((link) => {
  link.addEventListener("click", () => {
    navbar.classList.remove("active");
    menuIcon.classList.remove("menu-fixed");
    // Show menu icon when menu is closed
    menuIcon.style.visibility = "visible";
  });
});

// API endpoints
const API_BASE_URL = "/api";
const BLOG_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/blogs`,
  GET_ONE: (id) => `${API_BASE_URL}/blogs/${id}`,
  SEARCH: `${API_BASE_URL}/blogs/search`,
};

// DOM Elements
const newsContainer = document.querySelector(".news-section .blog-container");
const tutorialContainer = document.querySelector(
  ".tutorial-section .blog-container"
);

// Fetch and display blogs
async function fetchAndDisplayBlogs() {
  try {
    const response = await fetch(BLOG_ENDPOINTS.GET_ALL);
    const data = await response.json();

    if (data.success) {
      displayBlogs(data.data);
    } else {
      console.error("Failed to fetch blogs:", data.error);
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
  }
}

// Display blogs in the UI
function displayBlogs(blogs) {
  // Clear existing content
  newsContainer.innerHTML = "";
  tutorialContainer.innerHTML = "";

  // Separate blogs into news and tutorials
  const news = blogs.filter((blog) => blog.category === "news");
  const tutorials = blogs.filter((blog) => blog.category === "tutorial");

  // Display news
  news.forEach((blog) => {
    const blogCard = createBlogCard(blog);
    newsContainer.appendChild(blogCard);
  });

  // Display tutorials
  tutorials.forEach((blog) => {
    const blogCard = createBlogCard(blog);
    tutorialContainer.appendChild(blogCard);
  });
}

// Create a blog card element
function createBlogCard(blog) {
  const card = document.createElement("div");
  card.className = "blog-card";

  card.innerHTML = `
        <img src="${
          blog.featuredImage || "./Assets/img/default-blog.jpg"
        }" alt="${blog.title}" />
        <span class="category-tag">${blog.category}</span>
        <h3>${blog.title}</h3>
        <p>${blog.metaDescription || blog.content.substring(0, 100)}...</p>
        <a href="./blog-post.html?id=${
          blog.id
        }" class="read-more">ادامه مطلب</a>
    `;

  return card;
}

// Search functionality
const searchForm = document.querySelector(".search-form");
if (searchForm) {
  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const searchQuery = e.target.querySelector("input").value;

    try {
      const response = await fetch(
        `${BLOG_ENDPOINTS.SEARCH}?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.success) {
        displayBlogs(data.data);
      } else {
        console.error("Search failed:", data.error);
      }
    } catch (error) {
      console.error("Error searching blogs:", error);
    }
  });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplayBlogs();
});
