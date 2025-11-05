# Free Mint Process: Mainnet vs Frontend Integration

## Overview
The free minting process uses a **server-side (backend) mint via admin account**, not client-side transactions. The integration is the same across both testnet and mainnet.

---

## How Free Mint Process Works

### Flow Diagram
```
User clicks "Free Mint" button
    ↓
Frontend: handleGaslessMintAndTransfer() called
    ↓
Sends POST /platform/sui/mint-nft to backend
    ↓
Backend: adminFreeMint() executes
    ↓
Admin account mints NFT to user wallet (MAINNET)
    ↓
Success/Error toast notification
```

---

## Frontend Implementation

### File: `freemint/[metadata_id]/page.tsx`

#### Function: `handleGaslessMintAndTransfer()`
```tsx
const handleGaslessMintAndTransfer = async () => {
  try {
    const response = await axiosInstance.post(
      "/platform/sui/mint-nft",
      nftForm,  // Contains: collection_id, name, description, image_url, attributes
      {
        params: {
          user_address: address || userWalletAddress || currentAccount?.address,
        },
      }
    );
    
    // Success: Update UI, show success modal
    setShowSuccessModal(true);
  } catch (error) {
    // Error: Remove local mint attempt tracking, show error
  }
};
```

#### Key Characteristics:
- **No wallet signature required** from user
- **No client-side transaction** execution
- Only sends metadata to backend
- Backend admin account handles the actual mint

---

## Backend Implementation

### File: `hashcase-server/src/utils/sui_admin_mint.ts`

#### Function: `adminFreeMint()`

```typescript
export const adminFreeMint = async (
  adminPrivateKey: string,
  params: AdminMintParams
): Promise<AdminMintResult>
```

#### Network Configuration
```typescript
// Line 53-54: HARDCODED MAINNET CONNECTION
const client = new SuiClient({
  url: 'https://fullnode.mainnet.sui.io:443'  // ⚡ ALWAYS MAINNET
})
```

#### What It Does:
1. **Gets collection** from database (by ID)
2. **Creates admin keypair** from private key
3. **Connects to SUI MAINNET** (not testnet!)
4. **Sets transaction parameters:**
   - Admin address as sender
   - Gas price from mainnet
   - Gas budget: 50,000,000 (0.05 SUI)
   - Gas coins from admin wallet
5. **Executes move call:** `free_mint_nft` on smart contract
6. **Transfers NFT** to user's recipient address
7. **Returns:** transaction hash, NFT ID, mint price (0 for free)

---

## Network Comparison

| Aspect | Frontend | Backend |
|--------|----------|---------|
| **Network** | Hardcoded `sui:testnet` (in `useNftTransactions.ts`) | **Hardcoded `https://fullnode.mainnet.sui.io:443`** |
| **Transaction Type** | N/A (server-side) | Server-side admin mint |
| **Requires Signature** | No | Uses admin private key |
| **Gas Paid By** | Backend admin | Backend admin (stored in env) |
| **User Wallet Role** | Recipient only | Receives minted NFT |
| **Minting Account** | Admin account | Admin account from `SUI_PRIVATE_KEY` env var |

---

## Critical Finding: Network Mismatch ⚠️

### Problem:
```
Frontend chain: "sui:testnet"              (Line 50 in useNftTransactions.ts)
Backend mint network: "mainnet"             (Line 53 in sui_admin_mint.ts)
```

### What Happens:
1. Frontend calls free mint endpoint → Backend executes on **MAINNET** ✅
2. User's NFT appears on **MAINNET** wallet ✅
3. Frontend shows testnet chain selector (cosmetic only) ⚠️

### Impact:
- **Actual minting:** ✅ Happens on MAINNET (correct)
- **User experience:** ⚠️ UI might show wrong network

---

## Free Mint Flow on Mainnet

### Step-by-Step:

