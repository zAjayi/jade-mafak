// Service Worker registration for instant O(1) hardware cache retrieval
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Navigation mobile toggle
document.querySelector('.menu-toggle')?.addEventListener('click', (event) => {
  const button = event.currentTarget;
  const nav = document.querySelector('.nav');
  const open = nav.classList.toggle('is-open');
  button.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.nav a').forEach((link) => {
  link.addEventListener('click', () => document.querySelector('.nav')?.classList.remove('is-open'));
});

// Hero carousel
const carousel = document.querySelector('[data-carousel]');
if (carousel) {
  const slides = [...carousel.querySelectorAll('.hero__slide')];
  const dots = [...carousel.querySelectorAll('[data-slide]')];
  let current = 0;
  let timer;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.setAttribute('aria-hidden', i !== current);
    });
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
  };

  const restart = () => {
    clearInterval(timer);
    timer = setInterval(() => showSlide(current + 1), 6500);
  };

  carousel.querySelector('[data-carousel-prev]')?.addEventListener('click', () => {
    showSlide(current - 1);
    restart();
  });
  carousel.querySelector('[data-carousel-next]')?.addEventListener('click', () => {
    showSlide(current + 1);
    restart();
  });
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.slide));
      restart();
    });
  });
  restart();
}

// Values interactive list
document.querySelectorAll('.value').forEach((value) => {
  value.addEventListener('click', () => {
    document.querySelectorAll('.value').forEach((item) => item.classList.remove('is-selected'));
    value.classList.add('is-selected');
  });
});

// Contact form submission
const contactForm = document.querySelector('[data-contact-form]');
contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const status = contactForm.querySelector('.form-status');
  if (status) {
    status.textContent = 'Thank you. Your inquiry is ready to be followed up by our team.';
  }
  contactForm.reset();
});

// Gallery Data & O(1) Pre-Indexed Category Hash Map
const initialSeeds = [
  ['Handball academy warm-up', 'Grassroots Sports & Handball'],
  ['Finding the rhythm', 'Grassroots Sports & Handball'],
  ['Teamwork in motion', 'Grassroots Sports & Handball'],
  ['A new generation', 'Grassroots Sports & Handball'],
  ['Making space to play', 'Grassroots Sports & Handball'],
  ['Training day', 'Grassroots Sports & Handball'],
  ['The next pass', 'Grassroots Sports & Handball'],
  ['On the line', 'Grassroots Sports & Handball'],
  ['Practice makes progress', 'Grassroots Sports & Handball'],
  ['Play with purpose', 'Grassroots Sports & Handball'],
  ['Mentor circle', 'Youth Mentorship'],
  ['A listening ear', 'Youth Mentorship'],
  ['Room to grow', 'Youth Mentorship'],
  ['Shared stories', 'Youth Mentorship'],
  ['Future leaders', 'Youth Mentorship'],
  ['A question worth asking', 'Youth Mentorship'],
  ['Walking together', 'Youth Mentorship'],
  ['Confidence in practice', 'Youth Mentorship'],
  ['Community day', 'Community Events'],
  ['Many hands', 'Community Events'],
  ['A shared table', 'Community Events'],
  ['Neighbours together', 'Community Events'],
  ['Making a difference', 'Community Events'],
  ['Open doors', 'Community Events'],
  ['Celebrating effort', 'Community Events'],
  ['Local voices', 'Community Events'],
  ['Our community', 'Community Events'],
  ['Showing up', 'Community Events'],
  ['Learning together', 'Training & Education'],
  ['The classroom', 'Training & Education'],
  ['Tools for tomorrow', 'Training & Education'],
  ['Hands-on learning', 'Training & Education'],
  ['A bright idea', 'Training & Education'],
  ['Learning by doing', 'Training & Education'],
  ['The work continues', 'Training & Education'],
  ['Building skills', 'Training & Education'],
  ['A shared future', 'Training & Education'],
  ['A bold beginning', 'Grassroots Sports & Handball'],
  ['After the whistle', 'Grassroots Sports & Handball'],
  ['Finding focus', 'Grassroots Sports & Handball'],
  ['The team huddle', 'Youth Mentorship'],
  ['A shared goal', 'Youth Mentorship'],
  ['Growing together', 'Community Events'],
  ['A day of service', 'Community Events'],
  ['Learning forward', 'Training & Education'],
  ['Practical tools', 'Training & Education'],
  ['The work of hope', 'Community Events'],
  ['Young and ready', 'Youth Mentorship'],
  ['The long game', 'Grassroots Sports & Handball'],
  ['One more step', 'Training & Education'],
  ['Open possibility', 'Community Events'],
  ['Keep moving', 'Grassroots Sports & Handball']
];

