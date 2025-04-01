import type { BrowserUseDetails, GoToUrlParams } from "@/types/tools/browserUse";
import Window from "../Window/Window";

interface BrowserUseProps {
  toolDetails: BrowserUseDetails;
}

export default function BrowserUse({ toolDetails }: BrowserUseProps) {
  return (
    <Window
      title={(toolDetails as GoToUrlParams).url || ""}
    >
      <div>
        {toolDetails.result?.base64_image &&
          <img src={`data:image/png;base64,${toolDetails.result.base64_image}`} />
        }
        {toolDetails.result?.output &&
          <div className="px-4 py-3">
            <pre>{toolDetails.result.output}</pre>
          </div>
        }
      </div>
    </Window>
  );
} 
