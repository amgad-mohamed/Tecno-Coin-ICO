"use client";

const TokenSale = () => {
  const tokenDetails = [
    {
      title: "Total Supply",
      value: "100,000,000 PLT",
      description: "Fixed supply, no additional minting",
    },
    {
      title: "Presale Allocation",
      value: "41,000,000 PLT",
      description: "41% of total supply",
    },
    {
      title: "Token Price",
      value: "$0.10 USD",
      description: "Early investor price",
    },
    {
      title: "Listing Price",
      value: "$0.20 USD",
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
      label: "Soft Cap",
      value: "$1,000,000",
    },
    {
      label: "Hard Cap",
      value: "$4,000,000",
    },
    {
      label: "Minimum Purchase",
      value: "1,000 PLT",
    },
    {
      label: "Maximum Purchase",
      value: "500,000 PLT",
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
    <div id="token-sale" className="container px-4 sm:px-6 lg:px-8">
      <div className="text-center m-16 pt-20">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Token Sale Details
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Join our presale to secure PLT tokens at the best possible price. Our
          transparent tokenomics and vesting schedule ensure long-term value for
          all holders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16">
        {tokenDetails.map((detail, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-5 sm:p-6 hover:shadow-xl transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {detail.title}
            </h3>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              {detail.value}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              {detail.description}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-5 sm:p-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
            Presale Information
          </h3>
          <div className="space-y-4">
            {presaleInfo.map((info, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
              >
                <span className="text-gray-600 dark:text-gray-300">
                  {info.label}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white break-words">
                  {info.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-5 sm:p-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
            Token Distribution
          </h3>
          <div className="space-y-4">
            {distribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-lg text-gray-700 dark:text-gray-300">
                  {item.category}
                </span>
                <div className="flex items-center gap-4">
                  <div className="w-40 sm:w-48 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 dark:bg-emerald-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-5 sm:p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
          Vesting Schedule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-4">
            {vestingInfo.map((info, index) => (
              <div key={index} className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-1"
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
                <span className="text-gray-600 dark:text-gray-300">{info}</span>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-5 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-600">
            <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Smart Contract Details
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Contract Address
                </span>
                <code className="text-emerald-600 dark:text-emerald-400 font-mono break-all">
                  0x1234...5678
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Network
                </span>
                <span className="text-gray-900 dark:text-white">
                  Ethereum (ERC-20)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Audit Status
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  Verified by CertiK
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 p-5 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Important Notes:
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-emerald-600 dark:text-emerald-400">•</span>
            <span className="text-gray-600 dark:text-gray-300">
              Always verify the contract address before sending any funds
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-600 dark:text-emerald-400">•</span>
            <span className="text-gray-600 dark:text-gray-300">
              Do not send funds from an exchange wallet; use a personal
              ERC-20-compatible wallet
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-600 dark:text-emerald-400">•</span>
            <span className="text-gray-600 dark:text-gray-300">
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
