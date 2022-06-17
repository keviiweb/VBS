import {
  isInside,
  mapSlotToTiming,
  prettifyTiming,
} from '@constants/sys/helper';

test('isInside test 1', async () => {
  expect(isInside('1,2,3,4', '1,2')).toBe(true);
  expect(isInside('1,2,3,4,5,6', '1,2')).toBe(true);
});

test('isInside test 2', async () => {
  expect(isInside('1,2,3,4,5,6', '7,8')).toBe(false);
  expect(isInside('1,2,3,4,5,6', '22,23')).toBe(false);
  expect(isInside('1,2,3,4,5,6', '234')).toBe(false);
  expect(isInside('1', '234')).toBe(false);
  expect(isInside('', '234')).toBe(false);
  expect(isInside('1234', '')).toBe(false);
});

test('mapSlotToTiming test 1', async () => {
  expect(mapSlotToTiming('2')).toBe('0730 - 0800');
  expect(mapSlotToTiming('3')).toBe('0800 - 0830');
  expect(mapSlotToTiming('34')).toBe('2330 - 0000');
  expect(mapSlotToTiming('0')).toBe('');
  expect(mapSlotToTiming('99')).toBe('');
  expect(mapSlotToTiming('323')).toBe('');
});

test('mapSlotToTiming test 2', async () => {
  expect(mapSlotToTiming([2, 3, 4, 5])).toStrictEqual([
    '0730 - 0800',
    '0800 - 0830',
    '0830 - 0900',
    '0900 - 0930',
  ]);
  expect(mapSlotToTiming([3])).toStrictEqual(['0800 - 0830']);
  expect(mapSlotToTiming([1, 2])).toStrictEqual(['0700 - 0730', '0730 - 0800']);
  expect(mapSlotToTiming([, 2])).toStrictEqual(['0730 - 0800']);
  expect(mapSlotToTiming([0, 2])).toStrictEqual(['0730 - 0800']);
});

test('prettifyTiming test 1', async () => {
  expect(prettifyTiming(['1', '2', '3', '4'])).toStrictEqual('1, 2, 3, 4');
  expect(prettifyTiming(['1', '2', '3', '4', '5', '6'])).toStrictEqual(
    '1, 2, 3, 4, 5, 6',
  );
  expect(
    prettifyTiming(['banana', 'apple', 'orange', 'pineapple']),
  ).toStrictEqual('banana, apple, orange, pineapple');
  expect(prettifyTiming(['hello', 'my', 'name', 'is', 'jeff'])).toStrictEqual(
    'hello, my, name, is, jeff',
  );
});
