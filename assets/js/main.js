/* GPS Legal — Corporate & Commercial
   Progressive enhancement only: the page is fully readable with JS disabled. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- header
     Compacts once past the hero edge, and — following the reference site —
     retracts on scroll-down and returns on scroll-up. */
  var header = document.getElementById('site-header');
  if (header) {
    var lastY = window.scrollY;
    var ticking = false;

    var update = function () {
      var y = window.scrollY;
      header.classList.toggle('is-stuck', y > 40);

      var navOpen = document.querySelector('.nav-toggle[aria-expanded="true"]');
      if (!navOpen && Math.abs(y - lastY) > 5) {
        header.classList.toggle('is-hidden', y > lastY && y > 220);
      }
      lastY = y;
      ticking = false;
    };

    update();
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
  }

  /* ------------------------------------------------------------ mobile nav */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.setAttribute('data-open', String(!open));
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.setAttribute('data-open', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        toggle.setAttribute('aria-expanded', 'false');
        nav.setAttribute('data-open', 'false');
        toggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------- accordion */
  document.querySelectorAll('[data-accordion]').forEach(function (root) {
    root.addEventListener('click', function (e) {
      var trigger = e.target.closest('.accordion__trigger');
      if (!trigger || !root.contains(trigger)) return;

      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));

      // one open at a time, matching the collapsed state shown in the design
      root.querySelectorAll('.accordion__trigger').forEach(function (t) {
        if (t === trigger) return;
        t.setAttribute('aria-expanded', 'false');
        var p = document.getElementById(t.getAttribute('aria-controls'));
        if (p) p.setAttribute('data-open', 'false');
      });

      trigger.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.setAttribute('data-open', String(!expanded));
    });
  });

  /* --------------------------------------------------------- file input UI */
  var fileInput = document.getElementById('f-file');
  var fileName = document.querySelector('[data-file-name]');
  if (fileInput && fileName) {
    fileInput.addEventListener('change', function () {
      var names = Array.prototype.map.call(fileInput.files, function (f) { return f.name; });
      if (names.length) {
        fileName.textContent = names.join(', ');
        fileName.hidden = false;
      } else {
        fileName.hidden = true;
      }
    });
  }

  /* --------------------------------------------------------- form feedback */
  var form = document.querySelector('.form');
  var status = document.querySelector('[data-form-status]');
  if (form && status) {
    var fields = form.querySelectorAll('input[required], textarea[required]');

    var labelFor = function (el) {
      var l = form.querySelector('label[for="' + el.id + '"]');
      if (!l) return el.name || 'this field';
      // strip the required marker and the screen-reader-only suffix
      return l.textContent.replace(/\*/g, '').replace(/\(required\)/i, '').trim();
    };

    var clear = function (el) {
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    };

    fields.forEach(function (el) {
      el.addEventListener('input', function () { if (el.checkValidity()) clear(el); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var invalid = [];
      fields.forEach(function (el) {
        if (el.checkValidity()) { clear(el); return; }
        el.setAttribute('aria-invalid', 'true');
        el.setAttribute('aria-describedby', 'form-status');
        invalid.push(labelFor(el));
      });

      if (invalid.length) {
        // name the fields rather than saying only that something is wrong
        status.textContent = invalid.length === 1
          ? 'Please complete ' + invalid[0] + '.'
          : 'Please complete: ' + invalid.join(', ') + '.';
        var first = form.querySelector('[aria-invalid="true"]');
        if (first) first.focus();
        return;
      }
      // No endpoint is wired up in this static build.
      status.textContent = 'Form is not connected to a submission endpoint in this build.';
    });
  }

  /* ---------------------------------------------------------- reveal on scroll */
  var reveals = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reduce) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    reveals.forEach(function (el, i) {
      // small stagger inside grids so rows cascade rather than pop together
      el.style.transitionDelay = (i % 4) * 60 + 'ms';
      io.observe(el);
    });
  }
})();
