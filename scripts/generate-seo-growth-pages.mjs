import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DOMAIN = 'https://dcemergencylockanddoor.com';
const PHONE_RAW = '7032440559';
const PHONE_LABEL = '703-244-0559';

const sameAs = [
  'https://x.com/dcemergencylock',
  'https://www.linkedin.com/company/dc-emergency-lock-and-door',
  'https://www.youtube.com/@dcemergencylockanddoor',
  'https://www.facebook.com/profile.php?id=61574339060945'
];

const defaultAudience = [
  'Offices and office buildings',
  'Retail stores and shopping centers',
  'Restaurants and hospitality venues',
  'Schools and educational facilities',
  'Warehouses and distribution sites',
  'Apartment and mixed-use buildings',
  'Property managers and facility managers'
];

const locationMentions = [
  'Washington DC',
  'Northern Virginia',
  'Maryland',
  'New York'
];

const servicePages = [
  {
    slug: 'service-panic-bar-installation',
    title: 'Panic Bar Installation DC | Commercial Locksmith 24/7',
    description:
      'Panic bar installation Washington DC for offices, schools, and retail exits. Code-compliant hardware, same-day scheduling, and free estimates.',
    h1: 'Panic Bar Installation Washington DC',
    kicker: 'Code-Compliant Egress Hardware for Commercial Doors',
    hero:
      'Need panic bar installation for a new opening or a failed exit device? We install commercial panic bars and push bars with code-focused setup and fast turnaround.',
    serviceType: 'Panic Bar Installation',
    keywordLine:
      'This service targets panic bar installation, push bar installation, crash bar installation, and code compliant door hardware upgrades for business exits.',
    problems: [
      'Exit doors without compliant egress hardware',
      'Old crash bars that fail push-to-exit operation',
      'Panic bars that bind, sag, or misalign with latch points',
      'Openings that fail life-safety or occupancy checks',
      'Emergency exit door repair requests that require full replacement'
    ],
    related: [
      ['/service-panic-bars', 'Panic Bar Repair'],
      ['/service-exit-devices', 'Exit Device Repair'],
      ['/service-exit-device-installation', 'Exit Device Installation'],
      ['/service-fire-door-compliance', 'Fire Door Compliance'],
      ['/service-door-hardware', 'Commercial Door Hardware']
    ],
    faq: [
      ['Do you install panic bars on existing commercial doors?', 'Yes. We install panic bars on existing doors when the opening can support compliant hardware preparation and mounting.'],
      ['What brands of panic bars do you install?', 'We install major commercial brands and match the opening use case, traffic level, and code requirements.'],
      ['Can you replace a crash bar the same day?', 'In many cases yes, especially for standard rim panic bars and common commercial door setups.'],
      ['Do panic bar installs include adjustment and testing?', 'Yes. We test push operation, latch performance, and door closing behavior before sign-off.'],
      ['Do you serve outside Washington DC?', 'Yes. We install panic bars across Washington DC, Northern Virginia, Maryland, and New York service routes.']
    ]
  },
  {
    slug: 'service-exit-device-installation',
    title: 'Exit Device Installation DC | Code-Compliant 24/7',
    description:
      'Exit device installation Washington DC for rim, mortise, and concealed rod systems. Get compliant emergency egress hardware with fast scheduling.',
    h1: 'Exit Device Installation Washington DC',
    kicker: 'Rim, Mortise, and Concealed Rod Exit Devices',
    hero:
      'Install reliable exit devices that protect life safety and keep inspections moving. We install commercial exit hardware for retail, office, school, and mixed-use buildings.',
    serviceType: 'Exit Device Installation',
    keywordLine:
      'We handle exit device installation, emergency exit door repair upgrades, and code-compliant egress hardware setup for commercial facilities.',
    problems: [
      'Missing or non-compliant exit hardware on required egress doors',
      'Failing surface vertical rod and concealed vertical rod devices',
      'Mortise exit hardware with worn trim and latch components',
      'Doors that fail to release or relatch after use',
      'Inspection findings related to emergency exit operation'
    ],
    related: [
      ['/service-exit-devices', 'Exit Device Repair'],
      ['/service-panic-bars', 'Panic Bar Repair'],
      ['/service-panic-bar-installation', 'Panic Bar Installation'],
      ['/service-fire-door-compliance', 'Fire Door Compliance'],
      ['/service-door-hardware', 'Commercial Door Hardware']
    ],
    faq: [
      ['Do you install rim and concealed rod exit devices?', 'Yes. We install rim, mortise, and concealed/surface rod exit devices for commercial openings.'],
      ['Can you match exit hardware to existing door prep?', 'Yes. We assess the opening and recommend the right hardware and prep path for safe installation.'],
      ['Do you provide emergency replacement if an exit device fails?', 'Yes. We offer emergency commercial locksmith dispatch and same-day replacement options when available.'],
      ['Can exit device installation help with fire door compliance?', 'Yes. Correctly selected and installed exit hardware supports code-compliant fire door function.'],
      ['What areas do you cover?', 'Washington DC, Northern Virginia, Maryland, and New York.']
    ]
  },
  {
    slug: 'service-door-closer-adjustment',
    title: 'Door Closer Adjustment DC | Commercial Door Service',
    description:
      'Door closer adjustment Washington DC for slamming, drifting, and non-latching doors. Fast commercial service for offices, retail, and facilities.',
    h1: 'Door Closer Adjustment Washington DC',
    kicker: 'Fix Slamming or Slow-Closing Commercial Doors',
    hero:
      'If your commercial door closer slams, drifts, or will not latch, we provide precision adjustment and repair to restore safe daily operation.',
    serviceType: 'Door Closer Adjustment',
    keywordLine:
      'We solve commercial door closer repair issues including door closer leaking oil, door closer not closing, door will not latch, and door not locking properly.',
    problems: [
      'Door closer slams the door too fast',
      'Door closes too slowly and fails latch capture',
      'Leaking closer body causing pressure loss',
      'Backcheck and sweep settings out of range',
      'Door drag and alignment issues affecting closer performance'
    ],
    related: [
      ['/service-door-closers', 'Door Closer Repair'],
      ['/service-commercial-door-closer-installation', 'Commercial Door Closer Installation'],
      ['/service-fire-door-compliance', 'Fire Door Compliance'],
      ['/service-door-hardware', 'Commercial Door Hardware'],
      ['/service-panic-bars', 'Panic Bar Repair']
    ],
    faq: [
      ['Can you adjust a commercial door closer that slams?', 'Yes. We tune sweep, latch, and backcheck settings and inspect the opening for alignment issues.'],
      ['What if the closer is leaking oil?', 'A leaking closer often needs replacement because hydraulic pressure cannot be restored reliably.'],
      ['Can adjustment fix a door that will not latch?', 'Often yes, but we also check strike alignment, hinges, and latch condition for complete diagnosis.'],
      ['Do you handle after-hours closer emergencies?', 'Yes. We provide after-hours commercial locksmith and emergency door repair support.'],
      ['Do you service all regions you advertise?', 'Yes. Washington DC, Northern Virginia, Maryland, and New York are all served.']
    ]
  },
  {
    slug: 'service-commercial-door-closer-installation',
    title: 'Commercial Door Closer Installation DC | 24/7 Service',
    description:
      'Commercial door closer installation Washington DC with code-compliant setup and reliable closing control. Request a free estimate today.',
    h1: 'Commercial Door Closer Installation Washington DC',
    kicker: 'New Closers for High-Traffic Business Openings',
    hero:
      'Install the right commercial closer for your door type, occupancy load, and compliance requirements. We provide clean installs and precise setup.',
    serviceType: 'Commercial Door Closer Installation',
    keywordLine:
      'This page targets door closer installation, commercial door closer repair lifecycle replacement, and fire-rated closer upgrades for code compliance.',
    problems: [
      'Missing closer on required self-closing openings',
      'Undersized closer for heavy-use doors',
      'Incorrect arm setup causing latch failures',
      'Old closer bodies with repeat leaks and failures',
      'Fire-rated doors requiring compliant closing behavior'
    ],
    related: [
      ['/service-door-closers', 'Door Closer Repair'],
      ['/service-door-closer-adjustment', 'Door Closer Adjustment'],
      ['/service-fire-door-compliance', 'Fire Door Compliance'],
      ['/service-fire-doors', 'Fire Door Inspection'],
      ['/service-door-hardware', 'Commercial Door Hardware']
    ],
    faq: [
      ['Do you install closers on storefront and interior doors?', 'Yes. We install closers on storefront, office, corridor, and rated openings.'],
      ['Can you recommend closer size and arm type?', 'Yes. We match closer strength and arm configuration to door weight, width, and use case.'],
      ['Do you test latch performance after install?', 'Yes. We adjust sweep and latch speeds and verify reliable closing and latching.'],
      ['Can you install closers during off-hours?', 'Yes. We schedule around business operations and can support after-hours installs.'],
      ['Do you serve multi-site properties?', 'Yes. We work with property managers and facilities teams across the full service area.']
    ]
  },
  {
    slug: 'service-fire-door-compliance',
    title: 'Fire Door Compliance DC | Inspection & Correction Help',
    description:
      'Fire door compliance Washington DC support for inspections, deficiency correction, and code-compliant door hardware. Call 24/7 for help.',
    h1: 'Fire Door Compliance Washington DC',
    kicker: 'Inspection Support, Deficiency Repair, and Documentation',
    hero:
      'Stay ahead of compliance risk with practical fire door support. We inspect openings, identify deficiencies, and complete correction work fast.',
    serviceType: 'Fire Door Compliance',
    keywordLine:
      'We handle fire door inspection, fire door compliance, fire door repair, and code compliant door hardware correction across commercial properties.',
    problems: [
      'Openings failing annual fire door inspection',
      'Non-latching doors and damaged closing hardware',
      'Unapproved field modifications or incompatible hardware',
      'Missing documentation for inspection follow-up',
      'Emergency deficiencies needing same-day correction'
    ],
    related: [
      ['/service-fire-doors', 'Fire Door Inspection'],
      ['/fire-door-deficiency-repair', 'Fire Door Deficiency Repair'],
      ['/service-exit-device-installation', 'Exit Device Installation'],
      ['/service-door-closer-adjustment', 'Door Closer Adjustment'],
      ['/service-panic-bar-installation', 'Panic Bar Installation']
    ],
    faq: [
      ['Do you help with fire door compliance documentation?', 'Yes. We provide practical findings and correction guidance to support your compliance process.'],
      ['Can you repair deficiencies after inspection?', 'Yes. We correct many common deficiencies involving closers, panic bars, latches, and hardware alignment.'],
      ['Do you support annual inspection planning?', 'Yes. We can coordinate annual inspection cycles and phased correction workflows.'],
      ['Do you work on occupied buildings?', 'Yes. We regularly coordinate with property managers to reduce operational disruption.'],
      ['What areas do you serve for compliance support?', 'Washington DC, Northern Virginia, Maryland, and New York.']
    ]
  },
  {
    slug: 'service-commercial-rekey',
    title: 'Commercial Rekey Service DC | Business Lock Security',
    description:
      'Commercial rekey service Washington DC for offices, retail, and managed properties. Fast key control resets, master key updates, and lock security.',
    h1: 'Commercial Rekey Service Washington DC',
    kicker: 'Fast Key Control After Turnover or Access Changes',
    hero:
      'Need to secure your business quickly after staffing or tenant changes? Our commercial rekey service resets lock access without full hardware replacement.',
    serviceType: 'Commercial Rekey Service',
    keywordLine:
      'We provide commercial rekey service, business lock change planning, tenant lock change workflows, and restricted key system upgrades.',
    problems: [
      'Employee turnover and uncertain key copies',
      'Lost keys and uncontrolled access risk',
      'Tenant move-in / move-out access transitions',
      'Key hierarchy confusion across multi-suite properties',
      'Urgent office lockout and key reset needs'
    ],
    related: [
      ['/service-business-lock-change', 'Business Lock Change'],
      ['/service-tenant-lock-change', 'Tenant Lock Change Service'],
      ['/master-key-systems', 'Master Key Systems'],
      ['/service-restricted-key-systems', 'Restricted Key Systems'],
      ['/service-locksmith', 'Commercial Locksmith']
    ],
    faq: [
      ['When should a business rekey its locks?', 'After employee turnover, lost keys, vendor access changes, or tenant transitions to restore key control.'],
      ['Is rekeying faster than replacing all locks?', 'In many cases yes, especially when existing hardware is still in good condition.'],
      ['Can you rekey multiple suites in one visit?', 'Yes. We support portfolio and multi-tenant workflows for property managers and facilities teams.'],
      ['Do you provide master key updates during rekey service?', 'Yes. We can redesign or expand master key structures as part of the rekey process.'],
      ['Do you offer emergency rekey service?', 'Yes. We provide same-day and after-hours commercial locksmith support when urgency is high.']
    ]
  },
  {
    slug: 'service-business-lock-change',
    title: 'Business Lock Change DC | Commercial Locksmith 24/7',
    description:
      'Business lock change Washington DC for offices, retail stores, and managed properties. Same-day lock replacement and key control support.',
    h1: 'Business Lock Change Washington DC',
    kicker: 'Upgrade or Replace Commercial Locks Fast',
    hero:
      'If your business lock hardware is damaged, outdated, or insecure, we provide fast commercial lock change service with quality hardware options.',
    serviceType: 'Business Lock Change',
    keywordLine:
      'This page targets business lock change, commercial lock repair, commercial lock installation, and office locksmith security upgrades.',
    problems: [
      'Worn cylinders and unreliable lock operation',
      'Post-incident security upgrades after attempted entry',
      'Old lock platforms incompatible with key control goals',
      'Frequent keying issues and repeated lockouts',
      'Need for same-day lock change before opening hours'
    ],
    related: [
      ['/service-commercial-rekey', 'Commercial Rekey Service'],
      ['/service-office-lockout', 'Office Lockout Service'],
      ['/service-restricted-key-systems', 'Restricted Key Systems'],
      ['/master-key-systems', 'Master Key Systems'],
      ['/service-locksmith', 'Commercial Locksmith']
    ],
    faq: [
      ['Can you change business locks the same day?', 'Yes. Same-day scheduling is available for many common commercial lock platforms.'],
      ['Should I rekey or replace my locks?', 'We recommend based on hardware condition, security goals, and timeline.'],
      ['Do you install high-security commercial cylinders?', 'Yes. We install and service commercial lock options for stronger key control.'],
      ['Can lock changes be done after hours?', 'Yes. After-hours locksmith service is available for urgent business needs.'],
      ['Do you work with property managers?', 'Yes. We routinely support property manager and facility locksmith programs.']
    ]
  },
  {
    slug: 'service-restricted-key-systems',
    title: 'Restricted Key Systems DC | Commercial Key Control',
    description:
      'Restricted key systems Washington DC for businesses needing tighter key duplication control, audit-friendly structures, and long-term security.',
    h1: 'Restricted Key Systems Washington DC',
    kicker: 'Control Key Duplication and Access Risk',
    hero:
      'Move beyond uncontrolled key copies with a restricted key system built for business operations, staff changes, and multi-site oversight.',
    serviceType: 'Restricted Key Systems',
    keywordLine:
      'Ideal for restricted key system upgrades, master key system cost planning, and commercial locksmith security programs.',
    problems: [
      'Unknown key copies circulating outside management control',
      'No clear key issuance and return workflow',
      'Frequent turnover in office or retail staffing',
      'Multi-tenant sites needing tighter key hierarchy',
      'Audit gaps in key access documentation'
    ],
    related: [
      ['/master-key-systems', 'Master Key Systems'],
      ['/service-commercial-rekey', 'Commercial Rekey Service'],
      ['/service-business-lock-change', 'Business Lock Change'],
      ['/service-property-manager-locksmith', 'Property Manager Locksmith Service'],
      ['/service-locksmith', 'Commercial Locksmith']
    ],
    faq: [
      ['What is a restricted key system?', 'A key control platform that limits duplication and centralizes authorized key management.'],
      ['Is a restricted system useful for small businesses?', 'Yes. It reduces access risk and helps owners track who has keys over time.'],
      ['Can restricted keys be used with master key structures?', 'Yes. We design systems that combine hierarchy and controlled duplication.'],
      ['Do you provide rollout support for occupied properties?', 'Yes. We phase rollout by suite or zone to reduce operational disruption.'],
      ['Do you serve property management portfolios?', 'Yes. Property manager locksmith workflows are a core part of this service.']
    ]
  },
  {
    slug: 'service-office-lockout',
    title: 'Office Lockout Service DC | Emergency Commercial Help',
    description:
      'Office lockout service Washington DC with rapid emergency response, damage-minimizing entry, and immediate lock security restoration.',
    h1: 'Office Lockout Service Washington DC',
    kicker: '24 Hour Commercial Locksmith for Business Lockouts',
    hero:
      'Locked out of your office, suite, or storefront? We dispatch emergency commercial locksmith technicians for fast re-entry and security follow-up.',
    serviceType: 'Office Lockout Service',
    keywordLine:
      'This service targets office lockout, business lockout service, emergency locksmith open now, locksmith that comes to you, and after-hours locksmith calls.',
    problems: [
      'Keys left inside after closing',
      'Cylinder failures preventing normal entry',
      'Electronic lock credential mismatch',
      'After-hours lockout with staff waiting onsite',
      'Need to secure access immediately after forced entry concerns'
    ],
    related: [
      ['/service-locksmith', 'Commercial Locksmith'],
      ['/emergency-commercial-locksmith', 'Emergency Commercial Locksmith'],
      ['/service-business-lock-change', 'Business Lock Change'],
      ['/service-commercial-rekey', 'Commercial Rekey Service'],
      ['/service-access-control', 'Access Control Installation']
    ],
    faq: [
      ['How fast can you respond to an office lockout?', 'Response time depends on traffic and queue, but same-day and emergency dispatch are available 24/7.'],
      ['Can you unlock the office without drilling?', 'In many cases yes. We use non-destructive entry methods whenever possible.'],
      ['Do you offer after-hours lockout support?', 'Yes. We provide after-hours commercial locksmith service and emergency door repair support.'],
      ['Can you rekey after a lockout?', 'Yes. We can rekey or change locks immediately when key control is compromised.'],
      ['What areas do you serve?', 'Washington DC, Northern Virginia, Maryland, and New York.']
    ]
  },
  {
    slug: 'service-property-manager-locksmith',
    title: 'Property Manager Locksmith DC | 24/7 Commercial Help',
    description:
      'Property manager locksmith service Washington DC for rekeys, lock changes, turnovers, emergency calls, and code-compliant door hardware support.',
    h1: 'Property Manager Locksmith Service Washington DC',
    kicker: 'Portfolio-Ready Commercial Locksmith Support',
    hero:
      'We support property managers and facility teams with recurring locksmith, rekey, lock change, and life-safety door hardware needs across multiple properties.',
    serviceType: 'Property Manager Locksmith Service',
    keywordLine:
      'Built for property manager locksmith and facility locksmith workflows, including tenant lock change, business lock change, and emergency dispatch coordination.',
    problems: [
      'Frequent tenant and staff turnover events',
      'Multiple buildings with inconsistent lock standards',
      'Delayed response from generalist vendors',
      'Recurring panic bar, closer, and latch failures',
      'Need for predictable service documentation and approvals'
    ],
    related: [
      ['/service-tenant-lock-change', 'Tenant Lock Change Service'],
      ['/service-commercial-rekey', 'Commercial Rekey Service'],
      ['/service-restricted-key-systems', 'Restricted Key Systems'],
      ['/master-key-systems', 'Master Key Systems'],
      ['/service-fire-door-compliance', 'Fire Door Compliance']
    ],
    faq: [
      ['Do you work with property managers and facility managers?', 'Yes. This is a core service focus with scheduling and documentation support.'],
      ['Can you handle multi-property rekey programs?', 'Yes. We plan phased rekey and lock change work across portfolios.'],
      ['Do you support emergency requests after hours?', 'Yes. 24/7 emergency commercial locksmith service is available.'],
      ['Can you standardize lock hardware across buildings?', 'Yes. We can recommend and implement standardized lock and key control strategy.'],
      ['Do you assist with fire door compliance issues?', 'Yes. We coordinate panic bar, closer, and exit hardware corrections tied to compliance findings.']
    ]
  },
  {
    slug: 'service-tenant-lock-change',
    title: 'Tenant Lock Change Service DC | Fast Rekey & Locks',
    description:
      'Tenant lock change service Washington DC for move-ins, move-outs, and turnover security. Fast rekey or lock replacement for managed properties.',
    h1: 'Tenant Lock Change Service Washington DC',
    kicker: 'Secure Unit Turnovers Without Delays',
    hero:
      'Complete tenant lock change and rekey service for property teams managing office, retail, and mixed-use occupancy transitions.',
    serviceType: 'Tenant Lock Change Service',
    keywordLine:
      'Designed for tenant lock change, commercial rekey service, business lock change, and property manager locksmith turnover workflows.',
    problems: [
      'Move-out completed but key return is uncertain',
      'Urgent same-day turnover before next occupancy',
      'Legacy keyways with poor duplication control',
      'Office suite transitions needing immediate rekey',
      'Multiple units requiring coordinated access reset'
    ],
    related: [
      ['/service-commercial-rekey', 'Commercial Rekey Service'],
      ['/service-business-lock-change', 'Business Lock Change'],
      ['/service-property-manager-locksmith', 'Property Manager Locksmith Service'],
      ['/service-restricted-key-systems', 'Restricted Key Systems'],
      ['/service-office-lockout', 'Office Lockout Service']
    ],
    faq: [
      ['Can you handle same-day tenant lock changes?', 'Yes. Same-day tenant turnover lock service is available in many cases.'],
      ['Should we rekey or replace locks between tenants?', 'We advise based on hardware condition, key control, and turnover timeline.'],
      ['Do you provide service for commercial and mixed-use buildings?', 'Yes. We support office, retail, multifamily, and mixed-use properties.'],
      ['Can lock changes be bundled across multiple suites?', 'Yes. We coordinate batch changes for property managers and facilities teams.'],
      ['Do you cover DC, VA, MD, and NY routes?', 'Yes. We serve Washington DC, Northern Virginia, Maryland, and New York.']
    ]
  }
];

