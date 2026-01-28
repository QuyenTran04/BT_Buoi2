// ==================== POSTS MANAGEMENT ====================

// Load all posts (including soft-deleted ones)
async function LoadData() {
  let res = await fetch("http://localhost:3001/posts");
  let posts = await res.json();
  let body = document.getElementById("body_table");
  body.innerHTML = "";

  for (const post of posts) {
    // Check if post is soft-deleted
    const isDeleted = post.isDeleted === true;
    const rowClass = isDeleted ? 'soft-deleted' : '';
    const deletedLabel = isDeleted ? '<span class="deleted-badge">Đã xóa</span>' : '';
    const editDisabled = isDeleted ? 'disabled' : '';
    const deleteBtnClass = isDeleted ? 'btn-restore' : 'btn-delete';
    const deleteBtnText = isDeleted ? 'Khôi phục' : 'Xóa';

    body.innerHTML += `<tr class="${rowClass}">
            <td>${post.id}${deletedLabel}</td>
            <td>${post.title}</td>
            <td>${post.views}</td>
            <td>
                <div class="action-cell">
                    <button onclick="Edit(${post.id})" ${editDisabled} class="btn btn-edit"><i class="fas fa-pen"></i> Sửa</button>
                    <button onclick="Delete(${post.id})" class="btn ${deleteBtnClass}"><i class="fas ${isDeleted ? 'fa-undo' : 'fa-trash'}"></i> ${deleteBtnText}</button>
                </div>
            </td>
        </tr>`;
  }

  updateStats();
}

// Save (Create or Update) post
async function Save() {
  let id = document.getElementById("id_txt").value;
  let title = document.getElementById("title_txt").value;
  let views = document.getElementById("view_txt").value;

  // If ID is empty, generate auto-increment ID
  if (!id || id.trim() === "") {
    id = await generateNewId();
  }

  let getItem = await fetch("http://localhost:3001/posts/" + id);
  if (getItem.ok) {
    // Update existing post
    let post = await getItem.json();
    let res = await fetch("http://localhost:3001/posts/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        title: title,
        views: views,
        isDeleted: post.isDeleted || false,
      }),
    });
    if (res.ok) {
      console.log("Cap nhat thanh cong");
    }
  } else {
    // Create new post
    try {
      let res = await fetch("http://localhost:3001/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          title: title,
          views: views,
          isDeleted: false,
        }),
      });
      if (res.ok) {
        console.log("Them moi thanh cong");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Clear form
  document.getElementById("id_txt").value = "";
  document.getElementById("title_txt").value = "";
  document.getElementById("view_txt").value = "";

  LoadData();
  return false;
}

// Soft delete / Restore post
async function Delete(id) {
  let getItem = await fetch("http://localhost:3001/posts/" + id);
  let post = await getItem.json();

  let newDeletedStatus = !(post.isDeleted === true);

  let res = await fetch("http://localhost:3001/posts/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: post.id,
      title: post.title,
      views: post.views,
      isDeleted: newDeletedStatus,
    }),
  });

  if (res.ok) {
    console.log(newDeletedStatus ? "Da xoa mem" : "Da khoi phuc");
  }
  LoadData();
  return false;
}

// Edit post - fill form with post data
async function Edit(id) {
  let getItem = await fetch("http://localhost:3001/posts/" + id);
  let post = await getItem.json();

  document.getElementById("id_txt").value = post.id;
  document.getElementById("title_txt").value = post.title;
  document.getElementById("view_txt").value = post.views;

  document.getElementById("dataForm").scrollIntoView({ behavior: 'smooth' });
}

// Generate new auto-increment ID
async function generateNewId() {
  let res = await fetch("http://localhost:3001/posts");
  let posts = await res.json();

  if (posts.length === 0) {
    return "1";
  }

  let maxId = 0;
  for (const post of posts) {
    let idNum = parseInt(post.id);
    if (!isNaN(idNum) && idNum > maxId) {
      maxId = idNum;
    }
  }

  return String(maxId + 1);
}

// ==================== COMMENTS MANAGEMENT ====================

// Load all comments
async function LoadComments() {
  let res = await fetch("http://localhost:3001/comments");
  let comments = await res.json();
  let body = document.getElementById("body_comments");
  body.innerHTML = "";

  for (const comment of comments) {
    const isDeleted = comment.isDeleted === true;
    const rowClass = isDeleted ? 'soft-deleted' : '';
    const deletedLabel = isDeleted ? '<span class="deleted-badge">Đã xóa</span>' : '';
    const editDisabled = isDeleted ? 'disabled' : '';
    const deleteBtnClass = isDeleted ? 'btn-restore' : 'btn-delete';
    const deleteBtnText = isDeleted ? 'Khôi phục' : 'Xóa';

    body.innerHTML += `<tr class="${rowClass}">
            <td>${comment.id}${deletedLabel}</td>
            <td>${comment.postId}</td>
            <td>${comment.body}</td>
            <td>
                <div class="action-cell">
                    <button onclick="EditComment(${comment.id})" ${editDisabled} class="btn btn-edit"><i class="fas fa-pen"></i> Sửa</button>
                    <button onclick="DeleteComment(${comment.id})" class="btn ${deleteBtnClass}"><i class="fas ${isDeleted ? 'fa-undo' : 'fa-trash'}"></i> ${deleteBtnText}</button>
                </div>
            </td>
        </tr>`;
  }
}

