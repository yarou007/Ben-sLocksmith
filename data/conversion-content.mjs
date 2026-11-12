// Shared commercial segment content. Operational benefits describe how to scope
// a request; unverified administrative offerings stay in the owner checklist.
export const segments = [
  {
    id: 'property-managers', icon: 'building', label: 'Property & facility managers',
    heading: 'Get the door fixed without losing track of the work order',
    intro: 'Keep tenants, site contacts and approvals aligned around the exact opening that needs attention.',
    benefits: ['Identify each building, suite and affected door', 'Include the work order, purchase order and approval limit', 'Plan access around tenants and onsite contacts', 'Group multiple commercial buildings by work order'],
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

// Owner confirmed these target service locations on November 11, 2026.
export const coverageCandidates = {
  'washington-dc': ['Downtown', 'Capitol Hill', 'Georgetown', 'Navy Yard', 'NoMa', 'Dupont Circle', 'Adams Morgan', 'U Street'],
  'northern-virginia': ['Arlington', 'Alexandria'],
  maryland: ['Bethesda', 'Silver Spring']
};

export const locationProfiles = {
  'washington-dc': [
    { name: 'Downtown', id: 'downtown', heading: 'Downtown offices and managed commercial entrances', text: 'Keep a failed entrance, tenant lock or shared exit from interrupting business access. For Downtown work orders, identify the building entrance, suite or floor and the person who can authorize access. Include delivery restrictions and any building check-in instructions when requesting a free estimate.', benefits: ['Office and tenant lockouts, rekeys and commercial locks', 'Door closers and panic hardware on shared exits', 'Work-order references, onsite contacts and access windows'], href: '/commercial-locksmith-washington-dc', link: 'Commercial locksmith service' },
    { name: 'Capitol Hill', id: 'capitol-hill', heading: 'Capitol Hill business doors and exit hardware', text: 'Request commercial door and lock work for offices, schools, churches and business properties in Capitol Hill. Explain whether the door closes, latches, locks and releases; these details help separate an urgent security problem from planned hardware work. If an inspection flagged an opening, include its door identifier and the exact report item.', benefits: ['Commercial lock repair and business rekey requests', 'Panic bars, exit devices and controlled closing', 'Fire-door repair and inspection-scope requests'], href: '/fire-door-repair-washington-dc', link: 'Commercial fire-door repair' },
    { name: 'Georgetown', id: 'georgetown', heading: 'Georgetown storefront and business entrance repair', text: 'A dragging storefront door or latch that misses its strike can make opening and closing the business difficult. Send a full-opening photo and close-ups of the lock, pivots or closer for your Georgetown commercial property. Mention damaged glazing or a board-up requirement so those needs can be included in the scope discussion.', benefits: ['Storefront doors that drag, bind or will not secure', 'Commercial locks, cylinders and business lockouts', 'Closer control, latch alignment and break-in damage'], href: '/storefront-door-repair-washington-dc', link: 'Storefront door repair' },
    { name: 'Navy Yard', id: 'navy-yard', heading: 'Navy Yard retail, restaurant and shared commercial doors', text: 'Coordinate repairs for a customer entrance, staff door or common commercial opening in Navy Yard. Tell us which entrance is affected and whether deliveries, customer traffic or tenant access constrain the visit. Photos of the closer arm, panic device and latch area help explain a door that slams, stays open or refuses to relatch.', benefits: ['Restaurant and retail entrance failures', 'Panic-bar and exit-device repair requests', 'Shared commercial openings and door closer problems'], href: '/door-closer-repair-washington-dc', link: 'Commercial door closer repair' },
    { name: 'NoMa', id: 'noma', heading: 'NoMa office access and multi-tenant commercial work orders', text: 'Plan commercial door hardware, lock and key-control work around the people who use the building. For a NoMa office or managed commercial property, list the affected openings and authorized contacts. If the door connects to an access-control system, include the existing integrator and distinguish door-side hardware symptoms from reader or software issues.', benefits: ['Rekeying after staff changes or tenant turnover', 'Master-key planning by opening and authorized role', 'Door-side access-control hardware coordination'], href: '/access-control-systems-washington-dc', link: 'Access-control door hardware' },
    { name: 'Dupont Circle', id: 'dupont-circle', heading: 'Dupont Circle offices, medical suites and business access', text: 'Keep entry and key-control needs clear for a Dupont Circle office, medical suite or commercial property. Tell us whether the issue affects the main entrance, a shared door or a staff-only opening. For planned rekeying or lock changes, include the number of openings and the intended access roles so the free estimate starts with the right scope.', benefits: ['Commercial rekeying and lock repair', 'Office and medical-building entry hardware', 'Staff access, key-control and master-key requests'], href: '/commercial-rekey-washington-dc', link: 'Commercial rekey service' },
    { name: 'Adams Morgan', id: 'adams-morgan', heading: 'Adams Morgan restaurant and retail door problems', text: 'Call 24/7 when a business lockout or unsecured commercial entrance disrupts opening or closing in Adams Morgan. Describe the affected customer, staff or service entrance and whether the door can still latch and release. For planned work, send hardware photos and the business address to discuss a free estimate around your operating needs.', benefits: ['Business lockouts and doors that will not lock', 'Restaurant and retail panic hardware', 'Break-in damage and temporary securing requirements'], href: '/commercial-door-repair-washington-dc', link: 'Emergency commercial door repair' },
    { name: 'U Street', id: 'u-street', heading: 'U Street business entrances and staff exits', text: 'Request commercial lock, closer and exit-hardware service for U Street businesses. A door that will not secure after closing and an exit device that will not release call for different information: tell us both the security and exit-operation symptoms. Include the exact entrance and onsite contact so the scope conversation starts with the affected opening.', benefits: ['Commercial lockouts, locks and latch failures', 'Exit devices that stick or fail to relatch', 'High-use entrance closers and hardware'], href: '/panic-bar-repair-washington-dc', link: 'Panic-bar repair' }
  ],
  'northern-virginia': [
    { name: 'Arlington', id: 'arlington', heading: 'Arlington offices, facilities and managed commercial buildings', text: 'Request commercial door and locksmith work in Arlington for an office entrance, medical suite, school, retail property or managed building. Identify each affected opening, the onsite contact and any approval limit. For several doors or buildings, group the addresses and symptoms by work order so repair priorities and site access can be discussed together.', benefits: ['Business lockouts, commercial locks and turnover rekeys', 'Door closers, panic bars and exit hardware', 'Commercial door replacement and access-hardware planning'], href: '/service-property-manager-locksmith', link: 'Property and facility manager service' },
    { name: 'Alexandria', id: 'alexandria', heading: 'Alexandria storefronts and commercial property doors', text: 'An Alexandria business entrance that drags, slams or refuses to latch can affect both security and day-to-day access. Send a full-door photo, the failed hardware and your address for a free estimate. If the opening was damaged during a break-in, describe the frame and lock-area damage and whether temporary securing is needed before permanent work.', benefits: ['Storefront alignment, latching and closer problems', 'Commercial lock repair and business lockouts', 'Door, frame and hardware damage assessment'], href: '/commercial-door-repair-washington-dc', link: 'Commercial door and frame repair' }
  ],
  maryland: [
    { name: 'Bethesda', id: 'bethesda', heading: 'Bethesda medical offices and commercial building access', text: 'Coordinate commercial locks, rekeys and door hardware for Bethesda offices, medical buildings and managed properties. Describe the opening and the people who need access, including staff-only entrances and shared commercial doors. For planned work, include the opening count, access window and any existing key or access-control system that needs to be considered.', benefits: ['Office and medical-suite rekey requests', 'Master keys and authorized access roles', 'Door closers and door-side access hardware'], href: '/commercial-rekey-washington-dc', link: 'Commercial lock and rekey service' },
    { name: 'Silver Spring', id: 'silver-spring', heading: 'Silver Spring restaurant, retail and managed-property doors', text: 'Call about an unsecured entrance or business lockout in Silver Spring, or send photos for planned commercial door work. Include the address, affected entrance, urgency and whether the door closes, latches, locks and releases. Property teams can also include a work-order reference, site contact and an inspection item when requesting repair or fire-door scope review.', benefits: ['Commercial entrance and storefront repair', 'Panic-bar, exit-device and closer problems', 'Work-order coordination and fire-door repair requests'], href: '/commercial-door-repair-washington-dc', link: 'Commercial door repair service' }
  ]
};

export const ownerPlaceholders = {
  RESPONSE_TIME: 'Not supplied: omit numeric arrival and response guarantees',
  SERVICE_HOURS: 'Confirmed by owner: 24/7 service',
  LICENSE_INSURANCE: 'Not supplied: no public license or insurance claim',
  WHATSAPP_ACCOUNT: 'Confirmed by owner: WhatsApp receives messages on +12026434062',
  GOOGLE_RATING: 'Not supplied: Google badge remains unpublished',
  TESTIMONIALS: 'Not supplied: testimonial placeholders remain unpublished',
  HARDWARE_BRANDS: 'Not supplied: no manufacturer service or affiliation claim',
  BEFORE_AFTER: 'Not supplied: use reference photos without completed-job claims',
  WARRANTY: 'Not supplied: no public guarantee or warranty claim',
  VENDOR_DOCUMENTS: 'Not supplied: discuss requirements without promising administrative capabilities',
  MAINTENANCE: 'Not supplied: no recurring maintenance program claim',
  FIRE_INSPECTIONS: 'Inspection provider qualifications, reporting and correction scope',
  DC_NEIGHBORHOODS: 'Confirmed target locations: Downtown, Capitol Hill, Georgetown, Navy Yard, NoMa, Dupont Circle, Adams Morgan and U Street',
  VA_CITIES: 'Confirmed target locations: Arlington and Alexandria',
  MD_CITIES: 'Confirmed target locations: Bethesda and Silver Spring',
  FORM_DELIVERY: 'WhatsApp quote preparation is active; direct website submission remains coming soon',
  CALLBACK_WINDOW: 'Realistic callback window in minutes, hours and operating conditions',
  ADS_CONVERSIONS: 'Google Ads conversion ID/label and chosen call measurement method',
  CALL_TRACKING: 'Call tracking provider, numbers and qualified-call definition',
  PUBLIC_ADDRESS: 'Confirmed public business address, or keep the service-area setup',
  PRIVACY_DETAILS: 'Legal identity, privacy contact, effective date, retention and applicable consent details'
};
