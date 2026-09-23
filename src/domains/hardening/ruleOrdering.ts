export const compareRuleIds = (left?: string, right?: string): number =>
  (left || '').localeCompare(right || '', undefined, {
    numeric: true,
    sensitivity: 'base',
  });
