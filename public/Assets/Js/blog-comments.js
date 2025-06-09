document.addEventListener("DOMContentLoaded", () => {
  const commentsList = document.getElementById("commentsList");
  const commentForm = document.getElementById("commentForm");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const blogId = new URLSearchParams(window.location.search).get("id");

  if (!blogId) {
    showToast("Blog ID not found", "error");
    return;
  }

  // Load comments when page loads
  loadComments();

  // Handle comment form submission
  commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const content = document.getElementById("comment").value.trim();

    if (!content) {
      showToast("Please enter a comment", "error");
      return;
    }

    try {
      showLoading();
      const response = await fetch(`/api/blogs/${blogId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const comment = await response.json();
      document.getElementById("comment").value = "";
      showToast("Comment posted successfully", "success");
      loadComments(); // Reload comments
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      hideLoading();
    }
  });

  // Load comments for the blog post
  async function loadComments() {
    try {
      showLoading();
      const response = await fetch(`/api/blogs/${blogId}/comments`);

      if (!response.ok) {
        throw new Error("Failed to load comments");
      }

      const data = await response.json();
      renderComments(data.comments);
    } catch (error) {
      showToast(error.message, "error");
      commentsList.innerHTML = `
                <div class="empty-comments">
                    <i class="fas fa-comments"></i>
                    <p>Failed to load comments</p>
                </div>
            `;
    } finally {
      hideLoading();
    }
  }

  // Render comments in the UI
  function renderComments(comments) {
    if (!comments || comments.length === 0) {
      commentsList.innerHTML = `
                <div class="empty-comments">
                    <i class="fas fa-comments"></i>
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            `;
      return;
    }

    commentsList.innerHTML = comments
      .map(
        (comment) => `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-author">
                        <img src="${
                          comment.author.avatar ||
                          "Assets/images/default-avatar.png"
                        }" alt="${comment.author.name}">
                        <div>
                            <span class="name">${comment.author.name}</span>
                            <span class="comment-date">${formatDate(
                              comment.createdAt
                            )}</span>
                        </div>
                    </div>
                    ${
                      isCommentAuthor(comment.authorId)
                        ? `
                        <div class="comment-actions">
                            <button onclick="editComment('${comment.id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button onclick="deleteComment('${comment.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    `
                        : ""
                    }
                </div>
                <div class="comment-content">${comment.content}</div>
                ${renderReplies(comment.replies)}
                <button class="reply-button" onclick="showReplyForm('${
                  comment.id
                }')">
                    <i class="fas fa-reply"></i> Reply
                </button>
            </div>
        `
      )
      .join("");
  }

  // Render nested replies
  function renderReplies(replies) {
    if (!replies || replies.length === 0) return "";

    return `
            <div class="replies">
                ${replies
                  .map(
                    (reply) => `
                    <div class="comment reply" data-comment-id="${reply.id}">
                        <div class="comment-header">
                            <div class="comment-author">
                                <img src="${
                                  reply.author.avatar ||
                                  "Assets/images/default-avatar.png"
                                }" alt="${reply.author.name}">
                                <div>
                                    <span class="name">${
                                      reply.author.name
                                    }</span>
                                    <span class="comment-date">${formatDate(
                                      reply.createdAt
                                    )}</span>
                                </div>
                            </div>
                            ${
                              isCommentAuthor(reply.authorId)
                                ? `
                                <div class="comment-actions">
                                    <button onclick="editComment('${reply.id}')">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button onclick="deleteComment('${reply.id}')">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            `
                                : ""
                            }
                        </div>
                        <div class="comment-content">${reply.content}</div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;
  }

  // Helper functions
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function isCommentAuthor(authorId) {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    return currentUser && currentUser.id === authorId;
  }

  function showLoading() {
    loadingSpinner.style.display = "flex";
  }

  function hideLoading() {
    loadingSpinner.style.display = "none";
  }

  // Make functions available globally
  window.editComment = async (commentId) => {
    const comment = document.querySelector(`[data-comment-id="${commentId}"]`);
    const content = comment.querySelector(".comment-content").textContent;
    const newContent = prompt("Edit your comment:", content);

    if (newContent && newContent !== content) {
      try {
        showLoading();
        const response = await fetch(`/api/comments/${commentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ content: newContent }),
        });

        if (!response.ok) {
          throw new Error("Failed to update comment");
        }

        showToast("Comment updated successfully", "success");
        loadComments();
      } catch (error) {
        showToast(error.message, "error");
      } finally {
        hideLoading();
      }
    }
  };

  window.deleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      showLoading();
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      showToast("Comment deleted successfully", "success");
      loadComments();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      hideLoading();
    }
  };

  window.showReplyForm = (parentId) => {
    const comment = document.querySelector(`[data-comment-id="${parentId}"]`);
    const existingForm = document.querySelector(".reply-form");
    if (existingForm) {
      existingForm.remove();
    }

    const form = document.createElement("form");
    form.className = "reply-form";
    form.innerHTML = `
            <div class="form-group">
                <textarea required placeholder="Write your reply..."></textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Post Reply</button>
                <button type="button" class="btn btn-secondary" onclick="this.closest('.reply-form').remove()">Cancel</button>
            </div>
        `;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const content = form.querySelector("textarea").value.trim();

      if (!content) {
        showToast("Please enter a reply", "error");
        return;
      }

      try {
        showLoading();
        const response = await fetch(`/api/blogs/${blogId}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ content, parentId }),
        });

        if (!response.ok) {
          throw new Error("Failed to post reply");
        }

        showToast("Reply posted successfully", "success");
        form.remove();
        loadComments();
      } catch (error) {
        showToast(error.message, "error");
      } finally {
        hideLoading();
      }
    });

    comment.appendChild(form);
  };
});
