import {BottomSheetModal, BottomSheetModalProps} from '@gorhom/bottom-sheet';
import {RefObject} from 'react';
import {proxy} from 'valtio';

interface ToastStoreI {
  ref: (RefObject<BottomSheetModal> | null)[];
  snapPoints: (string | number)[][];
  props: Omit<BottomSheetModalProps, 'children' | 'snapPoints'>[];
}
const NUM_OF_SHEETS = 3;
const initialSnapPoints = ['35%'];
const initialProps = {};

const toastStore = proxy<ToastStoreI>({
  ref: [null, null],
  snapPoints: [...Array(NUM_OF_SHEETS)].map(() => initialSnapPoints),
  props: [...Array(NUM_OF_SHEETS)].map(() => initialProps),
});

const setSnapPoints = (
  points: ToastStoreI['snapPoints'][0],
  index: number = 0,
) => {
  toastStore.snapPoints.splice(index, 1, points);
};

const setModalProps = (props: ToastStoreI['props'][0], index: number = 0) => {
  toastStore.props.splice(index, 1, props);
};

const setRef = (ref: ToastStoreI['ref'][0], index: number = 0) => {
  toastStore.ref?.splice(index, 1, ref);
};

const resetSnapPoints = (index: number = 0) => {
  toastStore.snapPoints.splice(index, 1, initialSnapPoints);
};

const resetModalProps = (index: number = 0) => {
  toastStore.props.splice(index, 1, initialProps);
};

export {
  NUM_OF_SHEETS,
  resetModalProps,
  resetSnapPoints,
  setModalProps,
  setRef,
  setSnapPoints,
};
export type {ToastStoreI};
export default toastStore;
