// ---------- 1. Section Navigation ----------
let allPosts = [];
let currentStartIndex = 0;
const postsPerPage = 4;
const loader = document.getElementById('loader');
let activeTimeout = null;

// Updates the visible posts in the posts container
function updateVisiblePosts(posts, startIndex) {
  const postsContainer = document.querySelector('.ask-bar .posts-container');
  if (!postsContainer) return;
  postsContainer.innerHTML = '';
  const visiblePosts = posts.slice(startIndex, startIndex + postsPerPage);

  visiblePosts.forEach(post => {
    const thumbnailPath = post.thumbnail || null;
    const postTitle = post.title || 'Untitled Post';
    if (!post.thumbnail) {
      console.warn(`Thumbnail missing for post: ${postTitle}, image section hidden`);
    }
    const date = new Date(post.date);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    const readTime = post.time || '1 min';
    const shortDescription = post.summary ? post.summary.split('. ')[0] + '.' : 'No description available.';

    const postCard = document.createElement('div');
    postCard.className = 'post-card';
    let cardContent = `
      ${thumbnailPath ? `<img src="${thumbnailPath}" alt="${postTitle}" class="post-image">` : ''}
      <h3 class="post-title">${postTitle}</h3>
      <div class="post-meta">${formattedDate} · ${readTime}</div>
    `;
    if (!thumbnailPath) {
      cardContent += `<p class="post-summary">${shortDescription}</p>`;
    }
    cardContent += `
      <a class="read-more" href="${post.url}" target="_blank">Read More</a>
    `;
    postCard.innerHTML = cardContent;
    postsContainer.appendChild(postCard);
  });

  // Create a wrapper for the View More button to center it
  const viewMoreWrapper = document.createElement('div');
  viewMoreWrapper.className = 'view-more-wrapper';
  const viewMore = document.createElement('a');
  viewMore.className = 'view-more';
  viewMore.href = 'posts.html';
  viewMore.innerHTML = '<span>View More</span>';
  viewMoreWrapper.appendChild(viewMore);
  postsContainer.appendChild(viewMoreWrapper);
}

