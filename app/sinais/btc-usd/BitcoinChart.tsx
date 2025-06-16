'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  UTCTimestamp,
  ColorType,
  LineStyle,
  CrosshairMode,
} from 'lightweight-charts';

// Function to get chart options based on theme
const getChartOptions = (isDarkMode: boolean) => ({
  layout: {
    background: { type: ColorType.Solid, color: isDarkMode ? '#1f2937' : '#ffffff' }, // Tailwind gray-800 for dark, white for light
    textColor: isDarkMode ? '#d1d5db' : '#1f2937', // Tailwind gray-300 for dark, gray-800 for light
  },
  grid: {
    vertLines: {
      color: isDarkMode ? '#374151' : '#e5e7eb', // Tailwind gray-700 for dark, gray-200 for light
      style: LineStyle.Solid,
    },
    horzLines: {
      color: isDarkMode ? '#374151' : '#e5e7eb', // Tailwind gray-700 for dark, gray-200 for light
      style: LineStyle.Solid,
    },
  },
  crosshair: {
    mode: CrosshairMode.Normal,
  },
  rightPriceScale: {
    borderColor: isDarkMode ? '#4b5563' : '#d1d5db', // Tailwind gray-600 for dark, gray-300 for light
  },
  timeScale: {
    borderColor: isDarkMode ? '#4b5563' : '#d1d5db', // Tailwind gray-600 for dark, gray-300 for light
    timeVisible: true,
    secondsVisible: false,
  },
  // Width and height are typically set by the container
});

// Define candlestick series options (generally okay for both themes)
const seriesOptions = {
  upColor: '#26a69a',
  downColor: '#ef5350',
  borderDownColor: '#ef5350',
  borderUpColor: '#26a69a',
  wickDownColor: '#ef5350',
  wickUpColor: '#26a69a',
};

const BitcoinChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Effect to detect theme changes
  useEffect(() => {
    const checkDarkMode = () => {
      if (typeof window !== 'undefined') {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
      }
    };
    checkDarkMode(); // Initial check

    // Observe class changes on documentElement for theme switching
    const observer = new MutationObserver(checkDarkMode);
    if (typeof window !== 'undefined') {
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }
    return () => observer.disconnect();
  }, []);


  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    const currentChartOptions = getChartOptions(isDarkMode);

    chartRef.current = createChart(chartContainerRef.current, {
      ...currentChartOptions,
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    candlestickSeriesRef.current = chartRef.current.addCandlestickSeries(seriesOptions);

    // Apply options again if theme changes while chart is mounted
    if (chartRef.current) {
        chartRef.current.applyOptions(currentChartOptions);
    }

    // Dummy data for initial chart display (can be removed or replaced with historical fetch)
    // const initialData: CandlestickData[] = [
    //   { time: (Math.floor(Date.now() / 1000 / 60) * 60 - 4 * 60) as UTCTimestamp, open: 60000, high: 60500, low: 59800, close: 60200 },
    //   { time: (Math.floor(Date.now() / 1000 / 60) * 60 - 3 * 60) as UTCTimestamp, open: 60200, high: 60800, low: 60100, close: 60700 },
    //   { time: (Math.floor(Date.now() / 1000 / 60) * 60 - 2 * 60) as UTCTimestamp, open: 60700, high: 61000, low: 60600, close: 60900 },
    //   { time: (Math.floor(Date.now() / 1000 / 60) * 60 - 1 * 60) as UTCTimestamp, open: 60900, high: 61200, low: 60800, close: 61100 },
    // ];
    // if (initialData.length > 0 && candlestickSeriesRef.current) {
    //   candlestickSeriesRef.current.setData(initialData);
    //   chartRef.current?.timeScale().fitContent();
    // }

    // WebSocket Connection
    wsRef.current = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
    setConnectionStatus('Connecting...');

    wsRef.current.onopen = () => {
      console.log('WebSocket connection opened');
      setConnectionStatus('Connected');
    };

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data as string);
      if (message.k && candlestickSeriesRef.current) {
        const kline = message.k;
        const formattedCandle: CandlestickData = {
          time: (kline.t / 1000) as UTCTimestamp,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
        };
        candlestickSeriesRef.current.update(formattedCandle);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('Error');
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket connection closed');
      setConnectionStatus('Disconnected');
    };

    // Resize chart on window resize
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.resize(
          chartContainerRef.current.clientWidth,
          chartContainerRef.current.clientHeight
        );
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      window.removeEventListener('resize', handleResize);
      setConnectionStatus('Disconnected'); // Should this be here or in ws.onclose?
    };
  }, [isDarkMode]); // Re-run this effect if isDarkMode changes

  // Determine text color for status based on theme
  const statusTextColor = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const statusBorderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div className={`p-2 border-b ${statusBorderColor} ${statusTextColor} text-sm`}>
        Connection Status: {connectionStatus}
      </div>
      <div
        ref={chartContainerRef}
        style={{ flexGrow: 1, width: '100%' }} // Chart container takes remaining space
      />
    </div>
  );
};

export default BitcoinChart;