const blogPosts = [
  {
    slug: 'blog-fire-door-inspection-checklist-businesses-washington-dc',
    title: 'Fire Door Inspection Checklist for Businesses in Washington DC',
    description:
      'Practical fire door inspection checklist for Washington DC businesses with compliance steps, deficiency priorities, and fast correction planning.',
    h1: 'Fire Door Inspection Checklist for Businesses in Washington DC',
    kicker: 'Practical Compliance Guidance for Property Teams',
    intro:
      'Use this checklist to prepare inspections, document deficiencies, and prioritize corrections before compliance deadlines create operational pressure.',
    bodyTitle: 'What to Check First',
    bodyPoints: [
      'Confirm rated labels are present and legible on door and frame assemblies.',
      'Test full self-close and positive latch behavior on every inspected opening.',
      'Inspect panic bars, exit devices, and closer performance under normal traffic.',
      'Review clearances, gasketing, and door/frame condition for visible failures.',
      'Capture findings by opening ID so repairs can be routed quickly.'
    ],
    links: [
      ['/service-fire-doors', 'Fire Door Inspection Service'],
      ['/service-fire-door-compliance', 'Fire Door Compliance'],
      ['/fire-door-deficiency-repair', 'Fire Door Deficiency Repair']
    ],
    faq: [
      ['How often should businesses run fire door inspections?', 'Annual inspection cycles are typical, with interim checks when high-traffic risks are identified.'],
      ['Can deficiencies be corrected in phases?', 'Yes. Many businesses prioritize urgent life-safety items first, then phase remaining corrections.'],
      ['Who can perform correction work?', 'Commercial door and locksmith specialists can handle many closer, latch, panic bar, and hardware corrections.'],
      ['Do you serve outside DC for this service?', 'Yes. We also support Northern Virginia, Maryland, and New York service routes.']
    ]
  },
  {
    slug: 'blog-panic-bar-repair-signs-exit-device-needs-service',
    title: 'Panic Bar Repair: Signs Your Exit Device Needs Service',
    description:
      'Learn the warning signs of panic bar and exit device failure, when to repair vs replace, and how to avoid emergency egress downtime.',
    h1: 'Panic Bar Repair: Signs Your Exit Device Needs Service',
    kicker: 'Avoid Egress Failures Before They Become Emergencies',
    intro:
      'Small symptoms often appear before total failure. Catching those signs early can prevent emergency calls, failed inspections, and unsafe exits.',
    bodyTitle: 'Warning Signs to Watch',
    bodyPoints: [
      'Push bar movement feels sticky, uneven, or delayed.',
      'Latch does not fully retract or fails to relatch after closing.',
      'Door alignment drift creates friction at strikes and rods.',
      'Dogging behavior changes unexpectedly between shifts.',
      'Emergency exit door repair calls increase on the same opening.'
    ],
    links: [
      ['/service-panic-bars', 'Panic Bar Repair'],
      ['/service-panic-bar-installation', 'Panic Bar Installation'],
      ['/service-exit-devices', 'Exit Device Repair']
    ],
    faq: [
      ['Can a panic bar be repaired instead of replaced?', 'Often yes, depending on wear level, parts availability, and overall opening condition.'],
      ['Do you repair crash bars and push bars?', 'Yes. We service common commercial crash bar and push bar configurations.'],
      ['What is the fastest way to request service?', 'Call 703-244-0559 for emergency and same-day dispatch options.'],
      ['Do you work with property managers?', 'Yes. We regularly support portfolio teams and facility managers.']
    ]
  },
  {
    slug: 'blog-door-closer-not-closing-common-causes-fixes',
    title: 'Door Closer Not Closing? Common Causes and Fixes',
    description:
      'Door closer not closing properly? Review common commercial causes, safe first checks, and when to schedule urgent door closer service.',
    h1: 'Door Closer Not Closing? Common Causes and Fixes',
    kicker: 'Commercial Door Closer Troubleshooting',
    intro:
      'When doors stop latching, security and compliance risks follow quickly. Start with the most common causes before deciding on adjustment or replacement.',
    bodyTitle: 'Most Common Causes',
    bodyPoints: [
      'Improper sweep/latch speed settings after ad-hoc adjustment.',
      'Hydraulic closer body leaking oil and losing control pressure.',
      'Door or frame misalignment causing drag near the strike.',
      'Worn hinges changing closing geometry.',
      'Incorrect closer size for door weight and traffic level.'
    ],
    links: [
      ['/service-door-closers', 'Door Closer Repair'],
      ['/service-door-closer-adjustment', 'Door Closer Adjustment'],
      ['/service-commercial-door-closer-installation', 'Door Closer Installation']
    ],
    faq: [
      ['Can adjustment fix a door that slams?', 'Often yes, if the closer is healthy and the opening alignment is stable.'],
      ['What if the closer is leaking oil?', 'Leaking often indicates replacement is the reliable long-term solution.'],
      ['Do you service after-hours closer failures?', 'Yes. Emergency and after-hours service is available.'],
      ['Do you support fire-rated openings?', 'Yes. We service closers on fire door assemblies with compliance in mind.']
    ]
  },
  {
    slug: 'blog-when-should-business-rekey-locks',
    title: 'When Should a Business Rekey Its Locks?',
    description:
      'Know when to rekey business locks after turnover, lost keys, or access changes. Practical timing guidance for property and facility teams.',
    h1: 'When Should a Business Rekey Its Locks?',
    kicker: 'Key Control Timing for Commercial Properties',
    intro:
      'Rekey timing is one of the biggest security decisions for business owners and property managers. Delay too long and access risk compounds.',
    bodyTitle: 'High-Priority Rekey Triggers',
    bodyPoints: [
      'Employee separation where keys were not fully returned.',
      'Vendor access ended with uncertain key copy history.',
      'Tenant turnover in office or mixed-use buildings.',
      'Lost keys for high-access areas.',
      'Repeated lockouts caused by inconsistent key management.'
    ],
    links: [
      ['/service-commercial-rekey', 'Commercial Rekey Service'],
      ['/service-business-lock-change', 'Business Lock Change'],
      ['/service-restricted-key-systems', 'Restricted Key Systems']
    ],
    faq: [
      ['Is rekeying cheaper than replacing locks?', 'In many cases yes, especially when existing hardware remains in good condition.'],
      ['Should we rekey after every tenant move-out?', 'For many managed properties, yes, especially when key history is unclear.'],
      ['Can rekey work be done same day?', 'Same-day options are available for many commercial keyways.'],
      ['Do you handle multi-site rekey projects?', 'Yes. We support portfolio-level rekey planning and execution.']
    ]
  },
  {
    slug: 'blog-master-key-system-guide-offices-property-managers',
    title: 'Master Key System Guide for Offices and Property Managers',
    description:
      'Master key system guide covering hierarchy design, rollout planning, and common mistakes for office buildings and managed properties.',
    h1: 'Master Key System Guide for Offices and Property Managers',
    kicker: 'Build a Practical, Secure Key Hierarchy',
    intro:
      'A master key system should simplify operations without creating uncontrolled access risk. Design quality determines whether it scales or fails.',
    bodyTitle: 'Core Planning Steps',
    bodyPoints: [
      'Map access zones by function, not just floor or tenant.',
      'Define who can approve key issuance and duplication.',
      'Document emergency override paths for facilities teams.',
      'Use restricted key options where duplication control matters.',
      'Plan phased rollout to minimize tenant disruption.'
    ],
    links: [
      ['/master-key-systems', 'Master Key Systems Service'],
      ['/service-restricted-key-systems', 'Restricted Key Systems'],
      ['/service-property-manager-locksmith', 'Property Manager Locksmith Service']
    ],
    faq: [
      ['What affects master key system cost?', 'Door count, key hierarchy complexity, cylinder type, and rollout scope all impact cost.'],
      ['Can an existing building transition to a master key system?', 'Yes. Many properties phase transitions by suite or zone.'],
      ['Should restricted keys be included?', 'Often yes, especially when duplication control is critical.'],
      ['Do you support property managers directly?', 'Yes. We coordinate with property and facilities teams end-to-end.']
    ]
  },
  {
    slug: 'blog-access-control-systems-small-business-what-to-know',
    title: 'Access Control Systems for Small Businesses: What to Know',
    description:
      'Access control systems for small businesses explained: keyless entry options, planning tips, and rollout guidance for office and retail properties.',
    h1: 'Access Control Systems for Small Businesses: What to Know',
    kicker: 'Keyless Entry Planning Without Overbuilding',
    intro:
      'Small businesses can deploy effective access control without enterprise complexity. Start with realistic risk, staffing, and entry flow needs.',
    bodyTitle: 'What to Evaluate First',
    bodyPoints: [
      'Entry points that need credential control vs free egress.',
      'Credential type: keypad, card, mobile, or mixed model.',
      'Power and door hardware compatibility at each opening.',
      'After-hours lock/unlock scheduling and override rules.',
      'Growth path for additional doors or suites.'
    ],
    links: [
      ['/service-access-control', 'Access Control Installation'],
      ['/access-control-systems', 'Access Control Systems Overview'],
      ['/service-locksmith', 'Commercial Locksmith']
    ],
    faq: [
      ['Do you install access control for small businesses?', 'Yes. We design and install right-sized access control for offices, retail, and mixed-use sites.'],
      ['Can access control be added to existing doors?', 'Often yes, depending on hardware condition and power path options.'],
      ['What if we still need mechanical key backup?', 'Hybrid setups can combine keyless entry with controlled mechanical backup.'],
      ['Do you serve DC, VA, MD, and NY?', 'Yes. Service is available across all core coverage regions.']
    ]
  },
  {
    slug: 'blog-why-commercial-door-wont-latch-properly',
    title: 'Why Your Commercial Door Won’t Latch Properly',
    description:
      'Commercial door won’t latch properly? Learn common causes, quick checks, and when to call for lock, closer, strike, or alignment repair.',
    h1: 'Why Your Commercial Door Won’t Latch Properly',
    kicker: 'Fix Latching Issues Before They Become Lockouts',
    intro:
      'A door that will not latch is both a security issue and a compliance risk. Most failures involve alignment, closer behavior, or worn hardware interaction.',
    bodyTitle: 'Typical Root Causes',
    bodyPoints: [
      'Strike and latch misalignment after frame movement.',
      'Closer speed settings that prevent full latch capture.',
      'Worn latch components on high-cycle openings.',
      'Hinge sag changing door position over time.',
      'Weather, traffic, and repeated impacts affecting door geometry.'
    ],
    links: [
      ['/service-door-hardware', 'Commercial Door Hardware Repair'],
      ['/service-door-closers', 'Door Closer Repair'],
      ['/door-repair-washington-dc', 'Commercial Door Repair Washington DC']
    ],
    faq: [
      ['Can a non-latching door be repaired same day?', 'In many cases yes, especially when parts are available and alignment is correctable onsite.'],
      ['Is this a fire door compliance issue?', 'If the opening is rated, non-latching behavior can become a compliance deficiency.'],
      ['Should we replace the lock immediately?', 'Not always. Diagnosis should confirm whether lock, closer, strike, or alignment is the root cause.'],
      ['Do you provide emergency response?', 'Yes. We handle emergency door repair and after-hours locksmith calls.']
    ]
  },
  {
    slug: 'blog-emergency-commercial-locksmith-after-break-in',
    title: 'Emergency Commercial Locksmith: What to Do After a Break-In',
    description:
      'After a break-in, secure your business fast with emergency locksmith steps for lock changes, rekeying, and temporary access control stabilization.',
    h1: 'Emergency Commercial Locksmith: What to Do After a Break-In',
    kicker: 'Immediate Security Recovery Checklist',
    intro:
      'The first hour after a break-in is critical. Use this sequence to secure entries, restore key control, and limit follow-on risk.',
    bodyTitle: 'Priority Actions',
    bodyPoints: [
      'Secure compromised openings and isolate failed hardware.',
      'Change or rekey affected locks before next shift turnover.',
      'Document damage and access points for insurance and management.',
      'Review whether restricted key or access control upgrades are needed.',
      'Schedule follow-up hardening after immediate stabilization.'
    ],
    links: [
      ['/emergency-commercial-locksmith', 'Emergency Commercial Locksmith'],
      ['/service-business-lock-change', 'Business Lock Change'],
      ['/service-commercial-rekey', 'Commercial Rekey Service']
    ],
    faq: [
      ['How quickly can you dispatch after a break-in?', 'Emergency dispatch is available 24/7 with same-day service windows.'],
      ['Should we rekey or change locks after forced entry?', 'It depends on damage extent and access risk. We assess and recommend the fastest safe path.'],
      ['Can you secure temporary access the same visit?', 'Yes. We can stabilize access immediately, then phase permanent upgrades.'],
      ['Do you support property managers in these events?', 'Yes. We coordinate with building teams for fast approvals and updates.']
    ]
  },
  {
    slug: 'blog-fire-door-compliance-mistakes-businesses-avoid',
    title: 'Fire Door Compliance Mistakes Businesses Should Avoid',
    description:
      'Avoid common fire door compliance mistakes that cause failed inspections, costly rework, and preventable operational delays in commercial buildings.',
    h1: 'Fire Door Compliance Mistakes Businesses Should Avoid',
    kicker: 'Reduce Repeat Deficiencies and Inspection Delays',
    intro:
      'Most compliance failures are repeatable and preventable. Addressing a few high-impact mistakes can significantly lower risk and repair cost.',
    bodyTitle: 'Frequent Mistakes',
    bodyPoints: [
      'Treating non-latching behavior as a minor issue.',
      'Mixing incompatible hardware during emergency repairs.',
      'Skipping documented correction planning after findings.',
      'Delaying closer and panic hardware correction beyond safe windows.',
      'Not validating repairs against opening-by-opening records.'
    ],
    links: [
      ['/service-fire-door-compliance', 'Fire Door Compliance Service'],
      ['/service-fire-doors', 'Fire Door Inspection'],
      ['/fire-door-deficiency-repair', 'Fire Door Deficiency Repair']
    ],
    faq: [
      ['What is the most common fire door compliance failure?', 'Non-latching openings and failing closer/exit hardware are among the most common issues.'],
      ['Can panic bar problems affect compliance?', 'Yes. Exit hardware failures can produce immediate life-safety concerns and inspection findings.'],
      ['How should businesses prioritize corrections?', 'Address immediate life-safety risks first, then phase lower-risk items with clear timelines.'],
      ['Do you provide both inspection and repair support?', 'Yes. We support inspection planning and deficiency correction workflows.']
    ]
  },
  {
    slug: 'blog-panic-bar-vs-exit-device-difference',
    title: 'Panic Bar vs Exit Device: What Is the Difference?',
    description:
      'Understand panic bar vs exit device differences, where each is used, and how to choose the right egress hardware for your commercial property.',
    h1: 'Panic Bar vs Exit Device: What Is the Difference?',
    kicker: 'Choose the Right Egress Hardware for Your Opening',
    intro:
      'The terms are often used interchangeably, but hardware selection should match door type, use case, and compliance expectations.',
    bodyTitle: 'Key Differences',
    bodyPoints: [
      'Panic bar commonly refers to touch-bar egress operation on required exits.',
      'Exit device is broader and includes multiple configuration types.',
      'Opening type and traffic pattern influence hardware selection.',
      'Hardware pairing with closers, latches, and strikes affects long-term reliability.',
      'Correct installation matters as much as hardware brand choice.'
    ],
    links: [
      ['/service-panic-bars', 'Panic Bar Repair'],
      ['/service-panic-bar-installation', 'Panic Bar Installation'],
      ['/service-exit-device-installation', 'Exit Device Installation']
    ],
    faq: [
      ['Is every exit device a panic bar?', 'Not exactly. Panic bars are a common type within the broader exit device category.'],
      ['Which hardware is best for storefront exits?', 'It depends on door configuration, traffic, and compliance requirements.'],
      ['Can old panic bars be upgraded to newer exit devices?', 'Yes. Many openings can be upgraded with proper prep and hardware selection.'],
      ['Do you install and repair both types?', 'Yes. We service both panic bars and other commercial exit device configurations.']
    ]
  }
];

