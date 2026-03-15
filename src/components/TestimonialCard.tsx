import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  name: string;
  location: string;
  rating: number;
}

const TestimonialCard = ({ quote, name, location, rating }: TestimonialCardProps) => (
  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
    <div className="mb-3 flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-amber text-amber" : "text-border"}`}
        />
      ))}
    </div>
    <p className="mb-4 text-sm leading-relaxed text-muted-foreground">"{quote}"</p>
    <div>
      <p className="text-sm font-semibold text-foreground">{name}</p>
      <p className="text-xs text-muted-foreground">{location}</p>
    </div>
  </div>
);

export default TestimonialCard;
