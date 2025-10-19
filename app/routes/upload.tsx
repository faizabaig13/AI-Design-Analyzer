import {type FormEvent, useState, useRef} from 'react'
import Navbar from "~/components/Navbar";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {generateUUID} from "~/lib/utils";

const Upload = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
        
        // Clean up previous preview URL
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        
        // Create new preview URL
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('image/')) {
            handleFileSelect(droppedFile);
        }
    };

    const handleRemoveFile = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAnalyze = async (file: File) => {
        setIsProcessing(true);
    
        try {
            setStatusText('Uploading design to cloud storage...');
            
            // First upload to Cloudinary to get a public URL
            const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_URL;
            const cloudinaryPreset = import.meta.env.VITE_CLOUDINARY_PRESET;
    
            const cloudinaryFormData = new FormData();
            cloudinaryFormData.append('file', file);
            cloudinaryFormData.append('upload_preset', cloudinaryPreset);
            
            const uploadResponse = await fetch(cloudinaryUrl, {
                method: 'POST',
                body: cloudinaryFormData,
            });
    
            if (!uploadResponse.ok) {
                throw new Error('Failed to upload image to cloud storage');
            }
    
            const uploadData = await uploadResponse.json();
            const imageUrl = uploadData.secure_url;
            const designId = generateUUID();
    
            console.log('Image uploaded to:', imageUrl);
            setStatusText('Analyzing design with AI...');
    
            // FIXED: Use direct API key (no process.env in browser)
            const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
            
            const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                    'HTTP-Referer': window.location.origin, // Required by OpenRouter
                    'X-Title': 'Design Analyzer' // Updated title
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text", 
                                    "text": `Carefully analyze this design (which could be UI design, poster, logo, branding, illustration, or any visual design) and provide detailed, fair feedback.

IMPORTANT: 
- Provide FAIR and VARIED scores (0-100) based on actual design quality. Do NOT give similar scores to every design.
- Adjust your criteria based on the design type (UI, poster, logo, etc.)
- Be strict but fair in your evaluation

Please provide comprehensive feedback in this exact JSON format:
{
    "overallScore": [provide FAIR score 0-100 based on actual design quality],
    "designType": [identify the type of design: UI, poster, logo, illustration, etc.],
    "strengths": [3-4 specific strengths based on the design type],
    "improvementSuggestions": [3-4 actionable suggestions for improvement],
    "detailedAnalysis": {
        "composition": [analysis of layout, balance, and visual hierarchy],
        "visualAppeal": [analysis of colors, contrast, and aesthetic quality],
        "typography": [analysis of text readability and font choices - if applicable],
        "effectiveness": [analysis of how well it communicates its purpose],
        "technicalExecution": [analysis of craftsmanship and attention to detail]
    }
}

Scoring Guidelines:
- 90-100: Exceptional, professional quality
- 80-89: Very good with minor improvements needed
- 70-79: Good but needs significant refinement
- 60-69: Average, requires substantial improvement
- Below 60: Needs fundamental reworking

Provide:
- Honest, varied scores that reflect actual design quality
- Feedback specific to the design type
- Constructive criticism that helps improve the design
- Fair assessment based on design principles`
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": imageUrl
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 2500
                })
            });
    
            console.log('OpenRouter response status:', openRouterResponse.status);
    
            if (!openRouterResponse.ok) {
                const errorText = await openRouterResponse.text();
                console.error('OpenRouter error details:', errorText);
                throw new Error(`OpenRouter API error: ${openRouterResponse.status}`);
            }
    
            const openRouterData = await openRouterResponse.json();
            console.log('OpenRouter full response:', openRouterData);
            
            const aiMessage = openRouterData.choices[0].message.content;
            console.log('AI raw response:', aiMessage);
    
            // Parse the JSON response from AI
            let parsedFeedback;
            try {
                // Extract JSON from the response
                const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsedFeedback = JSON.parse(jsonMatch[0]);
                    console.log('Successfully parsed feedback:', parsedFeedback);
                } else {
                    console.warn('No JSON found in AI response, using fallback');
                    throw new Error('No JSON found in AI response');
                }
            } catch (parseError) {
                console.error('Failed to parse AI response:', parseError);
                throw new Error('AI response was not in the expected format. Please try again.');
            }
    
            // Validate that we have the expected structure
            if (!parsedFeedback.overallScore || !parsedFeedback.strengths || !parsedFeedback.improvementSuggestions || !parsedFeedback.detailedAnalysis) {
                throw new Error('AI response missing required fields');
            }

            const data = {
                id: designId,
                imagePath: imageUrl,
                designName: parsedFeedback.designType || "Design", // Use detected design type
                designPurpose: "Design Analysis", 
                feedback: {
                    overallScore: parsedFeedback.overallScore,
                    improvementSuggestions: parsedFeedback.improvementSuggestions,
                    strengths: parsedFeedback.strengths,
                    analysis: parsedFeedback.detailedAnalysis
                },
                analysis: parsedFeedback.detailedAnalysis,
                designType: parsedFeedback.designType || "Unknown"
            };
    
            console.log('Saving design data:', data);
            
            // Save to local storage or your KV store
            await kv.set(`design:${designId}`, JSON.stringify(data));
            setStatusText('AI analysis complete! Redirecting...');
            
            setTimeout(() => {
                navigate(`/design/${designId}`);
            }, 1500);
            
        } catch (error) {
            console.error('Analysis error:', error);
            setStatusText('Error: Analysis failed - ' + (error as Error).message);
            setIsProcessing(false);
        }
    }
    
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if(!file) {
            alert('Please select a design file first');
            return;
        }

        handleAnalyze(file);
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section ">
                <div className="page-heading max-w-6xl">
                    {isProcessing ? (
                        <div className="text-center">
                            <h1 className='text-6xl'>Smart feedback for your designs</h1>
                            <h2>{statusText}</h2>
                            <div className="mt-4 text-gray-600">
                                <p>AI is carefully analyzing your design...</p>
                            </div>
                            <img src="/images/resume-scan.gif" className="w-full max-w-md mx-auto" alt="Processing..." />
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row items-start gap-12 max-w-full">

                            {/* Left Column - Heading */}
                            <div className="flex-1 text-left p-3">
                                <h1 className="text-[50px] font-bold mb-4">Get Instant Feedback on Your Design</h1>
                                <h2 className="text-[20px] text-gray-600 leading-relaxed">
                                    Upload any design - UI, posters, logos, illustrations - and get comprehensive AI-powered feedback with fair scoring and actionable suggestions.
                                </h2>
                            </div>

                            {/* Right Column - Upload Form */}
                            <div className="flex-1 w-full flex justify-end">
                                <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                                    <div className="form-div w-full">
                                        <label htmlFor="uploader" className="block text-sm font-medium text-gray-700 mb-2">
                                            Upload Design Screenshot *
                                        </label>
                                        
                                        {previewUrl ? (
                                            <div className="border-2 border-dashed border-green-500 rounded-lg p-6 bg-green-50 w-full">
                                                <div className="flex flex-col items-center w-full">
                                                    <div className="relative mb-4 w-full">
                                                        <img
                                                            src={previewUrl}
                                                            alt="Design preview"
                                                            className="max-h-80 w-full object-contain rounded-lg border border-gray-300 shadow-sm"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleRemoveFile}
                                                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 transition-colors"
                                                            title="Remove image"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-3 w-full text-center">{file?.name}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="text-black hover:text-black text-sm font-medium"
                                                    >
                                                        Choose different file
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-black transition-colors cursor-pointer bg-gray-50 w-full"
                                                onDragOver={handleDragOver}
                                                onDrop={handleDrop}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <div className="flex flex-col items-center justify-center gap-4 w-full">
                                                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xl font-medium text-gray-700">Drag & drop your design</p>
                                                        <p className="text-lg text-gray-500 mt-2">
                                                            or <span className="text-black font-medium">browse files</span>
                                                        </p>
                                                        <p className="text-sm text-gray-400 mt-4">
                                                            Supports PNG, JPG, JPEG, WEBP (Max 10MB)
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                                            accept="image/*"
                                            className="hidden"
                                            id="uploader"
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="primary-button text-black w-full py-3 text-lg font-semibold disabled:cursor-not-allowed"
                                        disabled={!file}
                                    >
                                        {file ? 'Analyze Design with AI' : 'Please Upload a Design First'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}

export default Upload