/**
 * ANANT PRODUCTIONS — WEDDING PHOTOGRAPHY & CINEMATOGRAPHY
 * 
 * Interactive Engine:
 * - Dynamic Configuration Sync with js/config.js
 * - High-Converting Date Checker & WhatsApp Inquiry Dispatch
 * - Image & Video Lightbox Modals
 * - Portfolio Category Filtering
 * - Accessible FAQ Accordion
 * - Interactive Celebration Functions Selector
 * - Mobile Navigation & Floating Action Bar
 */

document.addEventListener('DOMContentLoaded', () => {
  const config = window.ANANT_CONFIG || null;

  // 1. Sync Configuration Data to UI (if present)
  if (config) {
    // Launch offer card sync
    const launchCard = document.getElementById('launch-card-container');
    if (launchCard && config.launchOffer) {
      if (!config.launchOffer.active) {
        // Hide launch offer if deactivated by business owner
        const launchSection = document.getElementById('launch-offer');
        if (launchSection) launchSection.style.display = 'none';
      } else {
        const priceDisplay = document.getElementById('launch-price-display');
        const regularDisplay = document.getElementById('launch-regular-display');
        const savingsDisplay = document.getElementById('launch-savings-display');
        const ctaBtn = document.getElementById('launch-cta-btn');

        if (priceDisplay) priceDisplay.textContent = config.launchOffer.price;
        if (regularDisplay) regularDisplay.textContent = config.launchOffer.regularPrice;
        if (savingsDisplay) savingsDisplay.textContent = config.launchOffer.savings;
        if (ctaBtn) {
          const encodedMsg = encodeURIComponent(config.launchOffer.waMessage);
          ctaBtn.href = `https://wa.me/${config.business.phoneRaw}?text=${encodedMsg}`;
        }
      }
    }
  }

  // 2. Navbar Sticky & Headroom Scroll Effect
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // 3. Mobile Navigation Drawer
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const mobileClose = document.querySelector('.mobile-drawer-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-drawer-cta');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.style.display = 'flex';
      mobileDrawer.classList.add('active');
      mobileToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeMobileDrawer() {
    if (mobileDrawer) {
      mobileDrawer.classList.remove('active');
      mobileDrawer.style.display = 'none';
      if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  if (mobileClose) {
    mobileClose.addEventListener('click', closeMobileDrawer);
  }

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileDrawer);
  });

  // 4. Portfolio Category Filtering
  const filterBtns = document.querySelectorAll('.gallery-filters [data-filter]');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filterVal = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const itemCat = item.getAttribute('data-category');
        if (filterVal === 'all' || itemCat === filterVal) {
          item.style.display = 'block';
          item.style.opacity = '1';
        } else {
          item.style.display = 'none';
          item.style.opacity = '0';
        }
      });
    });
  });

  // 4b. Package Category Tabs Switcher (Weddings / Pre-Wed / Engagement / Functions)
  const pkgTabs = document.querySelectorAll('[data-pkg-tab]');
  pkgTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      pkgTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const targetTab = tab.getAttribute('data-pkg-tab');
      document.querySelectorAll('.pkg-category-panel').forEach(panel => {
        if (panel.id === `tab-panel-${targetTab}`) {
          panel.style.display = 'block';
          panel.classList.add('active');
        } else {
          panel.style.display = 'none';
          panel.classList.remove('active');
        }
      });
    });
  });

  // 5. Image Lightbox for High-Resolution Photo Viewing
  const imageLightbox = document.getElementById('image-lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close-btn');

  function openImageLightbox(src, caption) {
    if (imageLightbox && lightboxImg) {
      lightboxImg.src = src;
      lightboxImg.alt = caption || 'Wedding Photograph';
      if (lightboxCaption) lightboxCaption.textContent = caption || '';
      imageLightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeImageLightbox() {
    if (imageLightbox) {
      imageLightbox.classList.remove('active');
      if (lightboxImg) lightboxImg.src = '';
      document.body.style.overflow = '';
    }
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const fullSrc = item.getAttribute('data-full-src') || item.querySelector('img')?.src;
      const caption = item.getAttribute('data-caption') || item.querySelector('.gallery-title')?.textContent;
      if (fullSrc) openImageLightbox(fullSrc, caption);
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const fullSrc = item.getAttribute('data-full-src') || item.querySelector('img')?.src;
        const caption = item.getAttribute('data-caption') || item.querySelector('.gallery-title')?.textContent;
        if (fullSrc) openImageLightbox(fullSrc, caption);
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeImageLightbox);
  }

  if (imageLightbox) {
    imageLightbox.addEventListener('click', (e) => {
      if (e.target === imageLightbox) closeImageLightbox();
    });
  }

  // 6. Video Film Preview Modal
  const videoCards = document.querySelectorAll('.film-card');
  const videoModal = document.getElementById('video-modal');
  const modalFilmTitle = document.getElementById('modal-film-title');
  const modalFilmDesc = document.getElementById('modal-film-desc');
  const modalWhatsappCta = document.getElementById('modal-whatsapp-cta');
  const modalCloseBtn = videoModal ? videoModal.querySelector('.modal-close-btn') : null;

  const filmDatabase = {
    'film-1': {
      title: 'Belvedere Celebration — Ahmedabad, Gujarat',
      desc: 'Three days of vibrant Mandva Muhurat, high-voltage Dodhiya Garba night, and sunset Hasta Melap under golden temple bells.'
    },
    'film-2': {
      title: 'Lakeside Heritage Romance — Surat to Udaipur',
      desc: 'Opulent lakeside celebrations with Shehnai melodies, traditional silver procession, and emotional Mosalu ceremony honoring maternal roots.'
    },
    'film-3': {
      title: 'Baroda Haveli Symphony — Vadodara, Gujarat',
      desc: 'Grandmother’s tearful blessings, soulful Vedic mantras, and authentic Gujarati traditions captured with warm analog cinematic tones.'
    },
    'film-4': {
      title: 'Saurashtra Traditions — Rajkot & Saurashtra',
      desc: 'Royal Kathiyawadi warmth, silver jewellery, live folk singers, playful nose-pulling during Ponkvu, and an emotional Vidaai.'
    }
  };

  function openVideoModal(filmId) {
    const film = filmDatabase[filmId] || filmDatabase['film-1'];
    if (modalFilmTitle) modalFilmTitle.textContent = film.title;
    if (modalFilmDesc) modalFilmDesc.textContent = film.desc;
    if (modalWhatsappCta) {
      const msg = encodeURIComponent(`Hello Anant Productions! I am interested in viewing sample films like "${film.title}". Could you please share the preview links?`);
      const phoneRaw = config?.business?.phoneRaw || '918000088819';
      modalWhatsappCta.href = `https://wa.me/${phoneRaw}?text=${msg}`;
    }
    if (videoModal) {
      videoModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeVideoModal() {
    if (videoModal) {
      videoModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  videoCards.forEach(card => {
    card.addEventListener('click', () => {
      openVideoModal(card.getAttribute('data-film-id'));
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openVideoModal(card.getAttribute('data-film-id'));
      }
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeVideoModal);
  }

  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeVideoModal();
    });
  }

  // Global ESC key listener for modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (imageLightbox && imageLightbox.classList.contains('active')) closeImageLightbox();
      if (videoModal && videoModal.classList.contains('active')) closeVideoModal();
      if (mobileDrawer && mobileDrawer.classList.contains('active')) closeMobileDrawer();
    }
  });

  // 7. Accessible FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close all
        faqItems.forEach(i => {
          i.classList.remove('active');
          const btn = i.querySelector('.faq-question');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
        // Toggle current
        if (!isActive) {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // 8. Celebration Functions Selector Pills
  const functionPills = document.querySelectorAll('.function-pill');
  functionPills.forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('selected');
    });
  });

  // 9. Wedding Date "Not Yet Finalized" Toggle
  const dateInput = document.getElementById('form-date');
  const dateFlexibleCheckbox = document.getElementById('form-date-flexible');

  if (dateFlexibleCheckbox && dateInput) {
    dateFlexibleCheckbox.addEventListener('change', () => {
      if (dateFlexibleCheckbox.checked) {
        dateInput.value = '';
        dateInput.placeholder = 'e.g. Discussing winter 2026/2027 muhurat…';
        dateInput.removeAttribute('required');
      } else {
        dateInput.placeholder = 'e.g. 14–15 Dec 2026…';
        dateInput.setAttribute('required', 'required');
      }
    });
  }

  // 10. High-Converting Wedding Enquiry Submission to WhatsApp
  const bookingForm = document.getElementById('wedding-inquiry-form');
  const feedbackBox = document.getElementById('form-feedback');
  const feedbackDirectLink = document.getElementById('feedback-direct-link');

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const names = document.getElementById('form-names')?.value.trim() || '';
      const phone = document.getElementById('form-phone')?.value.trim() || '';
      const isDateFlexible = dateFlexibleCheckbox?.checked;
      let dateVal = dateInput?.value.trim() || '';
      if (isDateFlexible && !dateVal) {
        dateVal = 'Date not yet finalized (Consulting family Panditji)';
      }
      const city = document.getElementById('form-city')?.value.trim() || '';
      const days = document.getElementById('form-days')?.value || '';
      const service = document.getElementById('form-service')?.value || '';
      const budget = document.getElementById('form-budget')?.value || '';
      const notes = document.getElementById('form-details')?.value.trim() || '';

      // Gather selected functions
      const selectedFns = [];
      document.querySelectorAll('.function-pill.selected').forEach(p => {
        selectedFns.push(p.getAttribute('data-fn'));
      });

      // Basic validation
      if (!names) {
        alert('Please enter your name or couple names.');
        document.getElementById('form-names')?.focus();
        return;
      }
      if (!phone) {
        alert('Please enter your WhatsApp contact number.');
        document.getElementById('form-phone')?.focus();
        return;
      }
      if (!isDateFlexible && !dateVal) {
        alert('Please enter your wedding date or check "Date not yet finalized".');
        dateInput?.focus();
        return;
      }
      if (!city) {
        alert('Please enter your wedding city or venue.');
        document.getElementById('form-city')?.focus();
        return;
      }

      // Construct respectful, clean WhatsApp message
      const waMessageText = 
        `Jai Shree Krishna / Hello Anant Productions Team,\n\n` +
        `We would love to check date availability and receive a customized package quotation for our wedding:\n\n` +
        `• Couple / Family Names: ${names}\n` +
        `• WhatsApp Number: ${phone}\n` +
        `• Wedding Dates: ${dateVal}\n` +
        `• City / Venue: ${city}\n` +
        `• Celebration Duration: ${days}\n` +
        `• Service Interested In: ${service}\n` +
        (selectedFns.length > 0 ? `• Functions to Cover: ${selectedFns.join(', ')}\n` : '') +
        (budget ? `• Approximate Budget: ${budget}\n` : '') +
        (notes ? `• Special Notes / Vision: ${notes}\n\n` : '\n') +
        `Please let us know your calendar availability and the next steps. Thank you!`;

      const phoneRaw = config?.business?.phoneRaw || '918000088819';
      const encodedWaUrl = `https://wa.me/${phoneRaw}?text=${encodeURIComponent(waMessageText)}`;

      // Show friendly on-page confirmation
      if (feedbackBox) {
        feedbackBox.style.display = 'block';
        if (feedbackDirectLink) feedbackDirectLink.href = encodedWaUrl;
      }

      // Open WhatsApp directly
      const waWindow = window.open(encodedWaUrl, '_blank');
      if (!waWindow || waWindow.closed || typeof waWindow.closed === 'undefined') {
        // Fallback if popup blocked: navigate directly
        window.location.href = encodedWaUrl;
      }
    });
  }
});
