import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, RotateCcw, Download, Check } from 'lucide-react';

interface CompletionScreenProps {
  onRestart: () => void;
  onDownloadCertificate?: () => void;
  className?: string;
}

export const CompletionScreen = ({ 
  onRestart, 
  onDownloadCertificate,
  className = '' 
}: CompletionScreenProps) => {
  return (
    <div className={`flex items-center justify-center min-h-[400px] p-8 ${className}`}>
      <Card className="max-w-lg w-full text-center p-8 shadow-elegant bg-gradient-subtle">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-success rounded-full flex items-center justify-center shadow-glow">
            <Trophy className="w-10 h-10 text-success-foreground" />
          </div>
        </div>

        {/* Congratulations Message */}
        <h2 className="text-2xl font-bold text-foreground mb-4">
          <Check className="w-6 h-6 inline mr-2 text-success" />
          Congratulations!
        </h2>
        
        <p className="text-muted-foreground mb-8">
          You have successfully completed all videos in this activity. You may replay any video or click the Next Activity button to continue.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={onRestart}
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Watch Again
          </Button>
          
          {onDownloadCertificate && (
            <Button 
              onClick={onDownloadCertificate}
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Certificate
            </Button>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            Your completion has been recorded and saved to your learning progress.
          </p>
        </div>
      </Card>
    </div>
  );
};