// Hillstead Farms — nav state, mobile menu, scroll reveals.
(function () {
  'use strict';

  var nav = document.getElementById('nav');
  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  }

  menuBtn.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    menuBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  mobileMenu.addEventListener('click', function (event) {
    if (event.target.tagName === 'A') closeMenu();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu();
  });

  // Gallery — tiles whose photo file isn't there yet fall back to a styled
  // placeholder instead of a broken image, so the section always looks finished.
  var galleryItems = document.querySelectorAll('.gal-item');

  galleryItems.forEach(function (item) {
    var img = item.querySelector('img');
    if (!img) return;

    function markMissing() { item.classList.add('no-photo'); }

    if (img.complete && img.naturalWidth === 0) markMissing();
    img.addEventListener('error', markMissing);
  });

  // Lightbox — opens a full view of a gallery photo.
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lbImg');
  var lightboxCap = document.getElementById('lbCap');
  var lightboxClose = document.getElementById('lbClose');
  var lastFocused = null;

  function openLightbox(item) {
    lastFocused = item;
    lightboxImg.src = item.getAttribute('data-full');
    lightboxImg.alt = item.querySelector('img') ? item.querySelector('img').alt : '';
    lightboxCap.textContent = item.getAttribute('data-cap') || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  if (lightbox) {
    galleryItems.forEach(function (item) {
      item.addEventListener('click', function () {
        // Placeholder tiles have nothing to enlarge.
        if (item.classList.contains('no-photo')) return;
        openLightbox(item);
      });
    });

    lightboxClose.addEventListener('click', closeLightbox);

    // Click the backdrop (but not the photo itself) to dismiss.
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
      // Keep focus inside the dialog while it's open.
      if (event.key === 'Tab' && !lightbox.hidden) {
        event.preventDefault();
        lightboxClose.focus();
      }
    });
  }

  // Scroll reveals — skipped entirely for reduced-motion users (CSS shows content).
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  revealEls.forEach(function (el) { observer.observe(el); });
})();
