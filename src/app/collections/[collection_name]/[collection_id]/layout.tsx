"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCollectionById } from "@/hooks/useCollections";
import CollectionTabs from "@/components/collectionShell/CollectionTabs";
import ShellSkeleton from "@/components/collectionShell/ShellSkeleton";
import ShellError from "@/components/collectionShell/ShellError";
import { collectionTheme } from "@/components/collectionShell/theme";

interface CollectionLayoutProps {
  children: React.ReactNode;
}

export default function CollectionLayout({ children }: CollectionLayoutProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const params = useParams();

  // Fetch collection data
  const {
    collection,
    isLoading: isCollectionLoading,
    isError: isCollectionError,
  } = useCollectionById(params.collection_id as string);

  // Stable shell skeleton while collection loads (keeps header/tabs in place)
  if (!mounted || isCollectionLoading) {
    return <ShellSkeleton theme={collectionTheme} />;
  }

  if (isCollectionError || !collection) {
    return (
      <ShellError
        theme={collectionTheme}
        title="Collection Not Found"
        message="The requested collection could not be found."
      />
    );
  }

  return (
    <div className={`min-h-screen ${collectionTheme.pageBg} max-w-[1920px]`}>
      {/* Collection Banner */}
      <div
        className={`w-full sm:h-[45vh] h-[35vh] max-w-[1920px] ${collectionTheme.pageBg} relative`}
      >
        <img
          src={
            collection.banner_image ? collection.banner_image : "/banner.jpg"
          }
          alt="banner"
          className="w-full h-full object-cover"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 20%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 70%, transparent 100%)",
          }}
        />
        <div className="w-full max-w-7xl absolute -mb-5 bottom-0 left-0 right-0 mx-auto flex items-center gap-8 sm:px-4 px-2">
          <div className="h-24 w-24 rounded-lg overflow-hidden">
            <img
              src={collection.image_uri}
              alt="collection"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-white text-4xl font-bold">{collection.name}</h1>
        </div>
      </div>

      {/* Spacer between banner and sticky tabs */}
      <div className="h-16" />

      {/* Tabs Navigation */}
      <CollectionTabs theme={collectionTheme} basePath="/collections" />

      {/* Tab Content — stable min-height prevents collapse/jump on tab switch */}
      <div className={`${collectionTheme.contentBg} min-h-[70vh]`}>
        {children}
      </div>
    </div>
  );
}
