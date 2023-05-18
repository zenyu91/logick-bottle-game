# logic-bottle-game
import { makeAutoObservable } from 'mobx';
import { createContext } from 'react';

type ShelfItemType = BottlesEnum | null;
type ShelfItemsListType = ShelfItemType[];

class BottlesGameStore {
	draggedPosition: PositionType | null = null; // начальная позиция drag-элемента в момент перетаскивания
	positions: Record<ShelvesEnum, ShelfItemsListType>; // содержимое ячеек на полках

	constructor() {
		makeAutoObservable(this);
		this.shuffle();
	}

	shuffle(): void { // перемешиваем бутылки
		this.positions = {
			[ShelvesEnum.top]: new Array(correctPositions.length).fill(null),
			[ShelvesEnum.bottom]: [...correctPositions].sort(
				() => Math.random() - 0.5
			),
		};

		this.isOneAtBottomCorrect && this.shuffle(); // перемешиваем еще раз, если хотя бы одна стоит на нужной позиции
	}

	get isOneAtBottomCorrect(): boolean {
		return correctPositions.some(
			(bottleId, columnIndex) =>
				bottleId === this.positions[ShelvesEnum.bottom][columnIndex]
		);
	}

	onDrag(position: PositionType): void {
		this.draggedPosition = position;
	}

	onDrop(bottleId: number, position: PositionType): void {
		const itemAtDrop = this.getItem(position); // проверяем бутылку в drop-ячейке
		if (itemAtDrop || !this.draggedPosition || this.isCorrect) {
			return;
		}

		this.setItem(this.draggedPosition, null); // удаляем бутылку из drag-ячейки, в которой она находилась в момент начала перетаскивания
		this.setItem(position, bottleId); // сохраняем бутылку в drop-ячейку
	}

	getItem(position: PositionType): ShelfItemType {
		const [shelfIndex, columnIndex] = position;
		return this.positions[shelfIndex][columnIndex];
	}

	setItem(position: PositionType, item: ShelfItemType): void {
		const [shelfIndex, columnIndex] = position;
		this.positions[shelfIndex][columnIndex] = item;
	}

  get isCorrect(): boolean { // проверяем правильные позиции
	  return (
		  JSON.stringify(correctPositions) ===
		  JSON.stringify(this.positions[ShelvesEnum.top]) // элегантный способ 🤨
	  );
  }

  get isUncorrect(): boolean { // проверяем, что верхняя полка заполнена, но позиции не верны
		return (
			!this.isCorrect &&
			this.positions[ShelvesEnum.top].every((position) => position !== null)
		);
	}
}
Для быстрого доступа к хранилищу из любого дочернего компонента создадим его контекст.

const BottlesGameContext = createContext<BottlesGameStore | null>(null); // создаем контекст с нашим стором

const useStore = <T>(context: React.Context<T | null>): T => { // быстрый доступ к контексту
	const data = useContext(context);
	if (!data) {
		throw new Error('Using store outside of context');
	}
	return data;
};
