// The checks that grade every remediation of the booking form.
//
// Written, and proven by `node run.mjs` against the floor, the reference and
// the gaming variant, before any remediation was attempted. Whoever remediates
// does not edit this file. run.mjs prints its SHA-256 on every run so a
// result can be tied to the exact checks that produced it.
//
// Every check runs on a freshly loaded page, so no result depends on what an
// earlier check did.

export const FINDINGS = [
  { id: 'A11Y-01', family: 'images', criterion: '1.1.1', scope: ['#access-map'],
    barrier: 'the map carries the step-free entrance, and nobody who cannot see it learns that' },
  { id: 'A11Y-02', family: 'images', criterion: '1.1.1', scope: ['#dining-room'],
    barrier: 'an image with no text alternative, whose purpose the source does not state' },
  { id: 'A11Y-03', family: 'names', criterion: '4.1.2', scope: ['#guests .remove'],
    barrier: 'the remove button has no accessible name' },
  { id: 'A11Y-04', family: 'roles and keyboard', criterion: '2.1.1, 4.1.2', scope: ['#add-guest'],
    barrier: 'Add guest is a div: not reachable by Tab, not operable by Enter or Space' },
  { id: 'A11Y-05', family: 'forms', criterion: '1.3.1, 3.3.2', scope: ['#email'],
    barrier: 'the email field is labelled only by a placeholder that disappears on input' },
  { id: 'A11Y-06', family: 'forms', criterion: '3.3.1, 1.3.1', scope: ['#email-error'],
    barrier: 'the error is shown in red but neither associated, flagged nor given focus' },
  { id: 'A11Y-07', family: 'custom widgets', criterion: '2.1.1, 4.1.2', scope: ['#room'],
    barrier: 'the room chooser is a set of divs: no focus, no keyboard, no role' },
  { id: 'A11Y-08', family: 'focus', criterion: '2.4.7', scope: ['button[type=submit]'],
    barrier: 'the primary button shows no focus indicator' },
  { id: 'A11Y-09', family: 'contrast', criterion: '1.4.3', scope: ['#email-hint'],
    barrier: 'hint text at 2.8 to 1 against white' },
];

// --------------------------------------------------------------------------
// Helpers.
// --------------------------------------------------------------------------

// The node Chromium exposes in its accessibility tree for one element. This
// is the browser's tree, read through the DevTools protocol; it is not a
// screen reader, and no result here is reported as one.
export async function axNode(page, selector) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Accessibility.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
  if (!nodeId) return null;
  const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
  const n = nodes[0];
  const prop = (name) => n.properties?.find((p) => p.name === name)?.value?.value;
  return {
    ignored: Boolean(n.ignored),
    role: n.role?.value ?? '',
    name: n.name?.value ?? '',
    description: n.description?.value ?? '',
    value: n.value?.value ?? '',
    invalid: prop('invalid'),
  };
}

// Press Tab until the focused element matches the selector (or sits inside an
// element that does). Returns false when the selector is never reached.
export async function tabTo(page, selector, max = 40) {
  for (let i = 0; i < max; i += 1) {
    await page.keyboard.press('Tab');
    const hit = await page.evaluate((sel) => {
      const el = document.activeElement;
      return Boolean(el && el !== document.body && (el.matches(sel) || el.closest(sel)));
    }, selector);
    if (hit) return true;
  }
  return false;
}

const guestCount = (page) => page.evaluate(() => document.querySelectorAll('#guests li').length);

// Whether the focused element shows an indicator: a non-transparent outline
// of some width, or a box shadow. Evaluated in the page.
const INDICATOR = `(() => {
  const el = document.activeElement;
  const s = getComputedStyle(el);
  const alpha = (c) => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return 1; const p = m[1].split(',').map(Number); return p.length > 3 ? p[3] : 1; };
  const outline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 && alpha(s.outlineColor) > 0;
  const shadow = s.boxShadow !== 'none';
  return { visible: outline || shadow, outline: s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor, shadow: s.boxShadow };
})()`;

const luminance = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (fg, bg) => {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
};

// --------------------------------------------------------------------------
// 1. Barrier checks, one per finding, as the person meets the barrier.
//    Each takes (page, answers): answers are the intent decisions a person has
//    recorded, keyed by finding id. A check that depends on intent passes only
//    against a recorded answer.
// --------------------------------------------------------------------------

