(() => {
  'use strict';

  const config = window.WEDDING_CONFIG || {};
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Apply editable names and event details without requiring a build step.
  const groom = String(config.groom || 'Anwar');
  const bride = String(config.bride || 'Shamna');
  const fullNames = `${groom} & ${bride}`;
  const setText = (selector, value) => {
    const element = $(selector);
    if (element && value) element.textContent = value;
  };
  setText('#introNames', fullNames);
  setText('#heroGroom', groom.toUpperCase());
  setText('#heroBride', bride.toUpperCase());
  setText('#storyNames', fullNames);
  setText('#closingNames', fullNames.toUpperCase());
  setText('#brandNames', fullNames.toUpperCase());

  const timeText = config.ceremonyTime || 'Ceremony time to be announced';
  const venueText = config.venue || 'Venue to be announced';
  const addressText = config.address || 'The celebration location will be shared soon.';
  setText('[data-config="time"]', timeText);
  setText('[data-config="venue"]', venueText);
  setText('[data-config="address"]', addressText);

  const mapLink = $('#mapLink');
  if (mapLink && String(config.mapQuery || '').trim()) {
    mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.mapQuery.trim())}`;
    mapLink.target = '_blank';
    mapLink.rel = 'noopener noreferrer';
    mapLink.classList.remove('is-disabled');
    mapLink.removeAttribute('aria-disabled');
  } else if (mapLink) {
    mapLink.addEventListener('click', (event) => {
      event.preventDefault();
      showToast('Add your venue and mapQuery in wedding-config.js to activate this link.');
    });
  }

  // Tiny status toast used by controls that need a little feedback.
  let toastTimeout;
  function showToast(message) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toast.classList.remove('is-visible'), 3600);
  }

  // Open the invitation and reveal the main experience.
  const intro = $('#intro');
  const siteShell = $('#siteShell');
  const openButton = $('#openInvitation');
  const menuToggle = $('#menuToggle');
  const siteNav = $('#siteNav');
  let hasOpened = false;
  let introTimer;

  function openInvitation() {
    if (!intro || !siteShell) return;
    window.clearTimeout(introTimer);
    intro.classList.add('is-opening');
    intro.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    siteShell.setAttribute('aria-hidden', 'false');
    siteShell.classList.add('is-visible');
    hasOpened = true;
    introTimer = window.setTimeout(() => {
      intro.hidden = true;
      $('#home')?.focus?.({ preventScroll: true });
    }, reducedMotion ? 20 : 1600);
  }

  function replayInvitation() {
    if (!intro || !siteShell) return;
    window.clearTimeout(introTimer);
    intro.hidden = false;
    intro.classList.remove('is-opening');
    intro.setAttribute('aria-hidden', 'false');
    siteShell.classList.remove('is-visible');
    siteShell.setAttribute('aria-hidden', 'true');
    document.body.classList.add('is-locked');
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    hasOpened = false;
    closeMobileMenu();
    openButton?.focus({ preventScroll: true });
  }

  openButton?.addEventListener('click', openInvitation);
  $('#reopenInvitation')?.addEventListener('click', replayInvitation);

  // Mobile navigation.
  function closeMobileMenu() {
    if (!menuToggle || !siteNav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    siteNav.classList.remove('is-open');
  }
  menuToggle?.addEventListener('click', () => {
    const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(willOpen));
    menuToggle.setAttribute('aria-label', willOpen ? 'Close navigation' : 'Open navigation');
    siteNav?.classList.toggle('is-open', willOpen);
  });
  $$('#siteNav a').forEach((link) => link.addEventListener('click', closeMobileMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileMenu();
  });

  // Live countdown. The ISO timestamp explicitly uses India Standard Time.
  const targetDate = new Date(config.eventDateISO || '2027-01-10T00:00:00+05:30').getTime();
  const countdownEls = {
    days: $('#days'), hours: $('#hours'), minutes: $('#minutes'), seconds: $('#seconds')
  };
  const pad = (number) => String(number).padStart(2, '0');
  function updateCountdown() {
    if (!Number.isFinite(targetDate)) return;
    let remaining = Math.max(0, targetDate - Date.now());
    const days = Math.floor(remaining / 86400000);
    remaining %= 86400000;
    const hours = Math.floor(remaining / 3600000);
    remaining %= 3600000;
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    if (countdownEls.days) countdownEls.days.textContent = pad(days);
    if (countdownEls.hours) countdownEls.hours.textContent = pad(hours);
    if (countdownEls.minutes) countdownEls.minutes.textContent = pad(minutes);
    if (countdownEls.seconds) countdownEls.seconds.textContent = pad(seconds);
    if (targetDate <= Date.now()) {
      const caption = $('.countdown-caption');
      if (caption) caption.textContent = 'TODAY IS THE DAY — LET THE CELEBRATION BEGIN';
    }
  }
  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  // Add an all-day calendar reminder as a local .ics file.
  $('#addToCalendar')?.addEventListener('click', () => {
    const escapeICS = (value) => String(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const event = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Anwar and Shamna//Wedding Invitation//EN',
      'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:anwar-shamna-${Date.now()}@wedding-invitation`,
      `DTSTAMP:${stamp}`, 'DTSTART;VALUE=DATE:20270110', 'DTEND;VALUE=DATE:20270111',
      `SUMMARY:${escapeICS(`${groom} & ${bride} — Wedding Day`)}`,
      `DESCRIPTION:${escapeICS('A celebration of love. Sunday, January 10, 2027.')}`,
      config.address ? `LOCATION:${escapeICS(config.address)}` : '', 'END:VEVENT', 'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
    const blob = new Blob([event], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'anwar-shamna-wedding.ics';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast('Calendar reminder prepared for January 10, 2027.');
  });

  // Scroll-based header, back-to-top and reveal choreography.
  const header = $('.site-header');
  const backToTop = $('#backToTop');
  let scrollTicking = false;
  function handleScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      const y = window.scrollY;
      header?.classList.toggle('is-scrolled', y > 35);
      backToTop?.classList.toggle('is-visible', y > 600);
      scrollTicking = false;
    });
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -45px 0px' });
    revealEls.forEach((element) => revealObserver.observe(element));
  } else {
    revealEls.forEach((element) => element.classList.add('is-revealed'));
  }

  // Gentle hero parallax and pointer glow; both are skipped for touch/reduced motion.
  const heroBackdrop = $('.hero-backdrop');
  const cursorGlow = $('#cursorGlow');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reducedMotion) {
    let pointerFrame = false;
    document.addEventListener('pointermove', (event) => {
      if (pointerFrame) return;
      pointerFrame = true;
      window.requestAnimationFrame(() => {
        if (cursorGlow) cursorGlow.style.transform = `translate(${event.clientX - 130}px, ${event.clientY - 130}px)`;
        pointerFrame = false;
      });
    }, { passive: true });
  }
  if (!reducedMotion && heroBackdrop) {
    let parallaxFrame = false;
    window.addEventListener('scroll', () => {
      if (parallaxFrame || window.scrollY > window.innerHeight * 1.15) return;
      parallaxFrame = true;
      window.requestAnimationFrame(() => {
        heroBackdrop.style.transform = `translate3d(0, ${window.scrollY * 0.12}px, 0) scale(1.04)`;
        parallaxFrame = false;
      });
    }, { passive: true });
  }

  // Gallery lightbox with keyboard navigation and focus restoration.
  const galleryItems = $$('.gallery-item');
  const lightbox = $('#lightbox');
  const lightboxImage = $('#lightboxImage');
  const lightboxCaption = $('#lightboxCaption');
  const lightboxCounter = $('#lightboxCounter');
  let activeImageIndex = 0;
  let lastGalleryTrigger = null;

  function showGalleryImage(index) {
    if (!galleryItems.length) return;
    activeImageIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[activeImageIndex];
    const image = $('img', item);
    lightboxImage.src = item.dataset.full || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = item.dataset.caption || image.alt;
    lightboxCounter.textContent = `${String(activeImageIndex + 1).padStart(2, '0')} / ${String(galleryItems.length).padStart(2, '0')}`;
  }
  function openLightbox(index, trigger) {
    if (!lightbox) return;
    lastGalleryTrigger = trigger;
    showGalleryImage(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('#lightboxClose')?.focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastGalleryTrigger) lastGalleryTrigger.focus({ preventScroll: true });
  }
  galleryItems.forEach((item, index) => item.addEventListener('click', () => openLightbox(index, item)));
  $('#lightboxClose')?.addEventListener('click', closeLightbox);
  $('#lightboxPrev')?.addEventListener('click', () => showGalleryImage(activeImageIndex - 1));
  $('#lightboxNext')?.addEventListener('click', () => showGalleryImage(activeImageIndex + 1));
  lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (event) => {
    if (!lightbox?.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showGalleryImage(activeImageIndex - 1);
    if (event.key === 'ArrowRight') showGalleryImage(activeImageIndex + 1);
  });

  // RSVP demonstration: validates and previews a response, but sends nothing.
  const rsvpForm = $('#rsvpForm');
  const successPanel = $('#formSuccess');
  rsvpForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!rsvpForm.reportValidity()) return;
    const guestName = String(new FormData(rsvpForm).get('guestName') || '').trim();
    $('#successName').textContent = guestName || 'friend';
    successPanel.hidden = false;
    rsvpForm.setAttribute('aria-label', 'RSVP response preview');
  });
  $('#editReply')?.addEventListener('click', () => {
    if (successPanel) successPanel.hidden = true;
    rsvpForm?.removeAttribute('aria-label');
    $('#guestName')?.focus();
  });

  // Optional, locally generated ambient pad. No audio file or network request is used.
  let audioContext = null;
  let ambientNodes = [];
  let soundEnabled = false;
  const soundToggle = $('#soundToggle');
  const soundLabel = $('#soundLabel');

  async function enableAmbientSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      showToast('Ambient audio is not supported by this browser.');
      return;
    }
    try {
      audioContext = audioContext || new AudioContextClass();
      await audioContext.resume();
      const master = audioContext.createGain();
      master.gain.setValueAtTime(0, audioContext.currentTime);
      master.gain.linearRampToValueAtTime(0.035, audioContext.currentTime + 2.5);
      master.connect(audioContext.destination);
      const notes = [130.81, 196.00, 261.63, 329.63];
      ambientNodes = notes.map((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = index === 3 ? 'sine' : 'triangle';
        oscillator.frequency.value = frequency;
        oscillator.detune.value = index % 2 ? -4 : 3;
        gain.gain.value = index === 0 ? .34 : .17;
        oscillator.connect(gain);
        gain.connect(master);
        oscillator.start();
        return { oscillator, gain, master };
      });
      soundEnabled = true;
      soundToggle?.setAttribute('aria-pressed', 'true');
      soundToggle?.setAttribute('aria-label', 'Turn ambient sound off');
      if (soundLabel) soundLabel.textContent = 'SOUND ON';
    } catch (error) {
      showToast('Your browser could not start ambient audio.');
    }
  }
  async function disableAmbientSound() {
    if (audioContext && audioContext.state !== 'closed') {
      const now = audioContext.currentTime;
      const nodesToStop = ambientNodes;
      ambientNodes = [];
      const master = nodesToStop[0]?.master;
      if (master) {
        master.gain.cancelScheduledValues(now);
        master.gain.setTargetAtTime(0, now, .35);
      }
      window.setTimeout(() => {
        nodesToStop.forEach(({ oscillator }) => { try { oscillator.stop(); } catch (_) { /* already stopped */ } });
      }, 1200);
    }
    soundEnabled = false;
    soundToggle?.setAttribute('aria-pressed', 'false');
    soundToggle?.setAttribute('aria-label', 'Turn ambient sound on');
    if (soundLabel) soundLabel.textContent = 'SOUND OFF';
  }
  soundToggle?.addEventListener('click', () => {
    if (soundEnabled) disableAmbientSound();
    else enableAmbientSound();
  });

  // Keep intro state explicit if a browser restores this page from the back-forward cache.
  window.addEventListener('pageshow', () => {
    if (hasOpened && intro?.classList.contains('is-opening')) intro.hidden = true;
  });
})();
