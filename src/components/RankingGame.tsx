import { useState, useCallback } from 'react';
import { SongCard } from './SongCard';
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from 'lucide-react';

interface Item {
    id: string;
    name: string;
    artist: string | null;
}

interface RankingGameProps {
    items: Item[]; 
    onSubmit: (ranking: string[]) => void;
}

export function RankingGame({ items, onSubmit }: RankingGameProps) {
    const [rankedItems, setRankedItems] = useState<Item[]>(items); 
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null); 

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newItems = [...rankedItems];
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(index, 0, draggedItem);
        setRankedItems(newItems);
        setDraggedIndex(index);
    };
    
    const handleDragEnd = () => {
        setDraggedIndex(null);
    }

    const handleSubmit = useCallback(() => {
        onSubmit(rankedItems.map(s => s.id));
    }, [rankedItems, onSubmit]);
    
    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <p className="text-muted-foreground font-body">
                    Drag to reorder from <span className="text-gold font-medium">favorite</span> to least favorite
                </p>
            </div>

            <div className="space-y-3">
                {rankedItems.map((item, index) => ( 
                    <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <SongCard 
                            item={item}
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
 