// Handles section changes and UI updates
function showSection(section) {
  if (activeTimeout) {
    clearTimeout(activeTimeout);
    activeTimeout = null;
  }

  const img = document.getElementById('profile-img');
  const title = document.getElementById('title');
  const subtitle = document.getElementById('subtitle');
  const prompt = document.getElementById('prompt');
  const typing = document.getElementById('typing');
  const content = document.getElementById('content');
  const projects = document.getElementById('projects-container');
  const tags = document.getElementById('tags-container');
  const skillsIntro = document.getElementById('skills-intro');
  const askBar = document.getElementById('ask-bar');

  if (!askBar) {
    console.error('Ask-bar element not found');
    return;
  }

  askBar.style.display = 'flex';
  const existingAboutHeading = document.querySelector('h2');
  if (existingAboutHeading) existingAboutHeading.remove();
  const existingSkillsContainer = document.querySelector('.skills-container');
  if (existingSkillsContainer) existingSkillsContainer.remove();
  const existingViewMore = document.querySelector('.view-more');
  if (existingViewMore) existingViewMore.remove();

  content.style.display = 'none';
  projects.style.display = 'none';
  tags.style.display = 'none';
  prompt.style.display = 'none';
  typing.style.display = 'none';
  title.style.display = 'none';
  subtitle.style.display = 'none';
  skillsIntro.style.display = 'none';
  askBar.classList.remove('posts');

  let placeholderText = 'Look for resources/posts…';
  if (section === 'tags') {
    placeholderText = 'Search for tags…';
  } else if (section === 'projects') {
    placeholderText = 'Search for projects…';
  } else if (section === 'posts') {
    placeholderText = 'Search for posts…';
  }

  askBar.innerHTML = `
    <input type="text" placeholder="${placeholderText}" autocomplete="off">
    <button aria-label="Send"><i class="fas fa-chevron-right"></i></button>
    <div class="posts-container"></div>
  `;

  const newSearchInput = askBar.querySelector('input');
  const newSearchButton = askBar.querySelector('button');

  function handleSearch() {
    const query = newSearchInput.value.trim();
    if (!query) return;
    if (section === 'tags') {
      window.location.href = `tags/tag.html?name=${encodeURIComponent(query)}`;
    } else {
      window.location.href = `search.html?search=${encodeURIComponent(query)}`;
    }
  }

  newSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  newSearchButton.addEventListener('click', handleSearch);

  if (section === 'posts') {
    newSearchInput.placeholder = 'Search for posts…';
    newSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = newSearchInput.value.trim();
        if (query) {
          window.location.href = `posts.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
    newSearchButton.addEventListener('click', () => {
      const query = newSearchInput.value.trim();
      if (query) {
        window.location.href = `posts.html?search=${encodeURIComponent(query)}`;
      }
    });
  }

  if (window.innerWidth <= 768) {
    img.style.transform = 'translateY(-20px)';
  } else {
    img.style.transform = 'translateY(-50px)';
  }

  let promptText = '';
  switch (section) {
    case 'about':
      promptText = 'Who are you? I want to know more about you.';
      break;
    case 'projects':
      promptText = 'What are your projects? What are you working on right now?';
      break;
    case 'posts':
      promptText = 'Loading latest posts...';
      break;
    case 'tags':
      promptText = 'Explore my tags!';
      break;
    case 'skills':
      promptText = 'What are your skills? Give me a list of your soft and hard skills.';
      break;
    default:
      console.warn('Unknown section:', section);
      return;
  }

  prompt.textContent = promptText;
  prompt.style.display = 'block';
  prompt.style.opacity = 1;

  activeTimeout = setTimeout(() => {
    prompt.style.opacity = 0;
    activeTimeout = setTimeout(() => {
      prompt.style.display = 'none';
      typing.style.display = 'block';
      typing.textContent = 'Wait…';

      activeTimeout = setTimeout(() => {
        typing.style.display = 'none';

        switch (section) {
          case 'about':
            const aboutHeading = document.createElement('h2');
            aboutHeading.textContent = 'About Me';
            aboutHeading.style.fontWeight = 'bold';
            aboutHeading.style.fontSize = '1.5em';
            aboutHeading.style.margin = '0 0 20px 0';
            aboutHeading.style.color = 'var(--primary)';
            aboutHeading.style.textAlign = 'center';

            const aboutContainer = document.createElement('div');
            aboutContainer.className = 'skills-container';
            aboutContainer.style.maxHeight = '300px';
            aboutContainer.style.overflowY = 'auto';
            aboutContainer.style.margin = '20px auto';
            aboutContainer.style.maxWidth = '500px';
            aboutContainer.style.background = 'transparent';
            const aboutContent = document.createElement('div');
            aboutContent.style.textAlign = 'left';
            aboutContent.innerHTML = `
              <h1 style="font-size: 1.5em; font-weight: bold; margin: 0 0 10px 0; font-family: 'Roboto', sans-serif; color: var(--primary);">Muhammad Taha Nasir</h1>
              <h2 style="font-size: 1.2em; margin: 0 0 20px 0; font-family: 'Roboto', sans-serif; color: var(--secondary); text-align: left;">(aka Terry)</h2>
              <p>Hi, I’m Muhammad Taha Nasir, a junior Computer Science student at FAST-NUCES. I’m learning and building in Artificial Intelligence and Full Stack Web Development using Python and JavaScript. I mostly work with tools like Next.js, FastAPI, PostgreSQL, and MongoDB to build web applications from scratch.</p>
              <p>Recently, I’ve also started working with Generative AI, using models like GPT, vector databases, and frameworks like LangChain to create smart systems such as chatbots and automation tools. I’m exploring how AI can be part of everyday applications, not just research.</p>
              <p>On the frontend, I use ShadCN and DaisyUI to build clean and modern interfaces that are responsive and easy to use. I like writing code that’s not just functional but also feels good to interact with. Alongside that, I’m also learning about cloud deployment, CI/CD, and automation with tools like n8n and GitHub Actions.</p>
              <p>I’m focused on building useful things, learning better ways to solve problems, and becoming a solid developer in both AI and full stack fields. I enjoy working on practical projects that mix logic and creativity.</p>
              <p>Oh, and I’m also what you might call a vibe coder — 99% of my work is powered by AI… but hey, that’s fair game when you’re training to be an AI engineer yourself! 😉</p>
            `;
            aboutContainer.appendChild(aboutContent);
            askBar.parentNode.insertBefore(aboutHeading, askBar);
            askBar.parentNode.insertBefore(aboutContainer, askBar);
            break;

          case 'projects':
            loader.classList.add('active');
            title.style.display = 'block';
            title.style.fontWeight = 'bold';
            title.style.fontSize = '1.5em';
            title.textContent = 'My Projects';
            projects.style.display = 'block';
            projects.style.margin = '20px auto';
            projects.style.maxWidth = '500px';
            projects.style.textAlign = 'center';
            generateProjects();
            setTimeout(() => {
              loader.classList.add('no-blur');
            }, 900);
            setTimeout(() => {
              loader.classList.add('hidden');
              loader.classList.remove('active');
            }, 1200);
            break;

          case 'posts':
            loader.classList.add('active');
            title.style.display = 'block';
            title.textContent = 'Latest Posts';
            title.style.fontWeight = 'bold';
            title.style.fontSize = '1.5em';
            const postsContainer = askBar.querySelector('.posts-container');
            postsContainer.style.display = 'flex';
            fetch('posts/posts.json')
              .then(response => {
                if (!response.ok) throw new Error('File not found');
                return response.json();
              })
              .then(data => {
                allPosts = data.sort((a, b) => new Date(b.date) - new Date(a.date));
                updateVisiblePosts(allPosts, currentStartIndex);
              })
              .catch(error => {
                postsContainer.innerHTML = '<p>Error loading posts. Please try again later.</p>';
                console.error('Error fetching posts:', error);
              })
              .finally(() => {
                setTimeout(() => {
                  loader.classList.add('no-blur');
                }, 900);
                setTimeout(() => {
                  loader.classList.add('hidden');
                  loader.classList.remove('active');
                }, 1200);
              });
            break;

          case 'tags':
            loader.classList.add('active');
            title.style.display = 'block';
            title.textContent = 'Tags';
            title.style.fontWeight = 'bold';
            title.style.fontSize = '1.5em';
            tags.style.display = 'block';
            generateTags();
            break;

          case 'skills':
            loader.classList.add('active');
            title.style.display = 'block';
            title.textContent = 'Skills & Expertise';
            title.style.fontWeight = 'bold';
            title.style.fontSize = '1.5em';

            const skillsContainer = document.createElement('div');
            skillsContainer.className = 'skills-container';
            skillsContainer.style.maxHeight = '300px';
            skillsContainer.style.overflowY = 'auto';
            skillsContainer.style.margin = '20px auto';
            skillsContainer.style.maxWidth = '500px';
            skillsContainer.style.background = 'transparent';

            const skillsIntroClone = skillsIntro.cloneNode(true);
            skillsIntroClone.style.display = 'block';
            skillsIntroClone.style.margin = '0 0 20px 0';
            skillsContainer.appendChild(skillsIntroClone);

            const skills = {
              'Programming Languages': ['Python', 'C/C++', 'JavaScript (ES6+)', 'SQL', 'Bash'],
              'AI/ML & Data Science': [
                '<strong>Machine Learning</strong>: scikit-learn, TensorFlow, PyTorch',
                '<strong>Data Analysis</strong>: Pandas, NumPy, Matplotlib',
                '<strong>NLP & Generative AI</strong>: Hugging Face, LangChain, NLTK'
              ],
              'Web Development': ['<strong>Frontend</strong>: Next.js, React, ShadCN, DaisyUI', '<strong>Backend</strong>: Django, Flask, FastAPI'],
              'Databases': ['<strong>PostgreSQL</strong> (SQL)', '<strong>MongoDB</strong> (NoSQL)'],
              'DevOps & Deployment': ['Git, GitHub Actions', 'Docker, CI/CD', 'Vercel', '<strong>AWS</strong> (EC2, S3, SageMaker)', '<strong>Google Cloud</strong> (Compute Engine, AI Platform)'],
              'Tools': ['Jupyter, Google Colab, Anaconda', 'MLflow, n8n'],
              'Soft Skills': ['Problem Solving', 'Technical Writing', 'Communication', 'Team Collaboration']
            };

            for (const [category, skillList] of Object.entries(skills)) {
              const categoryDiv = document.createElement('div');
              categoryDiv.className = 'skill-category';
              const categoryTitle = document.createElement('h3');
              categoryTitle.textContent = category;
              categoryTitle.style.margin = '10px 0 5px 0';
              categoryTitle.style.fontSize = '1.2em';
              categoryTitle.style.color = 'var(--primary)';
              categoryDiv.appendChild(categoryTitle);

              const pillsContainer = document.createElement('div');
              pillsContainer.style.display = 'flex';
              pillsContainer.style.flexWrap = 'wrap';
              pillsContainer.style.gap = '10px';
              pillsContainer.style.marginLeft = '0';
              pillsContainer.style.justifyContent = 'flex-start';

              skillList.forEach(skill => {
                const pill = document.createElement('span');
                pill.className = 'skill-pill';
                pill.innerHTML = skill;
                pillsContainer.appendChild(pill);
              });

              categoryDiv.appendChild(pillsContainer);
              skillsContainer.appendChild(categoryDiv);
            }

            askBar.parentNode.insertBefore(skillsContainer, askBar);
            setTimeout(() => {
              loader.classList.add('no-blur');
            }, 900);
            setTimeout(() => {
              loader.classList.add('hidden');
              loader.classList.remove('active');
            }, 1200);
            break;
        }
      }, 2000);
    }, 500);
  }, 2000);
}

// Hides typing text when switching sections
function changeSection(section) {
  const typingText = document.querySelector('.typing-text');
  if (typingText) typingText.style.display = 'none';
  showSection(section);
}

// ---------- 2. Generate Projects ----------
function generateProjects() {
  const projectsContainer = document.getElementById('projects-container');
  projectsContainer.innerHTML = '';

  const messageContainer = document.createElement('div');
  messageContainer.className = 'skills-container';
  messageContainer.style.maxHeight = '300px';
  messageContainer.style.overflowY = 'auto';
  messageContainer.style.margin = '20px auto';
  messageContainer.style.maxWidth = '500px';
  messageContainer.style.background = 'transparent';
  messageContainer.style.textAlign = 'center';

  const message = document.createElement('h3');
  message.textContent = "Wait! I'll be posting my projects soon here, stay tuned!";
  message.style.fontSize = '1.2em';
  message.style.color = 'var(--primary)';
  message.style.margin = '0 0 20px 0';

  messageContainer.appendChild(message);
  projectsContainer.appendChild(messageContainer);
}

// ---------- 3. Generate Tags ----------
function generateTags() {
  const tagsContainer = document.getElementById('tags-container');

  loader.classList.add('active');
  fetch('posts/posts.json')
    .then(res => {
      if (!res.ok) throw new Error('File not found');
      return res.json();
    })
    .then(posts => {
      const tagMap = new Map();
      posts.forEach(p => {
        (p.tags || []).forEach(tag => {
          tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        });
      });

      tagsContainer.innerHTML = '';
      [...tagMap.keys()].slice(0, 18).forEach(tag => {
        const el = document.createElement('a');
        el.className = 'tag';
        el.href = `tags/tag.html?name=${encodeURIComponent(tag)}`;
        el.textContent = tag;
        tagsContainer.appendChild(el);
      });

      const viewMore = document.createElement('a');
      viewMore.className = 'tag view-more';
      viewMore.href = 'tags.html';
      viewMore.textContent = 'View All Tags →';
      tagsContainer.appendChild(viewMore);
    })
    .catch(error => {
      tagsContainer.innerHTML = '<p>Error loading tags. Please try again later.</p>';
      console.error('Error fetching tags:', error);
    })
    .finally(() => {
      setTimeout(() => {
        loader.classList.add('no-blur');
      }, 900);
      setTimeout(() => {
        loader.classList.add('hidden');
        loader.classList.remove('active');
      }, 1200);
    });
}

// ---------- 4. Theme Toggle ----------
const toggleBtn = document.getElementById('theme-toggle');
let isToggling = false;
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    if (isToggling || loader.classList.contains('active')) return;
    isToggling = true;
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    try {
      localStorage.setItem('pref-theme', newTheme);
    } catch (e) {
      console.error('Failed to save theme to localStorage:', e);
    }
    document.querySelectorAll('[style*="color: var(--primary)"]').forEach(el => {
      el.style.color = getComputedStyle(document.documentElement).getPropertyValue('--primary');
    });
    document.querySelectorAll('[style*="color: var(--secondary)"]').forEach(el => {
      el.style.color = getComputedStyle(document.documentElement).getPropertyValue('--secondary');
    });
    document.querySelectorAll('[style*="background: var(--tertiary)"]').forEach(el => {
      el.style.background = getComputedStyle(document.documentElement).getPropertyValue('--tertiary');
    });
    setTimeout(() => { isToggling = false; }, 300);
  });
}

// ---------- 5. Auto-Load Theme and Event Listeners ----------
window.addEventListener('DOMContentLoaded', () => {
  try {
    let savedTheme = localStorage.getItem('pref-theme');
    if (!savedTheme) {
      savedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', savedTheme || 'light');
    document.querySelectorAll('[style*="color: var(--primary)"]').forEach(el => {
      el.style.color = getComputedStyle(document.documentElement).getPropertyValue('--primary');
    });
    document.querySelectorAll('[style*="color: var(--secondary)"]').forEach(el => {
      el.style.color = getComputedStyle(document.documentElement).getPropertyValue('--secondary');
    });
    document.querySelectorAll('[style*="background: var(--tertiary)"]').forEach(el => {
      el.style.background = getComputedStyle(document.documentElement).getPropertyValue('--tertiary');
    });
  } catch (e) {
    console.error('Failed to load theme from localStorage:', e);
    document.documentElement.setAttribute('data-theme', 'light');
  }

  loader.classList.add('active');
  setTimeout(() => {
    loader.classList.add('no-blur');
  }, 900);
  setTimeout(() => {
    loader.classList.add('hidden');
    loader.classList.remove('active');
  }, 1200);
});

// Handles browser back/forward navigation
window.addEventListener('popstate', () => {
  const askBar = document.getElementById('ask-bar');
  if (askBar && window.location.pathname.includes('index.html')) {
    askBar.style.display = 'none';
    askBar.innerHTML = `
      <input type="text" placeholder="Look for resources/posts…" autocomplete="off">
      <button aria-label="Send"><i class="fas fa-chevron-right"></i></button>
      <div class="posts-container"></div>
    `;
  }
});

// Attaches event listeners to action buttons
document.querySelectorAll('.action-buttons .button').forEach(button => {
  button.addEventListener('click', () => {
    const section = button.getAttribute('onclick').match(/'([^']+)'/)[1];
    showSection(section);
  });
});