// Save (Create or Update) comment
async function SaveComment() {
  let id = document.getElementById("comment_id_txt").value;
  let postId = document.getElementById("comment_postId_txt").value;
  let body = document.getElementById("comment_body_txt").value;

  // If ID is empty, generate auto-increment ID
  if (!id || id.trim() === "") {
    id = await generateNewCommentId();
  }

  let getItem = await fetch("http://localhost:3001/comments/" + id);
  if (getItem.ok) {
    let comment = await getItem.json();
    let res = await fetch("http://localhost:3001/comments/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        postId: postId,
        body: body,
        isDeleted: comment.isDeleted || false,
      }),
    });
    if (res.ok) {
      console.log("Cap nhat comment thanh cong");
    }
  } else {
    try {
      let res = await fetch("http://localhost:3001/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          postId: postId,
          body: body,
          isDeleted: false,
        }),
      });
      if (res.ok) {
        console.log("Them moi comment thanh cong");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Clear form
  document.getElementById("comment_id_txt").value = "";
  document.getElementById("comment_postId_txt").value = "";
  document.getElementById("comment_body_txt").value = "";

  LoadComments();
  updateStats();
  return false;
}

// Soft delete / Restore comment
async function DeleteComment(id) {
  let getItem = await fetch("http://localhost:3001/comments/" + id);
  let comment = await getItem.json();

  let newDeletedStatus = !(comment.isDeleted === true);

  let res = await fetch("http://localhost:3001/comments/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: comment.id,
      postId: comment.postId,
      body: comment.body,
      isDeleted: newDeletedStatus,
    }),
  });

  if (res.ok) {
    console.log(newDeletedStatus ? "Da xoa mem comment" : "Da khoi phuc comment");
  }
  LoadComments();
  return false;
}

// Edit comment - fill form with comment data
async function EditComment(id) {
  let getItem = await fetch("http://localhost:3001/comments/" + id);
  let comment = await getItem.json();

  document.getElementById("comment_id_txt").value = comment.id;
  document.getElementById("comment_postId_txt").value = comment.postId;
  document.getElementById("comment_body_txt").value = comment.body;

  document.getElementById("commentForm").scrollIntoView({ behavior: 'smooth' });
}

// Generate new auto-increment ID for comments
async function generateNewCommentId() {
  let res = await fetch("http://localhost:3001/comments");
  let comments = await res.json();

  if (comments.length === 0) {
    return "1";
  }

  let maxId = 0;
  for (const comment of comments) {
    let idNum = parseInt(comment.id);
    if (!isNaN(idNum) && idNum > maxId) {
      maxId = idNum;
    }
  }

  return String(maxId + 1);
}

// ==================== STATS UPDATE ====================

async function updateStats() {
  try {
    let postsRes = await fetch("http://localhost:3001/posts");
    let posts = await postsRes.json();
    let commentsRes = await fetch("http://localhost:3001/comments");
    let comments = await commentsRes.json();

    // Count active posts
    const activePosts = posts.filter(p => p.isDeleted !== true).length;
    // Count deleted items
    const deletedPosts = posts.filter(p => p.isDeleted === true).length;
    const deletedComments = comments.filter(c => c.isDeleted === true).length;
    const totalDeleted = deletedPosts + deletedComments;
    // Total views
    const totalViews = posts.reduce((sum, p) => sum + (parseInt(p.views) || 0), 0);

    // Update stats with animation
    animateValue("stat-posts", parseInt(document.getElementById("stat-posts").textContent), activePosts, 500);
    animateValue("stat-comments", parseInt(document.getElementById("stat-comments").textContent), comments.length, 500);
    animateValue("stat-deleted", parseInt(document.getElementById("stat-deleted").textContent), totalDeleted, 500);
    animateValue("stat-views", parseInt(document.getElementById("stat-views").textContent), totalViews, 500);
  } catch (error) {
    console.log("Error updating stats:", error);
  }
}

// Animate number change
function animateValue(id, start, end, duration) {
  const element = document.getElementById(id);
  if (!element) return;

  if (start === end) return;

  const range = end - start;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
    const current = Math.floor(start + range * easeProgress);
    element.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Load data on page load
LoadData();
LoadComments();
