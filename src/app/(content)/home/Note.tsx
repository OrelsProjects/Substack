import React, { useMemo } from "react";
import SubstackNote, {
  SubstackNoteRecommendationWithNote,
} from "@/models/substackNote";
import { cn } from "../../../lib/utils";
import Loading from "../../../components/ui/loading";
import { motion } from "framer-motion";

export interface NoteProps {
  recommmendation: SubstackNoteRecommendationWithNote;
  loading?: boolean;
}

export default function Note({ recommmendation, loading }: NoteProps) {
  const rating = useMemo((): string => {
    // If 0.8, return 8/10. If 0.85, return 8.5/10.
    return (recommmendation.rating * 10).toFixed(1).toString() + "/10";
  }, [recommmendation.rating]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="w-full h-64 flex flex-col border-foreground p-4 bg-muted-foreground/10 rounded-md gap-4 shadow-md relative"
    >
      <div
        className={cn(
          "h-full w-full absolute top-0 left-0 flex justify-center items-center bg-background/80",
          {
            hidden: !loading,
          },
        )}
      >
        <Loading spinnerClassName="h-12 w-12" />
      </div>
      <div className="flex flex-row justify-between">
        <h2 className="text-xl font-semibold">{recommmendation.idea}</h2>
        <h1
          className={cn("text-xl font-medium", {
            "success-text-color-gradient": recommmendation.rating >= 0.75,
            "warning-text-color-gradient":
              recommmendation.rating > 0.55 && recommmendation.rating < 0.75,
            "error-text-color-gradient": recommmendation.rating <= 0.55,
          })}
        >
          {rating}
        </h1>
      </div>
      <div className="flex flex-col gap-2 overflow-auto">
        <p>{recommmendation.hook}</p>
        <p className="font-extralight">{recommmendation.content}</p>
      </div>
      {recommmendation.inspiredBy && (
        <div className="flex flex-col">
          <p className="text-sm font-medium">Inspired by:</p>
          <p className="text-sm font-light">
            {recommmendation.userNote?.text.slice(0, 50)}
          </p>
        </div>
      )}
    </motion.div>
  );
}
