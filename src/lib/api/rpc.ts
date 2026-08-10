import { createPublicClient, http, parseEther, formatUnits, type Hex } from "viem";
import { mainnet } from "viem/chains";

/** Direct on-chain reads over free public RPC (PublicNode) — no keys.
 *  The Uniswap quote is a REAL eth_call against QuoterV2 on Ethereum mainnet. */

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http("https://ethereum-rpc.publicnode.com", { timeout: 12_000 }),
});

export async function fetchBlockNumber(): Promise<number> {
  const n = await publicClient.getBlockNumber();
  return Number(n);
}

export async function fetchGasGwei(): Promise<number> {
  const wei = await publicClient.getGasPrice();
  return Number(wei) / 1e9;
}

/* ————— Uniswap V3 QuoterV2 ————— */

const QUOTER_V2 = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e" as Hex;
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as Hex;
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Hex;

/** quoteExactInputSingle is nonpayable on-chain, but it is safe to eth_call —
 *  declaring it `view` here lets viem route it through readContract. */
const QUOTER_ABI = [
  {
    type: "function",
    name: "quoteExactInputSingle",
    stateMutability: "view",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "fee", type: "uint24" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    outputs: [
      { name: "amountOut", type: "uint256" },
      { name: "sqrtPriceX96After", type: "uint160" },
      { name: "initializedTicksCrossed", type: "uint32" },
      { name: "gasEstimate", type: "uint256" },
    ],
  },
] as const;

export interface UniQuote {
  ethIn: number;
  usdcOut: number;
  pricePerEth: number;
  feeTier: number;
  gasEstimate: number;
  block: number;
}

export async function fetchUniQuote(ethIn: number): Promise<UniQuote> {
  const amountIn = parseEther(ethIn.toFixed(18) as `${number}`);
  const [result, block] = await Promise.all([
    publicClient.readContract({
      address: QUOTER_V2,
      abi: QUOTER_ABI,
      functionName: "quoteExactInputSingle",
      args: [
        {
          tokenIn: WETH,
          tokenOut: USDC,
          amountIn,
          fee: 500,
          sqrtPriceLimitX96: BigInt(0),
        },
      ],
    }),
    publicClient.getBlockNumber(),
  ]);
  const [amountOut, , , gasEstimate] = result;
  const usdcOut = Number(formatUnits(amountOut, 6));
  return {
    ethIn,
    usdcOut,
    pricePerEth: usdcOut / ethIn,
    feeTier: 0.05,
    gasEstimate: Number(gasEstimate),
    block: Number(block),
  };
}
