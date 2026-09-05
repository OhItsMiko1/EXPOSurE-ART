import InfoPage from "@/components/layout/InfoPage";

export default function PrivacyPolicy() {
  return (
    <InfoPage title="Privacy Policy" subtitle={`Last updated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`}>
      <p>
        This Privacy Policy explains what information EXPOSurE.ART collects and how it's used.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>Account information you provide: username, email, full name, bio, and profile image.</li>
        <li>If you sign in with Google or Apple, basic profile info (name, email, photo) from that provider.</li>
        <li>Artwork listings, messages, and other content you create on the Site.</li>
        <li>Payment information is collected and processed directly by Stripe — we don't store your card details.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To operate your account and let you buy, sell, and message on the Site.</li>
        <li>To process payments through Stripe.</li>
        <li>To communicate with you about your account or transactions.</li>
      </ul>

      <h2>What we don't do</h2>
      <p>We don't sell your personal information to third parties.</p>

      <h2>Cookies</h2>
      <p>
        We use a small number of cookies to keep you signed in. See our{" "}
        <a href="/cookies">Cookie Policy</a> for details.
      </p>

      <h2>Your choices</h2>
      <p>
        You can update or delete your account information at any time from your Profile page.
        Contact us if you'd like help removing your data.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Reach out through our <a href="/contact">Contact Us</a> page.
      </p>
    </InfoPage>
  );
}
