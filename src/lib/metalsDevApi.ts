// Metals.dev API integration for live commodity prices

interface MetalsDevResponse {
  status: string;
  currency: string;
  unit: string;
  metals: {
    gold: number;
    silver: number;
    platinum: number;
    palladium: number;
    copper: number;
    aluminum: number;
    lead: number;
    nickel: number;
    zinc: number;
  };
  timestamps: {
    metal: string;
    currency: string;
  };
}

interface SpotMetalResponse {
  status: string;
  timestamp: string;
  currency: string;
  unit: string;
  metal: string;
  rate: {
    price: number;
    ask: number;
    bid: number;
    high: number;
    low: number;
    change: number;
    change_percent: number;
  };
}

const API_BASE = 'https://api.metals.dev/v1';
const API_KEY = process.env.NEXT_PUBLIC_METALS_DEV_API_KEY || 'demo';

export class MetalsDevService {
  private static instance: MetalsDevService;
  private lastFetch: number = 0;
  private cacheTimeout = 30000; // 30 seconds cache

  static getInstance(): MetalsDevService {
    if (!MetalsDevService.instance) {
      MetalsDevService.instance = new MetalsDevService();
    }
    return MetalsDevService.instance;
  }

  async fetchLatestRates(): Promise<MetalsDevResponse> {
    const now = Date.now();
    if (now - this.lastFetch < this.cacheTimeout) {
      throw new Error('Rate limited - please wait before fetching again');
    }

    const url = `${API_BASE}/latest?api_key=${API_KEY}&currency=USD&unit=toz`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'failure') {
        throw new Error(`API Error: ${data.error_message}`);
      }

      this.lastFetch = now;
      return data;
    } catch (error) {
      console.error('Metals.dev API Error:', error);
      throw error;
    }
  }

  async fetchSpotPrice(metal: string): Promise<SpotMetalResponse> {
    const url = `${API_BASE}/metal/spot?api_key=${API_KEY}&metal=${metal}&currency=USD`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'failure') {
        throw new Error(`API Error: ${data.error_message}`);
      }

      return data;
    } catch (error) {
      console.error(`Metals.dev API Error for ${metal}:`, error);
      throw error;
    }
  }

  // Map metals to our commodity symbols
  mapToCommodityData(metalsData: MetalsDevResponse) {
    return {
      gold: {
        price: metalsData.metals.gold,
        change24h: 0, // Will be calculated from previous price
        volume: "2.4B",
        marketCap: "11T",
        signal: "HOLD" as const,
      },
      silver: {
        price: metalsData.metals.silver,
        change24h: 0,
        volume: "1.1B", 
        marketCap: "1.4T",
        signal: "HOLD" as const,
      },
      crudeOil: {
        price: 78.35, // Not available in Metals.dev, keep mock data
        change24h: 0,
        volume: "4.8B",
        marketCap: "3.2T", 
        signal: "HOLD" as const,
      },
      naturalGas: {
        price: 2.14, // Not available in Metals.dev, keep mock data
        change24h: 0,
        volume: "890M",
        marketCap: "540B",
        signal: "HOLD" as const,
      },
      copper: {
        price: metalsData.metals.copper,
        change24h: 0,
        volume: "620M",
        marketCap: "280B",
        signal: "HOLD" as const,
      },
    };
  }
}

export const metalsDevService = MetalsDevService.getInstance();
