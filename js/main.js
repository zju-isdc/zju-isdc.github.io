const navToggle = document.querySelector(".nav-toggle");
const body = document.body;

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll(".site-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("nav-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
});

const page = body.dataset.page;
if (page) {
  const activeLink = document.querySelector(`[data-nav="${page}"]`);
  if (activeLink) {
    activeLink.classList.add("is-active");
  }
}

const currentYear = document.getElementById("current-year");
if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

const jsonCache = new Map();

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderLinkAttrs(url) {
  const href = `href="${escapeHtml(url)}"`;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return `${href} target="_blank" rel="noreferrer"`;
  }
  return href;
}

function summarizeAuthors(authors) {
  const names = authors
    .replace(", et al.", "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  if (names.length > 3) {
    return `${names.slice(0, 3).join(", ")}, et al.`;
  }
  return authors;
}

function setContainerHtml(container, html) {
  if (container) {
    container.innerHTML = html;
  }
}

function renderEmpty(message) {
  return `<div class="results-empty"><p>${escapeHtml(message)}</p></div>`;
}

function initializePaperYearTabs(root = document) {
  const paperYearTabs = root.querySelectorAll("[data-paper-year-target]");
  const paperYearGroups = root.querySelectorAll("[data-paper-year]");

  if (paperYearTabs.length === 0 || paperYearGroups.length === 0) {
    return;
  }

  paperYearTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetYear = tab.getAttribute("data-paper-year-target");

      paperYearTabs.forEach((item) => {
        const isActive = item === tab;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      paperYearGroups.forEach((group) => {
        group.hidden = group.getAttribute("data-paper-year") !== targetYear;
        group.classList.toggle("is-active", !group.hidden);
      });
    });
  });
}

function renderFeaturedPapers(years) {
  const featured = years
    .slice()
    .sort((a, b) => b.year - a.year)
    .flatMap((group) =>
      group.papers
        .slice()
        .sort((a, b) => (b.sort_date || `${b.year}-01-01`).localeCompare(a.sort_date || `${a.year}-01-01`))
        .filter((paper) => paper.featured),
    );

  if (featured.length === 0) {
    return "";
  }

  const cards = featured
    .map((paper) => {
      const note = paper.highlight
        ? `<p class="featured-paper-note">${escapeHtml(paper.highlight)}</p>`
        : "";
      return `<article class="featured-paper-card">
        <h3>${escapeHtml(paper.title)}</h3>
        ${note}
      </article>`;
    })
    .join("");

  return `<section class="section page-section">
    <div class="container">
      <div class="section-heading">
        <h2>代表性论文</h2>
      </div>
      <div class="featured-paper-grid">${cards}</div>
    </div>
  </section>`;
}

function renderPaperYears(years) {
  if (!years || years.length === 0) {
    return renderEmpty("暂无公开论文条目。");
  }

  const sortedYears = years.slice().sort((a, b) => b.year - a.year);
  const switches = sortedYears
    .map(
      (group, index) =>
        `<button class="paper-year-tab${index === 0 ? " is-active" : ""}" type="button" data-paper-year-target="${escapeHtml(group.year)}" aria-pressed="${index === 0}">${escapeHtml(group.year)}</button>`,
    )
    .join("");

  const groups = sortedYears
    .map((group, index) => {
      const rows = group.papers
        .slice()
        .sort((a, b) => (b.sort_date || `${b.year}-01-01`).localeCompare(a.sort_date || `${a.year}-01-01`))
        .map(
          (paper) => `<div class="paper-row">
            <div class="paper-title">${escapeHtml(paper.title)}</div>
            <div class="paper-authors">${escapeHtml(summarizeAuthors(paper.authors))}</div>
            <div class="paper-venue">${escapeHtml(paper.venue)}</div>
          </div>`,
        )
        .join("");

      return `<section class="paper-year-group${index === 0 ? " is-active" : ""}" data-paper-year="${escapeHtml(group.year)}"${index === 0 ? "" : " hidden"}>
        <div class="paper-year-heading">${escapeHtml(group.year)}</div>
        <div class="paper-table">
          <div class="paper-row paper-row-head">
            <div>名称</div>
            <div>作者</div>
            <div>会议 / 期刊</div>
          </div>
          ${rows}
        </div>
      </section>`;
    })
    .join("");

  return `<section class="section page-section">
    <div class="container">
      <div class="section-heading">
        <h2>论文列表</h2>
      </div>
      <div class="paper-year-tabs" aria-label="论文年份筛选">${switches}</div>
      ${groups}
    </div>
  </section>`;
}

