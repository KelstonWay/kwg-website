// Single source of truth for public contact details.
// Buyer mail goes to the shared orders@ mailbox so Samuel and Titus both see it
// (Samuel, 2026-08-25 — supersedes the 2026-07-31 call to route it to samuel@,
// and settles Titus's long-standing ask for a shared inbox). Swap CONTACT_EMAIL
// here if that changes — every buyer-facing address on the site reads from this file.

export const CONTACT_EMAIL = 'orders@kelstonway.com'
export const CONTACT_PHONE = '(859) 377-0173'
export const CONTACT_PHONE_HREF = 'tel:+18593770173'
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`
