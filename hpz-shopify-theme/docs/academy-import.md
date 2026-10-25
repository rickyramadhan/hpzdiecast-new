# Academy: blog setup and article import

## 1. Create the blog
1. Shopify admin > Online Store > Blog posts > Manage blogs > Add blog. Title `Academy`, URL handle `academy`.
2. In the theme editor open the blog page and set its template to `blog.academy` (this loads the index with category chips, featured article and glossary). Other blogs use the plain `blog` template.
3. Comments: leave disabled (the theme renders none).

## 2. Article conventions
- Article **tags are the categories** (Wheels, Decals, Fitment, Body kits, Engines). The first tag is shown on cards and in the breadcrumb.
- Tag one article `featured` to pin it at the top of page 1 of the index; otherwise the newest article is featured.
- Optional article metafields (namespace `hpz`): `level` (single line text: Beginner, Intermediate, Advanced, All levels) and `minutes` (integer). Both are hidden when empty.
- Optional `hpz.products` (list of product references) renders product cards under the article.
- **Every `<h2>` becomes a step.** The theme builds the step rail, scroll-spy, reading bar and the "mark step done" checklist (saved in the visitor's browser, keyed by article handle) from the h2 headings. Text before the first h2 is shown as the introduction. Use `<h3>` for sub-headings that should not become steps.
- Callouts: in the rich text editor switch to HTML view and give a paragraph or div a class: `<p class="callout tip">...</p>` or `<p class="callout warn">...</p>`.

## 3. Import the six starter guides
`setup/academy-articles.json` contains six guides (wheel swap, waterslide decals, picking a wheel diameter, resin widebody kit, white toner decals, painting a resin engine) as HTML bodies, with tags, level and minutes. Add a featured image to each article after import.

Option A: copy and paste. Open each entry, paste `body_html` into the article editor in HTML view, paste `summary_html` into the excerpt, set tags, and fill the two metafields.

Option B: script (Admin REST API, run on your own machine with a custom app token that has `write_content`):

```js
// node import-academy.cjs  (needs Node 18+)
const data = require('./setup/academy-articles.json');
const SHOP = process.env.SHOP, TOKEN = process.env.TOKEN, V = '2024-10';
const api = (p, o = {}) => fetch(`https://${SHOP}/admin/api/${V}/${p}`, { ...o, headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' } }).then(r => r.json());
(async () => {
  const { blogs } = await api('blogs.json?handle=' + data.blog.handle);
  let blog = blogs[0];
  if (!blog) blog = (await api('blogs.json', { method: 'POST', body: JSON.stringify({ blog: { title: data.blog.title, handle: data.blog.handle, template_suffix: data.blog.template_suffix } }) })).blog;
  for (const a of data.articles) {
    const res = await api(`blogs/${blog.id}/articles.json`, { method: 'POST', body: JSON.stringify({ article: {
      title: a.title, handle: a.handle, author: a.author, tags: a.tags.join(', '), body_html: a.body_html, summary_html: a.summary_html, published: a.published,
      metafields: a.metafields } }) });
    console.log(a.handle, res.errors || 'ok');
  }
})();
```

## 4. Glossary
The glossary on the academy index is made of **blocks** in the "Academy index" section (theme editor > blog page > Glossary term). Fifteen starter terms are included in `templates/blog.academy.json`.

## 5. Translations
Article text is merchant content: translate it with Shopify Translate & Adapt. Theme labels come from `locales/*`.
