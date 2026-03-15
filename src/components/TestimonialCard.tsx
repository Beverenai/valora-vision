import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  name: string;
  location: string;
  rating: number;
}

const TestimonialCard = ({ quote, name, location, rating }: TestimonialCardProps) => (
  <div className="bg-card border border-border p-6 relative">
    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold" />
    <div className="mb-3 flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "fill-gold text-gold" : "text-border"}`}
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