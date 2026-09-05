import InfoPage from "@/components/layout/InfoPage";

export default function PricingFees() {
  return (
    <InfoPage
      title="Pricing & Fees"
      subtitle="Simple, transparent pricing for artists selling on EXPOSurE.ART"
    >
      <h2>No listing fees</h2>
      <p>
        Creating an account and listing your artwork on EXPOSurE.ART is completely free.
        There's no cost to upload, list, or showcase your work.
      </p>

      <h2>What you keep</h2>
      <p>
        Right now, EXPOSurE.ART does not take a commission on sales — artists keep 100% of
        the sale price. Standard payment processing fees charged by our payment provider
        (Stripe) apply to each transaction, the same as they would anywhere else you accept
        card payments.
      </p>

      <h2>Premium subscription</h2>
      <p>
        We offer an optional premium subscription with additional features for artists who
        want extra visibility and tools. Premium is entirely optional — you can sell on the
        free tier with no restrictions on your ability to list and sell work.
      </p>

      <h2>Questions?</h2>
      <p>
        If you have questions about pricing that aren't answered here, reach out any time
        through our <a href="/contact">Contact Us</a> page.
      </p>
    </InfoPage>
  );
}
