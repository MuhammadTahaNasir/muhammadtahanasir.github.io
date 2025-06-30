function generateProjects() {
  const projectsContainer = document.getElementById('projects-container');
  const projects = [
    { title: 'Startup Project', name: 'Synto', description: 'A fun startup project' },
    { title: 'Fun Tool', name: 'Rrate', description: 'Compare your salary' },
    { title: 'Hackathon Winner', name: 'Defai', description: 'Swap 100 USDC to AVAX' },
    { title: 'Side Project', name: 'ProjectX', description: 'A side experiment' },
    { title: 'Open Source', name: 'OpenY', description: 'Contribute to open source' }
  ];

  projectsContainer.innerHTML = '<h2>My Projects</h2>';
  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'post-card';
    card.innerHTML = `<h3>${p.title}<br>${p.name}</h3><p>${p.description}</p>`;
    projectsContainer.appendChild(card);
  });
}