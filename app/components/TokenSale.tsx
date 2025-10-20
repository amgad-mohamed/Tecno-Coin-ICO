"use client";

import { useTokenContract } from "../services/useTokenContract";
import { formatEther } from "viem";

const TokenSale = () => {
  const { useTotalSupply } = useTokenContract();
  const { data: totalSupply } = useTotalSupply();
  const TOTAL_SUPPLY = Number(
    typeof totalSupply === "bigint" ? formatEther(totalSupply) : 0
  );
  const PUBLIC_ALLOCATION = TOTAL_SUPPLY / 2;
  const tokenDetails = [
    {
      title: "Total Supply",
      value: `${TOTAL_SUPPLY > 0 ? TOTAL_SUPPLY.toLocaleString() : "—"} NEFE`,
      description: "Fixed supply, no additional minting",
    },
    {
      title: "Public Allocation",
      value: `${PUBLIC_ALLOCATION > 0 ? PUBLIC_ALLOCATION.toLocaleString() : "—"} NEFE`,
      description: "50% of total supply available",
    },
    {
      title: "Token Price",
      value: "$0.001 USDT",
      description: "Early investor price",
    },
    {
      title: "Listing Price",
      value: "$0.01 USD",
      description: "100% upside potential",
    },
  ];

  const presaleInfo = [
    {
      label: "Start Date",
      value: "March 15, 2024 12:00 UTC",
    },
    {
      label: "End Date",
      value: "May 1, 2024 12:00 UTC",
    },
    {
      label: "Target Raise",
      value: "$2,500,000",
    },
    {
      label: "Maximum Raise",
      value: "$5,000,000",
    },
    {
      label: "Minimum Purchase",
      value: "1,000 NEFE",
    },
    {
      label: "Maximum Purchase",
      value: "500,000 NEFE",
    },
  ];

  const distribution = [
    { category: "Public Sale", percentage: 20 },
    { category: "Assets", percentage: 30 },
    { category: "Exchange and Liquidity", percentage: 10 },

    { category: "Team", percentage: 5 },

    { category: "Ecosystem and Development", percentage: 15 },
    { category: "Marketing", percentage: 15 },
    { category: "Partnership Funds", percentage: 5 },
  ];

  const vestingInfo = [
    "Presale tokens: 25% at TGE, then 25% monthly",
    "Liquidity: 100% locked for 1 year",
    "Development: 10% monthly release",
    "Marketing: 10% monthly release",
    "Team: 6-month cliff, then 10% monthly",
  ];

  return (
    <div
      id="token-sale"
      className=" text-white font-nunito"
    >
      <div className="text-center pt-20">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Token Sale Details
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-3xl mx-auto">
          Join our presale to secure NEFE tokens at the best possible price. Our
          transparent tokenomics and vesting schedule ensure long-term value for
          all holders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 my-16">
        {tokenDetails.map((detail, index) => (
          <div
            key={index}
            className="bg-secondBgColor rounded-xl p-5 sm:p-6 border border-bgColor/60"
          >
            <h3 className="text-base md:text-xl font-medium text-white/80 mb-2">
              {detail.title}
            </h3>
            <p className="text-base sm:text-lg md:text-2xl font-bold bg-gradient-to-r from-[#F4AD30] to-[#CA6C2F] bg-clip-text text-transparent mb-1">
              {detail.value}
            </p>
            <p className="text-white/70 text-sm md:text-base">
              {detail.description}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16">
        <div className="bg-black/60 rounded-xl p-5 sm:p-6 border border-bgColor/60">
          <h3 className="text-base md:text-xl font-semibold mb-4 text-white/80">
            Presale Information
          </h3>
          <div className="space-y-4">
            {presaleInfo.map((info, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 p-4 bg-secondBgColor rounded-xl border border-bgColor/60"
              >
                <span className=" text-xs sm:text-sm md:text-base">
                  {info.label}
                </span>
                <span className="font-semibold text-xs sm:text-sm md:text-base break-words">
                  {info.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black/60 rounded-xl p-5 sm:p-6 border border-bgColor/60">
          <h3 className="text-sm font-medium mb-4 text-white/80">
            Token Distribution
          </h3>
          <div className="space-y-4">
            {distribution.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-xs sm:text-sm md:text-base">
                  {item.category}
                </span>
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  <div className="h-1.5 bg-bgColor rounded-full overflow-hidden flex-1 sm:flex-none w-full sm:w-40 md:w-52">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#F4AD30] to-[#CA6C2F]"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-amber-400">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl  border border-bgColor/60">
        <h3 className="text-base md:text-xl font-semibold mb-4 text-white/80">
          Vesting Schedule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-4">
            {vestingInfo.map((info, index) => (
              <div key={index} className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 flex-shrink-0 text-btnColor"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm md:base font-inter">{info}</span>
              </div>
            ))}
          </div>
          <div className="bg-secondBgColor p-5 sm:p-6 rounded-xl border border-bgColor/60">
            <h4 className="text-base md:text-xl font-semibold mb-3 text-white/80">
              Smart Contract Details
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm md:text-base">Contract Address</span>
                <code className="text-primary font-mono break-all text-sm">
                  0x1234...5678
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm md:text-base">Network</span>
                <span className="text-sm md:text-base">Ethereum (ERC-20)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm md:text-base">Audit Status</span>
                <span className="text-sm md:text-base">Verified by CertiK</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 p-5 sm:p-6 bg-thirdBgColor rounded-xl border border-bgColor/60">
        <h3 className="text-base md:text-xl font-semibold mb-3 text-amber-400">
          Important Notes:
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-amber-400">•</span>
            <span>
              Always verify the contract address before sending any funds
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-400">•</span>
            <span>
              Do not send funds from an exchange wallet; use a personal
              ERC-20-compatible wallet
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-400">•</span>
            <span>
              The team is not responsible for transactions sent to the wrong
              address
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TokenSale;
