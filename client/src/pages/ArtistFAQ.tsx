import FAQPage from "@/components/layout/FAQPage";

export default function ArtistFAQ() {
  return (
    <FAQPage
      title="Artist FAQ"
      subtitle="Common questions from artists selling on EXPOSurE.ART"
      items={[
        {
          question: "How do I start selling?",
          answer:
            "Register an account and check \"Register as an Artist\" during signup, then head to your Artist Dashboard to upload your first piece.",
        },
        {
          question: "Are there any listing fees?",
          answer:
            "No. Listing artwork is free, and there's currently no commission taken on sales — see our Pricing & Fees page for details.",
        },
        {
          question: "How do I get paid?",
          answer:
            "Sales are processed securely through Stripe. Buyers pay through the site, and payments are handled directly through our payment provider.",
        },
        {
          question: "Can I edit or remove a listing after posting it?",
          answer:
            "Yes. From your Artist Dashboard you can edit an existing listing's details and image, or remove it entirely.",
        },
        {
          question: "How do buyers contact me?",
          answer:
            "Buyers can message you directly through the site from your artwork's page. Replies show up in your Messages inbox.",
        },
        {
          question: "What kind of art can I list?",
          answer:
            "Only original, human-made artwork. AI-generated content is not permitted on EXPOSurE.ART.",
        },
      ]}
    />
  );
}
