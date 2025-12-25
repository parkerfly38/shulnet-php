import { useCallback, useState } from 'react';
import type { TorahReadingResponse } from '@/types';

interface FetchTorahReadingsParams {
    start: string; // ISO date string (YYYY-MM-DD)
    end: string; // ISO date string (YYYY-MM-DD)
    cfg?: string; // Configuration (default: 'json')
}

const HEBCAL_API_BASE = 'https://www.hebcal.com/leyning';

export const useTorahReadings = () => {
    const [data, setData] = useState<TorahReadingResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTorahReadings = useCallback(
        async (params: FetchTorahReadingsParams): Promise<TorahReadingResponse | null> => {
            setLoading(true);
            setError(null);

            try {
                const searchParams = new URLSearchParams({
                    cfg: params.cfg || 'json',
                    start: params.start,
                    end: params.end,
                });

                const response = await fetch(
                    `${HEBCAL_API_BASE}?${searchParams.toString()}`,
                    {
                        headers: { Accept: 'application/json' },
                    }
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch Torah readings: ${response.status}`);
                }

                const result = await response.json() as TorahReadingResponse;
                setData(result);
                return result;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
                setError(errorMessage);
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return {
        data,
        loading,
        error,
        fetchTorahReadings,
        reset,
    };
};
