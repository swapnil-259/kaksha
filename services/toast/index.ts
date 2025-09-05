import {BottomSheetModalData} from '@common/components/BottomSheet';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import toastStore, {
  ToastStoreI,
  resetModalProps,
  resetSnapPoints,
  setModalProps,
  setSnapPoints,
} from '@kaksha/store/toast';
import {RefObject} from 'react';

type CommonToasterModalData = {
  type: 'success' | 'error' | 'warning';
  title?: string;
  description?: string;
  index?: number;
  customButton?: (ref: RefObject<BottomSheetModal> | null) => React.ReactNode;
};

type CustomToasterModalData = {
  type: 'custom';
  index?: number;
  content: (ref: RefObject<BottomSheetModal> | null) => React.ReactNode;
};

type ToasterModalData = BottomSheetModalData<
  CommonToasterModalData | CustomToasterModalData
>;

const showToast = (
  data: ToasterModalData['data'],
  points?: ToastStoreI['snapPoints'][0] | boolean,
  props?: ToastStoreI['props'][0] | boolean,
) => {
  if (data.type === 'custom') {
    typeof points === 'boolean' || typeof points === 'undefined'
      ? resetSnapPoints(data.index)
      : setSnapPoints(points, data.index);
    typeof props === 'boolean' || typeof props === 'undefined'
      ? resetModalProps(data.index)
      : setModalProps(props, data.index);
  } else {
    resetSnapPoints(data.index);
    resetModalProps(data.index);
  }
  toastStore.ref[data.index ?? 0]?.current?.present(data);
};

export {showToast};

export type {ToasterModalData};
