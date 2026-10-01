import type { Row } from '@/lib/db';
import { date, dateTime, money, number } from '@/lib/format';
import type { Column } from '@/lib/list';
import type { Config } from '@/lib/types';
import { Badge } from './parts';

// How a value of each column type is written. Numbers and money are aligned
// right by the stylesheet through the type class, text left, a status is a
// badge with its word.

export function cellText(config: Config, column: Pick<Column, 'type' | 'set'>, value: Row[string]): string {
  if (value === null || value === undefined || value === '') return config.ui.table!.empty ?? '';
  switch (column.type) {
    case 'money':
      return money(config, Number(value));
    case 'number':
      return number(config, Number(value));
    case 'date':
      return date(config, String(value));
    case 'datetime':
      return dateTime(config, String(value));
    case 'option':
      return config.options[column.set ?? '']?.[String(value)] ?? String(value);
    case 'status':
      return config.statuses[column.set ?? '']?.[String(value)] ?? String(value);
    default:
      return String(value);
  }
}

export function Cell({ config, column, value }: { config: Config; column: Column; value: Row[string] }) {
  if (column.type === 'status' && value !== null && value !== undefined) {
    return <Badge config={config} set={column.set ?? ''} value={String(value)} />;
  }
  return <>{cellText(config, column, value)}</>;
}
