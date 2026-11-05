const app = document.getElementById("app");
const SITE = "Arknights story timeline";
let view = "home", homeY = 0;

function h(tag, cls, text){
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}
function link(href, cls){ const a = h("a", cls); a.href = href; return a; }
function meta(s){
  const m = h("div", "meta");
  if (s.type) m.append(h("span", "tag", s.type));
  if (s.when) m.append(h("span", "", s.when));
  return m;
}

const FLAG = /(Speculation|Disputed in part|Disputed|Partly confirmed|Plausible|Confirmed|Unchecked|Conflict)( \([^)]{0,90}\))?: /g;
const FLAG_CLASS = {"Speculation":"spec","Disputed":"disp","Disputed in part":"disp","Conflict":"disp","Confirmed":"ok"};

/* Turns a leading label such as "Speculation (no source found yet):" into a small badge. */
function para(text){
  const p = h("p"); let last = 0, count = 0, m;
  FLAG.lastIndex = 0;
  while ((m = FLAG.exec(text))){
    if (m.index > 0 && !/[.!?"')]\s*$/.test(text.slice(0, m.index))) continue;
    p.append(document.createTextNode(text.slice(last, m.index)));
    const label = m[1], note = m[2] || "";
    const unsourced = label === "Speculation" && /no source found/.test(note);
    const b = h("span", "flag f-" + (FLAG_CLASS[label] || "mute"));
    const vis = h("span", "", unsourced ? "Unsourced" : label); vis.setAttribute("aria-hidden", "true");
    b.append(vis, h("span", "sr", label + note + ":"));
    p.append(b); last = m.index + m[0].length; count++;
  }
  p.append(document.createTextNode(text.slice(last)));
  return {p, count};
}

function home(){
  const f = document.createDocumentFragment();
  const head = h("header");
  head.append(h("h1", "", SITE), h("p", "lede", "Every Arknights story in order. Select a point to read it."), h("div", "stripe"));
  head.querySelector("h1").tabIndex = -1;
  f.append(head);
  if (!STORIES.length){
    f.append(h("div", "empty", "No stories yet. Add entries to the STORIES list in the page source."));
  } else {
    f.append(h("p", "count", STORIES.length + (STORIES.length === 1 ? " story" : " stories")));
    const ol = h("ol", "tl");
    STORIES.forEach(s => {
      const li = h("li"), a = link("#" + s.id);
      a.append(meta(s), h("h2", "", s.title));
      if (s.summary) a.append(h("p", "", s.summary));
      li.append(a); ol.append(li);
    });
    f.append(ol);
  }
  f.append(h("footer", "", "Fan-made archive. Not affiliated with Hypergryph or Yostar. Arknights is their property."));
  return f;
}

function detail(i){
  const s = STORIES[i], f = document.createDocumentFragment();
  const grid = h("div", "cols"), main = h("article", "main");
  const back = link("#", "back"); back.textContent = "Back to timeline";
  const t = h("h1", "", s.title); t.tabIndex = -1;
  main.append(back, meta(s), t);
  if (s.summary) main.append(h("p", "summary", s.summary));
  main.append(h("div", "stripe"));
  const text = h("div", "text"); let flags = 0;
  if (s.body && s.body.length) s.body.forEach(x => { const r = para(x); flags += r.count; text.append(r.p); });
  else text.append(h("p", "", "The full story text has not been added yet."));
  if (flags) main.append(h("p", "legend", "Labels in the text: Unsourced means no source found yet. Speculation, Plausible and Unchecked are not confirmed. Disputed means sources disagree."));
  main.append(text);
  const pager = h("nav", "pager"); pager.setAttribute("aria-label", "Neighbouring stories");
  [[i - 1, "prev", "Earlier"], [i + 1, "next", "Later"]].forEach(([j, cls, label]) => {
    if (!STORIES[j]) return;
    const a = link("#" + STORIES[j].id, cls);
    a.append(h("small", "", label), document.createTextNode(STORIES[j].title));
    pager.append(a);
  });
  main.append(pager);
  grid.append(main);
  /* Right rail: characters, open when there is room. */
  if (s.characters && s.characters.length){
    const side = h("aside", "rail rail-r"), box = h("details", "chars-box");
    box.open = !!(window.matchMedia && window.matchMedia("(min-width:1200px)").matches);
    box.append(h("summary", "", "Characters (" + s.characters.length + ")"));
    const ul = h("ul", "chars");
    s.characters.forEach(c => ul.append(h("li", "tag", c)));
    box.append(ul); side.append(box); grid.append(side);
  }
  /* Left rail: every story, current one marked. Hidden on narrow screens. */
  const nav = h("nav", "rail rail-l"); nav.setAttribute("aria-label", "All stories");
  nav.append(h("h2", "", "All stories"));
  const ol = h("ol", "navlist");
  STORIES.forEach((x, k) => {
    const li = h("li"), a = link("#" + x.id, "navlink"); a.textContent = x.title;
    if (k === i) a.setAttribute("aria-current", "page");
    li.append(a); ol.append(li);
  });
  nav.append(ol); grid.append(nav);
  f.append(grid);
  return f;
}

function route(first){
  const id = decodeURIComponent(location.hash.slice(1));
  const i = STORIES.findIndex(s => s.id === id);
  view = i < 0 ? "home" : "detail";
  app.dataset.view = view;
  app.replaceChildren(i < 0 ? home() : detail(i));
  document.title = i < 0 ? SITE : STORIES[i].title + " | " + SITE;
  window.scrollTo(0, view === "home" ? homeY : 0);
  if (!first){ const h1 = app.querySelector("h1"); if (h1) h1.focus({preventScroll:true}); }
}
window.addEventListener("scroll", () => { if (view === "home") homeY = window.scrollY; }, {passive:true});
window.addEventListener("hashchange", () => route(false));
route(true);