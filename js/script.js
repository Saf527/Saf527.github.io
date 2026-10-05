const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const menuToggle = $("#menuToggle");
const nav = $("#nav");
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", open);
});
$$(".nav a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

const themeToggle = $("#themeToggle");
const savedTheme = localStorage.getItem("safwan-theme");
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
themeToggle.textContent = document.documentElement.dataset.theme === "light" ? "☼" : "◐";
themeToggle.addEventListener("click", () => {
  const light = document.documentElement.dataset.theme === "light";
  document.documentElement.dataset.theme = light ? "dark" : "light";
  localStorage.setItem("safwan-theme", light ? "dark" : "light");
  themeToggle.textContent = light ? "◐" : "☼";
});

const cursor = $(".cursor-glow");
window.addEventListener("pointermove", e => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$(".reveal").forEach(el => observer.observe(el));

const backTop = $("#backTop");
window.addEventListener("scroll", () => backTop.classList.toggle("show", window.scrollY > 700));
backTop.addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));
$("#year").textContent = new Date().getFullYear();

const contactForm = $("#contactForm");
const formStatus = $("#formStatus");
const submitBtn = $("#submitBtn");

if (new URLSearchParams(window.location.search).get("sent") === "1") {
  formStatus.textContent = "Message sent successfully. Thank you for reaching out!";
  formStatus.className = "success-message";
  window.history.replaceState({}, document.title, window.location.pathname + "#contact");
}

contactForm.addEventListener("submit", async e => {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";
  formStatus.textContent = "";
  formStatus.className = "";

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: new FormData(contactForm),
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) throw new Error("Submission failed");

    contactForm.reset();
    formStatus.textContent = "Message sent successfully. Thank you for reaching out!";
    formStatus.className = "success-message";
  } catch (error) {
    formStatus.textContent = "Something went wrong. Please try again.";
    formStatus.className = "error-message";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message ↗";
  }
});

async function loadGitHubRepos() {
  const box = $("#githubProjects");
  const status = $("#githubStatus");
  try {
    const response = await fetch("https://api.github.com/users/Saf527/repos?sort=updated&per_page=6");
    if (!response.ok) throw new Error("GitHub API unavailable");
    const repos = await response.json();
    if (!repos.length) throw new Error("No public repositories");

    status.textContent = `${repos.length} recent public repositories loaded from GitHub.`;

    box.innerHTML = repos.map(repo => `
      <a class="github-repo reveal visible" href="${repo.html_url}" target="_blank" rel="noopener">
        <div class="repo-top">
          <h4>${escapeHTML(repo.name)}</h4>
          <span class="repo-lang">${escapeHTML(repo.language || "CODE")}</span>
        </div>
        <p>${escapeHTML(repo.description || "Public GitHub repository")}</p>
        <small>${repo.stargazers_count} ★ · ${repo.forks_count} forks · Open repository ↗</small>
      </a>
    `).join("");
  } catch {
    status.textContent = "GitHub projects are available directly from @Saf527.";
    box.innerHTML = `<a class="github-repo reveal visible" href="https://github.com/Saf527" target="_blank" rel="noopener">
      <div class="repo-top"><h4>View GitHub projects</h4><span class="repo-lang">GITHUB</span></div>
      <p>Explore my public repositories and technical work.</p>
      <small>GITHUB.COM/SAF527 ↗</small>
    </a>`;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
const projectDetails = {
  summarization: {
    kicker: "NLP · MACHINE LEARNING",
    title: "Text Summarization",
    description: "Research and implementation work focused on text summarization using NLP and Python, exploring transformer-based approaches and evaluation workflows.",
    tags: ["Python", "NLP", "Machine Learning", "Transformers"],
    meta: ["Context: BISAG-N project internship", "Focus: Summarization research"]
  },
  stress: {
    kicker: "ML · NLP",
    title: "Stress Detection",
    description: "A machine-learning project using sentiment analysis and natural language processing on social-media comments to detect psychological stress levels.",
    tags: ["Python", "Sentiment Analysis", "NLP"],
    meta: ["Duration: 6 weeks", "Focus: Social-media text analysis"]
  },
  blood: {
    kicker: "PYTHON · DJANGO",
    title: "Blood Report Automation",
    description: "A Django-based project that automated the delivery of blood reports and paired clinical results with data-driven health insights.",
    tags: ["Python", "Django", "Automation"],
    meta: ["Context: Brainy Beam internship", "Focus: Workflow automation"]
  }
};

const modal = $("#projectModal");
const modalClose = $("#modalClose");

function openProjectModal(key) {
  const project = projectDetails[key];
  if (!project) return;
  $("#modalKicker").textContent = project.kicker;
  $("#modalTitle").textContent = project.title;
  $("#modalDescription").textContent = project.description;
  $("#modalTags").innerHTML = project.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join("");
  $("#modalMeta").innerHTML = project.meta.map(item => `<div>${escapeHTML(item)}</div>`).join("");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeProjectModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
$$(".project-detail-btn").forEach(btn => btn.addEventListener("click", () => openProjectModal(btn.dataset.project)));
modalClose.addEventListener("click", closeProjectModal);
$$("[data-close-modal]").forEach(el => el.addEventListener("click", closeProjectModal));
document.addEventListener("keydown", e => { if (e.key === "Escape") closeProjectModal(); });

loadGitHubRepos();
