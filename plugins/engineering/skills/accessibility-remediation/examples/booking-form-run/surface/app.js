// Behaviour shared by every variant: adding and removing guests, the room
// control, and submission. What a remediation changes about error handling is
// supplied by the variant as window.onInvalidEmail; without it, the original
// behaviour runs (the error is shown and nothing else happens).
(() => {
  const form = document.getElementById('booking');
  const guests = document.getElementById('guests');
  const status = document.getElementById('status');
  const email = document.getElementById('email');
  const error = document.getElementById('email-error');

  const removeLabel = (n) => `Remove guest ${n}`;

  const renumber = () => {
    [...guests.children].forEach((li, i) => {
      li.querySelector('.guest-name').textContent = `Guest ${i + 1}`;
      const btn = li.querySelector('.remove');
      if (btn && btn.dataset.namePattern) btn.setAttribute('aria-label', removeLabel(i + 1));
    });
  };

  guests.addEventListener('click', (event) => {
    const btn = event.target.closest('.remove');
    if (!btn) return;
    btn.closest('li').remove();
    renumber();
  });

  document.getElementById('add-guest').addEventListener('click', () => {
    const li = document.createElement('li');
    const name = document.createElement('span');
    name.className = 'guest-name';
    li.append(name);
    guests.append(li);
    renumber();
  });

  // The room control is either a native select or the original custom one.
  const roomValue = () => {
    const native = document.querySelector('select#room');
    if (native) return native.options[native.selectedIndex].text;
    return document.querySelector('#room .cs-current').textContent;
  };
  const custom = document.querySelector('#room.custom-select');
  if (custom) {
    const current = custom.querySelector('.cs-current');
    const options = custom.querySelector('.cs-options');
    current.addEventListener('click', () => { options.hidden = !options.hidden; });
    options.addEventListener('click', (event) => {
      const option = event.target.closest('.cs-option');
      if (!option) return;
      custom.dataset.value = option.dataset.value;
      current.textContent = option.textContent;
      custom.querySelectorAll('.cs-option').forEach((o) => {
        if (o.hasAttribute('aria-selected')) o.setAttribute('aria-selected', String(o === option));
      });
      options.hidden = true;
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
    if (!valid) {
      error.hidden = false;
      if (typeof window.onInvalidEmail === 'function') window.onInvalidEmail(email, error);
      return;
    }
    error.hidden = true;
    if (typeof window.onValidEmail === 'function') window.onValidEmail(email, error);
    status.textContent = `Booking requested: ${guests.children.length} guests, ${roomValue()}.`;
  });
})();