function localBusinessSchema(description, url) {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'Locksmith'],
    name: 'DC Emergency Lock & Door',
    description,
    telephone: '+1-703-244-0559',
    url,
    openingHours: 'Mo-Su 00:00-23:59',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Mobile Commercial Service',
      addressLocality: 'Washington',
      addressRegion: 'DC',
      postalCode: '20001',
      addressCountry: 'US'
    },
    areaServed: locationMentions,
    sameAs
  };
}

function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DC Emergency Lock & Door',
    url: DOMAIN,
    telephone: '+1-703-244-0559',
    sameAs
  };
}

function serviceSchema(page, description, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.h1,
    serviceType: page.serviceType,
    description,
    areaServed: locationMentions,
    provider: {
      '@type': 'LocalBusiness',
      name: 'DC Emergency Lock & Door',
      telephone: '+1-703-244-0559',
      url: DOMAIN
    },
    url
  };
}

function breadcrumbSchema(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.item
    }))
  };
}

function faqSchema(faq) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a }
    }))
  };
}

function tag(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}

function renderFaqHtml(faq) {
  return faq
    .map(([q, a]) => `<h3>${q}</h3><p>${a}</p>`)
    .join('');
}

function renderLinks(links) {
  return links.map(([href, label]) => `<a href="${href}">${label}</a>`).join('');
}

