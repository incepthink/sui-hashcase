// src/components/randomizedmint/NFTSetDetails.tsx

"use client";

import { MetadataSetWithAllMetadataInstances } from "@/utils/modelTypes";
import SetBadges from "./SetBadges";
import NFTList from "./NFTList";
import ProbabilityBar from "./ProbabilityBar";

interface NFTSetDetailsProps {
  metadataSet: MetadataSetWithAllMetadataInstances;
}

export default function NFTSetDetails({ metadataSet }: NFTSetDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
          {metadataSet.name}
        </h1>

        <SetBadges
          isRandomized={metadataSet.isRandomized}
          isUpgradable={metadataSet.isUpgradable}
        />
      </div>

      {/* Probability Distribution */}
      <ProbabilityBar metadata={metadataSet.metadata} />

      {/* NFT List */}
      <NFTList metadata={metadataSet.metadata} />
    </div>
  );
}
