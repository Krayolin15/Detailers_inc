/* ==========================================================================
   Booking — a four-step enquiry. On "Send booking request" the customer's
   details are put into a pre-written WhatsApp message to the PRIMARY line
   (084 877 2847) and WhatsApp opens, ready to send. Nothing is stored online.
   ========================================================================== */
(function () {
'use strict';
const DI = (window.DI = window.DI || {});
const {SERVICES, VEHICLE_TYPES, CONTACT, money} = DI;

const $ = (id) => document.getElementById(id);
const STEPS = 4;

function booking() {
  const form = $('bookForm');
  const state = { step: 1, serviceId: SERVICES[0].id, typeId: '' };
  const stepEls = [...form.querySelectorAll('[data-form-step]')];
  const aside = [...document.querySelectorAll('#steps li')];
  const line = $('stepsLine');

  /* ----- build choices from data ----- */
  $('fServices').innerHTML = SERVICES.map((s, i) => `
    <label><input type="radio" name="service" value="${s.id}"${i === 0 ? ' checked' : ''}><small>${s.no}</small><b>${s.name}</b><em>${s.line}</em></label>`).join('');
  $('fTypes').innerHTML = VEHICLE_TYPES.map((t) => `
    <label><input type="radio" name="vtype" value="${t.id}"><b>${t.label}</b><em>${t.hint}</em></label>`).join('');
  $('fDate').min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

  const service = () => SERVICES.find((s) => s.id === state.serviceId);
  const pkg = () => service().packages.find((p) => p.id === $('fPackage').value) || null;
  const type = () => VEHICLE_TYPES.find((t) => t.id === state.typeId) || null;

  function fillPackages() {
    const s = service();
    $('fPackage').innerHTML = (s.packages.length > 1 ? '<option value="">Select a package</option>' : '') +
      s.packages.map((p) => `<option value="${p.id}">${p.name} — ${p.duration}</option>`).join('');
    price();
  }
  function price() {
    const p = pkg(), t = type(), el = $('formPrice');
    if (!p) { el.innerHTML = ''; return 0; }
    if (!t) { el.innerHTML = `From <b>${money(Math.min(...Object.values(p.prices)))}</b>`; return 0; }
    el.innerHTML = `Listed price, ${t.label}<b>${money(p.prices[t.id])}</b>`;
    return p.prices[t.id];
  }

  /* ----- validation, one step at a time ----- */
  const invalid = (el, msg) => { el.setAttribute('aria-invalid', 'true'); el.focus(); return msg; };
  function validate(step) {
    form.querySelectorAll('[aria-invalid]').forEach((e) => e.removeAttribute('aria-invalid'));
    if (step === 1 && !pkg()) return invalid($('fPackage'), 'Please select a package.');
    if (step === 2) {
      if (!type()) { $('fTypes').querySelector('input').focus(); return 'Please select your vehicle size.'; }
      if (!$('fVehicle').value.trim()) return invalid($('fVehicle'), 'Please enter your vehicle make and model.');
    }
    if (step === 3) {
      const d = $('fDate').value;
      if (!d) return invalid($('fDate'), 'Please choose a preferred date.');
      if (d < $('fDate').min) return invalid($('fDate'), 'Please choose a date from today onwards.');
      if (new Date(d + 'T12:00').getDay() === 0) return invalid($('fDate'), 'We operate Monday to Saturday. Please choose another day.');
      if (!$('fAddress').value.trim()) return invalid($('fAddress'), 'Please tell us where to come to.');
    }
    if (step === 4) {
      if ($('fName').value.trim().length < 2) return invalid($('fName'), 'Please enter your full name.');
      if (!/^[0-9+\s()-]{9,16}$/.test($('fPhone').value.trim())) return invalid($('fPhone'), 'Please enter a valid contact number.');
      const em = $('fEmail').value.trim();
      if (em && !/^\S+@\S+\.\S+$/.test(em)) return invalid($('fEmail'), 'Please check your email address.');
    }
    return '';
  }

  /* ----- step navigation ----- */
  function go(step, focus = true) {
    state.step = step;
    stepEls.forEach((f) => { const on = +f.dataset.formStep === step; f.hidden = !on; f.classList.toggle('is-active', on); });
    $('formBack').hidden = step === 1;
    $('formNext').querySelector('span').textContent = step === STEPS ? 'Send on WhatsApp' : 'Continue';
    $('formStepNo').textContent = `Step ${step} of ${STEPS}`;
    $('formBar').style.transform = `scaleX(${step / STEPS})`;
    $('formError').textContent = '';
    markAside(step);
    if (step === STEPS) summary();
    if (focus) { const f = stepEls[step - 1].querySelector('input:checked, input, select, textarea'); if (f) f.focus({ preventScroll: true }); }
  }
  // the left-hand timeline mirrors the form. Step 4 ("Receive confirmation")
  // stays current after sending: it completes when Detailers Inc. replies.
  function markAside(step) {
    aside.forEach((li, i) => { li.classList.toggle('is-done', i + 1 < step); li.classList.toggle('is-current', i + 1 === step); });
    line.style.strokeDashoffset = String(100 - (step - 1) * 25);
  }
  function summary() {
    const s = service(), p = pkg(), t = type(), total = price();
    const rows = [['Service', s.name], ['Package', `${p.name} (${p.duration})`], ['Vehicle', `${$('fVehicle').value.trim()} — ${t.label}`],
      ['When', `${$('fDate').value}${$('fTime').value ? ' at ' + $('fTime').value : ''}`], ['Where', $('fAddress').value.trim()], ['Listed price', money(total)]];
    $('fSummary').innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd></dd>`).join('');
    [...$('fSummary').querySelectorAll('dd')].forEach((dd, i) => { dd.textContent = rows[i][1]; });     // textContent: user input is never parsed as HTML
  }

  /* ----- submit ----- */
  function collect() {
    const s = service(), p = pkg(), t = type();
    return {
      ref: 'DI-' + Date.now().toString(36).toUpperCase(),
      name: $('fName').value.trim(), phone: $('fPhone').value.trim(), email: $('fEmail').value.trim(),
      vehicle: $('fVehicle').value.trim(), vehicleType: t.id, vehicleTypeLabel: t.label,
      serviceId: s.id, serviceName: s.name, packageId: p.id, packageName: p.name, duration: p.duration,
      date: $('fDate').value, time: $('fTime').value, address: $('fAddress').value.trim(), notes: $('fNotes').value.trim(),
      price: p.prices[t.id], createdAt: new Date().toISOString()
    };
  }
  function waUrl(b, number) {
    const lines = ['Hello Detailers Inc,', '', 'I would like to book a detail:', '',
      `*Name:* ${b.name}`, `*Phone:* ${b.phone}`, b.email ? `*Email:* ${b.email}` : null,
      `*Vehicle:* ${b.vehicle} (${b.vehicleTypeLabel})`, `*Service:* ${b.serviceName}`, `*Package:* ${b.packageName}`,
      `*Preferred date:* ${b.date}${b.time ? ' at ' + b.time : ''}`, `*Location:* ${b.address}`, b.notes ? `*Notes:* ${b.notes}` : null,
      `*Listed price:* ${money(b.price)} (${b.duration})`, `*Reference:* ${b.ref}`, '', 'Please confirm my booking.'].filter((l) => l !== null);
    return `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`;
  }
  function send() {
    // honeypot: a filled hidden field means a bot; do nothing
    if ($('fCompany').value) return;
    const b = collect();
    const url = waUrl(b, CONTACT.primary.wa);
    // opened synchronously inside the click/submit so phone browsers do not block it
    const win = window.open(url, '_blank', 'noopener');
    $('doneWa').href = url; $('doneWa2').href = waUrl(b, CONTACT.secondary.wa);
    $('doneRef').textContent = `Ref ${b.ref}`;
    $('doneEyebrow').textContent = 'Almost done';
    $('doneTitle').textContent = 'Press send in WhatsApp.';
    $('doneText').textContent = win
      ? `Thank you, ${b.name.split(' ')[0]}. WhatsApp has opened with your booking details already written. Press send there and we will confirm the date and price with you.`
      : `Thank you, ${b.name.split(' ')[0]}. Tap the button below: WhatsApp opens with your booking details already written, you only need to press send.`;
    $('doneWa').querySelector('span').textContent = 'Open WhatsApp';
    stepEls.forEach((f) => { f.hidden = true; });
    $('formNav').hidden = true; $('formNav').style.display = 'none';
    $('formStepNo').textContent = 'Send on WhatsApp';
    $('formDone').hidden = false; $('formDone').focus({ preventScroll: true });
    markAside(4);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const err = validate(state.step);
    $('formError').textContent = err;
    if (err) return;
    if (state.step < STEPS) go(state.step + 1); else send();
  });
  $('formBack').addEventListener('click', () => go(state.step - 1));
  $('fServices').addEventListener('change', (e) => { state.serviceId = e.target.value; fillPackages(); });
  $('fTypes').addEventListener('change', (e) => { state.typeId = e.target.value; price(); });
  $('fPackage').addEventListener('change', price);
  $('doneReset').addEventListener('click', () => {
    form.reset(); state.serviceId = SERVICES[0].id; state.typeId = '';
    $('formDone').hidden = true; $('formNav').hidden = false; $('formNav').style.display = '';
    fillPackages(); go(1);
  });

  fillPackages();
  go(1, false);

  return {
    /** Called by the services stage: pre-select a service and show step 1. */
    selectService(id) {
      const input = form.querySelector(`input[name="service"][value="${id}"]`);
      if (!input) return;
      if (!$('formDone').hidden) $('doneReset').click();
      input.checked = true; state.serviceId = id; fillPackages(); go(1, false);
    }
  };
}

Object.assign(DI, { booking });
})();
