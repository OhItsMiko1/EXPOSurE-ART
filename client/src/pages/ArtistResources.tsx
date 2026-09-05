import InfoPage from "@/components/layout/InfoPage";

export default function ArtistResources() {
  return (
    <InfoPage
      title="Artist Resources"
      subtitle="Tools and tips to help you get the most out of EXPOSurE.ART"
    >
      <h2>Getting started</h2>
      <p>
        After creating your artist account, head to your <a href="/dashboard">Artist Dashboard</a> to
        upload your first piece. Add a clear title, an honest description of your medium and
        dimensions, and a well-lit photo — listings with complete details get noticed more.
      </p>

      <h2>Photographing your work</h2>
      <ul>
        <li>Use natural, indirect light — avoid flash and harsh shadows.</li>
        <li>Shoot straight-on to avoid distortion, and fill the frame with the piece.</li>
        <li>Include a close-up detail shot alongside the full-piece photo when you can.</li>
      </ul>

      <h2>Writing a strong listing</h2>
      <ul>
        <li>Lead with what makes the piece distinctive — medium, technique, inspiration.</li>
        <li>List exact dimensions and materials so buyers know what they're getting.</li>
        <li>Be upfront about whether a piece is an original or a limited edition.</li>
      </ul>

      <h2>Talking with buyers</h2>
      <p>
        Buyers can message you directly through the site — check your <a href="/messages">Messages</a> inbox
        regularly and respond promptly. Quick, friendly communication builds trust and leads to sales.
      </p>

      <h2>Need more help?</h2>
      <p>
        Check our <a href="/artist-faq">Artist FAQ</a> for common questions, or reach out through{" "}
        <a href="/contact">Contact Us</a>.
      </p>
    </InfoPage>
  );
}
