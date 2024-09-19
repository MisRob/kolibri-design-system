import { setCardsPerRow, setColumnGap, setRowGap } from '../cards/useGridConfig';

export default function useKCardGrid() {
  return { setCardsPerRow, setColumnGap, setRowGap };
}
