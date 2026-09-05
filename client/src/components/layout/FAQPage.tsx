import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQPageProps {
  title: string;
  subtitle?: string;
  items: FAQItem[];
}

export default function FAQPage({ title, subtitle, items }: FAQPageProps) {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{subtitle}</p>
        )}
      </div>
      <div className="max-w-3xl mx-auto bg-white/60 backdrop-blur-sm rounded-lg shadow-lg p-8">
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
              <AccordionContent className="text-gray-600">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
