import Window from "../Window/Window";
import { useMemo } from "react";

interface BrowserUseProps {
  toolDetails: BrowserUseDetails;
}

export default function BrowserUse({ toolDetails }: BrowserUseProps) {
  const resultImg = useMemo(() => {
    if (toolDetails.result?.base64_image) {
      return `data:image/png;base64,${toolDetails.result.base64_image}`;
    }
    return null;
  }, [toolDetails.result?.base64_image]);

  return (
    <Window
      title={(toolDetails as GoToUrlParams).url || ""}
    >
      <div>
        {resultImg &&
          <img className="w-full object-contain" src={resultImg} />
        }
      </div>
    </Window>
  );
} 
