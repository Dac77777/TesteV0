import React from 'react';
import BitcoinChart from './BitcoinChart'; // Assuming BitcoinChart.tsx is in the same directory

const BtcUsdPage = () => {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8"> {/* Enhanced responsive padding */}
      <h1 className="text-2xl font-semibold mb-4 text-center">Real-Time BTC/USDT Chart (1-min)</h1>
      {/* Ensure this div takes up the space for the chart, and chart itself fills this div */}
      <div style={{ height: '600px' }} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4"> {/* Adjusted height, added dark mode bg */}
        <BitcoinChart />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center"> {/* Dark mode text for caption */}
        Data streamed from Binance (wss://stream.binance.com:9443/ws/btcusdt@kline_1m)
      </p>
    </div>
  );
};

export default BtcUsdPage;
