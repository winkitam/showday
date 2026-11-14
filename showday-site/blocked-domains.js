// Throwaway email services. The database blocks the same list (supabase/014_signup_protection.sql).
export const BLOCKED_DOMAINS = new Set([
  '10minutemail.com', '10minutemail.net', '20minutemail.com', 'mailinator.com', 'mailinator.net', 'guerrillamail.com',
  'guerrillamail.net', 'guerrillamail.org', 'guerrillamailblock.com', 'sharklasers.com', 'grr.la', 'pokemail.net',
  'spam4.me', 'yopmail.com', 'yopmail.fr', 'yopmail.net', 'temp-mail.org', 'temp-mail.io', 'tempmail.com', 'tempmail.net',
  'tempmailo.com', 'tempail.com', 'tempr.email', 'throwawaymail.com', 'trashmail.com', 'trashmail.de', 'trashmail.net',
  'getnada.com', 'nada.email', 'dispostable.com', 'maildrop.cc', 'mailnesia.com', 'mintemail.com', 'mohmal.com',
  'moakt.com', 'emailondeck.com', 'fakeinbox.com', 'fakemail.net', 'mailcatch.com', 'mailpoof.com', 'mytemp.email',
  'spambox.us', 'spamgourmet.com', 'tempinbox.com', 'burnermail.io', 'discard.email', 'dropmail.me', 'emailfake.com',
  'email-temp.com', 'inboxkitten.com', 'mail.tm', 'mail.gw', 'minuteinbox.com', 'tmail.ws', 'tmpmail.org', 'tmpmail.net',
  'byom.de', 'linshiyouxiang.net', 'mailto.plus', 'fexpost.com', 'fexbox.org', 'rover.info', 'chitthi.in', 'any.pink',
  'merepost.com', 'mailbox.in.ua', 'disposablemail.com', 'luxusmail.org', '33mail.com', 'anonaddy.me', 'spamex.com',
  'tempmailaddress.com', 'tempmail.plus', 'getairmail.com', 'airmail.cc', 'crazymailing.com', 'tm2mail.com', 'vomoto.com'
]);
export const isBlockedEmail = (email) => {
  const d = String(email || '').trim().toLowerCase().split('@')[1] || '';
  return BLOCKED_DOMAINS.has(d) || [...BLOCKED_DOMAINS].some((b) => d.endsWith('.' + b));
};
