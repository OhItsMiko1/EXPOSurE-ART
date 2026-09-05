import InfoPage from "@/components/layout/InfoPage";

export default function BuyerProtection() {
  return (
    <InfoPage
      title="Buyer Protection"
      subtitle="Shopping for original art should feel safe — here's how we help"
    >
      <h2>Secure payments</h2>
      <p>
        All payments on EXPOSurE.ART are processed through Stripe, a leading payment processor
        used by millions of businesses worldwide. Your card details are never stored on our
        servers.
      </p>

      <h2>Know who you're buying from</h2>
      <p>
        Every artist has a public profile showing their bio, location, and portfolio of work.
        You can message an artist directly through our built-in messaging before you buy if
        you have questions about a piece.
      </p>

      <h2>Only human-made art</h2>
      <p>
        EXPOSurE.ART is built exclusively for original, human-created artwork — no
        AI-generated content is permitted on the platform.
      </p>

      <h2>Have an issue with an order?</h2>
      <p>
        If something isn't right with an order, reach out through <a href="/contact">Contact Us</a>{" "}
        and we'll help sort it out.
      </p>
    </InfoPage>
  );
}
