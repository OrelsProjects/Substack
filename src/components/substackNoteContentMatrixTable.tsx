import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SubstackNoteContentMatrixRecommendation } from "../models/substackNote";

interface SubstackNoteContentMatrixProps {
  recommendations: SubstackNoteContentMatrixRecommendation[];
}

const SubstackNoteContentMatrix: React.FC<SubstackNoteContentMatrixProps> = ({
  recommendations,
}) => {
  // Extract unique structures and topics
  const structures = Array.from(
    new Set(recommendations.map(r => r.structure?.name)),
  );
  const topics = Array.from(new Set(recommendations.map(r => r.topic)));

  // Create a mapping from [topic][structure] to content
  const contentMap: {
    [topic: string]: { [structureName: string]: string };
  } = {};

  recommendations.forEach(rec => {
    if (!contentMap[rec.topic]) {
      contentMap[rec.topic] = {};
    }
    contentMap[rec.topic][rec.structure?.name] = rec.content;
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Topic / Structure</TableHead>
          {structures.map(structureName => (
            <TableHead key={structureName}>{structureName}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {topics.map(topic => (
          <TableRow key={topic}>
            <TableCell>{topic}</TableCell>
            {structures.map(structureName => (
              <TableCell key={structureName}>
                {contentMap[topic] && contentMap[topic][structureName]
                  ? contentMap[topic][structureName]
                  : ""}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SubstackNoteContentMatrix;
