import Bentodemo from "./bentogrid";

export const Features = () => {
  return (
    <div className="bg-black text-white py-[72px] sm:py-24 ">
      <div className="container">
        <h2 className="text-center font-bold text-4xl sm:text-6xl tracking-tighter">
          Create Memorable <br /> Browsing & Checkout Experience
        </h2>
        <div className="max-w-xl mx-auto">
          <p className="text-center mt-5 text-xl text-white/70">
            Gamify your user journey and give your audience something unique
            that they actually own.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center sm:flex-row gap-4 mt-32">
          <Bentodemo />
        </div>
      </div>
    </div>
  );
};
