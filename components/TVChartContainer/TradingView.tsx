import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import { FAKE_DATA_BARS } from './fake';
import {
  widget,
  version,
  TradingTerminalWidgetOptions,
  IChartingLibraryWidget,
} from '../charting_library/charting_library.min';
import {
  HistoryCallback,
  LibrarySymbolInfo,
  ResolutionString,
  ResolveCallback,
} from '../charting_library/datafeed-api';

function getLanguageFromURL() {
  const regex = new RegExp('[\\?&]lang=([^&#]*)');
  const results = regex.exec(window.location.search);
  return results === null
    ? null
    : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

const configurationData = {
  supports_search: true,
  supports_marks: true,
  intraday_multipliers: [
    '1',
    '3',
    '5',
    '15',
    '30',
    '60',
    '120',
    '240',
    '360',
    '480',
    '720',
  ],
  supported_resolutions: [
    '1',
    '3',
    '5',
    '15',
    '30',
    '60',
    '120',
    '240',
    '360',
    '480',
    '720',
    '1D',
    '3D',
    '1W',
  ],
};

const TVChartContainer: React.FC<any> = (props) => {
  const [widgetCom, setWidgetCom] = useState<IChartingLibraryWidget | null>();
  const [isChartReady, setChartReady] = useState(true);

  const onReady = (callback: any) => {
    setTimeout(() => callback(configurationData));
  };

  const getBars = async (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    from: number,
    to: number,
    onResult: HistoryCallback
  ) => {
    // return FAKE_DATA_BARS;
    onResult(FAKE_DATA_BARS.bars, { noData: false });
  };

  const resolveSymbol = async (
    symbolName: string,
    onSymbolResolvedCallback: ResolveCallback
    // onResolveErrorCallback: ErrorCallback,
  ) => {
    const symbol = `BTCUSD`;
    const priceScale = 100000;
    // log(amount_precision) * (fee precision)
    const volumePrecision = -Math.log10(Number(0.01)) + 2;
    const symbolInfo: LibrarySymbolInfo = {
      exchange: '',
      full_name: '',
      listed_exchange: '',
      ticker: symbol,
      name: symbol,
      description: symbol,
      type: 'bitcoin',
      session: '24x7',
      timezone: 'Etc/UTC',
      minmov: 1,
      pricescale: priceScale,
      has_intraday: true,
      has_weekly_and_monthly: true,
      intraday_multipliers: ['1', '60'],
      supported_resolutions: configurationData.supported_resolutions,
      volume_precision: volumePrecision,
    };
    onSymbolResolvedCallback(symbolInfo);
  };

  const datafeed = {
    onReady,
    searchSymbols: () => {},
    resolveSymbol,
    getBars,
    subscribeBars: () => {},
    unsubscribeBars: () => {},
  };

  useEffect(() => {
    const widgetOptions: TradingTerminalWidgetOptions = {
      symbol: props.symbol,
      // BEWARE: no trailing slash is expected in feed URL
      // datafeed: new window.Datafeeds.UDFCompatibleDatafeed(
      //   props.datafeedUrl
      // ),
      datafeed: datafeed,
      interval: props.interval,
      container_id: 'tv_chart_container',
      library_path: props.libraryPath,

      locale: 'en',
      disabled_features: ['use_localstorage_for_settings'],
      enabled_features: ['study_templates'],
      charts_storage_url: props.chartsStorageUrl,
      charts_storage_api_version: props.chartsStorageApiVersion,
      client_id: props.clientId,
      user_id: props.userId,
      fullscreen: props.fullscreen,
      autosize: props.autosize,
      studies_overrides: props.studiesOverrides,
      theme: 'Dark',
    };

    const tvWidget: any = new widget(widgetOptions);
    setWidgetCom(tvWidget);

    tvWidget.onChartReady(() => {
      setChartReady(true);
      tvWidget.chart().setResolution('1D', () => {});
      tvWidget.applyOverrides({ 'paneProperties.topMargin': 15 });
      tvWidget.headerReady().then(() => {
        const button = tvWidget.createButton();
        button.setAttribute('title', 'Click to show a notification popup');
        button.classList.add('apply-common-tooltip');
        button.addEventListener('click', () =>
          tvWidget.showNoticeDialog({
            title: 'Notification',
            body: 'TradingView Charting Library API works correctly',
            callback: () => {
              console.log('Noticed!');
            },
          })
        );

        button.innerHTML = 'Check API';
      });
    });
  }, []);

  useEffect(() => {
    return () => {
      widgetCom && widgetCom.remove();
      setWidgetCom(null);
    };
  }, []);

  useEffect(() => {
    if (isChartReady) {
      widgetCom?.chart().setResolution('1D', () => {});
    }
  }, [isChartReady]);

  return (
    <>
      <header className={styles.VersionHeader}></header>
      <div
        style={{ height: '400px', width: 800 }}
        id={props.container_id}
        className={styles.TVChartContainer}
      />
    </>
  );
};

TVChartContainer.defaultProps = {
  container_id: 'tv_chart_container',
  symbol: 'BTCUSD',
  interval: 'D',
  datafeedUrl: 'https://demo_feed.tradingview.com',
  libraryPath: '/static/charting_library/',
  chartsStorageUrl: 'https://saveload.tradingview.com',
  chartsStorageApiVersion: '1.1',
  clientId: 'tradingview.com',
  userId: 'public_user_id',
  fullscreen: false,
  autosize: true,
  studiesOverrides: {},
};

export default TVChartContainer;
