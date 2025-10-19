import { useParams, Link } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { useEffect, useState } from "react";
import Navbar from "~/components/Navbar";
import ScoreCircle from "~/components/ScoreCircle";

// Define the Design type
interface Design {
  id: string;
  imagePath: string;
  designName: string;
  designPurpose: string;
  feedback: {
    overallScore: number;
    improvementSuggestions: string[];
    strengths: string[];
    analysis: any;
  };
}

export default function DesignDetail() {
  const { id } = useParams();
  const { kv } = usePuterStore();
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadDesign = async () => {
      if (!id) {
        setError('No design ID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        const designData = await kv.get(`design:${id}`);
        if (!designData) {
          setError('Design not found');
          setLoading(false);
          return;
        }
        const parsedDesign = JSON.parse(designData) as Design;
        setDesign(parsedDesign);
      } catch (error) {
        setError('Failed to load design: ' + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadDesign();
  }, [id]);

  // Function to format analysis text with proper spacing
  const formatAnalysisText = (text: string) => {
    if (!text) return '';
    
    // If text starts with the category name (like "compositionThe layout..."), separate them
    const categories = ['composition', 'visualAppeal', 'typography', 'effectiveness', 'technicalExecution', 'layout', 'colors', 'userExperience', 'accessibility'];
    
    for (const category of categories) {
      if (text.toLowerCase().startsWith(category) && text.length > category.length) {
        // Check if the next character is uppercase (meaning it's the start of the actual content)
        const nextChar = text[category.length];
        if (nextChar === nextChar?.toUpperCase()) {
          return text.substring(category.length);
        }
      }
    }
    
    return text;
  };

  // Function to get display name for analysis categories
  const getCategoryDisplayName = (key: string) => {
    const displayNames: { [key: string]: string } = {
      composition: "Composition",
      visualAppeal: "Visual Appeal",
      typography: "Typography",
      effectiveness: "Effectiveness",
      technicalExecution: "Technical Execution",
      layout: "Layout",
      colors: "Colors",
      userExperience: "User Experience",
      accessibility: "Accessibility"
    };
    
    return displayNames[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  if (loading) {
    return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
        <Navbar />
        <section className="main-section">
          <div className="page-heading py-16 text-center">
            <h1 className="text-6xl">Loading Design Analysis...</h1>
            <img src="/images/resume-scan-2.gif" className="w-[200px] mx-auto mt-4" alt="Loading" />
            <p className="text-white mt-4 text-4xl">Please wait while we load your design analysis</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !design) {
    return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
        <Navbar />
        <section className="main-section">
          <div className="page-heading py-16 text-center">
            <h1>Design Not Found</h1>
            <h2 className="text-red-600">{error || 'The requested design analysis could not be found.'}</h2>
            <div className="mt-8">
              <Link to="/" className="primary-button px-6 py-3">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />

      <section className="main-section py-10">
        {/* Page Heading with Description */}
        <div className="page-heading text-center mb-8">
          <h1 className="text-6xl font-bold text-gray-900">Your Design Feedback is Ready!</h1>
          <p className="mt-2 text-gray-600 text-lg max-w-xl mx-auto">
            Get actionable insights on your UI design, including strengths, areas for improvement, and detailed analysis to enhance the user experience.
          </p>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-block black-gradient primary-button px-8 py-3 text-lg"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Content Grid */}
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Design Image & Overall Score */}
          <div className="space-y-6">
            <div className="gradient-border p-4 bg-white rounded-xl">
              <img
                src={design.imagePath}
                alt="Design"
                className="w-full h-auto max-h-96 object-contain rounded-lg"
                onError={(e) => ((e.target as HTMLImageElement).src = '/images/placeholder-design.png')}
              />
            </div>

            {/* Overall UX Score */}
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Overall UX Score</h3>
              <div className="flex justify-center">
                <ScoreCircle score={design.feedback.overallScore} size="lg" />
              </div>
              <p className="text-gray-600 mt-3 text-lg">
                {design.feedback.overallScore >= 80
                  ? 'Excellent!'
                  : design.feedback.overallScore >= 60
                  ? 'Good job!'
                  : 'Needs Improvement'}
              </p>
            </div>

            {/* Improvement Tips */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-6 text-gray-800">Improvement Tips</h3>
              <div className="grid grid-cols-1 gap-4">
                {design.feedback.improvementSuggestions.map((tip, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex-1 mb-2 md:mb-0">
                      <h4 className="font-semibold text-lg text-black mb-1">Tip {index + 1}</h4>
                      <p className="text-gray-700">{tip}</p>
                    </div>
                    <button className="mt-2 md:mt-0 inline-block bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                      Try Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Analysis & Strengths */}
          <div className="space-y-6">
            {/* Detailed Analysis */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-6 text-gray-800">Detailed Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(design.feedback.analysis).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-4 bg-gray-50 rounded-lg flex flex-col justify-between min-h-[120px]"
                  >
                    <h4 className="font-semibold text-lg text-gray-800 mb-2">
                      {getCategoryDisplayName(key)}
                    </h4>
                    <p className="text-gray-700 flex-grow leading-relaxed">
                      {formatAnalysisText(value as string)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Design Strengths */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Design Strengths</h3>
              <ul className="space-y-3">
                {design.feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start p-3 bg-green-50 rounded-lg">
                    <span className="text-black mr-3 text-lg">✓</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}