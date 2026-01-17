import type { Song } from "@/lib/songs";
import type { LeaderboardEntry } from "@/lib/leaderboard";
import { Trophy, Users, Crown, Medal } from "lucide-react";

interface LeaderboardProps {
    songs: Song[];
    leaderboard: LeaderboardEntry[];
    userRanking: string[];
}

export function Leaderboard({ songs, leaderboard, userRanking }: LeaderboardProps) {
    const songMap = new Map(songs.map(s => [s.id,s]));
    const totalVotes = leaderboard[0]?.totalVotes || 0;

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent">
                    <Users className="w-4 h-4 text-gold" />
                    <span className="text-sm font-medium text-foreground">
                        {totalVotes} Swiftie{totalVotes !== 1 ? 's' : ''} voted today
                    </span> 
                </div>
            </div>
            
            <div className="space-y-3">
                {leaderboard.map((entry, index) => {
                    const song = songMap.get(entry.songId);
                    if (!song) return null;

                    const userRank = userRanking.indexOf(entry.songId) + 1;
                    const isTop = index === 0;
                    const isTopThree = index < 3;

                    return (
                        <div
                            key={entry.songId}
                            className={`
                                relative flex items-center gap-4 p-4 rounded-xl
                                border transition-all duration-300 animate-slide-up
                                ${isTop
                                    ? 'big-gradient-gold border-gold/30 shadow-glow'
                                    : 'bg-card border-border/50 shadow-soft hover:shadow-card'
                                }
                            `}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Rank Badge */}
                            <div className={`
                                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                                ${isTop
                                    ? 'big-primary-foreground'
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
                                <h3 className={`font-display text-lg font-semibold truncate ${isTop ? 'text-primary-foreground' : 'text-foreground'}`}>
                                    {song.title}
                                </h3>
                                <p className={`text-sm truncate ${isTop ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                {song.album}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="flex-shrink-0 text-right">
                                <div className={`text-sm font-medium ${isTop ? 'text-primary-foreground' : 'text-foreground'}`}>
                                    Avg: {entry.averageRank.toFixed(1)}
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