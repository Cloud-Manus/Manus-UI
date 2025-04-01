import { ScrollArea } from "@/components/ui/scroll-area"
import { DisplayStep } from "@/pages/ChatPage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { useState } from "react";

export default function ThinkEvent({ event }: { event: DisplayStep }) {
  const [value, setValue] = useState("");

  return <div className={`${value ? "w-[524px]" : "w-[120px]"} rounded-[15px] border py-1 px-3 bg-[var(--gray-2)] transition-all`}>
    <Accordion type="single" collapsible value={value} onValueChange={setValue}>
      <AccordionItem className="border-0" value="thinking">
        <AccordionTrigger className="p-0 !no-underline">Thinking...</AccordionTrigger>
        <AccordionContent className="pt-1 pb-2">
          <ScrollArea className="w-[500px]" viewportClassName="max-h-[300px] pr-3">
            <div className="font-small text-[var(--dark-4)]">{event.content}</div>
          </ScrollArea>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
}
