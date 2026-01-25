import { Users, Crown, Medal } from "lucide-react";
import type { GlobalRankingItem } from "@/lib/types";

interface Item {
    id: string;
    name: string;
    artist: string | null;
}

interface LeaderboardProps {
    items: Item[];
    globalRanking: GlobalRankingItem[];
    userRanking: string[];
}

export function Leaderboard({ items, globalRanking, userRanking }: LeaderboardProps) {
    const itemMap = new Map(items.map(i => [i.id, i]));
    
    // Calculate total votes from scores (since score = sum of (7 - rank))
    // Each vote contributes between 1 and 6 points, average ~3.5
    const totalScore = globalRanking.reduce((sum, item) => sum + item.score, 0);
    const estimatedVotes = totalScore > 0 ? Math.round(totalScore / 21) : 0; // 21 = sum(1..6)

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent">
                    <Users className="w-4 h-4 text-gold" />
                    <span className="text-sm font-medium text-foreground">
                        {estimatedVotes} Swiftie{estimatedVotes !== 1 ? 's' : ''} voted today
                    </span> 
                </div>
            </div>
            
            <div className="space-y-3">
                {globalRanking.map((entry, index) => {
                    const item = itemMap.get(entry.item_id);
                    if (!item) return null;

                    const userRank = userRanking.indexOf(entry.item_id) + 1;
                    const isTop = index === 0;
                    const isTopThree = index < 3;

                    return (
                        <div
                            key={entry.item_id}
                            className={`
                                relative flex items-center gap-4 p-4 rounded-xl
                                border transition-all duration-300 animate-slide-up
                                ${isTop
                                    ? 'bg-gradient-gold border-gold/30 shadow-glow'
                                    : 'bg-card border-border/50 shadow-soft hover:shadow-card'
                                }
                            `}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Rank Badge */}
                            <div className={`
                                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                                ${isTop
                                    ? 'bg-primary-foreground'
                                    : isTopThree
                                        ? 'bg-accent'
                                        : 'bg-muted'
                                }
                            `}>
                                {isTop ? (
                                    <Crown className="w-5 h-5 text-gold" />
                                ) : isTopThree ? (
                                    <Medal className="w-5 h-5 text-gold" />
                                ) : (
                                    <span className={`text-lg font-semibold ${isTop ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {index + 1}
                                    </span>
                                )}
                            </div>

                            {/* Song Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-display text-lg font-medium truncate ${isTop ? 'text-primary-foreground' : 'text-foreground'}`}>
                                    {item.name}
                                </h3>
                                <p className={`text-sm truncate ${isTop ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                {/* {song.album} */}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="flex-shrink-0 text-right">
                                <div className={`text-sm font-medium ${isTop ? 'text-primary-foreground' : 'text-foreground'}`}>
                                    {entry.first_place_votes > 0 ? (
                                        <span className="flex items-center gap-1 justify-end">
                                            <Crown className="w-3.5 h-3.5" />
                                            {entry.first_place_votes}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </div>
                                <div className={`text-xs ${isTop ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    You: #{userRank}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pt-4 text-center">
                <p className="text-sm text-muted-foreground">
                    Come back tomorrow for a new set of songs! ✨
                </p>
            </div>
        </div>

        
    );
}