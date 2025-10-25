export function shortenAddress(address: string, chars = 6): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function getExplorerUrl(
  chain: string,
  address: string,
  type: "address" | "tx" | "object" = "address"
): string {
  const explorers: Record<string, string> = {
    sui: "https://suiscan.xyz/mainnet",
    ethereum: "https://etherscan.io",
    polygon: "https://polygonscan.com",
    // Add more chains as needed
  };

  const baseUrl = explorers[chain.toLowerCase()] || explorers.sui;
  
  if (chain.toLowerCase() === "sui") {
    return `${baseUrl}/${type}/${address}`;
  }
  
  return `${baseUrl}/${type}/${address}`;
}