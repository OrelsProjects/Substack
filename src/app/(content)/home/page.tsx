"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { SubstackNoteContentMatrixRecommendation } from "@/models/substackNote";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "@/components/ui/loading";
import SubstackNoteContentMatrix from "../../../components/substackNoteContentMatrixTable";
import { Button } from "../../../components/ui/button";

export default function Home() {
  const loadingRef = useRef(false);
  const [loading, setLoading] = React.useState(false);
  const [recommendations, setRecommendations] = React.useState<
    SubstackNoteContentMatrixRecommendation[]
  >([]);
  const [currentRecommendation, setCurrentRecommendation] =
    React.useState<SubstackNoteContentMatrixRecommendation | null>(null);
  const [recommendationsUsed, setRecommendationsUsed] = React.useState<
    SubstackNoteContentMatrixRecommendation[]
  >([]);

  const [loadingGenerate, setLoadingGenerate] = React.useState(false);

  useEffect(() => {
    // if (loadingRef.current) {
    //   return;
    // }
    // loadingRef.current = true;
    // setLoading(true);
    // axios
    //   .get<SubstackNoteContentMatrixRecommendation[]>(
    //     "/api/substack/fetch/" + "orelzilberman",
    //   )
    //   .then(response => {
    //     debugger;
    //     setRecommendations(response.data);
    //     if (response.data.length > 0) {
    //       setCurrentRecommendation(response.data[0]);
    //     }
    //   })
    //   .catch(error => {
    //     toast.error("Failed to fetch recommendations", { data: error.message });
    //   })
    //   .finally(() => {
    //     loadingRef.current = false;
    //     setLoading(false);
    //   });
  }, []);

  const orderedRecommendations = useMemo(() => {
    return recommendations.sort((a, b) => b.rating - a.rating);
  }, [recommendations]);

  const handler = useMemo(() => {
    return recommendations.length > 0 ? recommendations[0].handler : "";
  }, [recommendations]);

  const generateNewRecommendation = () => {
    if (loadingGenerate) {
      return;
    }
    setLoadingGenerate(true);
    const randomTimeout = Math.floor(Math.random() * 950) + 1300;

    setTimeout(() => {
      // randomize a recommendation. filter out the ones that were already used
      const newRecommendations = recommendations.filter(
        recommendation => !recommendationsUsed.includes(recommendation),
      );
      const randomIndex = Math.floor(Math.random() * newRecommendations.length);
      const randomRecommendation = newRecommendations[randomIndex];
      setRecommendationsUsed([...recommendationsUsed, randomRecommendation]);
      setCurrentRecommendation(randomRecommendation);
      setLoadingGenerate(false);
    }, randomTimeout);
  };

  const fetchLinkedin = async () => {
    try {
      const response = await axios.get("/api/linkedin/fetch");
      console.log(response.data);
    } catch (error: any) {
      toast.error("Failed to fetch linkedin", { data: error.message });
    }
  };

  if (loading) {
    return <Loading spinnerClassName="h-12 w-12" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* <SubstackNoteContentMatrix
        recommendations={orderedRecommendations || []}
      /> */}
      {/* {handler && <h2 className="text-3xl font-semibold">@{handler}</h2>}
      {currentRecommendation && (
        <div className="flex flex-col items-center gap-4">
          <Note
            key={currentRecommendation.hook}
            recommmendation={currentRecommendation}
            loading={loadingGenerate}
          />
          <Button
            onClick={generateNewRecommendation}
            disabled={loadingGenerate}
          >
            Generate New
          </Button>
        </div>
      )}*/}
      <Button
        className="bg-blue-500"
        onClick={fetchLinkedin}
        disabled={loadingGenerate}
      >
        Fetch Linkedin
      </Button>
    </div>
  );
}
