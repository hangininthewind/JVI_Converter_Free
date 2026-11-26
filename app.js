(() => {
  const $ = (id) => document.getElementById(id);
  const FAST = new URLSearchParams(location.search).has('fast'); // for testing only
  const T = (ms) => (FAST ? ms / 20 : ms);
  const sleep = (ms) => new Promise((r) => setTimeout(r, T(ms)));
  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const show = (el) => el.classList.remove('hidden');
  const hide = (el) => el.classList.add('hidden');

  // ---------- Startup splash ----------
  const TIPS = [
    'Preparing your personal experience',
    'Hint: Did you know you can convert multiple images at once using the JVI Batch Converter?',
    "Did you know: Batched images are compressed as a .JVZ file, which can be unzipped with your device's native extraction tools.",
    'Optimizing JVI codecs for your specific face…',
    'Tip: PRO members get HD JVI, up to 4K (results may vary).',
    'Loading ads you will love…',
  ];
  async function runSplash() {
    const tip = $('splash-tip');
    const order = [TIPS[0], ...TIPS.slice(1).sort(() => Math.random() - 0.5).slice(0, 2)];
    for (const t of order) {
      tip.style.opacity = 0;
      await sleep(250);
      tip.textContent = t;
      tip.style.opacity = 1;
      await sleep(2300);
    }
    hide($('splash'));
    show($('app'));
    setTimeout(() => openPaywall('JVI PRO', true), T(1800)); // classic welcome nag
  }

  // ---------- Fake ads ----------
  const ADS = [
    { e: '🦝', h: 'HOT SINGLE RACCOONS in your area', s: 'They want to go through your trash. Tonight.', c: 'Meet Them' },
    { e: '🍣', h: 'Gas Station Sushi', s: 'Now with 40% fewer regrets. Open 24 hours, unfortunately.', c: 'Eat Bravely' },
    { e: '🧔', h: 'Doctors HATE him!', s: 'Local man discovers one weird trick. (He showers now.)', c: 'Learn the Trick' },
    { e: '⚖️', h: 'Divorce Lawyers Near You', s: 'First consult free. Second also free. Third one we keep the dog.', c: 'Get Free' },
    { e: '🍇', h: "Uncle Gary's Off-Brand Vitality Pills", s: 'Now in Grape. Not FDA approved, but FDA aware.', c: 'Ask Gary' },
    { e: '📱', h: 'FREE iPhone 6!!', s: 'Screen, battery, and phone not included. Box included.', c: 'Claim Box' },
    { e: '🩲', h: 'Pre-Owned Underwear', s: 'Gently used. Lovingly folded. Smells like adventure.', c: 'Shop Now' },
    { e: '🦶', h: 'Is Your Foot Fungus Lonely?', s: 'Introduce it to friends with FungalFriends™ Social Network.', c: 'Join Free' },
    { e: '🪦', h: 'Pre-Need Funeral Plans', s: 'Lock in today’s low casket prices. You’re not getting any younger. Or prettier.', c: 'Plan Ahead' },
    { e: '🧀', h: 'Cheese You Can Eat In The Shower', s: 'Why not? Name one reason. You can’t.', c: 'Lather Up' },
  ];
  function adHTML(a, big) {
    if (!big) return `<b>${a.e} ${a.h}</b>${a.s}`;
    return `<div class="inter-emoji">${a.e}</div><div class="inter-head">${a.h}</div><div class="inter-sub">${a.s}</div><div class="inter-cta">${a.c} ›</div>`;
  }
  let lastAd = -1;
  function nextAd() { let i; do { i = Math.floor(Math.random() * ADS.length); } while (i === lastAd); lastAd = i; return ADS[i]; }
  function rotateBanner() { $('banner-body').innerHTML = adHTML(nextAd(), false); }
  rotateBanner();
  setInterval(rotateBanner, 7000);
  $('banner-body').addEventListener('click', () => toast('This ad is not clickable on the Free plan.'));

  async function showInterstitial() {
    const box = $('interstitial');
    $('inter-body').innerHTML = adHTML(nextAd(), true);
    const skip = $('inter-skip');
    skip.disabled = true;
    show(box);
    for (let s = 5; s > 0; s--) { skip.textContent = `Skip ad in ${s}`; await sleep(1000); }
    skip.textContent = 'Skip ad ›';
    skip.disabled = false;
    await new Promise((r) => (skip.onclick = r));
    hide(box);
  }
  $('inter-body').addEventListener('click', () => toast('Opening offer… just kidding. Upgrade to PRO to click ads.'));

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg) {
    const t = $('toast'); t.textContent = msg; show(t);
    clearTimeout(toastTimer); toastTimer = setTimeout(() => hide(t), 2600);
  }

  // ---------- Paywall ----------
  function openPaywall(feature, welcome) {
    const title = document.querySelector('.pay-title');
    title.innerHTML = welcome
      ? 'Welcome! Try <span class="gold">JVI PRO</span> free for 2 days'
      : `<span>${feature}</span> is a <span class="gold">PRO</span> feature`;
    const x = $('pay-x'), later = $('pay-later');
    hide(x); hide(later);
    show($('paywall'));
    setTimeout(() => show(x), T(3000));      // the close button "loads" slowly
    setTimeout(() => show(later), T(4500));
  }
  const closePaywall = () => hide($('paywall'));
  $('pay-x').onclick = closePaywall;
  $('pay-later').onclick = () => { closePaywall(); toast('Noted. We are disappointed, but not surprised.'); };
  document.addEventListener('click', (e) => {
    const pw = e.target.closest('[data-paywall]');
    if (pw) { e.stopPropagation(); openPaywall(pw.dataset.paywall); return; }
    const pt = e.target.closest('[data-patreon]');
    if (pt) { e.stopPropagation(); openPatreon(); }
  });

  // ---------- Patreon nonsense ----------
  const PATREON_FAILS = [
    ['Subscribing requires PRO', 'To subscribe to PRO, you must first be a PRO subscriber. Please subscribe to PRO to continue.'],
    ['Our Patreon is temporarily on vacation', 'It will be back once we can afford the gas money. Consider paying our rent.'],
    ['Payment method not accepted', "We detected you are not holding a Diner's Club card or Apple Store gift card. Please find one and try again."],
    ['Bitcoin wallet not found', 'Please write your seed phrase on a napkin and keep it somewhere safe. Do not send it to us. We mean it.'],
  ];
  async function openPatreon() {
    closePaywall();
    const [t, m] = rand(PATREON_FAILS);
    $('patreon-title').textContent = 'Connecting to Patreon…';
    $('patreon-msg').textContent = '';
    show($('patreon-spin')); hide($('patreon-close'));
    show($('patreon'));
    await sleep(2200);
    hide($('patreon-spin'));
    $('patreon-title').textContent = t;
    $('patreon-msg').textContent = m;
    show($('patreon-close'));
  }
  $('patreon-close').onclick = () => hide($('patreon'));

  // ---------- Pay our rent ----------
  $('rent-open').onclick = () => { show($('rent')); $('rent').scrollTop = 0; };
  $('rent-x').onclick = () => hide($('rent'));
  $('rent-no').onclick = () => { hide($('rent')); toast('We will remember this.'); };

  // ---------- Choose file ----------
  const fileInput = $('file');
  $('choose').onclick = () => fileInput.click();
  $('dropzone').onclick = () => fileInput.click();
  fileInput.onchange = () => {
    const f = fileInput.files[0];
    if (!f) return;
    const prev = $('preview');
    prev.src = URL.createObjectURL(f);
    show(prev); hide($('dz-empty'));
    $('convert').disabled = false;
  };

  // ---------- Convert ----------
  const STATUSES = [
    'Initializing JVI engine…', 'Reticulating pixels…', 'Calibrating JVI matrix…', 'Removing unnecessary colors…',
    'Consulting the JVI elders…', 'Compressing vibes…', 'Applying proprietary JVI-ness…', 'Asking the server nicely…',
    'Reversing the polarity…', 'Downloading more RAM…', 'Almost there (legally)…', 'Finalizing .JVI headers…',
  ];
  let images = [];
  fetch('images/list.json', { cache: 'no-store' }).then((r) => r.json()).then((l) => (images = l)).catch(() => {});

  async function pickImage() {
    if (!images.length) images = await fetch('images/list.json').then((r) => r.json());
    const name = rand(images);
    const blob = await fetch('images/' + encodeURIComponent(name)).then((r) => r.blob());
    return { name, blob };
  }

  let output = null;
  $('convert').onclick = async () => {
    const ov = $('converting');
    const fill = $('bar-fill'), pct = $('pct'), ring = document.querySelector('.ring'), status = $('conv-status');
    show(ov);
    const picked = pickImage(); // fetch in background
    const total = T(10000 + Math.random() * 5000); // 10–15 seconds
    const start = performance.now();
    let statusIdx = 0, nextStatusAt = 0;
    const order = STATUSES.slice(1).sort(() => Math.random() - 0.5);
    status.textContent = STATUSES[0];
    await new Promise((resolve) => {
      function frame(now) {
        const t = Math.min(1, (now - start) / total);
        // uneven progress: fast start, a long stall at 99%
        let p = t < 0.85 ? Math.pow(t / 0.85, 0.8) * 99 : 99;
        if (t >= 1) p = 100;
        const shown = Math.floor(p);
        fill.style.width = shown + '%';
        pct.textContent = shown + '%';
        ring.style.setProperty('--p', shown + '%');
        if (now - start > nextStatusAt && statusIdx < order.length) {
          status.textContent = t > 0.85 ? 'Finalizing .JVI headers… (this is normal)' : order[statusIdx++];
          nextStatusAt += T(1400);
        }
        if (t < 1) requestAnimationFrame(frame); else resolve();
      }
      requestAnimationFrame(frame);
    });
    await sleep(400);
    hide(ov);
    const { blob } = await picked;
    await showInterstitial();
    const num = String(Math.floor(Math.random() * 9000) + 1000);
    const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    output = { blob, display: `IMG_JVI_${num}.JVI`, file: `IMG_JVI_${num}.${ext}` };
    $('result-img').src = URL.createObjectURL(blob);
    $('result-name').textContent = output.display;
    show($('result'));
  };

  // ---------- Download ----------
  $('download').onclick = async () => {
    if (!output) return;
    const file = new File([output.blob], output.file, { type: output.blob.type || 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file] }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file); a.download = file.name;
    document.body.appendChild(a); a.click(); a.remove();
    toast('Tip: long-press the image to Save to Photos.');
  };
  $('again').onclick = () => {
    hide($('result'));
    fileInput.value = '';
    hide($('preview')); show($('dz-empty'));
    $('convert').disabled = true;
    setTimeout(() => openPaywall('.JVI Batch Converter'), T(600));
  };

  runSplash();
})();
