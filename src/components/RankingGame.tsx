import { useState, useCallback } from 'react';
import type { Song } from '@/lib/songs';
import { SongCard } from './SongCard';
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from 'lucide-react';

interface RankingGameProps {
    songs: Song[]; 
    onSubmit: (ranking: string[]) => void;  // ranking is an array of song IDs in the order ranked by the user
}

export function RankingGame({ songs, onSubmit }: RankingGameProps) {
    const [rankedSongs, setRankedSongs] = useState<Song[]>(songs); 
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null); 

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newSongs = [...rankedSongs];
        const [draggedSong] = newSongs.splice(draggedIndex, 1);
        newSongs.splice(index, 0, draggedSong);
        setRankedSongs(newSongs);
        setDraggedIndex(index);
    };
    
    const handleDragEnd = () => {
        setDraggedIndex(null);
    }

    const handleSubmit = useCallback(() => {
        onSubmit(rankedSongs.map(s => s.id));
    }, [rankedSongs, onSubmit]);
    
    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <p className="text-muted-foreground font-body">
                    Drag to reorder from <span className="text-gold font-medium">favorite</span> to least favorite
                </p>
            </div>

            <div className="space-y-3">
                {rankedSongs.map((song, index) => ( 
                    <div
                        key={song.id} // Use song.id as key
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <SongCard 
                            song={song}
                            rank={index + 1}
                            isDragging={draggedIndex === index}
                        />
                    </div>
                ))}
            </div>

            <div className="pt-4">
                <Button 
                    onClick={handleSubmit}
                    className="w-full h-14 text-lg font-display font-semibold bg-gradient-gold hover:opacity-90 transition-opacity shadow-glow"
                >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Submit My Ranking
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    );
}
 