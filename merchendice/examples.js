const search = document.querySelector('#exampleSearch');
const filters = [...document.querySelectorAll('.directory-filter')];
const cards = [...document.querySelectorAll('.listing-card')];
const resultCount = document.querySelector('#directoryResultCount');
const resultKind = document.querySelector('#directoryResultKind');
const emptyMessage = document.querySelector('#directoryEmpty');
const filterCookie = 'merchendice_storefront_view';
const validFilters = new Set(['example', 'real']);
const savedFilter = document.cookie.split('; ').find(cookie => cookie.startsWith(`${filterCookie}=`))?.split('=').slice(1).join('=');
let activeFilter = validFilters.has(savedFilter) ? savedFilter : 'example';

function syncFilterButtons() {
  for (const button of filters) {
    const isActive = button.dataset.filter === activeFilter;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  }
}

function updateDirectory() {
  const terms = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  let visibleCount = 0;
  for (const card of cards) {
    const matchesType = card.dataset.kind === activeFilter;
    const searchable = card.dataset.search.toLocaleLowerCase();
    const matchesQuery = terms.every(term => searchable.includes(term));
    card.hidden = !(matchesType && matchesQuery);
    if (!card.hidden) visibleCount += 1;
  }
  resultCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'storefront' : 'storefronts'}`;
  resultKind.textContent = `${activeFilter === 'example' ? 'EXAMPLE' : 'REAL'} STOREFRONTS`;
  emptyMessage.hidden = false;
  if (visibleCount) {
    emptyMessage.hidden = true;
  } else if (terms.length) {
    emptyMessage.textContent = `No ${activeFilter} storefronts match that search. Try a different name or clear your search.`;
  } else {
    emptyMessage.textContent = activeFilter === 'real'
      ? 'There are no real storefronts listed yet.'
      : 'There are no example storefronts listed yet.';
  }
}

syncFilterButtons();
updateDirectory();
window.addEventListener('pageshow', updateDirectory);

search.addEventListener('input', updateDirectory);
for (const button of filters) {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${filterCookie}=${activeFilter}; Max-Age=31536000; Path=/examples/; SameSite=Lax${secure}`;
    syncFilterButtons();
    updateDirectory();
  });
}
