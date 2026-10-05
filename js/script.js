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
  try {
    const response = await fetch("https://api.github.com/users/Saf527/repos?sort=updated&per_page=6");
    if (!response.ok) throw new Error("GitHub API unavailable");
    const repos = await response.json();
    if (!repos.length) throw new Error("No public repositories");
    box.innerHTML = repos.map(repo => `
      <a class="github-repo reveal visible" href="${repo.html_url}" target="_blank" rel="noopener">
        <h4>${escapeHTML(repo.name)}</h4>
        <p>${escapeHTML(repo.description || "Public GitHub repository")}</p>
        <small>${escapeHTML(repo.language || "CODE")} · ${repo.stargazers_count} ★</small>
      </a>
    `).join("");
  } catch {
    box.innerHTML = `<a class="github-repo reveal visible" href="https://github.com/Saf527" target="_blank" rel="noopener"><h4>View GitHub projects</h4><p>Explore my public repositories and technical work.</p><small>GITHUB.COM/SAF527 ↗</small></a>`;
  }
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
loadGitHubRepos();
