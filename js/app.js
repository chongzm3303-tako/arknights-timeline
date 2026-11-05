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
  const art = h("article", "detail");
  const back = link("#", "back"); back.textContent = "Back to timeline";
  const t = h("h1", "", s.title); t.tabIndex = -1;
  art.append(back, meta(s), t);
  if (s.summary) art.append(h("p", "summary", s.summary));
  art.append(h("div", "stripe"));
  const text = h("div", "text");
  if (s.body && s.body.length) s.body.forEach(p => text.append(h("p", "", p)));
  else text.append(h("p", "", "The full story text has not been added yet."));
  art.append(text);
  if (s.characters && s.characters.length){
    art.append(h("h2", "", "Characters"));
    const ul = h("ul", "chars");
    s.characters.forEach(c => ul.append(h("li", "tag", c)));
    art.append(ul);
  }
  const pager = h("nav", "pager"); pager.setAttribute("aria-label", "Neighbouring stories");
  [[i - 1, "prev", "Earlier"], [i + 1, "next", "Later"]].forEach(([j, cls, label]) => {
    if (!STORIES[j]) return;
    const a = link("#" + STORIES[j].id, cls);
    a.append(h("small", "", label), document.createTextNode(STORIES[j].title));
    pager.append(a);
  });
  art.append(pager);
  f.append(art);
  return f;
}

function route(first){
  const id = decodeURIComponent(location.hash.slice(1));
  const i = STORIES.findIndex(s => s.id === id);
  view = i < 0 ? "home" : "detail";
  app.replaceChildren(i < 0 ? home() : detail(i));
  document.title = i < 0 ? SITE : STORIES[i].title + " | " + SITE;
  window.scrollTo(0, view === "home" ? homeY : 0);
  if (!first){ const h1 = app.querySelector("h1"); if (h1) h1.focus({preventScroll:true}); }
}
window.addEventListener("scroll", () => { if (view === "home") homeY = window.scrollY; }, {passive:true});
window.addEventListener("hashchange", () => route(false));
route(true);
