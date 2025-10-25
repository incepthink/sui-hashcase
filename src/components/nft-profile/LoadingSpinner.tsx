export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
        <p className="text-xl">Loading NFT...</p>
      </div>
    </div>
  );
}
