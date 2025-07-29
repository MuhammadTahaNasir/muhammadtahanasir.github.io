// ---------- 1. Section Navigation ----------
let allPosts = [];
let currentStartIndex = 0;
const postsPerPage = 4;
const loader = document.getElementById('loader');
let activeTimeout = null;

// Updates the visible posts in the posts container
function updateVisiblePosts(posts, startIndex) {
  const postsContainer = document.querySelector('.posts-container');
  if (!postsContainer) return;

  postsContainer.innerHTML = '';
  
  if (posts.length === 0) {
    postsContainer.innerHTML = `
      <p style="text-align: center; color: var(--secondary);">No posts found 😕</p>
    `;
  } else {
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
      postCard.style.display = 'flex';
      postCard.style.flexDirection = 'column';
      postCard.style.width = '180px';
      postCard.style.minWidth = '180px';
      postCard.style.maxWidth = '180px';
      postCard.style.height = '180px';
      postCard.style.flexShrink = '0';
      postCard.style.background = 'var(--entry)';
      postCard.style.borderRadius = '8px';
      postCard.style.padding = '8px';
      postCard.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      postCard.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease';
      postCard.style.textAlign = 'left';
      
      // Add hover effect
      postCard.addEventListener('mouseenter', () => {
        postCard.style.transform = 'translateY(-5px)';
        postCard.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
      });
      
      postCard.addEventListener('mouseleave', () => {
        postCard.style.transform = 'translateY(0)';
        postCard.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      });
      
      let cardContent = `
        ${thumbnailPath ? `<img src="${thumbnailPath}" alt="${postTitle}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 6px; margin-bottom: 5px;">` : ''}
        <h3 style="font-size: 0.8em; font-weight: bold; margin: 0 0 3px; color: var(--primary); white-space: normal; word-wrap: break-word; height: 2.4em; overflow: hidden;">${postTitle}</h3>
        <div style="font-size: 0.65em; color: var(--secondary); margin: 2px 0;">${formattedDate} · ${readTime}</div>
      `;
      if (!thumbnailPath) {
        cardContent += `<p style="font-size: 0.7em; color: var(--content); margin: 5px 0; max-height: 2.8em; overflow: hidden; line-height: 1.4em;">${shortDescription}</p>`;
      }
      cardContent += `
        <a href="${post.url}" target="_blank" style="display: inline-block; margin-top: auto; padding: 6px 12px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 6px; font-size: 0.7em; font-weight: 600; transition: background 0.3s ease;">Read More</a>
      `;
      postCard.innerHTML = cardContent;
      postsContainer.appendChild(postCard);
    });
  }

  // Always create View More button below posts container
  const viewMoreButton = document.createElement('div');
  viewMoreButton.style.textAlign = 'center';
  viewMoreButton.style.margin = '40px 0 0 0'; // Increased top margin for more spacing
  viewMoreButton.style.padding = '0 20px'; // Add horizontal padding for better centering
  
  // Mobile responsive styling
  if (window.innerWidth <= 768) {
    viewMoreButton.style.textAlign = 'left';
    viewMoreButton.style.padding = '0 10px';
    viewMoreButton.style.margin = '20px 0 0 0';
  }
  
  const viewMore = document.createElement('a');
  viewMore.className = 'view-more';
  viewMore.href = 'posts.html';
  viewMore.style.display = 'inline-block';
  viewMore.style.padding = '10px 20px'; // Slightly more padding
  viewMore.style.background = 'transparent';
  viewMore.style.color = 'var(--primary)';
  viewMore.style.textDecoration = 'none';
  viewMore.style.borderRadius = '20px'; // Slightly more rounded
  viewMore.style.fontSize = '0.9em';
  viewMore.style.fontWeight = '500';
  viewMore.style.border = '1px solid var(--primary)';
  viewMore.style.transition = 'all 0.3s ease';
  viewMore.style.minWidth = '140px'; // Ensure consistent width
  viewMore.innerHTML = '<span>View All Posts</span>';
  
  // Add hover effect to View More button
  viewMore.addEventListener('mouseenter', () => {
    viewMore.style.transform = 'translateY(-2px)';
    viewMore.style.background = 'var(--primary)';
    viewMore.style.color = 'var(--entry)';
  });
  
  viewMore.addEventListener('mouseleave', () => {
    viewMore.style.transform = 'translateY(0)';
    viewMore.style.background = 'transparent';
    viewMore.style.color = 'var(--primary)';
  });
  
  viewMoreButton.appendChild(viewMore);
  postsContainer.appendChild(viewMoreButton);
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
  // Clear any existing View All Projects button
  const existingViewAllButton = document.querySelector('a[href="projects.html"]');
  if (existingViewAllButton && existingViewAllButton.textContent === 'View All Projects') {
    existingViewAllButton.parentElement.remove();
  }

  content.style.display = 'none';
  projects.style.display = 'none';
  tags.style.display = 'none';
  prompt.style.display = 'none';
  typing.style.display = 'none';
  title.style.display = 'none';
  subtitle.style.display = 'none';
  skillsIntro.style.display = 'none';
  askBar.classList.remove('posts');
  
  // Clear any existing containers
  const existingPostsContainer = document.querySelector('.posts-container');
  if (existingPostsContainer) {
    existingPostsContainer.remove();
  }

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
  `;

  const newSearchInput = askBar.querySelector('input');
  const newSearchButton = askBar.querySelector('button');

  function handleSearch() {
    const query = newSearchInput.value.trim();
    if (!query) return;
    if (section === 'tags') {
      window.location.href = `tags/tag.html?name=${encodeURIComponent(query)}`;
    } else if (section === 'projects') {
      // Search within projects section
      searchProjects(query);
    } else if (section === 'about') {
      // Redirect to search.html with about query
      window.location.href = `search.html?search=${encodeURIComponent(query)}&section=about`;
    } else if (section === 'skills') {
      // Redirect to search.html with skills query
      window.location.href = `search.html?search=${encodeURIComponent(query)}&section=skills`;
    } else {
      window.location.href = `search.html?search=${encodeURIComponent(query)}`;
    }
  }

  // Add event listeners for all sections
  newSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });

  newSearchButton.addEventListener('click', handleSearch);

  if (section === 'about') {
    newSearchInput.placeholder = 'Search for projects/resources/posts…';
    
    // Enter key and button click to redirect to search.html
    newSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = newSearchInput.value.trim();
        if (query) {
          window.location.href = `search.html?search=${encodeURIComponent(query)}&section=about`;
        }
      }
    });
    
    newSearchButton.addEventListener('click', () => {
      const query = newSearchInput.value.trim();
      if (query) {
        window.location.href = `search.html?search=${encodeURIComponent(query)}&section=about`;
      }
    });
  } else if (section === 'skills') {
    newSearchInput.placeholder = 'Search for projects/resources/posts…';
    
    // Enter key and button click to redirect to search.html
    newSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = newSearchInput.value.trim();
        if (query) {
          window.location.href = `search.html?search=${encodeURIComponent(query)}&section=skills`;
        }
      }
    });
    
    newSearchButton.addEventListener('click', () => {
      const query = newSearchInput.value.trim();
      if (query) {
        window.location.href = `search.html?search=${encodeURIComponent(query)}&section=skills`;
      }
    });
  } else if (section === 'tags') {
    newSearchInput.placeholder = 'Search for tags…';
    
    // Real-time search for tags
    let allTags = []; // Store all tags for filtering
    
    // Load all tags first
    fetch('posts/posts.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch posts');
        return res.json();
      })
      .then(postsData => {
        const tagMap = new Map();
        postsData.forEach(p => {
          (p.tags || []).forEach(tag => {
            tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
          });
        });
        allTags = [...tagMap.keys()];
        // Show all tags initially
        displayTags(allTags);
      })
      .catch(error => {
        console.error('Error loading tags:', error);
      });
    
    // Real-time search as user types
    newSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (query === '') {
        // Show all tags when search is empty
        displayTags(allTags);
      } else {
        // Filter tags based on search query
        const filteredTags = allTags.filter(tag => 
          tag.toLowerCase().includes(query)
        );
        displayTags(filteredTags);
      }
    });
  } else if (section === 'posts') {
    newSearchInput.placeholder = 'Search for posts…';
    
    // Real-time search for posts
    let allPosts = []; // Store all posts for filtering
    
    // Load all posts first
    fetch('posts/posts.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch posts');
        return res.json();
      })
      .then(postsData => {
        allPosts = postsData.filter(p => !p.url.endsWith("posts.html")); // Filter out posts.html
        // Show all posts initially
        updateVisiblePosts(allPosts, currentStartIndex);
      })
      .catch(error => {
        console.error('Error loading posts:', error);
      });
    
    // Real-time search as user types
    newSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (query === '') {
        // Show all posts when search is empty
        updateVisiblePosts(allPosts, currentStartIndex);
      } else {
        // Filter posts based on search query
        const filteredPosts = allPosts.filter(post => {
          const title = (post.title || '').toLowerCase();
          const summary = (post.summary || '').toLowerCase();
          const tags = (post.tags || []).join(' ').toLowerCase();
          
          return title.includes(query) || 
                 summary.includes(query) || 
                 tags.includes(query);
        });
        updateVisiblePosts(filteredPosts, 0); // Reset to first page when filtering
      }
    });
    
    // Enter key and button click to redirect to posts.html
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
  } else if (section === 'projects') {
    newSearchInput.placeholder = 'Search for projects…';
    
    // Real-time search for projects
    let allProjects = []; // Store all projects for filtering
    
    // Load all projects first
    fetch('projects/projects.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch projects');
        return res.json();
      })
      .then(projectsData => {
        allProjects = projectsData;
        // Show all projects initially
        displayProjects(allProjects);
      })
      .catch(error => {
        console.error('Error loading projects:', error);
      });
    
    // Real-time search as user types
    newSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (query === '') {
        // Show all projects when search is empty
        displayProjects(allProjects);
      } else {
        // Filter projects based on search query
        const filteredProjects = allProjects.filter(project => {
          const title = (project.title || '').toLowerCase();
          const description = (project.description || '').toLowerCase();
          const tab = (project.tab || '').toLowerCase();
          const subcategory = (project.subcategory || '').toLowerCase();
          
          return title.includes(query) || 
                 description.includes(query) || 
                 tab.includes(query) || 
                 subcategory.includes(query);
        });
        displayProjects(filteredProjects);
      }
    });
    
    // Enter key and button click to redirect to projects.html
    newSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = newSearchInput.value.trim();
        if (query) {
          window.location.href = `projects.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
    
    newSearchButton.addEventListener('click', () => {
      const query = newSearchInput.value.trim();
      if (query) {
        window.location.href = `projects.html?search=${encodeURIComponent(query)}`;
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
              <p>Hi, I'm Muhammad Taha Nasir, a junior Computer Science student at FAST-NUCES. I'm learning and building in Artificial Intelligence and Full Stack Web Development using Python and JavaScript. I mostly work with tools like Next.js, FastAPI, PostgreSQL, and MongoDB to build web applications from scratch.</p>
              <p>Recently, I've also started working with Generative AI, using models like GPT, vector databases, and frameworks like LangChain to create smart systems such as chatbots and automation tools. I'm exploring how AI can be part of everyday applications, not just research.</p>
              <p>On the frontend, I use ShadCN and DaisyUI to build clean and modern interfaces that are responsive and easy to use. I like writing code that's not just functional but also feels good to interact with. Alongside that, I'm also learning about cloud deployment, CI/CD, and automation with tools like n8n and GitHub Actions.</p>
              <p>I'm focused on building useful things, learning better ways to solve problems, and becoming a solid developer in both AI and full stack fields. I enjoy working on practical projects that mix logic and creativity.</p>
              <p>Oh, and I'm also what you might call a vibe coder — 99% of my work is powered by AI… but hey, that's fair game when you're training to be an AI engineer yourself! 😉</p>
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
            title.textContent = 'Latest Projects';
            title.style.textAlign = 'center';
            title.style.margin = '0 0 20px 0';
            title.style.color = 'var(--primary)';
            projects.style.display = 'flex';
            projects.style.flexDirection = 'row';
            projects.style.margin = '20px auto';
            projects.style.maxWidth = '500px';
            projects.style.background = 'transparent';
            projects.style.borderRadius = '10px';
            projects.style.padding = '15px';
            projects.style.boxShadow = 'none';
            projects.style.overflowX = 'auto';
            projects.style.overflowY = 'hidden';
            projects.style.whiteSpace = 'nowrap';
            projects.style.gap = '15px';

            // Clear previous cards
            projects.innerHTML = '';

            // Add "View All Projects" button
            const viewAllButton = document.createElement('div');
            viewAllButton.style.textAlign = 'center';
            viewAllButton.style.margin = '20px 0 0 0';
            
            const viewAllLink = document.createElement('a');
            viewAllLink.href = 'projects.html';
            viewAllLink.style.display = 'inline-block';
            viewAllLink.style.padding = '8px 16px';
            viewAllLink.style.background = 'transparent';
            viewAllLink.style.color = 'var(--primary)';
            viewAllLink.style.textDecoration = 'none';
            viewAllLink.style.borderRadius = '15px';
            viewAllLink.style.fontSize = '0.9em';
            viewAllLink.style.fontWeight = '500';
            viewAllLink.style.border = '1px solid var(--primary)';
            viewAllLink.style.transition = 'all 0.3s ease';
            viewAllLink.textContent = 'View All Projects';
            
            // Add hover effect
            viewAllLink.addEventListener('mouseenter', () => {
              viewAllLink.style.background = 'var(--primary)';
              viewAllLink.style.color = 'var(--entry)';
            });
            
            viewAllLink.addEventListener('mouseleave', () => {
              viewAllLink.style.background = 'transparent';
              viewAllLink.style.color = 'var(--primary)';
            });
            
            viewAllButton.appendChild(viewAllLink);
            projects.parentNode.insertBefore(viewAllButton, projects.nextSibling);

            // Fetch and render projects
            fetch('projects/projects.json')
              .then(res => {
                if (!res.ok) throw new Error('File not found');
                return res.json();
              })
              .then(projectsData => {
                if (projectsData.length === 0) {
                  projects.innerHTML = '<p style="text-align:center; color: var(--secondary);">No projects available yet. Stay tuned!</p>';
                } else {
                  displayProjects(projectsData);
                }
              })
              .catch(error => {
                projects.innerHTML = '<p style="color: var(--secondary);">Error loading projects. Please try again later.</p>';
                console.error('Error fetching projects:', error);
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

          case 'posts':
            loader.classList.add('active');
            title.style.display = 'block';
            title.textContent = 'Latest Posts';
            title.style.fontWeight = 'bold';
            title.style.fontSize = '1.5em';
            title.style.textAlign = 'center';
            title.style.margin = '0 0 20px 0';
            title.style.color = 'var(--primary)';
            
            // Create posts container like projects
            const postsContainer = document.createElement('div');
            postsContainer.className = 'posts-container';
            postsContainer.style.display = 'flex';
            postsContainer.style.flexDirection = 'row';
            postsContainer.style.margin = '20px auto';
            postsContainer.style.maxWidth = '500px';
            postsContainer.style.background = 'transparent';
            postsContainer.style.borderRadius = '10px';
            postsContainer.style.padding = '15px';
            postsContainer.style.boxShadow = 'none';
            postsContainer.style.overflowX = 'auto';
            postsContainer.style.overflowY = 'hidden';
            postsContainer.style.whiteSpace = 'nowrap';
            postsContainer.style.gap = '15px';
            
            // Insert posts container before ask-bar
            askBar.parentNode.insertBefore(postsContainer, askBar);
            
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

// ---------- 6. Search Functions for Different Sections ----------

// Display tags function
function displayTags(tags) {
  const tagsContainer = document.getElementById('tags-container');
  if (!tagsContainer) return;
  
  tagsContainer.innerHTML = '';
  
  if (tags.length === 0) {
    tagsContainer.innerHTML = '<p style="text-align: center; color: var(--secondary);">No tags found matching your search.</p>';
    return;
  }
  
  tags.slice(0, 18).forEach(tag => {
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
}

// ---------- 7. Generate Projects ----------
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

// Function to display projects in the projects container
function displayProjects(projects) {
  const projectsContainer = document.querySelector('.projects-container');
  if (!projectsContainer) return;

  if (projects.length === 0) {
    projectsContainer.innerHTML = '<p style="text-align: center; color: var(--secondary);">No projects found 😕</p>';
    return;
  }

  // Sort projects by date (most recent first) and take the top 5
  const latestProjects = projects
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5); // Limit to 5 projects

  // Clear container and show projects
  projectsContainer.innerHTML = '';

  latestProjects.forEach(project => {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    projectCard.style.display = 'flex';
    projectCard.style.flexDirection = 'column';
    projectCard.style.width = '260px';
    projectCard.style.minWidth = '260px';
    projectCard.style.maxWidth = '260px';
    projectCard.style.flexShrink = '0';

    const thumbnailPath = project.thumbnail || null;
    const projectTitle = project.title || 'Untitled Project';
    const shortDescription = project.description ? (project.description.length > 80 ? project.description.substring(0, 80) + '...' : project.description) : 'No description available.';
    const date = new Date(project.date);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    const tabName = project.tab ? project.tab.charAt(0).toUpperCase() + project.tab.slice(1) : 'Project';

    let cardContent = `
      ${thumbnailPath ? `<img src="${thumbnailPath}" alt="${projectTitle}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 16px;">` : ''}
      <h3 style="margin: 0 0 12px 0; font-size: 1.1em; font-weight: 600; color: var(--primary); line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word;">${projectTitle}</h3>
      <span style="display: inline-block; padding: 2px 10px; background: #ff7a59; border-radius: 999px; font-size: 0.7em; color: #fff; margin: 0 0 10px 0; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; box-shadow: 0 1px 4px rgba(255,122,89,0.08); opacity: 0.85;">${tabName}</span>
      <p style="font-size: 0.75em; color: var(--secondary); margin: 0 0 12px 0;">${formattedDate}</p>
      <p style="font-size: 0.8em; color: var(--secondary); line-height: 1.4; margin: 0 0 16px 0; flex-grow: 1;">${shortDescription}</p>
      <a href="${project.url}" target="_blank" style="display: block; margin-top: auto; padding: 8px 16px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 6px; font-size: 0.8em; font-weight: 600; transition: background 0.3s ease; text-align: center;">View Project</a>
    `;
    projectCard.innerHTML = cardContent;
    projectsContainer.appendChild(projectCard);
  });
}

// Function to search projects within the projects section
function searchProjects(query) {
  const projectsContainer = document.querySelector('.projects-container');
  if (!projectsContainer) return;
  
  // Show loading state
  projectsContainer.innerHTML = '<p style="text-align: center; color: var(--secondary);">Searching projects...</p>';
  
  fetch('projects/projects.json')
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    })
    .then(projectsData => {
      const filteredProjects = projectsData.filter(project => {
        const searchText = query.toLowerCase();
        const title = (project.title || '').toLowerCase();
        const description = (project.description || '').toLowerCase();
        const tab = (project.tab || '').toLowerCase();
        const subcategory = (project.subcategory || '').toLowerCase();
        
        return title.includes(searchText) || 
               description.includes(searchText) || 
               tab.includes(searchText) || 
               subcategory.includes(searchText);
      });
      
      if (filteredProjects.length === 0) {
        projectsContainer.innerHTML = `<p style="text-align: center; color: var(--secondary);">No projects found for "${query}"</p>`;
        return;
      }
      
      // Clear container and show filtered results
      projectsContainer.innerHTML = '';
      
      filteredProjects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.style.display = 'flex';
        projectCard.style.flexDirection = 'column';
        projectCard.style.width = '260px';
        projectCard.style.minWidth = '260px';
        projectCard.style.maxWidth = '260px';
        projectCard.style.height = '320px';
        projectCard.style.flexShrink = '0';
        
        const thumbnailPath = project.thumbnail || null;
        const projectTitle = project.title || 'Untitled Project';
        const shortDescription = project.description ? project.description.length > 80 ? project.description.substring(0, 80) + '...' : project.description : 'No description available.';
        const date = new Date(project.date);
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        const tabName = project.tab ? project.tab.charAt(0).toUpperCase() + project.tab.slice(1) : 'Project';
        
        let cardContent = `
          ${thumbnailPath ? `<img src="${thumbnailPath}" alt="${projectTitle}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 16px;">` : ''}
          <h3 style="margin: 0 0 12px 0; font-size: 1.1em; font-weight: 600; color: var(--primary); line-height: 1.3; height: 2.6em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${projectTitle}</h3>
          <span style="display: inline-block; padding: 2px 10px; background: #ff7a59; border-radius: 999px; font-size: 0.7em; color: #fff; margin: 0 0 10px 0; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; box-shadow: 0 1px 4px rgba(255,122,89,0.08); opacity: 0.85;">${tabName}</span>
          <p style="font-size: 0.75em; color: var(--secondary); margin: 0 0 12px 0;">${formattedDate}</p>
          <p style="font-size: 0.8em; color: var(--secondary); line-height: 1.4; margin: 0 0 16px 0; height: 2.8em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${shortDescription}</p>
          <a href="${project.url}" target="_blank" style="display: block; margin-top: auto; padding: 8px 16px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 6px; font-size: 0.8em; font-weight: 600; transition: background 0.3s ease; text-align: center;">View Project</a>
        `;
        projectCard.innerHTML = cardContent;
        projectsContainer.appendChild(projectCard);
      });
    })
    .catch(error => {
      projectsContainer.innerHTML = '<p style="text-align: center; color: var(--secondary);">Error loading projects. Please try again.</p>';
      console.error('Error searching projects:', error);
    });
}

// Function to update all theme-dependent elements
function updateThemeElements() {
  // Update all elements with CSS variables
  document.querySelectorAll('[style*="color: var(--primary)"]').forEach(el => {
    el.style.color = getComputedStyle(document.documentElement).getPropertyValue('--primary');
  });
  document.querySelectorAll('[style*="color: var(--secondary)"]').forEach(el => {
    el.style.color = getComputedStyle(document.documentElement).getPropertyValue('--secondary');
  });
  document.querySelectorAll('[style*="color: var(--content)"]').forEach(el => {
    el.style.color = getComputedStyle(document.documentElement).getPropertyValue('--content');
  });
  document.querySelectorAll('[style*="background: var(--tertiary)"]').forEach(el => {
    el.style.background = getComputedStyle(document.documentElement).getPropertyValue('--tertiary');
  });
  document.querySelectorAll('[style*="background: var(--entry)"]').forEach(el => {
    el.style.background = getComputedStyle(document.documentElement).getPropertyValue('--entry');
  });
  // Update project cards background
  document.querySelectorAll('.project-card').forEach(card => {
    card.style.background = getComputedStyle(document.documentElement).getPropertyValue('--entry');
  });
  // Update post cards background
  document.querySelectorAll('.post-card').forEach(card => {
    card.style.background = getComputedStyle(document.documentElement).getPropertyValue('--entry');
  });
  // Update view more button
  document.querySelectorAll('.view-more').forEach(btn => {
    if (btn.style.background === 'transparent') {
      btn.style.color = getComputedStyle(document.documentElement).getPropertyValue('--primary');
    }
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
    updateThemeElements();
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
    updateThemeElements();
  } catch (e) {
    console.error('Failed to load theme from localStorage:', e);
    document.documentElement.setAttribute('data-theme', 'light');
  }

  // Only show loader if it's not already active
  if (!loader.classList.contains('active')) {
    loader.classList.add('active');
    setTimeout(() => {
      loader.classList.add('no-blur');
    }, 900);
    setTimeout(() => {
      loader.classList.add('hidden');
      loader.classList.remove('active');
    }, 1200);
  }
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