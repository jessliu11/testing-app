import { Users, Crown, Medal, Share2, Check, TrendingUp, Music } from "lucide-react";
import type { GlobalRankingItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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

    const [copied, setCopied] = useState(false);
    const itemMap = new Map(items.map(i => [i.id, i]));

    
    // Calculate total votes from scores (since score = sum of (7 - rank))
    // Each vote contributes between 1 and 6 points, average ~3.5
    const totalScore = globalRanking.reduce((sum, item) => sum + Number(item.score), 0);
    const estimatedVotes = totalScore > 0 ? Math.round(totalScore / 21) : 0; // 21 = sum(1..6)

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    };

    const handleShare = async () => {
        const rankingText = userRanking
            .map((itemId, index) => {
                const item = itemMap.get(itemId);
                return `${index + 1}. ${item ? item.name : 'Unknown'}`;
            })
            .join('\n');

        const shareText = `🎵 My Taylor Swift ranking for today:\n\n${rankingText}\n\nPlay at: ${window.location.href}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Taylor Swift Ranking',
                    text: shareText,
                });
            } catch (err) {
                // user cancelled or share failed, fall back to clipboard
                copyToClipboard(shareText);
            }
        } else {
            copyToClipboard(shareText);
        }
    };
    

    // Build user's ranked items in order
    const userRankedItems = userRanking
        .map(id => itemMap.get(id))
        .filter(Boolean) as Item[];

    return (
        <div className="space-y-6">
            {/* Participation count + share */}
            <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{estimatedVotes.toLocaleString()} Swiftie{estimatedVotes !== 1 ? 's' : ''} voted today</span>
                </div>

                <Button
                    onClick={handleShare}
                    variant="outline"
                    size="lg"
                    className="gap-3"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Share2 className="w-4 h-4" />
                            Share My Ranking
                        </>
                    )}
                </Button>
            </div>

            {/* Side-by-side comparison */}
            <div className="grid gap-3 grid-cols-2">
                {/* Your Ranking */}
                <div className="rounded-xl border border-border p-2.5">
                    <h3 className="mb-2.5 flex items-center gap-1.5 font-semibold text-xs">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted">
                            <Music className="w-3 h-3 text-foreground" />
                        </span>
                        <span className="truncate">Your Ranking</span>
                    </h3>
                    <div className="space-y-1.5">
                        {userRankedItems.map((item, index) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-1.5 py-1.5 animate-slide-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
                                    {index + 1}
                                </span>
                                <span className="text-[11px] font-medium truncate leading-tight">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Community Ranking */}
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-2.5">
                    <h3 className="mb-2.5 flex items-center gap-1.5 font-semibold text-xs">
                        <TrendingUp className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">Community</span>
                    </h3>
                    <div className="space-y-1.5">
                        {globalRanking.map((entry, index) => {
                            const item = itemMap.get(entry.item_id);
                            if (!item) return null;
                            const isTop = index === 0;
                            return (
                                <div
                                    key={entry.item_id}
                                    className="flex items-center gap-1.5 rounded-lg bg-background px-1.5 py-1.5 animate-slide-up"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${isTop ? 'bg-gradient-gold text-primary-foreground' : 'bg-primary text-primary-foreground'}`}>
                                        {isTop ? <Crown className="w-2.5 h-2.5" /> : index + 1}
                                    </span>
                                    <span className="text-[11px] font-medium truncate leading-tight">{item.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="pt-2 text-center">
                <p className="text-sm text-muted-foreground">
                    Come back tomorrow for a new set of songs! ✨
                </p>
            </div>
        </div>
    );
}