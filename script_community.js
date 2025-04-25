document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('post-form');
    const postBtn = document.getElementById('post-btn');
    const submitPostBtn = document.getElementById('submit-post');
    const feed = document.getElementById('feed');
    const postContent = document.getElementById('post-content');
    const postMedia = document.getElementById('post-media');
  
    // Toggle post form visibility
    postBtn.addEventListener('click', () => {
      postForm.style.display = postForm.style.display === 'block' ? 'none' : 'block';
    });
  
    // Handle post submission
    submitPostBtn.addEventListener('click', () => {
      const content = postContent.value.trim();
      const files = postMedia.files;
  
      if (content || files.length > 0) {
        const post = createPost(content, files);
        feed.insertBefore(post, feed.firstChild);
        postContent.value = '';
        postMedia.value = '';
        postForm.style.display = 'none';
      } else {
        alert('Please add content or media to your post.');
      }
    });
  
    // Create a new post element
    function createPost(content, files) {
      const post = document.createElement('div');
      post.className = 'post';
  
      if (content) {
        const postText = document.createElement('p');
        postText.textContent = content;
        post.appendChild(postText);
      }
  
      if (files.length > 0) {
        Array.from(files).forEach(file => {
          const media = document.createElement(file.type.startsWith('image') ? 'img' : 'video');
          media.src = URL.createObjectURL(file);
          media.controls = true;
          post.appendChild(media);
        });
      }
  
      const postActions = document.createElement('div');
      postActions.className = 'post-actions';
  
      const likeBtn = document.createElement('button');
      likeBtn.textContent = 'Like';
      likeBtn.addEventListener('click', () => {
        alert('Liked!');
      });
  
      const commentBtn = document.createElement('button');
      commentBtn.textContent = 'Comment';
      commentBtn.addEventListener('click', () => {
        const comment = prompt('Add a comment:');
        if (comment) {
          const commentElement = document.createElement('p');
          commentElement.textContent = comment;
          post.appendChild(commentElement);
        }
      });
  
      postActions.appendChild(likeBtn);
      postActions.appendChild(commentBtn);
      post.appendChild(postActions);
  
      return post;
    }
  });