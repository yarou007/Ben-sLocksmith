// Shared commercial segment content. Operational benefits describe how to scope
// a request; unverified administrative offerings stay in the owner checklist.
export const segments = [
  {
    id: 'property-managers', icon: 'building', label: 'Property & facility managers',
    heading: 'Get the door fixed without losing track of the work order',
    intro: 'Keep tenants, site contacts and approvals aligned around the exact opening that needs attention.',
    benefits: ['Identify each building, suite and affected door', 'Include the work order, purchase order and approval limit', 'Plan access around tenants and onsite contacts', 'Discuss recurring maintenance and multi-building needs'],
    faqs: [
      { question: 'What should I send with a work order?', answer: 'Send the address, door identifier, problem, onsite contact and approval requirements. A wide door photo and a close-up of the hardware help explain the request.' },
      { question: 'What about COI, W-9 and a single point of contact?', answer: 'Include your vendor documents, billing requirements and preferred contact in the request. We will review these with you before you approve the work.' }
    ],
    cta: 'Discuss a property work order', href: '/service-property-manager-locksmith'
  },
  {
    id: 'restaurants-retail', icon: 'store', label: 'Restaurants & retail',
    heading: 'An unsecured entrance should not keep your business closed',
    intro: 'Describe the door failure and operating deadline so the conversation starts with reopening and securing the premises.',
    benefits: ['Business lockouts and failed storefront locks', 'Door, frame and hardware damage after a break-in', 'Panic bars and closers on busy customer and staff exits', 'Discuss after-hours access and temporary securing needs'],
    faqs: [
      { question: 'Can I ask about a lockout after closing?', answer: 'Call with your business address and tell us whether you are locked out or unable to secure the entrance. We will discuss current availability and the next step.' },
      { question: 'What should I send after a break-in?', answer: 'Show the full opening, damaged frame and lock area. Call about an unsecured door. Mention any board-up or glazing requirement so the appropriate scope can be discussed.' }
    ],
    cta: 'Send a storefront door photo', href: '/commercial-door-repair-washington-dc', photo: true
  },
  {
    id: 'offices-medical', icon: 'office', label: 'Offices & medical buildings',
    heading: 'Keep business access organized when staff or tenants change',
    intro: 'Coordinate keys, commercial locks and door-side access hardware around the people who need access.',
    benefits: ['Rekey commercial locks after staff or tenant turnover', 'Plan master-key access by door and authorized role', 'Review door hardware with your access-control integrator', 'Identify staff entrances, shared doors and access windows'],
    faqs: [
      { question: 'Do all locks need replacing after staff turnover?', answer: 'A rekey may change which keys operate a compatible lock without replacing the entire lock. The condition, key system and access requirements determine the right approach.' },
      { question: 'Can I include existing access control?', answer: 'Yes. Include the hardware model and integrator contact. Describe the door-side problem and any reader, programming or system work you need coordinated.' }
    ],
    cta: 'Plan office locks and access', href: '/commercial-rekey-washington-dc'
  },
  {
    id: 'fire-door-egress', icon: 'exit', label: 'Fire doors & exit hardware',
    heading: 'A door that will not close, latch or release needs attention',
    intro: 'Turn a failed inspection item or exit-hardware problem into a clear repair or inspection request.',
    benefits: ['Panic bars and exit devices that stick or fail to relatch', 'Door closers that leak, slam or leave a door open', 'Fire-door repair requests tied to specific report items', 'Agree the repair, inspection and documentation scope'],
    faqs: [
      { question: 'What if a fire door failed inspection?', answer: 'Share the report item, door identifier and photos of the hardware and labels. We will discuss the requested correction and any inspection or documentation requirements.' },
      { question: 'Does a repair provide final compliance approval?', answer: 'Repair and inspection are separate scopes. The responsible inspector or authority determines final acceptance for the opening. Include their requirements when requesting work.' }
    ],
    cta: 'Discuss a fire-door repair', href: '/fire-door-repair-washington-dc'
  }
];

// Keep unverified neighborhoods out of published coverage claims and schema.
export const coverageCandidates = {
  'washington-dc': ['Downtown', 'Capitol Hill', 'Georgetown', 'Navy Yard', 'NoMa', 'Dupont Circle', 'Adams Morgan', 'U Street'],
  'northern-virginia': ['Arlington', 'Alexandria'],
  maryland: ['Bethesda', 'Silver Spring']
};

export const ownerPlaceholders = {
  RESPONSE_TIME: 'Typical response/arrival range, geographic limits and conditions',
  SERVICE_HOURS: 'Actual operating hours and after-hours or 24/7 availability',
  LICENSE_INSURANCE: 'Verified licensing jurisdictions/details and approved insurance wording',
  WHATSAPP_ACCOUNT: 'Confirm WhatsApp is active on +17032440559 or supply the correct number',
  GOOGLE_RATING: 'Google Business Profile URL, current rating and review count',
  TESTIMONIALS: 'Approved review text, attribution, source link and date',
  HARDWARE_BRANDS: 'Confirmed manufacturers serviced and approved wording',
  BEFORE_AFTER: 'Approved before/after photos, dimensions, captions and documented outcomes',
  WARRANTY: 'Written workmanship/parts warranty terms, exclusions and claim process',
  VENDOR_DOCUMENTS: 'COI, W-9, invoicing, purchase orders and single-contact capabilities',
  MAINTENANCE: 'Recurring maintenance scope, schedule and multi-building coverage',
  FIRE_INSPECTIONS: 'Inspection provider qualifications, reporting and correction scope',
  DC_NEIGHBORHOODS: 'Confirm each DC neighborhood listed in the coverage checklist',
  VA_CITIES: 'Confirm Arlington and Alexandria coverage',
  MD_CITIES: 'Confirm Bethesda and Silver Spring coverage',
  FORM_DELIVERY: 'Verified submission endpoint, file handling and recipient before enabling the form',
  CALLBACK_WINDOW: 'Realistic callback window in minutes, hours and operating conditions',
  ADS_CONVERSIONS: 'Google Ads conversion ID/label and chosen call measurement method',
  CALL_TRACKING: 'Call tracking provider, numbers and qualified-call definition',
  PUBLIC_ADDRESS: 'Confirmed public business address, or keep the service-area setup',
  PRIVACY_DETAILS: 'Legal identity, privacy contact, effective date, retention and applicable consent details'
};
