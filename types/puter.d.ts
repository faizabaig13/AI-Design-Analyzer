interface Design {
    id: string;
    imagePath: string;
    designName: string;
    designPurpose: string;
    feedback: {
      overallScore: number;
      improvementSuggestions: string[];
      analysis: {
        extractedText: string;
        dominantColors: {
          background: string;
          text: string;
          primary: string;
        };
        contrastRatio: number;
        textReadability: number;
        colorScore: number;
        layoutScore: number;
      };
    };
  }
  
  interface KVItem {
    value: string;
  }