// Card-only home screen

const PROJECTS = [
  { code: "CEDA", icon: "bi-building" },
  { code: "RH",   icon: "bi-people" },
  { code: "NRW",  icon: "bi-globe2" },
  { code: "CP",   icon: "bi-shield-check" },
  { code: "US",   icon: "bi-person-badge" },
  { code: "WSP",  label: "ENERGY",  icon: "bi-diagram-3" },
  { code: "E&S",  label: "E&S/WSP",  icon: "bi-lightning-charge" }
];

let selectedCode = null;

// Map project codes to pages
const ROUTES = {
  "RH": "RH/index.html",
  "NRW": "NRW/index.html",
  "E&S": "E&S/index.html",
  "US": "US/index.html"
};

function el(id){ return document.getElementById(id); }

function escapeHTML(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}

function renderCards(){
  const grid = el("cardsGrid");
  grid.innerHTML = "";

  PROJECTS.forEach((p, idx) => {
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-lg-4 col-xl-3";

    const active = selectedCode === p.code ? "active" : "";
    const codeEsc = escapeHTML(p.code);
    const labelEsc = escapeHTML(p.label || p.code);

    col.innerHTML = `
      <div
        class="project-card ${active}"
        role="button"
        tabindex="0"
        data-code="${codeEsc}"
        data-anim="in"
        style="animation-delay:${Math.min(idx * 40, 240)}ms"
        aria-label="Select ${labelEsc}"
      >
        <div class="selected-badge" aria-hidden="true"><i class="bi bi-check2"></i></div>
        <div class="card-inner">
          <div class="icon-wrap flex-shrink-0"><i class="bi ${p.icon}"></i></div>
          <div class="flex-grow-1">
            <div class="code">${labelEsc}</div>
          </div>
        </div>
      </div>
    `;

    const card = col.querySelector(".project-card");

    const toggle = () => {
      // If this project has a page, open it directly
      if (ROUTES[p.code]) {
        window.location.href = ROUTES[p.code];
        return;
      }
      selectedCode = (selectedCode === p.code) ? null : p.code;
      renderCards();
    };

    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });

    grid.appendChild(col);
  });
}

function runLoader(){
  const loader = el("loader");
  const bar = el("loaderBar");
  const app = el("app");

  const steps = [15, 28, 44, 62, 78, 92, 100];
  let i = 0;
  const interval = setInterval(() => {
    i = Math.min(i + 1, steps.length - 1);
    bar.style.width = steps[i] + "%";
  }, 250);

  setTimeout(() => {
    clearInterval(interval);
    loader.classList.add("fade-out");
    loader.setAttribute("aria-busy","false");

    setTimeout(() => {
      loader.remove();
      app.classList.remove("d-none");
      renderCards();
    }, 260);
  }, 2000);
}

document.addEventListener("DOMContentLoaded", () => {
  runLoader();
});
