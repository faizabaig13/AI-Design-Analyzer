// ~/components/ScoreCircle.tsx
interface ScoreCircleProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
  }
  
  const ScoreCircle = ({ score, size = 'md' }: ScoreCircleProps) => {
    const getSizeClasses = () => {
      switch (size) {
        case 'sm': return 'w-12 h-12 text-lg';
        case 'lg': return 'w-24 h-24 text-2xl';
        default: return 'w-16 h-16 text-xl';
      }
    };
  
    const getColor = () => {
      if (score >= 80) return 'text-green-500 border-green-500';
      if (score >= 60) return 'text-yellow-500 border-yellow-500';
      return 'text-red-500 border-red-500';
    };
  
    return (
      <div className={`${getSizeClasses()} ${getColor()} rounded-full border-4 flex items-center justify-center font-bold`}>
        {score}
      </div>
    );
  };
  
  export default ScoreCircle;