1. **User visits page**
   - Can select Free or Paid option via `DualMintButton`
   - Only needs wallet connected (not signing required)

2. **User clicks "Free Mint"**
   - Frontend submits NFT metadata to backend
   - Shows loading spinner

3. **Backend Admin Mint (On Mainnet)**
   ```
   Admin account (from env: SUI_PRIVATE_KEY)
     ↓
   Gets NFT details from DB
     ↓
   Connects to https://fullnode.mainnet.sui.io:443
     ↓
   Creates transaction with admin as sender
     ↓
   Calls contract: free_mint_nft()
     ↓
   Transfers NFT to user wallet address
     ↓
   Returns transaction hash
   ```

4. **User sees success**
   - NFT appears in their mainnet wallet
   - Success modal shows
   - localStorage tracks mint attempt

---

## Database Integration

### Collection Model Requirements:
Each collection must have these fields:
```typescript
{
  id: number,
  name: string,
  collection_address: string,  // On-chain collection object ID
  cap_id: string,              // Admin cap for minting
  package_id: string,          // Smart contract package ID
  chain_name: string,          // Network identifier
  owner_id: number,
  contract_id: string,
  image_uri: string,
  attributes: string
}
```

### Mainnet Collection Example:
```sql
-- ID: 18 (HashCase Mainnet Collection)
INSERT INTO collections VALUES (
  18,
  'HashCase Mainnet Collection',
  'A collection of amazing NFTs on mainnet',
  '0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290',
  'sui',
  1,
  1,
  'Rarity: Common, Type: Digital Art, Collection: HashCase, Network: Mainnet',
  ...
);
```

---

## Environment Variables Required

### Backend (.env)
```bash
SUI_PRIVATE_KEY=<admin-keypair-base64-or-suiprivkey1-format>
# This admin account must:
# - Own the collection on mainnet
# - Have sufficient SUI gas balance
# - Have mint capability
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_CONTRACT_PACKAGE_ID=0xea46060a8a4750de4ce91e6b8a2119d35becbeaef939c09557d0773c7f7c20a0
```

---

## Paid Mint vs Free Mint on Mainnet

### Free Mint (Admin-Driven)
- ✅ Handled by backend admin account
- ✅ Runs on **MAINNET** 
- ✅ User pays 0 gas (admin pays)
- ✅ No wallet signature needed

### Paid Mint (User-Signed)
- ✅ User signs transaction in wallet
- ⚠️ Currently hardcoded to `sui:testnet` in frontend
- ✅ User pays gas fees from their wallet
- ⚠️ **ISSUE:** Backend tries to mint on mainnet, but frontend connects to testnet

---

## Summary: Free Mint on Mainnet

✅ **Working Correctly:**
- Backend admin account has mainnet connectivity
- Free mint endpoint uses mainnet client
- Users receive NFTs on mainnet
- No signing required from users
- Gasless for users (admin pays)

⚠️ **Potential Issues:**
- Frontend chain selector shows `sui:testnet` (cosmetic)
- Database must have mainnet collection data
- Admin private key must be secured in env vars
- Admin account must have sufficient SUI balance

🔧 **Required for Production:**
1. Configure `SUI_PRIVATE_KEY` with admin keypair that owns mainnet collections
2. Add mainnet collection records to database (collection_address, cap_id, package_id)
3. Ensure admin wallet has SUI for gas fees
4. Test free mint flow end-to-end on mainnet

---

## Key Files Reference

| File | Role | Network |
|------|------|---------|
| `src/app/collections/.../freemint/[metadata_id]/page.tsx` | Frontend mint handler | Testnet UI (cosmetic) |
| `hashcase-server/src/utils/sui_admin_mint.ts` | Backend mint execution | **MAINNET** ✅ |
| `hashcase-server/src/routes/user.ts` | API endpoint | N/A (calls backend) |
| `.env` (backend) | Admin keypair | N/A (config) |
| Database | Collection metadata | N/A (data storage) |

