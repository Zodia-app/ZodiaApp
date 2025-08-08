import { useState, useEffect } from 'react';
import { fetchDailyHoroscope, DailyHoroscope } from '../services/horoscope/horoscopeService';

export function useDailyHoroscope(sign: string, date: string) {
  const [horoscope, setHoroscope] = useState<DailyHoroscope | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sign || !date) {
      setHoroscope(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetchDailyHoroscope(sign, date)
      .then(data => {
        setHoroscope(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch horoscope');
        setLoading(false);
      });
  }, [sign, date]);

  return { horoscope, loading, error };
}