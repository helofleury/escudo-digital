import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { countRead, listHistory } from '@/db/historyRepository';
import type { HistoryItem } from '@/types';

interface HistoryState {
  items: HistoryItem[];
  tipsRead: number;
  loading: boolean;
  reload: () => Promise<void>;
}

export function useHistory(): HistoryState {
  const { user } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [tipsRead, setTipsRead] = useState(0);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async (): Promise<void> => {
    if (user === null) return;
    const [list, read] = await Promise.all([listHistory(user.id), countRead(user.id)]);
    setItems(list);
    setTipsRead(read);
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      reload().catch(() => setLoading(false));
    }, [reload]),
  );

  return { items, tipsRead, loading, reload };
}
