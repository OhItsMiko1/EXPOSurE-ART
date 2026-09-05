import FAQPage from "@/components/layout/FAQPage";

export default function BuyerFAQ() {
  return (
    <FAQPage
      title="Buyer FAQ"
      subtitle="Common questions from buyers shopping on EXPOSurE.ART"
      items={[
        {
          question: "Is all the art on EXPOSurE.ART made by real people?",
          answer:
            "Yes. EXPOSurE.ART is built exclusively for original, human-created artwork — AI-generated content isn't permitted on the platform.",
        },
        {
          question: "How do I buy a piece?",
          answer:
            "Browse artwork on the Discover page, and click \"Buy Now\" on any piece that's for sale to check out securely through Stripe.",
        },
        {
          question: "Can I message an artist before buying?",
          answer:
            "Yes — every artwork page has a way to contact the artist directly if you have questions before purchasing.",
        },
        {
          question: "What if a piece isn't marked \"for sale\"?",
          answer:
            "Some artists list pieces that aren't currently for sale, such as portfolio or commission-only work. You can still message the artist to ask about it.",
        },
        {
          question: "Is my payment information safe?",
          answer:
            "Yes. All payments are processed through Stripe, and your card details are never stored on our servers.",
        },
        {
          question: "What if there's a problem with my order?",
          answer:
            "Reach out through our Contact Us page and we'll help you sort it out.",
        },
      ]}
    />
  );
}
