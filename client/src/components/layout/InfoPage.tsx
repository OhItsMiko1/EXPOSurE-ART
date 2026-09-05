import { ReactNode } from "react";

interface InfoPageProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function InfoPage({ title, subtitle, children }: InfoPageProps) {
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
        <div className="prose prose-lg max-w-none prose-headings:text-fuchsia-600">
          {children}
        </div>
      </div>
    </div>
  );
}
