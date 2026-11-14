/* ==========================================================================
   DETAILERS INC — business data (single source of truth for the homepage)
   --------------------------------------------------------------------------
   Everything here was taken from the previous site (index.html + booking.html).
   Nothing is invented. To change a price, a package, a phone number or the
   vehicle categories, edit THIS file only.
   NOTE: booking.html keeps its own copy of the price list (legacy page).
         If you change prices here, change them there too.
   ========================================================================== */

(function () {
'use strict';
const DI = (window.DI = window.DI || {});
const CONTACT = {
  primary:   { label: 'Bookings & WhatsApp', display: '+27 84 877 2847', tel: '+27848772847', wa: '27848772847' },
  secondary: { label: 'Second WhatsApp line', display: '+27 62 890 4914', wa: '27628904914' },
  email: 'sales@detailersinc.co.za',
  address: 'Unit 5, King Fisher Office Park 2, Mount Edgecombe, Durban 4300',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=King+Fisher+Office+Park+Mount+Edgecombe+Durban',
  hours: 'Mon – Sat, 8AM – 6PM',
  instagram: 'https://www.instagram.com/detailersinc_/',
  tiktok: 'https://www.tiktok.com/@detailersinc'
};

/* Vehicle size categories — configurable. Prices exist only for these three. */
const VEHICLE_TYPES = [
  { id: 'sedan', label: 'Sedan / Hatch',        hint: 'Hatchbacks, sedans, coupés' },
  { id: 'suv',   label: 'Mini SUV / Crossover', hint: 'Compact SUVs and crossovers' },
  { id: 'large', label: 'Large SUV / 4x4',      hint: 'Full-size SUVs, bakkies, 4x4s' }
];

const SERVICES = [
  {
    id: 'maintenance_wash', no: '01', name: 'Full Maintenance Wash', short: 'Maintenance Wash',
    line: 'Snow foam to tyre gel.',
    desc: 'Complete interior and exterior cleaning with snow foam, vacuum and premium finishes.',
    includes: ['Snow foam wash', 'Rim & arch cleaning', 'Interior vacuum', 'Dashboard treatment', 'Tyre gel application', 'Oil-based perfume'],
    video: 'svc-wash', tint: '#8fb9cf', footage: 'VW Golf GTI, snow foam stage',
    packages: [
      { id: 'mw_standard', name: 'Full Maintenance Wash', duration: '45 – 60 min', prices: { sedan: 349, suv: 449, large: 529 } }
    ]
  },
  {
    id: 'detailing', no: '02', name: 'Vehicle Detailing', short: 'Detailing',
    line: 'Deep clean, inside and out.',
    desc: 'Premium deep clean with clay bar treatment, paint correction and leather care.',
    includes: ['Iron decontamination', 'Clay bar treatment', 'Paint correction and polish', 'Tyre, trim and rubber decon', 'Interior deep clean', 'Antibacterial steam clean', 'Leather conditioning', 'Engine wash & dressing'],
    video: 'svc-detail', tint: '#00a8e4', footage: 'VW Golf GTI, drill-brush seat clean',
    packages: [
      { id: 'interior_detail', name: 'Interior Detail',     duration: '3 – 4 hrs',  prices: { sedan: 1999, suv: 2499, large: 2999 } },
      { id: 'full_s1',         name: 'Stage 1 Full Detail', duration: '1 day',      prices: { sedan: 3999, suv: 4699, large: 5499 } },
      { id: 'full_s2',         name: 'Stage 2 Full Detail', duration: '1 – 2 days', prices: { sedan: 6199, suv: 6999, large: 7999 } }
    ]
  },
  {
    id: 'polishing', no: '03', name: 'Vehicle Polishing', short: 'Polishing',
    line: 'Cut, polish, measure.',
    desc: 'Professional cut and polish to remove swirls and restore gloss.',
    includes: ['Iron decontamination', 'Clay bar treatment', 'Paint correction and polish', 'One step cut & polish', '70–80% swirl reduction', 'Paint micron testing'],
    video: 'svc-polish', tint: '#c9d2da', footage: 'Machine polishing, black paint',
    packages: [
      { id: 'polish_s1', name: 'Stage 1 Polish (Finish)',       duration: '4 – 5 hrs', prices: { sedan: 2299, suv: 2499, large: 2999 } },
      { id: 'polish_s2', name: 'Stage 2 Polish (Cut & Polish)', duration: '6 – 8 hrs', prices: { sedan: 3299, suv: 3499, large: 4999 } }
    ]
  },
  {
    id: 'ceramic', no: '04', name: 'Ceramic Coating', short: 'Ceramic Coating',
    line: 'Gloss that stays.',
    desc: 'A durable, high-gloss protective layer that helps shield paint from UV and environmental contaminants.',
    includes: ['Application of ceramic coating', 'Polishing of high spots for even shine', 'Iron decontamination', 'Clay bar treatment', 'Paint correction and polish', '70–80% swirl reduction', 'Paint micron testing'],
    video: 'svc-ceramic', tint: '#1b6fd0', footage: 'Ceramic coating application',
    packages: [
      { id: 'ceramic_s1', name: 'Stage 1 Ceramic Coating',          duration: '1 – 2 days', prices: { sedan: 5999, suv: 7499, large: 8598 } },
      { id: 'ceramic_s2', name: 'Stage 2 Ceramic Coating',          duration: '2 days',     prices: { sedan: 7298, suv: 8499, large: 10598 } },
      { id: 'combo_s1',   name: 'Stage 1 Combo (Detail + Ceramic)', duration: '2 days',     prices: { sedan: 6999, suv: 8499, large: 10499 } },
      { id: 'combo_skin', name: 'Stage 1 Combo (CarPro Skin)',      duration: '2 days',     prices: { sedan: 6999, suv: 8499, large: 10499 } },
      { id: 'combo_s2',   name: 'Stage 2 Combo (Cut + Ceramic)',    duration: '2 – 3 days', prices: { sedan: 9499, suv: 9999, large: 12999 } }
    ]
  }
];

const money = (n) => 'R ' + Number(n || 0).toLocaleString('en-ZA');

Object.assign(DI, { CONTACT, VEHICLE_TYPES, SERVICES, money });
})();
