import InfoPage from "@/components/layout/InfoPage";

export default function TermsOfService() {
  return (
    <InfoPage title="Terms of Service" subtitle={`Last updated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`}>
      <p>
        These Terms of Service ("Terms") govern your use of EXPOSurE.ART (the "Site"). By
        creating an account or using the Site, you agree to these Terms.
      </p>

      <h2>1. Who can use EXPOSurE.ART</h2>
      <p>
        You must be able to form a legally binding contract to use the Site. You're
        responsible for keeping your account credentials secure and for all activity under
        your account.
      </p>

      <h2>2. Original, human-made art only</h2>
      <p>
        EXPOSurE.ART is built exclusively for original, human-created artwork. Listing
        AI-generated content, or artwork you don't have the rights to sell, is prohibited and
        may result in account suspension.
      </p>

      <h2>3. Buying and selling</h2>
      <p>
        Artists list artwork for sale at prices they set. Payments are processed through
        Stripe. EXPOSurE.ART facilitates the connection between artists and buyers but is not
        a party to the sale itself.
      </p>

      <h2>4. Messaging</h2>
      <p>
        The Site includes direct messaging between users. Please use it respectfully — abusive
        or fraudulent messages may result in account suspension.
      </p>

      <h2>5. Account termination</h2>
      <p>
        We may suspend or terminate accounts that violate these Terms, including listing
        AI-generated content, fraudulent activity, or abuse of other users.
      </p>

      <h2>6. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the Site after changes
        means you accept the updated Terms.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions about these Terms? Reach out through our <a href="/contact">Contact Us</a> page.
      </p>
    </InfoPage>
  );
}
