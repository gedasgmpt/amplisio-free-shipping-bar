
(function() {
  const root = document.getElementById('fspb-root');
  if (!root) return;

  // Segmentation (Growth) check
  const countries = (root.dataset.countries || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  const collections = (root.dataset.collections || '').split(',').map(s => s.trim()).filter(Boolean);

  // If restricted by country and we don't know country, show anyway (merchant can add backend later).
  // Collection-based filtering can be approximated by checking meta tags for 'product' pages.
  try {
    if (collections.length > 0) {
      const body = document.body;
      const productHandle = body && body.getAttribute('data-product-handle');
      if (productHandle && !collections.includes(productHandle)) {
        return; // don't render if product not in allowed collections/handles (best-effort)
      }
    }
  } catch (e) {}

  const threshold = parseFloat(root.dataset.threshold || '0') || 0;
  const beforeText = root.dataset.beforeText || 'Spend {{amountRemaining}} more to get Free Shipping.';
  const afterText = root.dataset.afterText || '🎉 You’ve unlocked Free Shipping!';
  const sticky = root.dataset.sticky === 'true';
  const position = root.dataset.position || 'top';
  const bg = root.dataset.bg || '#F3F4F6';
  const fill = root.dataset.fill || '#111827';
  const textColor = root.dataset.textColor || '#111827';
  const height = parseInt(root.dataset.height || '32', 10);
  const radius = parseInt(root.dataset.radius || '12', 10);
  const template = root.dataset.template || 'minimal';

  // Styles
  const barContainer = document.createElement('div');
  const bar = document.createElement('div');
  const label = document.createElement('div');

  // Positioning
  barContainer.style.position = sticky ? 'sticky' : 'relative';
  barContainer.style.zIndex = '2147483646';
  if (position === 'top') {
    barContainer.style.top = '0';
  } else if (position === 'bottom') {
    barContainer.style.bottom = '0';
  }
  barContainer.style.width = '100%';
  barContainer.style.left = '0';
  barContainer.style.right = '0';
  barContainer.style.padding = template === 'banner' ? '8px 12px' : '12px 16px';
  barContainer.style.background = template === 'banner' ? bg : 'transparent';
  barContainer.style.backdropFilter = template === 'glass' ? 'saturate(180%) blur(10px)' : 'none';

  // Progress track
  const track = document.createElement('div');
  track.style.width = '100%';
  track.style.background = bg;
  track.style.borderRadius = radius + 'px';
  track.style.height = height + 'px';
  track.style.overflow = 'hidden';
  track.style.boxShadow = template === 'glass' ? 'inset 0 0 0 1px rgba(255,255,255,0.3)' : 'none';

  // Progress fill
  const progress = document.createElement('div');
  progress.style.width = '0%';
  progress.style.height = '100%';
  progress.style.background = fill;
  progress.style.transition = 'width 200ms ease';

  // Label
  label.style.marginTop = '8px';
  label.style.textAlign = 'center';
  label.style.fontSize = '14px';
  label.style.color = textColor;
  label.style.fontWeight = '500';

  // Pill/compact variants
  if (template === 'pill') {
    track.style.borderRadius = Math.max(height, radius) + 'px';
  }
  if (template === 'compact') {
    barContainer.style.padding = '8px 12px';
    label.style.fontSize = '13px';
  }

  track.appendChild(progress);
  bar.appendChild(track);
  barContainer.appendChild(bar);
  barContainer.appendChild(label);

  if (position === 'cart') {
    // only render on cart templates (best-effort: check URL)
    if (!location.pathname.includes('/cart')) {
      root.style.display = 'none';
      return;
    }
  }

  // Mount to DOM
  const mount = () => {
    if (position === 'top') {
      document.body.insertBefore(barContainer, document.body.firstChild);
    } else if (position === 'bottom' || position === 'cart') {
      document.body.appendChild(barContainer);
    }
  };
  mount();

  // Currency formatter from cart.js currency
  let currency = null;
  const formatMoney = (amount) => {
    // amount in shop currency; best-effort fallback
    try {
      if (currency) {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
      }
      return new Intl.NumberFormat().format(amount);
    } catch (e) {
      return amount.toFixed(2);
    }
  };

  const update = async () => {
    try {
      const res = await fetch('/cart.js', { credentials: 'include' });
      const cart = await res.json();
      // Shopify returns total_price in cents
      const total = (cart && typeof cart.total_price === 'number') ? cart.total_price / 100 : 0;
      currency = cart && cart.currency;
      const remaining = Math.max(0, threshold - total);
      const ratio = Math.max(0, Math.min(1, total / threshold));

      progress.style.width = (ratio * 100).toFixed(2) + '%';

      if (remaining > 0) {
        const msg = beforeText.replace('{{amountRemaining}}', formatMoney(remaining));
        label.textContent = msg;
      } else {
        label.textContent = afterText;
        // subtle success pulse
        progress.style.transition = 'width 200ms ease, box-shadow 300ms ease';
        progress.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.4)';
        setTimeout(() => { progress.style.boxShadow = 'none'; }, 350);
      }

      // Expose lightweight analytics hooks (no backend)
      window.__fspb_events = window.__fspb_events || [];
      window.__fspb_events.push({ t: Date.now(), ev: 'progress_update', total, threshold, remaining });
      if (remaining <= 0) {
        window.__fspb_events.push({ t: Date.now(), ev: 'goal_reached', total, threshold });
      }
    } catch (e) {
      // fail silently
    }
  };

  update();
  // Poll modestly to keep in sync
  const iv = setInterval(update, 2500);

  // Attempt to listen for Shopify Theme Cart updates (varies by theme)
  document.addEventListener('cart:refresh', update);
  document.addEventListener('cart:updated', update);
})();
