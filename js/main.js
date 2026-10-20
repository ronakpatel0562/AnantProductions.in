/**
 * ANANT PRODUCTIONS — LUXURY CINEMATOGRAPHY & FINE-ART PHOTOGRAPHY
 * Interactive Engine: Gujarati & Pan-India Wedding Calculator, Video Lightbox,
 * Gallery Filtering, FAQs & Royal Soundscape.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Navbar Sticky & Scroll Effects
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const mobileClose = document.querySelector('.mobile-drawer-close');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.add('active');
    });
  }

  if (mobileClose && mobileDrawer) {
    mobileClose.addEventListener('click', () => {
      mobileDrawer.classList.remove('active');
    });
  }

  // 2. Interactive Gujarat & Pan-India Package Investment Calculator
  const locationBtns = document.querySelectorAll('[data-calc="location"]');
  const daysBtns = document.querySelectorAll('[data-calc="days"]');
  const addOnCheckboxes = document.querySelectorAll('[data-calc="addon"]');
  const calcCityDisplay = document.getElementById('calc-city-display');
  const calcDaysDisplay = document.getElementById('calc-days-display');
  const calcAddonsDisplay = document.getElementById('calc-addons-display');
  const calcTotalDisplay = document.getElementById('calc-total-display');
  const calcWhatsappBtn = document.getElementById('calc-whatsapp-btn');

  // Pricing Model (INR)
  const locationRates = {
    'ahmedabad': { name: 'Ahmedabad / Gandhinagar', base: 120000, travelFee: 0 },
    'surat': { name: 'Surat & South Gujarat', base: 135000, travelFee: 15000 },
    'vadodara': { name: 'Vadodara (Laxmi Vilas / Estates)', base: 130000, travelFee: 10000 },
    'rajkot': { name: 'Rajkot & Saurashtra Region', base: 135000, travelFee: 15000 },
    'udaipur': { name: 'Rajasthan Destination (Udaipur/Jaipur)', base: 180000, travelFee: 40000 },
    'goa': { name: 'Goa & Other Pan-India Destination', base: 195000, travelFee: 45000 }
  };

  const daysMultipliers = {
    '1': { label: '1 Day Intimate Celebration', factor: 1 },
    '2': { label: '2 Days (Garba + Wedding)', factor: 1.6 },
    '3': { label: '3 Days (Mandva/Pithi + Garba + Wedding + Reception)', factor: 2.2 },
    '4': { label: '4+ Days Grand Royal Extravaganza', factor: 2.8 }
  };

  let selectedLocation = 'ahmedabad';
  let selectedDays = '3'; // Default to 3-day typical Gujarati wedding

  function updateCalculator() {
    const locInfo = locationRates[selectedLocation] || locationRates['ahmedabad'];
    const daysInfo = daysMultipliers[selectedDays] || daysMultipliers['3'];

    // Base calculation
    const baseAmount = Math.round(locInfo.base * daysInfo.factor);

    // Add-ons calculation
    let addonsTotal = 0;
    const selectedAddonNames = [];

    addOnCheckboxes.forEach(cb => {
      if (cb.checked) {
        const price = parseInt(cb.getAttribute('data-price'), 10) || 0;
        addonsTotal += price;
        selectedAddonNames.push(cb.getAttribute('data-name'));
      }
    });

    const grandTotal = baseAmount + addonsTotal + locInfo.travelFee;

    // Format in Indian currency notation (e.g. ₹2,75,000)
    const formattedTotal = '₹' + grandTotal.toLocaleString('en-IN');

    if (calcCityDisplay) calcCityDisplay.textContent = locInfo.name;
    if (calcDaysDisplay) calcDaysDisplay.textContent = daysInfo.label;
    if (calcAddonsDisplay) {
      calcAddonsDisplay.textContent = selectedAddonNames.length > 0 
        ? `${selectedAddonNames.length} selected (+₹${addonsTotal.toLocaleString('en-IN')})` 
        : 'None selected';
    }
    if (calcTotalDisplay) calcTotalDisplay.textContent = formattedTotal;

    // Update WhatsApp Inquiry Link
    if (calcWhatsappBtn) {
      const waMsg = encodeURIComponent(
        `Jai Shree Krishna / Namaste Anant Productions Team!\n\nI just customized a wedding photography & cinematography estimate on your website:\n` +
        `• Destination: ${locInfo.name}\n` +
        `• Schedule: ${daysInfo.label}\n` +
        `• Custom Add-ons: ${selectedAddonNames.length > 0 ? selectedAddonNames.join(', ') : 'Standard Complete Film Package'}\n` +
        `• Estimated Investment: ${formattedTotal}\n\n` +
        `Please let me know your availability for our wedding dates. We would love to discuss further!`
      );
      calcWhatsappBtn.href = `https://wa.me/919879000000?text=${waMsg}`;
    }
  }

  // Location selector handlers
  locationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      locationBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedLocation = btn.getAttribute('data-val');
      updateCalculator();
    });
  });

  // Days selector handlers
  daysBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      daysBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedDays = btn.getAttribute('data-val');
      updateCalculator();
    });
  });

  // Add-on checkboxes
  addOnCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateCalculator);
  });

  // Initial Calculation Run
  updateCalculator();

  // 3. Portfolio Gallery Category Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const itemCat = item.getAttribute('data-category');
        if (filterValue === 'all' || itemCat === filterValue) {
          item.style.display = 'block';
          item.style.animation = 'fadeIn 0.4s ease';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // 4. Video Player Modal Lightbox
  const videoCards = document.querySelectorAll('.film-card');
  const modalBackdrop = document.getElementById('video-modal');
  const modalIframe = document.getElementById('modal-video-frame');
  const modalTitle = document.getElementById('modal-film-title');
  const modalDetails = document.getElementById('modal-film-desc');
  const modalCloseBtn = document.querySelector('.modal-close-btn');

  const filmDatabase = {
    'film-1': {
      title: 'Aastha & Parth — The Royal Belvedere Symphony, Ahmedabad',
      desc: 'Three days of vibrant Mandva Muhurat, high-voltage Dodhiya Garba night, and sunset Hasta Melap under golden temple bells.',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'
    },
    'film-2': {
      title: 'Dhwani & Harsh — From the Riverbanks of Surat to The Leela, Udaipur',
      desc: 'A grand Kathiyawadi & Diamond Merchant celebration with 1400 guests, live royal dhol, and palatial fireworks.',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'
    },
    'film-3': {
      title: 'Maitri & Bhavin — Intimate Heritage Haveli Rites, Vadodara',
      desc: 'Tears of joy during Mameru, heartfelt Kanku Pagla, and authentic Gujarati traditions captured with soulful cinematic restraint.',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'
    },
    'film-4': {
      title: 'Priyanshi & Yash — Royal Rajputana & Saurashtra Grandeur, Rajkot to Jaipur',
      desc: 'A magnificent fusion of Kathiyawadi royal warmth and royal palace aesthetics, celebrating lifelong love and extended family bonds.',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'
    }
  };

  videoCards.forEach(card => {
    card.addEventListener('click', () => {
      const filmKey = card.getAttribute('data-film-id');
      const film = filmDatabase[filmKey] || filmDatabase['film-1'];

      if (modalTitle) modalTitle.textContent = film.title;
      if (modalDetails) modalDetails.textContent = film.desc;
      if (modalIframe) {
        // Fallback demo reel video or embed
        modalIframe.src = film.embedUrl;
      }
      if (modalBackdrop) modalBackdrop.classList.add('active');
    });
  });

  if (modalCloseBtn && modalBackdrop) {
    modalCloseBtn.addEventListener('click', () => {
      modalBackdrop.classList.remove('active');
      if (modalIframe) modalIframe.src = '';
    });

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        modalBackdrop.classList.remove('active');
        if (modalIframe) modalIframe.src = '';
      }
    });
  }

  // 5. FAQ Accordion Toggle
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // 6. Direct Contact Form Submission to WhatsApp / Notification
  const bookingForm = document.getElementById('wedding-inquiry-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const brideGroom = document.getElementById('form-names').value;
      const phone = document.getElementById('form-phone').value;
      const date = document.getElementById('form-date').value;
      const venueCity = document.getElementById('form-city').value;
      const eventDetails = document.getElementById('form-details').value;

      const whatsappText = encodeURIComponent(
        `Jai Shree Krishna / Hello Anant Productions,\n\n` +
        `New Wedding Booking Inquiry from Website:\n` +
        `• Couple Names: ${brideGroom}\n` +
        `• Phone/Contact: ${phone}\n` +
        `• Wedding Dates: ${date}\n` +
        `• City/Venues: ${venueCity}\n` +
        `• Functions & Notes: ${eventDetails}\n\n` +
        `Please confirm your availability and share next steps!`
      );

      // Open WhatsApp with populated form details
      window.open(`https://wa.me/919879000000?text=${whatsappText}`, '_blank');

      alert(`Aum Shree Ganeshay Namah! Thank you ${brideGroom}. Your inquiry is being sent directly to our director on WhatsApp. We will connect with you within a few hours!`);
    });
  }

  // 7. Ambient Royal Audio Soundscape (Web Audio API Synthesizer)
  // Generates a soft, majestic royal tanpura / sitar harmonic drone when user clicks the music toggle
  const audioToggle = document.getElementById('ambient-audio-toggle');
  let audioCtx = null;
  let isPlaying = false;
  let oscillators = [];

  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      if (!isPlaying) {
        try {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          
          // Royal Indian Sa-Pa meditative drone chord (frequencies for D Indian scale: D3 146.8Hz, A3 220Hz, D4 293.6Hz)
          const freqs = [146.83, 220.00, 293.66, 440.00];
          const masterGain = audioCtx.createGain();
          masterGain.gain.setValueAtTime(0.04, audioCtx.currentTime); // Gentle soothing volume
          masterGain.connect(audioCtx.destination);

          oscillators = freqs.map((f, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(f, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.4 / (idx + 1), audioCtx.currentTime);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start();
            return osc;
          });

          isPlaying = true;
          audioToggle.innerHTML = '🎵 <span style="font-size:0.65rem; margin-left:4px;">Pause</span>';
          audioToggle.setAttribute('title', 'Pause Royal Ambiance');
          audioToggle.style.borderColor = '#D4AF37';
        } catch (err) {
          console.log('Audio init prevented:', err);
        }
      } else {
        if (oscillators.length > 0) {
          oscillators.forEach(osc => osc.stop());
          oscillators = [];
        }
        if (audioCtx) {
          audioCtx.close();
          audioCtx = null;
        }
        isPlaying = false;
        audioToggle.innerHTML = '🪕 <span style="font-size:0.65rem; margin-left:4px;">Sound</span>';
        audioToggle.setAttribute('title', 'Play Royal Indian Wedding Ambiance');
        audioToggle.style.borderColor = 'rgba(212, 175, 55, 0.22)';
      }
    });
  }
});
