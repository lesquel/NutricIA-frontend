import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { Colors, FontSize, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { chatService } from '../api/chat.service';
import type { ConversationSummary } from '@/shared/types/api';

interface ConversationHistoryModalProps {
  visible: boolean;
  activeId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
}

interface DateGroup {
  label: string;
  items: ConversationSummary[];
}

const ES_MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return '';
  }
}

function formatDayLabel(day: Date, locale: string): string {
  // Hermes on Android ships without full ICU, so `new Intl.DateTimeFormat`
  // throws "Cannot convert undefined value to object" for some locales.
  // Hand-roll a minimal formatter for the only two locales we support.
  const months = locale.startsWith('en') ? EN_MONTHS : ES_MONTHS;
  const d = day.getDate();
  const m = months[day.getMonth()];
  const y = day.getFullYear();
  return locale.startsWith('en') ? `${m} ${d}, ${y}` : `${d} de ${m} de ${y}`;
}

function groupByDate(items: ConversationSummary[], locale: string): DateGroup[] {
  if (!Array.isArray(items) || items.length === 0) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const bucket = new Map<string, ConversationSummary[]>();
  for (const item of items) {
    if (!item) continue;
    const rawTs = item.updated_at || item.created_at;
    if (!rawTs) continue;
    const created = new Date(rawTs);
    if (Number.isNaN(created.getTime())) continue;
    const day = new Date(
      created.getFullYear(),
      created.getMonth(),
      created.getDate(),
    );
    let label: string;
    if (day.getTime() === today.getTime()) label = '__today__';
    else if (day.getTime() === yesterday.getTime()) label = '__yesterday__';
    else label = formatDayLabel(day, locale);
    if (!bucket.has(label)) bucket.set(label, []);
    bucket.get(label)!.push(item);
  }

  // Natural order: today, yesterday, then newest first by any date string.
  const order = Array.from(bucket.keys()).sort((a, b) => {
    if (a === '__today__') return -1;
    if (b === '__today__') return 1;
    if (a === '__yesterday__') return -1;
    if (b === '__yesterday__') return 1;
    // Compare underlying dates — use first item's timestamp as the group key.
    const aTs = bucket.get(a)![0].updated_at || bucket.get(a)![0].created_at;
    const bTs = bucket.get(b)![0].updated_at || bucket.get(b)![0].created_at;
    return bTs.localeCompare(aTs) * -1;
  });

  return order.map((key) => ({
    label: key,
    items: bucket
      .get(key)!
      .sort((a, b) =>
        (b.updated_at || b.created_at).localeCompare(
          a.updated_at || a.created_at,
        ),
      ),
  }));
}

export function ConversationHistoryModal({
  visible,
  activeId,
  onClose,
  onSelect,
}: ConversationHistoryModalProps) {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatService.listConversations(50, 0),
    enabled: visible,
  });

  const groups = useMemo(() => {
    if (!data?.items) return [];
    return groupByDate(data.items, i18n.language ?? 'es');
  }, [data, i18n.language]);

  function renderGroup({ item }: { item: DateGroup }) {
    const label =
      item.label === '__today__'
        ? t('tabs.recipes.historyToday')
        : item.label === '__yesterday__'
          ? t('tabs.recipes.historyYesterday')
          : item.label;

    return (
      <View>
        <Text style={[styles.groupLabel, { color: colors.textMuted }]}>
          {label}
        </Text>
        {item.items.map((conv) => {
          const isActive = conv.id === activeId;
          return (
            <TouchableOpacity
              key={conv.id}
              style={[
                styles.row,
                {
                  backgroundColor: isActive ? colors.primary + '18' : colors.surface,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
              onPress={() => onSelect(conv.id)}
              activeOpacity={0.75}
            >
              <MaterialIcons name="chat-bubble-outline" size={18} color={colors.primary} />
              <Text
                style={[styles.rowTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {conv.title || t('tabs.recipes.historyUntitled')}
              </Text>
              <Text style={[styles.rowTime, { color: colors.textMuted }]}>
                {formatTime(conv.updated_at || conv.created_at)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('tabs.recipes.history')}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surface }]}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : groups.length === 0 ? (
            <View style={styles.centered}>
              <MaterialIcons
                name="history-toggle-off"
                size={40}
                color={colors.textMuted}
              />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {t('tabs.recipes.historyEmpty')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={groups}
              keyExtractor={(g) => g.label}
              renderItem={renderGroup}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '85%',
    minHeight: '50%',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  groupLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: 8,
  },
  rowTitle: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  rowTime: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 40,
  },
  emptyText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
});

// Silence unused Colors import for strict TS
void Colors;
