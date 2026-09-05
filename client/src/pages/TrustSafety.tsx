import InfoPage from "@/components/layout/InfoPage";

export default function TrustSafety() {
  return (
    <InfoPage
      title="Trust & Safety"
      subtitle="How we work to keep EXPOSurE.ART a safe, authentic community"
    >
      <h2>Human-made art only</h2>
      <p>
        EXPOSurE.ART exists to support real human artists. AI-generated artwork is not
        permitted on the platform.
      </p>

      <h2>Secure accounts and payments</h2>
      <p>
        Passwords are securely hashed and never stored in plain text, and all payments are
        processed through Stripe rather than handled directly by us.
      </p>

      <h2>Reporting a problem</h2>
      <p>
        If you encounter a listing, message, or user that seems suspicious, misleading, or
        violates our community's spirit, please let us know through <a href="/contact">Contact Us</a>{" "}
        so we can look into it.
      </p>
    </InfoPage>
  );
}
