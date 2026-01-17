import { Star, Calendar } from "lucide-react";

export function Header() {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
    
    return (
        <header className="text-center space-y-4 py-8">
            <div className="inline-flex items-center gap-2 animate-sparkle">
                <Star className="w-5 h-5 text-gold fill-gold" />
                <Star className="w-4 h-4 text-gold fill-gold opacity-60" />
                <Star className="w-5 h-5 text-gold fill-gold" />
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Swift Ranker
            </h1>

            <p className="text-lg text-muted-foreground font-display italic">
                Rank Taylor's songs, see how you compare
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blush">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{formattedDate}</span>
            </div>
        </header>
    );
}