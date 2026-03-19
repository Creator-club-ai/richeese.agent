import { Badge } from '@renderer/components/ui/badge';
import { translateValidationState } from '@renderer/lib/workspace';

export function ValidationBadge({ state }: { state: string }): React.JSX.Element {
  const variant =
    state === 'valid' ? 'success' : state === 'invalid' ? 'danger' : state === 'warning' ? 'warning' : 'neutral';

  return <Badge variant={variant}>{translateValidationState(state)}</Badge>;
}
