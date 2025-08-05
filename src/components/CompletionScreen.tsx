
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, RotateCcw } from 'lucide-react';

interface CompletionScreenProps {
  onRestart: () => void;
}

export const CompletionScreen = ({ onRestart }: CompletionScreenProps) => {
  return (
    <div className="flex items-center justify-center w-full h-full p-8">
      <Card className="max-w-md text-center p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Congratulations! 🎉</h2>
        <p className="text-muted-foreground mb-8">
          You have successfully completed all videos in this activity. Great job!
        </p>
        
        <Button 
          onClick={onRestart}
          className="w-full"
          variant="outline"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Watch Again
        </Button>
      </Card>
    </div>
  );
};