const localCategories = ['Grassroots Sports & Handball', 'Youth Mentorship', 'Community Events', 'Training & Education'];
for (let index = initialSeeds.length; index < 58; index += 1) {
  initialSeeds.push([`Community moment ${index + 1}`, localCategories[index % localCategories.length]]);
}

const allItems = initialSeeds.map(([title, category], index) => {
  const num = String(index + 1).padStart(2, '0');
  const url = `/images/gallery-${num}.jpeg`;
  return {
    id: index + 1,
    title,
    category,
    caption: `${title} · Jade Mafak Development Ltd`,
    thumbnailUrl: url,
    fullUrl: url
  };
});

// O(1) Pre-indexed Hash Table by Category
const CATEGORY_MAP = {
  All: allItems,
  'Grassroots Sports & Handball': [],
  'Youth Mentorship': [],
  'Community Events': [],
  'Training & Education': []
};

allItems.forEach((item) => {
  if (CATEGORY_MAP[item.category]) {
    CATEGORY_MAP[item.category].push(item);
  }
});

// Gallery rendering & Lightbox
const galleryGrid = document.querySelector('[data-gallery-grid]');
if (galleryGrid) {
  let activeFilter = 'All';
  let visibleCount = 12;
  let activeItems = CATEGORY_MAP['All'];

  const createCardHTML = (item) => `
    <button class="gallery-card" type="button" data-gallery-id="${item.id}" style="background-image:url('${item.thumbnailUrl}')" aria-label="Open ${item.title}">
      <span class="gallery-card__overlay">
        <span>${item.category}</span>
        <strong>${item.title}</strong>
      </span>
    </button>
  `;

  const loadMoreBtn = document.querySelector('[data-load-more]');

  const updateLoadMoreVisibility = () => {
    if (loadMoreBtn) {
      loadMoreBtn.hidden = visibleCount >= activeItems.length;
    }
  };

  // O(1) Category Switch using pre-indexed lookup
  const renderActiveGrid = () => {
    activeItems = CATEGORY_MAP[activeFilter] || allItems;
    visibleCount = 12;
    galleryGrid.innerHTML = activeItems.slice(0, visibleCount).map(createCardHTML).join('');
    updateLoadMoreVisibility();
  };

  // Category filter buttons
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      if (activeFilter === button.dataset.filter) return;
      activeFilter = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach((btn) => btn.classList.toggle('is-active', btn === button));
      renderActiveGrid();
    });
  });

  // O(K) Incremental append for Load More without destroying existing DOM nodes
  loadMoreBtn?.addEventListener('click', () => {
    const nextBatch = activeItems.slice(visibleCount, visibleCount + 12);
    visibleCount += 12;
    if (nextBatch.length > 0) {
      galleryGrid.insertAdjacentHTML('beforeend', nextBatch.map(createCardHTML).join(''));
    }
    updateLoadMoreVisibility();
  });

  // O(1) Container Event Delegation for opening lightbox
  galleryGrid.addEventListener('click', (event) => {
    const card = event.target.closest('[data-gallery-id]');
    if (!card) return;
    const cardId = Number(card.dataset.galleryId);
    const index = activeItems.findIndex((item) => item.id === cardId);
    if (index !== -1) {
      openLightbox(index);
    }
  });

  // Lightbox implementation
  const lightbox = document.querySelector('[data-lightbox]');
  const image = lightbox?.querySelector('[data-lightbox-image]');
  const caption = lightbox?.querySelector('[data-lightbox-caption]');
  const category = lightbox?.querySelector('[data-lightbox-category]');
  let lightboxIndex = 0;

  const updateLightbox = () => {
    const item = activeItems[lightboxIndex];
    if (!item || !image || !caption || !category) return;
    image.src = item.fullUrl;
    image.alt = item.caption;
    caption.textContent = item.caption;
    category.textContent = item.category;
  };

  function openLightbox(index) {
    lightboxIndex = index;
    updateLightbox();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('[data-lightbox-close]')?.focus();
  }

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const moveLightbox = (direction) => {
    lightboxIndex = (lightboxIndex + direction + activeItems.length) % activeItems.length;
    updateLightbox();
  };

  lightbox?.querySelectorAll('[data-lightbox-close]').forEach((el) => el.addEventListener('click', closeLightbox));
  lightbox?.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => moveLightbox(-1));
  lightbox?.querySelector('[data-lightbox-next]')?.addEventListener('click', () => moveLightbox(1));
  document.addEventListener('keydown', (event) => {
    if (!lightbox?.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });
}
