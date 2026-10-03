/**
 * MEN'S HEALTH & LOOKSMAXXING - APPLICATION CONTROLLER
 * Manages checklists, overall ascension progress, tier calculation,
 * mascot speech/routines, audio effects, and modal image zoom.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize 3D Penguin Mascot
  let penguin = null;
  if (window.Penguin3D) {
    penguin = new window.Penguin3D('penguin-canvas');
  }

  // Audio SFX state
  let soundEnabled = true;
  const audioBtn = document.getElementById('toggle-sound-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (penguin) penguin.audioEnabled = soundEnabled;
      audioBtn.innerHTML = soundEnabled ? '🔊' : '🔇';
      audioBtn.title = soundEnabled ? 'Mute Sounds' : 'Unmute Sounds';
    });
  }

  // Master Checklist & Progress System
  const checklists = {
    hair: [
      { id: 'h1', text: 'Wash scalp only with sulfate-free shampoo in circular motions (pads of fingers)', sub: 'Never scratch with nails; let foam rinse down lengths naturally.' },
      { id: 'h2', text: 'Apply nourishing conditioner exclusively to mid-lengths & ends', sub: 'Leave for 2-3 mins, then finish with a cold water rinse for maximum cuticle shine.' },
      { id: 'h3', text: 'Pat dry gently with 100% cotton tee or microfiber towel', sub: 'Strictly avoid rough towel rubbing which snaps keratin bonds.' },
      { id: 'h4', text: 'Detangle with a Wide-Tooth Wooden Neem Comb while damp', sub: 'Start at the bottom tips and work upwards to prevent breakage.' },
      { id: 'h5', text: 'Apply scalp serum (Rosemary oil / Peppermint / Minoxidil)', sub: 'Increases dermal papilla microcirculation and prolongs anagen growth phase.' },
      { id: 'h6', text: 'Consume daily hair growth superfoods (Eggs, Salmon, Pumpkin Seeds)', sub: 'Supplies essential Biotin, Zinc, Omega-3s, and Collagen building blocks.' },
      { id: 'h7', text: 'Wear protective silk cap or bandana in dusty/sunny environments', sub: 'Shields scalp from oxidative stress, UV damage, and airborne particulates.' }
    ],
    skin: [
      { id: 's1', text: 'AM: Gentle pH-balanced foaming cleanser with lukewarm water', sub: 'Removes overnight sebum without compromising your acid mantle barrier.' },
      { id: 's2', text: 'AM: Apply 15% Vitamin C serum on dry skin for antioxidant defense', sub: 'Fights free radicals, brightens hyperpigmentation, and promotes collagen.' },
      { id: 's3', text: 'AM: Broad-Spectrum SPF 50+ PA++++ Sunscreen (Non-Negotiable)', sub: 'Prevents 90% of premature facial aging, UV collagen breakdown, and spots.' },
      { id: 's4', text: 'PM: Double cleanse if exposed to dust, sweat, or heavy SPF', sub: 'Micellar water / cleansing oil followed by water-based cleanser.' },
      { id: 's5', text: 'PM: 2x Weekly 0.05% Retinoid or 2% BHA Salicylic Exfoliant', sub: 'Accelerates cellular turnover, unclogs pores, and refines texture.' },
      { id: 's6', text: 'PM: Ceramide & Hyaluronic Acid barrier repair moisturizer', sub: 'Locks in deep transepidermal moisture overnight.' },
      { id: 's7', text: 'Morning Ice Roller / Gua Sha lymphatic drainage on jawline', sub: 'Depuffs facial bloating, defines mandibular line, and drains stagnant lymph.' }
    ],
    nails: [
      { id: 'n1', text: 'Trim fingernails straight across with slightly rounded edges', sub: 'Prevents painful ingrown corners and structural weakness.' },
      { id: 'n2', text: 'Smooth edges in ONE direction using a Czech Glass Nail File', sub: 'Seals keratin plates together; never saw back-and-forth.' },
      { id: 'n3', text: 'Gently push back cuticles after warm shower (never cut live tissue)', sub: 'Creates a clean, elongated nail bed appearance.' },
      { id: 'n4', text: 'Scrub underneath free edge daily with dedicated nail brush & soap', sub: 'Eliminates trapped bacteria, grease, and dark dirt lines.' },
      { id: 'n5', text: 'Massage pure Jojoba / Vitamin E oil into cuticles & nail plate', sub: 'Prevents hangnails, brittleness, and longitudinal ridges.' }
    ],
    teeth: [
      { id: 't1', text: 'Brush 2 full minutes at 45° angle to gumline (Modified Bass technique)', sub: 'Gently sweeps plaque out of the gingival sulcus without gum recession.' },
      { id: 't2', text: 'Scrape tongue 5-7 times back-to-front with Pure Copper / Steel scraper', sub: 'Eliminates 90% of volatile sulfur compounds causing bad breath.' },
      { id: 't3', text: 'Floss between every contact point or use an orthodontic Water Flosser', sub: 'Removes interproximal plaque that toothbrushes cannot physically reach.' },
      { id: 't4', text: 'Use Nano-Hydroxyapatite (nHAp) toothpaste to remineralize enamel', sub: 'Restores micro-defects in tooth enamel naturally, eliminating sensitivity.' },
      { id: 't5', text: 'Practice 24/7 Mewing: Entire tongue suctioned to palate with sealed lips', sub: 'Guides forward facial maxilla growth, sharpens jawline, and prevents mouth breathing.' },
      { id: 't6', text: 'Use gentle porous mouth tape during sleep for pure nasal breathing', sub: 'Increases nitric oxide intake, prevents dry mouth cavities, and sharpens gonial angle.' }
    ],
    bonus: [
      { id: 'b1', text: 'Perform 3 sets of 15 Chin Tucks & Wall Angels for neck posture', sub: 'Reverses tech-neck, forward head posture, and accentuates the jawline profile.' },
      { id: 'b2', text: 'Apply fragrance to warm pulse points (carotid artery, inner elbows)', sub: 'Spray from 6 inches away; NEVER rub wrists together (destroys top scent notes).' },
      { id: 'b3', text: 'Drink 3.5 Liters of water daily with optimal potassium/sodium ratio', sub: 'Flushes facial water retention, reducing cheek puffiness.' },
      { id: 'b4', text: 'Sleep 8 hours on a 100% Mulberry Silk Pillowcase in pitch blackness', sub: 'Zero hair friction damage, zero sleep compression wrinkles, maximal GH release.' }
    ]
  };

  // State
  let completedItems = JSON.parse(localStorage.getItem('looksmaxxing_checklist_v1') || '{}');

  // Mascot Speech Script Database
  const mascotScripts = {
    shampoo: {
      tag: '🫧 SHAMPOO & HAIR CARE DEMO',
      text: 'Listen up, kings! First, wet hair thoroughly with lukewarm water to open the cuticles. Emulsify shampoo between your palms FIRST, then massage ONLY into the scalp using circular motions with the pads of your fingers. NEVER scratch with fingernails! Let the lather naturally cascade down your ends. Finish with cold water to seal the hair shaft for diamond shine!',
      mode: 'shampoo',
      status: 'Mascot Mode: Shampooing & Scalp Massage'
    },
    skin: {
      tag: '🧴 SKINCARE & GLOW DEMO',
      text: 'Glass skin is built on consistency! Cleanse gently with pH 5.5 foam, pat Vitamin C serum onto dry skin, follow with a lightweight ceramide moisturizer, and finish with Broad-Spectrum SPF 50+. Pat products gently into your skin—never drag or stretch your facial tissue! Use an ice roller along your jawline to depuff.',
      mode: 'skin',
      status: 'Mascot Mode: Hydrating Skincare Routine'
    },
    nail: {
      tag: '💅 NAIL PRECISION DEMO',
      text: 'Well-groomed hands speak before you do! Cut nails straight across with soft rounded corners. Always use a crystal glass nail file in ONE single direction to seal keratin layers. After a warm shower, gently push back cuticles with a wooden stick and seal with a drop of cold-pressed jojoba oil!',
      mode: 'nail',
      status: 'Mascot Mode: Precision Nail Grooming'
    },
    teeth: {
      tag: '🪥 ORAL & MEWING DEMO',
      text: 'A clean smile and sharp jawline go hand in hand! Hold your brush at a 45-degree angle targeting the gumline for 2 minutes. Use a pure copper scraper on your tongue every morning. Most importantly: keep your ENTIRE tongue suctioned to the roof of your mouth 24/7 with closed lips—nasal breathing is the ultimate craniofacial hack!',
      mode: 'teeth',
      status: 'Mascot Mode: Teeth & Mewing Masterclass'
    },
    dance: {
      tag: '🎉 ASCENSION CELEBRATION',
      text: 'WOOO! Look at you ascending! Your hair, skin, nails, and jawline are in peak form! Keep this discipline up daily and you will unlock that legendary aesthetic tier!',
      mode: 'dance',
      status: 'Mascot Mode: Celebration Dance'
    }
  };

  // Render Checklists into DOM
  function renderChecklists() {
    Object.keys(checklists).forEach(cat => {
      const container = document.getElementById(`${cat}-checklist-container`);
      if (!container) return;

      container.innerHTML = '';
      checklists[cat].forEach(item => {
        const isChecked = !!completedItems[item.id];
        const el = document.createElement('div');
        el.className = `checklist-item ${isChecked ? 'checked' : ''}`;
        el.dataset.id = item.id;
        el.dataset.cat = cat;

        el.innerHTML = `
          <div class="custom-checkbox">✓</div>
          <div class="checklist-text-wrap">
            <div class="checklist-text">${item.text}</div>
            <div class="checklist-subtext">${item.sub}</div>
          </div>
        `;

        el.addEventListener('click', () => toggleChecklistItem(item.id, cat, el));
        container.appendChild(el);
      });

      updateSectionProgress(cat);
    });

    updateMasterProgress();
  }

  // Toggle checklist item
  function toggleChecklistItem(id, cat, el) {
    const isNowChecked = !completedItems[id];
    completedItems[id] = isNowChecked;
    localStorage.setItem('looksmaxxing_checklist_v1', JSON.stringify(completedItems));

    if (isNowChecked) {
      el.classList.add('checked');
      if (penguin) penguin.triggerReaction();
      showFloatingTip(`Awesome work! +1 step completed in ${cat.toUpperCase()}!`);
    } else {
      el.classList.remove('checked');
    }

    updateSectionProgress(cat);
    updateMasterProgress();
  }

  // Update Section Progress Bar
  function updateSectionProgress(cat) {
    const items = checklists[cat];
    if (!items || items.length === 0) return;

    let checkedCount = 0;
    items.forEach(it => {
      if (completedItems[it.id]) checkedCount++;
    });

    const percent = Math.round((checkedCount / items.length) * 100);
    const fillEl = document.getElementById(`${cat}-progress-fill`);
    const labelEl = document.getElementById(`${cat}-progress-label`);

    if (fillEl) fillEl.style.width = `${percent}%`;
    if (labelEl) labelEl.textContent = `${percent}% Completed (${checkedCount}/${items.length})`;
  }

  // Update Master Ascension Progress & Tier
  function updateMasterProgress() {
    let totalItems = 0;
    let totalChecked = 0;

    Object.keys(checklists).forEach(cat => {
      checklists[cat].forEach(it => {
        totalItems++;
        if (completedItems[it.id]) totalChecked++;
      });
    });

    const overallPercent = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;

    // Update Hero & Nav Progress Fill
    const masterFill = document.getElementById('master-progress-fill');
    const masterPercentText = document.getElementById('master-progress-percent');
    const navTierPill = document.getElementById('user-nav-tier');
    const streakCount = document.getElementById('streak-count-text');

    if (masterFill) masterFill.style.width = `${overallPercent}%`;
    if (masterPercentText) masterPercentText.textContent = `${overallPercent}%`;

    // Tier calculation
    let tierName = 'Novice Looksmaxxer';
    let tierIcon = '🌱';
    let tierBadgeClass = 'tier-novice';
    let assessment = 'You have begun your transformation. Follow the hair and skincare protocols daily to see immediate vitality gains!';

    if (overallPercent >= 100) {
      tierName = 'Aesthetic Deity (Chad)';
      tierIcon = '👑';
      assessment = 'Flawless execution! Your hair volume, glass skin, chiseled maxilla, and hygiene routine put you in the top 1% of male aesthetics!';
    } else if (overallPercent >= 75) {
      tierName = 'Chadlite Ascendant';
      tierIcon = '⚡';
      assessment = 'Elite tier discipline! Your grooming regimen is virtually airtight. Keep consistent to lock in permanent genetic expression!';
    } else if (overallPercent >= 45) {
      tierName = 'Aesthetic Novice (Rising)';
      tierIcon = '💎';
      assessment = 'Solid foundation! You are consistently caring for hair and skin. Start incorporating tongue posture (mewing) and clean nail shaping.';
    } else if (overallPercent >= 20) {
      tierName = 'Self-Care Initiate';
      tierIcon = '✨';
      assessment = 'Great start! Focus on mastering the sulfate-free scalp wash and daily SPF 50+ application.';
    }

    if (navTierPill) navTierPill.textContent = tierName;

    // Update Calculator Section
    const calcScoreEl = document.getElementById('calc-score-number');
    const calcTierBadge = document.getElementById('calc-tier-badge');
    const calcTrophy = document.getElementById('calc-trophy-icon');
    const calcDesc = document.getElementById('calc-assessment-text');

    if (calcScoreEl) calcScoreEl.textContent = `${overallPercent}%`;
    if (calcTierBadge) calcTierBadge.textContent = tierName;
    if (calcTrophy) calcTrophy.textContent = tierIcon;
    if (calcDesc) calcDesc.textContent = assessment;
  }

  // Mascot Action Buttons Handler
  const actionButtons = document.querySelectorAll('.penguin-action-btn');
  const speechTag = document.getElementById('mascot-tag');
  const speechText = document.getElementById('mascot-text');
  const statusPill = document.getElementById('penguin-status-pill');

  actionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      actionButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const actionKey = btn.dataset.action;
      const script = mascotScripts[actionKey];
      if (!script) return;

      if (speechTag) speechTag.textContent = script.tag;
      if (speechText) speechText.textContent = script.text;
      if (statusPill) statusPill.innerHTML = `<span>🐧</span> ${script.status}`;

      if (penguin) {
        penguin.setMode(script.mode);
        penguin.triggerReaction();
      }
    });
  });

  // Mascot Viewport Buttons (Rotate Left, Reset, Rotate Right)
  const rotLeftBtn = document.getElementById('btn-rot-left');
  const rotRightBtn = document.getElementById('btn-rot-right');
  const resetBtn = document.getElementById('btn-rot-reset');

  if (rotLeftBtn) {
    rotLeftBtn.addEventListener('click', () => {
      if (penguin) penguin.targetRotY -= 0.6;
    });
  }
  if (rotRightBtn) {
    rotRightBtn.addEventListener('click', () => {
      if (penguin) penguin.targetRotY += 0.6;
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (penguin) {
        penguin.targetRotY = 0;
        penguin.targetRotX = 0;
        penguin.setMode('idle');
      }
      if (speechTag) speechTag.textContent = '🐧 PIP THE GROOMING SENSEI';
      if (speechText) speechText.textContent = 'Welcome brother! Click any routine button to watch me demonstrate the exact motions for shampoo, skincare, nail buffing, and oral mewing posture!';
      if (statusPill) statusPill.innerHTML = '<span>🐧</span> Mascot Mode: Ready & Focused';
    });
  }

  // Floating Corner Mascot Click & Tips
  const floatingBubble = document.getElementById('floating-penguin-btn');
  const floatingSpeech = document.getElementById('floating-speech-pop');

  if (floatingBubble) {
    floatingBubble.addEventListener('click', () => {
      if (penguin) {
        penguin.triggerReaction();
      }
      // Scroll smoothly to mascot stage
      const mascotStage = document.getElementById('mascot-stage');
      if (mascotStage) {
        mascotStage.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  function showFloatingTip(msg) {
    if (!floatingSpeech) return;
    floatingSpeech.textContent = msg;
    floatingSpeech.classList.add('show');
    setTimeout(() => {
      floatingSpeech.classList.remove('show');
    }, 4500);
  }

  // Lightbox Modal for Infographic Zoom
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  document.querySelectorAll('.zoomable-img-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const src = trigger.dataset.imgSrc || trigger.querySelector('img').src;
      if (lightboxModal && lightboxImg) {
        lightboxImg.src = src;
        lightboxModal.classList.add('active');
      }
    });
  });

  if (lightboxClose && lightboxModal) {
    lightboxClose.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
    });

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('active');
      }
    });
  }

  // Smooth Navigation Spy
  const sections = document.querySelectorAll('.looks-section');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      const secTop = sec.offsetTop - 120;
      if (pageYOffset >= secTop) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Initial load
  renderChecklists();
});
