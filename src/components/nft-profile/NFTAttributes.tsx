// @/components/nft/NFTAttributes.tsx
interface NFTAttributesProps {
  attributes: string;
}

export default function NFTAttributes({ attributes }: NFTAttributesProps) {
  const parseAttributes = (attributesString: string): any[] | null => {
    if (!attributesString) return null;
    try {
      const parsed = JSON.parse(attributesString);
      return Array.isArray(parsed) ? parsed : null;
    } catch (e) {
      console.error("Failed to parse attributes:", e);
      return null;
    }
  };

  const parsedAttributes = parseAttributes(attributes);

  return (
    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
      <h3 className="font-semibold text-white/90 text-xl mb-4">Attributes</h3>
      {parsedAttributes && parsedAttributes.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {parsedAttributes.map((attr: any, index: number) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-lg p-4 border border-blue-500/20"
            >
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
                {attr.trait_type || "Attribute"}
              </p>
              <p className="font-semibold text-white">{attr.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
          <p className="text-sm text-gray-300 whitespace-pre-wrap">
            {attributes}
          </p>
        </div>
      )}
    </div>
  );
}