function servicePageHtml(page) {
  const url = `${DOMAIN}/${page.slug}`;
  const img = `${DOMAIN}/assets/img-956a4955d1ddb21c.jpg`;
  const breadcrumb = [
    { name: 'Home', item: `${DOMAIN}/` },
    { name: 'Services', item: `${DOMAIN}/#services` },
    { name: page.h1, item: url }
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google Tag Manager -->
<script>
  window.dataLayer = window.dataLayer || [];
  window.GTM_CONFIG = window.GTM_CONFIG || {
    gtmId: 'GTM-XXXXXXX',
    ga4Id: 'G-XXXXXXXXXX',
    fbPixelId: '000000000000000'
  };
  (function(w,d,s,l,i){
    if(!i || i==='GTM-XXXXXXX'){ return; }
    w[l]=w[l]||[];
    w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
    var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!=='dataLayer'?'&l='+l:'';
    j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
    f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer',window.GTM_CONFIG.gtmId);
</script>
<!-- End Google Tag Manager -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${page.title}</title>
<meta name="description" content="${page.description}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${url}">
<link rel="icon" type="image/png" href="assets/locksmith.png">
<meta property="og:type" content="website">
<meta property="og:title" content="${page.title}">
<meta property="og:description" content="${page.description}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta property="og:image:alt" content="${page.h1}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${page.title}">
<meta name="twitter:description" content="${page.description}">
<meta name="twitter:image" content="${img}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/lead-pages.css">
<link rel="stylesheet" href="assets/seo-growth.css">
${tag(localBusinessSchema(page.description, url))}
${tag(organizationSchema())}
${tag(serviceSchema(page, page.description, url))}
${tag(breadcrumbSchema(breadcrumb))}
${tag(faqSchema(page.faq))}
</head>
<body class="lead-page">
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
<div class="lead-topbar">24/7 Commercial Locksmith Dispatch - <a href="tel:${PHONE_RAW}" data-event="phone_click">${PHONE_LABEL}</a></div>
<header class="lead-hero">
  <div class="lead-wrap">
    <nav class="lead-breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/#services">Services</a><span>/</span><span>${page.h1}</span></nav>
    <span class="lead-kicker">${page.kicker}</span>
    <h1 class="lead-title">${page.h1}</h1>
    <p class="lead-subtitle">${page.hero}</p>
    <div class="lead-cta-row">
      <a class="lead-btn lead-btn-primary" href="tel:${PHONE_RAW}" data-event="phone_click">Call 24/7: ${PHONE_LABEL}</a>
      <a class="lead-btn lead-btn-danger" href="#request-service-form" data-event="quote_form_open">Request a Free Estimate</a>
      <a class="lead-btn lead-btn-ghost" href="/emergency-commercial-locksmith" data-event="service_cta_click">Emergency Commercial Locksmith</a>
    </div>
    <ul class="lead-trust">
      <li>Licensed and insured commercial specialists</li>
      <li>24/7 emergency commercial locksmith service</li>
      <li>Fast response across DC, VA, MD, and NY</li>
      <li>Code-compliance support for door hardware</li>
    </ul>
  </div>
</header>
<section class="lead-section">
  <div class="lead-wrap lead-grid two">
    <article class="lead-card">
      <h2>${page.h1} Service Overview</h2>
      <p>${page.keywordLine}</p>
      <h2>Common Problems Solved</h2>
      <ul class="lead-list">
        ${page.problems.map((p) => `<li>${p}</li>`).join('')}
      </ul>
      <div class="lead-cta-row">
        <a class="lead-btn lead-btn-primary" href="tel:${PHONE_RAW}" data-event="phone_click">Need a commercial locksmith today?</a>
        <a class="lead-btn lead-btn-danger" href="#request-service-form" data-event="quote_form_open">Request Service</a>
      </div>
    </article>
    <aside class="lead-cta-box">
      <h3>Who This Service Is For</h3>
      <ul class="lead-list">
        ${defaultAudience.map((item) => `<li>${item}</li>`).join('')}
      </ul>
      <p>Primary service coverage: ${locationMentions.join(', ')}.</p>
      <div class="lead-inline-links">
        <a href="/city-washington-dc">Washington DC</a>
        <a href="/city-northern-virginia">Northern Virginia</a>
        <a href="/city-maryland">Maryland</a>
        <a href="/city-new-york">New York</a>
      </div>
    </aside>
  </div>
</section>
<section class="lead-section alt">
  <div class="lead-wrap lead-grid two">
    <article class="lead-card">
      <h2>Frequently Asked Questions</h2>
      ${renderFaqHtml(page.faq)}
    </article>
    <aside class="lead-card">
      <h2>Related Services</h2>
      <p>Explore related commercial locksmith and door hardware support:</p>
      <div class="lead-inline-links">
        ${renderLinks(page.related)}
      </div>
      <h3 style="margin-top:16px">Service Areas We Cover</h3>
      <p>Washington DC, Northern Virginia, Maryland, and New York with emergency and scheduled service options.</p>
    </aside>
  </div>
</section>
<section class="lead-section" id="request-service-form">
  <div class="lead-wrap">
    <article class="lead-cta-box">
      <h2>Request Service</h2>
      <p>Share your details and we will follow up quickly. For urgent requests, call <a href="tel:${PHONE_RAW}" data-event="phone_click">${PHONE_LABEL}</a>.</p>
      <form class="lead-quote-form quote-form" action="https://formsubmit.co/Info@capitalglassdoor.com" method="POST" enctype="multipart/form-data">
        <div class="lead-form-row"><div><label for="${page.slug}-name">Name</label><input id="${page.slug}-name" name="Name" required></div><div><label for="${page.slug}-business">Business name</label><input id="${page.slug}-business" name="Business name" required></div></div>
        <div class="lead-form-row"><div><label for="${page.slug}-phone">Phone</label><input id="${page.slug}-phone" name="Phone" type="tel" required></div><div><label for="${page.slug}-email">Email</label><input id="${page.slug}-email" name="Email" type="email" required></div></div>
        <div class="lead-form-row"><div><label for="${page.slug}-service">Service needed</label><input id="${page.slug}-service" name="Service needed" value="${page.h1}" required></div><div><label for="${page.slug}-location">Location / service area</label><select id="${page.slug}-location" name="Service location" required><option value="">Select location</option><option>Washington DC</option><option>Northern Virginia</option><option>Maryland</option><option>New York</option></select></div></div>
        <div class="lead-form-row"><div><label for="${page.slug}-urgency">Urgency</label><select id="${page.slug}-urgency" name="Urgency" required><option value="">Select urgency</option><option>Emergency</option><option>Same day</option><option>Scheduled</option></select></div><div><label for="${page.slug}-message">Short description</label><textarea id="${page.slug}-message" name="Issue description" placeholder="Describe the issue and building type."></textarea></div></div>
        <button class="lead-btn lead-btn-primary" type="submit" data-event="quote_form_submit">Request a Free Estimate</button>
      </form>
    </article>
  </div>
</section>
<section class="lead-section alt">
  <div class="lead-wrap">
    <div class="lead-card">
      <h2>Need a Commercial Locksmith Today?</h2>
      <p>Call now for emergency commercial lock service, inspection support, and code-compliant door hardware repairs.</p>
      <div class="lead-cta-row">
        <a class="lead-btn lead-btn-primary" href="tel:${PHONE_RAW}" data-event="phone_click">Call 24/7: ${PHONE_LABEL}</a>
        <a class="lead-btn lead-btn-danger" href="#request-service-form" data-event="quote_form_open">Request a Free Estimate</a>
      </div>
    </div>
  </div>
</section>
<footer class="lead-footer">
  <div class="lead-wrap">
    <p>DC Emergency Lock & Door · Commercial locksmith, panic bars, exit devices, door closers, fire door compliance, and access control · <a href="tel:${PHONE_RAW}" style="color:#93c5fd;" data-event="phone_click">${PHONE_LABEL}</a></p>
  </div>
</footer>
<script src="assets/lead-pages.js?v=20260504" defer></script>
</body>
</html>
`;
}

function blogPageHtml(post) {
  const url = `${DOMAIN}/${post.slug}`;
  const img = `${DOMAIN}/assets/img-02691dacdfba1f73.jpg`;
  const breadcrumb = [
    { name: 'Home', item: `${DOMAIN}/` },
    { name: 'Blog', item: `${DOMAIN}/blog` },
    { name: post.h1, item: url }
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google Tag Manager -->
<script>
  window.dataLayer = window.dataLayer || [];
  window.GTM_CONFIG = window.GTM_CONFIG || {
    gtmId: 'GTM-XXXXXXX',
    ga4Id: 'G-XXXXXXXXXX',
    fbPixelId: '000000000000000'
  };
  (function(w,d,s,l,i){
    if(!i || i==='GTM-XXXXXXX'){ return; }
    w[l]=w[l]||[];
    w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
    var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!=='dataLayer'?'&l='+l:'';
    j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
    f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer',window.GTM_CONFIG.gtmId);
</script>
<!-- End Google Tag Manager -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${post.title}</title>
<meta name="description" content="${post.description}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${url}">
<link rel="icon" type="image/png" href="assets/locksmith.png">
<meta property="og:type" content="article">
<meta property="og:title" content="${post.title}">
<meta property="og:description" content="${post.description}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta property="og:image:alt" content="${post.h1}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${post.title}">
<meta name="twitter:description" content="${post.description}">
<meta name="twitter:image" content="${img}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/lead-pages.css">
<link rel="stylesheet" href="assets/seo-growth.css">
${tag(localBusinessSchema(post.description, url))}
${tag(organizationSchema())}
${tag(breadcrumbSchema(breadcrumb))}
${tag(faqSchema(post.faq))}
</head>
<body class="lead-page">
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
<div class="lead-topbar">Commercial locksmith guide support: <a href="tel:${PHONE_RAW}" data-event="phone_click">${PHONE_LABEL}</a></div>
<header class="lead-hero">
  <div class="lead-wrap">
    <nav class="lead-breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/blog">Blog</a><span>/</span><span>${post.h1}</span></nav>
    <span class="lead-kicker">${post.kicker}</span>
    <h1 class="lead-title">${post.h1}</h1>
    <p class="lead-subtitle">${post.intro}</p>
    <div class="lead-cta-row">
      <a class="lead-btn lead-btn-primary" href="tel:${PHONE_RAW}" data-event="phone_click">Call 24/7: ${PHONE_LABEL}</a>
      <a class="lead-btn lead-btn-danger" href="#blog-cta" data-event="service_cta_click">Need a commercial locksmith today?</a>
      <a class="lead-btn lead-btn-ghost" href="/service-locksmith" data-event="service_cta_click">Commercial Locksmith Service</a>
    </div>
  </div>
</header>
<section class="lead-section">
  <div class="lead-wrap lead-grid two">
    <article class="lead-card">
      <h2>${post.bodyTitle}</h2>
      <ul class="lead-list">
        ${post.bodyPoints.map((p) => `<li>${p}</li>`).join('')}
      </ul>
      <h2>Related Commercial Services</h2>
      <div class="lead-inline-links">
        ${renderLinks(post.links)}
      </div>
    </article>
    <aside class="lead-cta-box" id="blog-cta">
      <h3>Need Service Fast?</h3>
      <p>We handle emergency commercial locksmith calls, panic bar issues, door closer failures, and fire door compliance support.</p>
      <div class="lead-cta-row">
        <a class="lead-btn lead-btn-primary" href="tel:${PHONE_RAW}" data-event="phone_click">Call ${PHONE_LABEL}</a>
        <a class="lead-btn lead-btn-danger" href="/emergency-commercial-locksmith" data-event="service_cta_click">Emergency Service</a>
      </div>
    </aside>
  </div>
</section>
<section class="lead-section alt">
  <div class="lead-wrap lead-grid two">
    <article class="lead-card">
      <h2>FAQ</h2>
      ${renderFaqHtml(post.faq)}
    </article>
    <article class="lead-card">
      <h2>Service Areas</h2>
      <p>Our commercial technicians support Washington DC, Northern Virginia, Maryland, and New York with same-day and scheduled service options.</p>
      <div class="lead-inline-links">
        <a href="/city-washington-dc">Washington DC</a>
        <a href="/city-northern-virginia">Northern Virginia</a>
        <a href="/city-maryland">Maryland</a>
        <a href="/city-new-york">New York</a>
      </div>
      <h3 style="margin-top:16px">More Resources</h3>
      <div class="lead-inline-links">
        <a href="/blog">Blog Home</a>
        <a href="/service-fire-doors">Fire Door Inspection</a>
        <a href="/service-panic-bars">Panic Bar Repair</a>
        <a href="/service-door-closers">Door Closer Repair</a>
      </div>
    </article>
  </div>
</section>
<section class="lead-section">
  <div class="lead-wrap">
    <div class="lead-card">
      <h2>Need a Commercial Locksmith Today?</h2>
      <p>For urgent door and lock problems, call now. For planned work, request a free estimate and we will follow up quickly.</p>
      <div class="lead-cta-row">
        <a class="lead-btn lead-btn-primary" href="tel:${PHONE_RAW}" data-event="phone_click">Call 24/7: ${PHONE_LABEL}</a>
        <a class="lead-btn lead-btn-danger" href="#request-service-form" data-event="quote_form_open">Request a Free Estimate</a>
      </div>
    </div>
  </div>
</section>
<footer class="lead-footer">
  <div class="lead-wrap">
    <p>DC Emergency Lock & Door commercial resource · <a href="tel:${PHONE_RAW}" style="color:#93c5fd;" data-event="phone_click">${PHONE_LABEL}</a></p>
  </div>
</footer>
<script src="assets/lead-pages.js?v=20260504" defer></script>
</body>
</html>
`;
}

for (const page of servicePages) {
  const file = path.join(ROOT, `${page.slug}.html`);
  fs.writeFileSync(file, servicePageHtml(page));
}

for (const post of blogPosts) {
  const file = path.join(ROOT, `${post.slug}.html`);
  fs.writeFileSync(file, blogPageHtml(post));
}

console.log(`Generated ${servicePages.length} service pages and ${blogPosts.length} blog pages.`);
