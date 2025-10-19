import {Link} from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";

const DesignCard = ({ design: { id, designName, designPurpose, feedback, imagePath } }: { design: Design }) => {
    const { fs } = usePuterStore();
    const [designUrl, setDesignUrl] = useState('');

    useEffect(() => {
        const loadDesign = async () => {
            const blob = await fs.read(imagePath);
            if(!blob) return;
            let url = URL.createObjectURL(blob);
            setDesignUrl(url);
        }

        loadDesign();
    }, [imagePath]);

    return (
        <Link to={`/design/${id}`} className="design-card animate-in fade-in duration-1000">
            <div className="design-card-header">
                <div className="flex flex-col gap-2">
                    {designName && <h2 className="!text-black font-bold break-words">{designName}</h2>}
                    {designPurpose && <h3 className="text-lg break-words text-gray-500">{designPurpose}</h3>}
                    {!designName && !designPurpose && <h2 className="!text-black font-bold">Design</h2>}
                </div>
                <div className="flex-shrink-0">
                    <ScoreCircle score={feedback.overallScore} />
                </div>
            </div>
            {designUrl && (
                <div className="gradient-border animate-in fade-in duration-1000">
                    <div className="w-full h-full">
                        <img
                            src={designUrl}
                            alt="design"
                            className="w-full h-[350px] max-sm:h-[200px] object-contain bg-gray-50"
                        />
                    </div>
                </div>
                )}
        </Link>
    )
}
export default DesignCard