export const BARRIER = {
  async 'A11Y-01'(page) {
    const n = await axNode(page, '#access-map');
    const inName = /side door/i.test(n?.name ?? '');
    const inText = await page.evaluate(() => /side door/i.test(document.querySelector('main').innerText));
    return { ok: inName || inText, detail: `name "${n?.name ?? ''}"` };
  },

  async 'A11Y-02'(page, answers) {
    const answer = answers['A11Y-02'];
    const n = await axNode(page, '#dining-room');
    const alt = await page.getAttribute('#dining-room', 'alt');
    if (!answer) return { ok: false, detail: `no recorded intent; alt=${JSON.stringify(alt)}` };
    if (answer === 'decorative') {
      const hidden = alt === '' && (n === null || n.ignored || n.role === 'none' || n.role === 'presentation' || n.name === '');
      return { ok: hidden, detail: `answer decorative; alt=${JSON.stringify(alt)}` };
    }
    return { ok: (n?.name ?? '').toLowerCase().includes(answer.toLowerCase()), detail: `answer "${answer}"; name "${n?.name ?? ''}"` };
  },

  async 'A11Y-03'(page) {
    const n = await axNode(page, '#guests .remove');
    const name = n?.name ?? '';
    return { ok: /remove/i.test(name) && /guest/i.test(name), detail: `name "${name}"` };
  },

  async 'A11Y-04'(page) {
    if (!(await tabTo(page, '#add-guest'))) return { ok: false, detail: 'never reached by Tab' };
    const start = await guestCount(page);
    await page.keyboard.press('Enter');
    const afterEnter = await guestCount(page);
    await page.keyboard.press('Space');
    const afterSpace = await guestCount(page);
    const n = await axNode(page, '#add-guest');
    const ok = afterEnter === start + 1 && afterSpace === start + 2 && n?.role === 'button';
    return { ok, detail: `role ${n?.role}; guests ${start} -> Enter ${afterEnter} -> Space ${afterSpace}` };
  },

  async 'A11Y-05'(page) {
    const n = await axNode(page, '#email');
    const label = await page.evaluate(() => {
      const input = document.getElementById('email');
      const l = input.labels && input.labels[0];
      if (!l) return null;
      const r = l.getBoundingClientRect();
      return { text: l.innerText.trim(), visible: r.width > 1 && r.height > 1 };
    });
    await page.fill('#email', 'someone@example');
    const named = /email/i.test(n?.name ?? '');
    const ok = named && label !== null && label.visible && /email/i.test(label.text);
    return { ok, detail: `name "${n?.name ?? ''}"; visible label ${label ? JSON.stringify(label.text) : 'none'}` };
  },

  async 'A11Y-06'(page) {
    if (!(await tabTo(page, 'button[type=submit]'))) return { ok: false, detail: 'submit never reached by Tab' };
    await page.keyboard.press('Enter');
    const focused = await page.evaluate(() => document.activeElement.id);
    const n = await axNode(page, '#email');
    const described = /enter an email address/i.test(n?.description ?? '');
    const invalid = n?.invalid === 'true';
    return {
      ok: focused === 'email' && described && invalid,
      detail: `focus on "${focused}"; description "${n?.description ?? ''}"; invalid ${n?.invalid}`,
    };
  },

  async 'A11Y-07'(page) {
    if (!(await tabTo(page, '#room'))) return { ok: false, detail: 'never reached by Tab' };
    const sel = await page.evaluate(() => {
      const el = document.activeElement;
      if (el.id) return '#' + el.id;
      return null;
    });
    const n = sel ? await axNode(page, sel) : null;
    const read = () => page.evaluate(() => {
      const native = document.querySelector('select#room');
      return native ? native.value : document.querySelector('#room').dataset.value;
    });
    const before = await read();
    await page.keyboard.press('ArrowDown');
    const after = await read();
    const roleOk = ['combobox', 'listbox'].includes(n?.role);
    const nameOk = /room/i.test(n?.name ?? '');
    return {
      ok: roleOk && nameOk && before !== after,
      detail: `role ${n?.role}; name "${n?.name ?? ''}"; value ${before} -> ArrowDown ${after}`,
    };
  },

  async 'A11Y-08'(page) {
    if (!(await tabTo(page, 'button[type=submit]'))) return { ok: false, detail: 'never reached by Tab' };
    const s = await page.evaluate(INDICATOR);
    return { ok: s.visible, detail: `outline ${s.outline}; shadow ${s.shadow}` };
  },

  async 'A11Y-09'(page) {
    const fg = await page.evaluate(() => getComputedStyle(document.getElementById('email-hint')).color);
    const nums = fg.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
    const r = ratio(nums, [255, 255, 255]);
    return { ok: r >= 4.5, detail: `${fg} on white, ${r.toFixed(2)} to 1` };
  },
};

