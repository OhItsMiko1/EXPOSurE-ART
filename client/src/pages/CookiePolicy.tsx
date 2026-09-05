import InfoPage from "@/components/layout/InfoPage";

export default function CookiePolicy() {
  return (
    <InfoPage title="Cookie Policy" subtitle={`Last updated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`}>
      <p>
        EXPOSurE.ART uses a small number of cookies — small pieces of data stored in your
        browser — to make the Site work.
      </p>

      <h2>What we use cookies for</h2>
      <ul>
        <li>
          <strong>Keeping you signed in</strong> — a secure, essential cookie remembers your
          login session so you don't have to sign in on every page.
        </li>
      </ul>

      <h2>What we don't use cookies for</h2>
      <p>
        We don't currently use advertising or third-party tracking cookies.
      </p>

      <h2>Managing cookies</h2>
      <p>
        Most browsers let you block or delete cookies through their settings. Note that
        blocking our sign-in cookie will prevent you from staying logged in to EXPOSurE.ART.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Reach out through our <a href="/contact">Contact Us</a> page.
      </p>
    </InfoPage>
  );
}
