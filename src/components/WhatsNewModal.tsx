import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrendingUp, MessageCircle, Trophy } from 'lucide-react';

const SEEN_KEY = 'rankie_whats_new_seen_v1';

const features = [
    {
        icon: TrendingUp,
        title: 'Your Ranking vs Community',
        description: "After you submit, see how your ranking stacks up side-by-side against everyone else's.",
    },
    {
        icon: MessageCircle,
        title: 'Comments',
        description: "Share your thoughts on today's set once you've submitted your ranking.",
    },
    {
        icon: Trophy,
        title: 'Top Pick in Comments',
        description: "Your #1 ranked song is shown alongside your comment so others can see how you voted.",
    },
];

export function WhatsNewModal() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem(SEEN_KEY)) {
            setOpen(true);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem(SEEN_KEY, '1');
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
            <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden">
                {/* Header band */}
                <div className="bg-gradient-gold px-6 py-5">
                    <DialogHeader>
                        <DialogTitle className="text-primary-foreground text-xl font-display font-semibold">
                            What's New ✨
                        </DialogTitle>
                        <p className="text-primary-foreground/80 text-sm mt-1">
                            A few new features have been added since your last visit.
                        </p>
                    </DialogHeader>
                </div>

                {/* Feature list */}
                <div className="px-6 py-5 space-y-4">
                    {features.map(({ icon: Icon, title, description }) => (
                        <div key={title} className="flex gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">{title}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <Button onClick={handleClose} className="w-full bg-gradient-gold hover:opacity-90 transition-opacity">
                        Got it, let's rank!
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