function renderAchievements(years) {
  if (!years || years.length === 0) {
    return renderEmpty("暂无公开成果条目。");
  }

  return years
    .slice()
    .sort((a, b) => b.year - a.year)
    .map((group) => {
      const rows = group.entries
        .slice()
        .sort((a, b) => (b.sort_date || `${b.year}-01-01`).localeCompare(a.sort_date || `${a.year}-01-01`))
        .map((entry) => {
          const name = entry.url
            ? `<a class="results-row-link" ${renderLinkAttrs(entry.url)}>${escapeHtml(entry.name)}</a>`
            : escapeHtml(entry.name);
          return `<div class="paper-row">
            <div class="paper-title">${name}</div>
            <div class="paper-authors">${escapeHtml(entry.type)}</div>
            <div class="paper-venue">${escapeHtml(entry.description)}</div>
          </div>`;
        })
        .join("");

      return `<section class="paper-year-group">
        <div class="paper-year-heading">${escapeHtml(group.year)}</div>
        <div class="paper-table">
          <div class="paper-row paper-row-head">
            <div>名称</div>
            <div>类型</div>
            <div>说明</div>
          </div>
          ${rows}
        </div>
      </section>`;
    })
    .join("");
}

function renderNews(items) {
  if (!items || items.length === 0) {
    return renderEmpty("暂无公开动态。");
  }

  const cards = items
    .slice()
    .sort((a, b) => b.sort_date.localeCompare(a.sort_date))
    .map((item) => {
      const featuredClass = item.featured ? " featured-news-card" : "";
      return `<article class="news-card${featuredClass}">
        <a class="news-card-link" ${renderLinkAttrs(item.url)}>
          <div class="news-date">${escapeHtml(item.display_date)}</div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.summary)}</p>
        </a>
      </article>`;
    })
    .join("");

  return `<div class="news-grid">${cards}</div>`;
}

function renderTeam(groups) {
  if (!groups || groups.length === 0) {
    return renderEmpty("暂无公开团队信息。");
  }

  return groups
    .map((group) => {
      const members = group.members
        .map((member) => `<div class="team-member">
          <a ${renderLinkAttrs(member.homepage)} class="team-member-avatar">
            <img src="${escapeHtml(member.avatar)}" alt="${escapeHtml(member.name)}">
          </a>
          <span class="team-member-name">${escapeHtml(member.name)}</span>
        </div>`)
        .join("");

      return `<div class="team-group">
        <h2 class="team-group-title">${escapeHtml(group.title)}</h2>
        <div class="team-grid team-group-grid">${members}</div>
      </div>`;
    })
    .join("");
}

function fetchJson(path) {
  if (!jsonCache.has(path)) {
    const promise = fetch(path).then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.status}`);
      }
      return response.json();
    });
    jsonCache.set(path, promise);
  }

  return jsonCache.get(path);
}

function preloadJson(paths) {
  paths.forEach((path) => {
    void fetchJson(path).catch((error) => {
      jsonCache.delete(path);
      console.error(error);
    });
  });
}

async function initResultsPage() {
  const container = document.getElementById("results-app");
  if (!container) {
    return;
  }

  try {
    const data = await fetchJson("data/results.json");
    const activeSlug = container.dataset.resultsSlug || "papers";
    const tab = data.tabs.find((item) => item.slug === activeSlug);

    if (!tab) {
      setContainerHtml(container, renderEmpty("未找到成果数据。"));
      return;
    }

    const bodyHtml =
      activeSlug === "papers"
        ? `${renderFeaturedPapers(tab.years)}${renderPaperYears(tab.years)}`
        : `<section class="section page-section"><div class="container">${renderAchievements(tab.years)}</div></section>`;

    setContainerHtml(container, bodyHtml);
    initializePaperYearTabs(container);
  } catch (error) {
    setContainerHtml(container, renderEmpty("成果数据加载失败。"));
    console.error(error);
  }
}

async function initNewsPage() {
  const container = document.getElementById("news-list");
  if (!container) {
    return;
  }

  try {
    const items = await fetchJson("data/news.json");
    setContainerHtml(container, renderNews(items));
  } catch (error) {
    setContainerHtml(container, renderEmpty("动态数据加载失败。"));
    console.error(error);
  }
}

async function initTeamPage() {
  const container = document.getElementById("team-groups");
  if (!container) {
    return;
  }

  try {
    const data = await fetchJson("data/team.json");
    setContainerHtml(container, renderTeam(data.groups));
  } catch (error) {
    setContainerHtml(container, renderEmpty("团队数据加载失败。"));
    console.error(error);
  }
}

function schedulePreload() {
  const paths = ["data/results.json", "data/news.json", "data/team.json"];

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => preloadJson(paths), { timeout: 1500 });
    return;
  }

  window.setTimeout(() => preloadJson(paths), 300);
}

schedulePreload();
void Promise.all([initResultsPage(), initNewsPage(), initTeamPage()]);
