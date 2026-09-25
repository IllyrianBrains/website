// Shared by the signed-in member pages (rrjeti, profili, roli, organizatat) and the
// composer on /rrjeti/postimet/ (which passes showSubnav = false: it has the Rrjeti bar).
// getSession() only reads localStorage, so a session the server
// no longer accepts (revoked, signed out elsewhere) still looks signed in and
// every query then fails with 401, leaving the page blank. This checks the
// session with the server, forgets it if it's no longer valid, and keeps the
// header in step: "Llogaria"/"Bashkohu" and the member sub navbar.
import { isAuthApiError, type Session, type SupabaseClient } from '@supabase/supabase-js';

export async function memberSession(supabase: SupabaseClient, showSubnav = true): Promise<{ session: Session | null; expired: boolean }> {
  let { data: { session } } = await supabase.auth.getSession();
  let expired = false;
  if (session) {
    const { error } = await supabase.auth.getUser();
    // Only an answer from the auth server means the session is bad; a network
    // hiccup shouldn't sign anyone out.
    if (error && isAuthApiError(error)) {
      await supabase.auth.signOut({ scope: 'local' });
      session = null;
      expired = true;
    }
  }

  const subnav = document.querySelector<HTMLElement>('.member-subnav');
  if (subnav) {
    subnav.hidden = !session || !showSubnav;
  }
  const joinCta = document.querySelector<HTMLAnchorElement>('.site-header .nav-cta:not(.nav-cta-secondary)');
  if (joinCta) {
    joinCta.href = session ? '/anetaresohu/rrjeti/' : '/anetaresohu/';
    joinCta.textContent = session ? 'Llogaria' : 'Bashkohu';
  }
  return { session, expired };
}
