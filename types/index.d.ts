interface Design {
    id: string;
    imagePath: string;
    designName: string;
    designPurpose: string;
    feedback: {
      overallScore: number;
      improvementSuggestions: string[];
      strengths: string[];
      analysis: {
        extractedText: string;
        dominantColors: {
          background: string;
          text: string;
          primary: string;
          secondary: string;
          accent: string;
        };
        colorPalette: string[];
        contrastRatio: number;
        textReadability: number;
        colorScore: number;
        layoutScore: number;
        visualHierarchy: number;
        spacingScore: number;
        detectedElements: {
          hasNavigation: boolean;
          hasButtons: boolean;
          hasImages: boolean;
          hasForms: boolean;
        };
      };
    };
  }