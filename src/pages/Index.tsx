import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
// import { RankingGame } from '@/components/RankingGame';
import { Leaderboard } from '@/components/Leaderboard';
import { getTodaySongs } from '@/lib/songs';
import type { Song } from '@/lib/songs';
import type { LeaderboardEntry } from '@/lib/leaderboard';
import {
    hasSubmittedToday,
    saveSubmission,
    calculateLeaderboard,
    getUserRanking
} from '@/lib/leaderboard';
import { Sparkles } from 'lucide-react';

const Index = () => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userRanking, setUserRanking] = useState<string[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        const todaysSongs = getTodaySongs();
        setSongs(todaysSongs);

        const submitted = hasSubmittedToday();
        setHasSubmitted(submitted);

        if (submitted) {
            setLeaderboard(calculateLeaderboard(todaysSongs));
            setUserRanking(getUserRanking() || []);
        }
    }, []);

    const handleSubmit = (ranking: string[]) => {
        saveSubmission(ranking);
        setUserRanking(ranking);
        setHasSubmitted(true);
        setShowConfetti(true);
        setLeaderboard(calculateLeaderboard(songs));

        setTimeout(() => setShowConfetti(false), 3000);
    };

    return (
        <div className="min-h-screen bg-gradient-hero">
            {/* Confetti Effect */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-fade-in"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-20px`,
                                animation: `fall ${2 + Math.random() *2}s linear forwards`,
                                animationDelay: `${Math.random() * 0.5}s`,
                            }}
                        >
                            <Sparkles
                                className="text-gold"
                                style={{
                                    width: `${12 + Math.random() * 12}px`,
                                    opacity: 0.6 + Math.random() * 0.4,
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            <div className="container max-w-lg mx-auto px-4 pb-12">

                <Header />
                {!hasSubmitted ? (
                    songs.length > 0 ? (
                        <div className="text-center py-12">
                            <p className="text-foreground">Ranking game coming soon.</p>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Loading today's songs...</p>
                        </div>
                    )
                ) : (
                    <div className="space-y-6">
                        <div className="text-center animate-fade-in">
                            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-gold shadow-glow">
                                <Sparkles className="w-5 h-5 text-primary-foreground" />
                                <span className="font-display text-lg font-semibold text-primary-foreground">
                                    Ranking Submitted!
                                </span>
                            </div>
                        </div>

                        <h2 className="text-center font-display text-2xl font-bold text-foreground">
                            Today's Global Rankings
                        </h2>

                        <Leaderboard
                            songs={songs}
                            leaderboard={leaderboard}
                            userRanking={userRanking}
                        />
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fall {
                to {
                    transform: translateY(100vh) rotate(360deg);
                }
                }
            `}</style>
        </div>
    );
};

export default Index;