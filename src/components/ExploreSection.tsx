import React from "react";

interface ContentCardProps {
  content: string;
  header: string;
}

const ExploreSection = () => {
  return (
    <div className="bg-black text-white bg-gradient-to-b from-black to-[#5D2CA8] py-[72px] sm:py-24">
      <div className="container">
        <h2 className="text-center md:text-5xl text-3xl font-bold tracking-tighter">
          Web3 + AI = Engaged, Loyal & Happy Customers
        </h2>
        <div className="flex flex-col items-center justify-center my-4">
          <div className="flex flex-wrap justify-center items-center gap-x-6 my-4 px-6">
            <ImageCard />
            <ContentCard
              header="Design the perfect Campaign"
              content="Our team of experts helps design the perfect campaign. Chose from a suite of features (points,badges, membership tubes, etc) to make the perfect bland."
            />
          </div>
          <div className="flex flex-wrap-reverse justify-center items-center my-4 gap-x-6 px-6">
            <ContentCard
              header="Hyper-Personalize with AI"
              content="Our AI tools generate unique assets & messaging giving your users a personalized experience."
            />
            <ImageCard />
          </div>
          <div className="flex flex-wrap justify-center items-center my-4 gap-x-6 px-6">
            <ImageCard />
            <ContentCard
              header="Know your Audience Better"
              content="Our advanced analytics & insights give you a detailed understanding of your user behaviour. Campaign evolve to continually sense the user best."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreSection;

const ImageCard = () => {
  return (
    <div className="md:w-[300px] w-[210px] md:h-[300px] h-[210px] bg-black/20 shadow-md backdrop-blur-md rounded-md"></div>
  );
};

const ContentCard: React.FC<ContentCardProps> = ({ content, header }) => {
  return (
    <div className="max-w-xl mx-auto">
      <p className="md:text-3xl text-xl text-white/80 text-center font-semibold my-4">
        {header}
      </p>
      <p className="md:text-xl text-md text-white/70 text-center mt-5 ">
        {content}
      </p>
    </div>
  );
};
