import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { RankingGame } from '@/components/RankingGame';
import { Leaderboard } from '@/components/Leaderboard';
import { getDailySet, submitRanking, getGlobalRanking } from '@/lib/api';
import type { DailySetItem, GlobalRankingItem } from '@/lib/types';
import { Sparkles } from 'lucide-react';

interface Item {
  id: string;
  name: string;
  artist: string | null;
}

const Index = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [dailySetId, setDailySetId] = useState<string | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [globalRanking, setGlobalRanking] = useState<GlobalRankingItem[]>([]);
    const [userRanking, setUserRanking] = useState<string[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadDailySet() {
            try {
                setLoading(true);
                const { data, error } = await getDailySet('taylor-swift');
                
                if (error) {
                    console.error('Error loading daily set:', error);
                    setError('Failed to load today\'s songs');
                    return;
                }

                if (data && data.length > 0) {
                    const setId = data[0].daily_set_id;
                    setDailySetId(setId);
                    
                    // Convert API data to Item format
                    const itemsData = data.map((item: DailySetItem) => ({
                        id: item.item_id,
                        name: item.item_name,
                        artist: item.item_artist,
                    }));
                    setItems(itemsData);

                    // Check if user has already submitted by trying to load rankings
                    const userSubmissionKey = `submitted_${setId}`;
                    const storedRanking = localStorage.getItem(userSubmissionKey);
                    
                    if (storedRanking) {
                        const ranking = JSON.parse(storedRanking);
                        setUserRanking(ranking);
                        setHasSubmitted(true);
                        
                        // Load global rankings
                        const { data: rankingData, error: rankingError } = await getGlobalRanking(setId);
                        if (!rankingError && rankingData) {
                            setGlobalRanking(rankingData);
                        }
                    }
                }
            } catch (err) {
                console.error('Error:', err);
                setError('An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        }

        loadDailySet();
    }, []);

    const handleSubmit = async (ranking: string[]) => {
        if (!dailySetId) return;

        try {
            const { error } = await submitRanking(dailySetId, ranking);
            
            if (error) {
                console.error('Error submitting ranking:', error);
                alert('Failed to submit ranking. Please try again.');
                return;
            }

            // Save to localStorage for client-side tracking
            localStorage.setItem(`submitted_${dailySetId}`, JSON.stringify(ranking));
            
            setUserRanking(ranking);
            setHasSubmitted(true);
            setShowConfetti(true);

            // Load global rankings
            const { data: rankingData, error: rankingError } = await getGlobalRanking(dailySetId);
            if (!rankingError && rankingData) {
                setGlobalRanking(rankingData);
            }

            setTimeout(() => setShowConfetti(false), 3000);
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('An unexpected error occurred');
        }
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
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading today\'s songs...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500">{error}</p>
                    </div>
                ) : !hasSubmitted ? (
                    items.length > 0 ? (
                        <RankingGame items={items} onSubmit={handleSubmit} />
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No songs available today.</p>
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
                            items={items}
                            globalRanking={globalRanking}
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