// Hillstead Farms — nav state, mobile menu, scroll reveals, gallery, live inventory.
// NOTE: file was renamed from hs-site.js after an antivirus quarantine (2026-08-14).
// The page must never DEPEND on this file: reveal styling is gated behind the
// html.js class added below, so with no JS the site still renders completely.
(function () {
  'use strict';

  // Progressive-enhancement gate: hide-then-reveal styles apply only when JS runs.
  document.documentElement.classList.add('js');

  var nav = document.getElementById('nav');
  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');

  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function closeMenu() {
    if (!nav || !menuBtn) return;
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      menuBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
  }

  if (mobileMenu) {
    mobileMenu.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') closeMenu();
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu();
  });

  // ---------- Live weekly inventory (inventory.json) ----------
  // Fails silently: on file:// or a broken JSON the cards simply show no badges.
  var INV_STATUS = {
    available: ['Available Now', 'inv-available'],
    low: ['Almost Gone', 'inv-low'],
    out: ['Sold Out', 'inv-out'],
    season: ['In Season', 'inv-season'],
    ask: ['Text to Check', 'inv-ask'],
    soon: ['Coming Soon', 'inv-soon']
  };

  function formatInvDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    if (!m) return '';
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  }

  function applyInventory(data) {
    if (!data || typeof data !== 'object') return;

    var items = data.items || {};
    Object.keys(items).forEach(function (key) {
      var cards = document.querySelectorAll('[data-inv="' + key + '"]');
      var item = items[key];
      if (!cards.length || !item) return;

      var status = INV_STATUS[String(item.status || '').toLowerCase()];
      cards.forEach(function (card) {
        var badge = card.querySelector('.inv-badge');
        if (badge && status) {
          badge.textContent = status[0];
          badge.classList.add(status[1]);
          badge.hidden = false;
        }

        var noteEl = card.querySelector('.inv-note');
        if (noteEl && item.note) {
          noteEl.textContent = item.note;
          noteEl.hidden = false;
        }
      });
    });

    var updatedEl = document.getElementById('standUpdated');
    if (updatedEl) {
      var parts = [];
      var dateText = formatInvDate(data.updated);
      if (dateText) parts.push('This week’s list · updated ' + dateText);
      if (data.note) parts.push(data.note);
      updatedEl.textContent = parts.join(' · ');
    }
  }

  if (window.fetch) {
    fetch('inventory.json', { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('inventory unavailable');
        return res.json();
      })
      .then(applyInventory)
      .catch(function () { /* badges are an enhancement — never break the page */ });
  }


  // ---------- Newsletter signup ----------
  // Posts to the form backend in the background; without JS the form still
  // submits normally and the backend shows its own thank-you page.
  var newsForm = document.getElementById("newsForm");
  var newsMsg = document.getElementById("newsMsg");

  if (newsForm && newsMsg && window.fetch) {
    newsForm.addEventListener("submit", function (event) {
      var action = newsForm.getAttribute("action") || "";
      if (action.indexOf("YOUR_FORM_ID") !== -1) {
        event.preventDefault();
        newsMsg.textContent = "Signups open soon — text us at 615-337-7034 for now.";
        newsMsg.classList.remove("err");
        return;
      }
      event.preventDefault();
      newsForm.classList.add("is-busy");
      newsMsg.textContent = "";
      newsMsg.classList.remove("err");

      fetch(action, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(newsForm)
      }).then(function (res) {
        if (!res.ok) throw new Error("bad status " + res.status);
        newsForm.reset();
        newsMsg.textContent = "You’re on the list — thanks! We’ll write when something’s fresh.";
      }).catch(function () {
        newsMsg.textContent = "Hmm, that didn’t go through. Try again, or text us at 615-337-7034.";
        newsMsg.classList.add("err");
      }).then(function () {
        newsForm.classList.remove("is-busy");
      });
    });
  }

  // ---------- Gallery ----------
  // Tiles whose photo file isn't there yet fall back to a styled placeholder
  // instead of a broken image, so the section always looks finished.
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

  // ---------- Scroll reveals ----------
  // Skipped entirely for reduced-motion users (CSS shows content).
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
