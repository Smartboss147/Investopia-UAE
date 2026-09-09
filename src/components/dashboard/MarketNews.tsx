import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Newspaper, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { triggerHaptic } from '../../utils/haptic';

interface NewsItem {
  title: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export const MarketNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/news');
      if (!response.ok) throw new Error('Failed to fetch news');
      const data = await response.json();
      setNews(data);
    } catch (err) {
      setError('Could not load latest news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp size={14} className="text-emerald-500" />;
      case 'negative': return <TrendingDown size={14} className="text-red-500" />;
      default: return <Minus size={14} className="text-gray-500" />;
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Newspaper size={16} className="text-[#D4FF3D]" />
          <h3 className="text-xs font-bold text-[#8A93A6] tracking-[0.2em] uppercase">Market News</h3>
        </div>
        <button 
          onClick={() => {
            triggerHaptic();
            fetchNews();
          }}
          disabled={loading}
          className={cn(
            "p-2 rounded-full transition-all active:scale-90",
            theme === 'dark' ? "bg-white/5 text-white" : "bg-black/5 text-black"
          )}
        >
          <RefreshCw size={14} className={cn(loading && "animate-spin")} />
        </button>
      </div>

      <div className={cn(
        "rounded-[24px] overflow-hidden border transition-colors",
        theme === 'dark' ? "bg-[#131A2E]/50 border-white/5" : "bg-white border-black/5 shadow-sm"
      )}>
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-[#D4FF3D] border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-bold text-[#8A93A6] uppercase tracking-widest">Fetching Headlines...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {news.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h4 className={cn(
                    "text-sm font-bold leading-snug",
                    theme === 'dark' ? "text-white" : "text-[#0A0F1E]"
                  )}>
                    {item.title}
                  </h4>
                  <div className="mt-1 flex-shrink-0">
                    {getSentimentIcon(item.sentiment)}
                  </div>
                </div>
                <p className="text-[11px] text-[#8A93A6] line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <p className="text-[8px] text-center text-gray-600 font-medium uppercase tracking-[0.2em] italic">Powered by Investopia Intelligence & Google Search</p>
    </section>
  );
};