// --------------------------------------------------------------------------
// 2. Universal layer, on the whole remediated surface whatever the finding.
//    Each returns the elements that fail, so a failure can be attributed to
//    the finding whose scope holds the element.
// --------------------------------------------------------------------------

export const UNIVERSAL = {
  // 2.4.7: every Tab stop shows an indicator.
  async 'focus visible'(page) {
    const failures = [];
    const seen = new Set();
    for (let i = 0; i < 40; i += 1) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(`(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const path = el.id ? '#' + el.id : el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : '');
        return { path, indicator: ${INDICATOR} };
      })()`);
      if (!info) break;
      if (seen.has(info.path)) break;
      seen.add(info.path);
      if (!info.indicator.visible) failures.push(info.path);
    }
    return failures;
  },

  // 2.5.8: interactive targets at least 24 by 24 CSS pixels. The skip link is
  // measured when focused, where it is on screen.
  async 'target size'(page) {
    return page.evaluate(() => {
      const out = [];
      const els = document.querySelectorAll('button, input, select, [role=button], [role=listbox], [role=combobox], [tabindex]:not([tabindex="-1"]), a.skip');
      els.forEach((el) => {
        if (el.matches('a.skip')) el.focus();
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        if (r.width < 24 || r.height < 24) out.push(el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + el.className);
        if (el.matches('a.skip')) el.blur();
      });
      return out;
    });
  },

  // 1.4.10: no horizontal page scroll at 320 CSS pixels.
  async 'reflow 320'(page) {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.reload();
    const w = await page.evaluate(() => document.documentElement.scrollWidth);
    return w > 320 ? [`page scrollWidth ${w}`] : [];
  },

  // 2.3.3, held here: with reduced motion requested, nothing animates.
  async 'reduced motion'(page) {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    return page.evaluate(() => document.getAnimations()
      .filter((a) => a.playState === 'running')
      .map((a) => (a.effect && a.effect.target && a.effect.target.id) || 'animation'));
  },
};

// --------------------------------------------------------------------------
// 3. Preservation: what worked before still works, by mouse, as before.
//    Each names the findings whose change could have broken it.
// --------------------------------------------------------------------------

export const PRESERVATION = [
  { name: 'add a guest by mouse', findings: ['A11Y-04'], async run(page) {
    const a = await guestCount(page);
    await page.click('#add-guest');
    return (await guestCount(page)) === a + 1;
  } },
  { name: 'remove a guest by mouse', findings: ['A11Y-03'], async run(page) {
    const a = await guestCount(page);
    await page.click('#guests .remove');
    return (await guestCount(page)) === a - 1;
  } },
  { name: 'choose a room by mouse', findings: ['A11Y-07'], async run(page) {
    if (await page.$('select#room')) {
      await page.selectOption('select#room', 'terrace');
    } else {
      await page.click('#room .cs-current');
      await page.click('#room .cs-option[data-value=terrace]');
    }
    await page.fill('#email', 'someone@example.com');
    await page.click('button[type=submit]');
    return /Terrace/.test(await page.textContent('#status'));
  } },
  { name: 'submit a valid booking by mouse', findings: ['A11Y-05', 'A11Y-06', 'A11Y-08'], async run(page) {
    await page.fill('#email', 'someone@example.com');
    await page.click('button[type=submit]');
    return /Booking requested: 2 guests, Main room\./.test(await page.textContent('#status'));
  } },
  { name: 'the error still shows on an empty submit', findings: ['A11Y-06'], async run(page) {
    await page.click('button[type=submit]');
    return page.isVisible('#email-error');
  } },
  { name: 'every visible text is still there', findings: FINDINGS.map((f) => f.id), async run(page) {
    const text = await page.evaluate(() => document.body.innerText);
    return ['Book a table', 'Getting here', 'Your booking', 'We send the confirmation here.',
      'Room', 'Main room', 'Guests', 'Guest 1', 'Guest 2', 'Add guest', 'Request booking']
      .every((t) => text.includes(t));
  } },
];
