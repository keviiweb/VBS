import {
  isInside,
  mapSlotToTiming,
  prettifyTiming,
  convertSlotToArray,
  findSlots,
  findSlotsByID,
  checkerString,
  checkerArray,
  checkerNumber,
  splitHours,
} from '@constants/sys/helper';
import { TimeSlot } from 'types/vbs/timeslot';

test('isInside test 1', async () => {
  expect(isInside('1,2,3,4', '1,2')).toStrictEqual(true);
  expect(isInside('1,2,3,4,5,6', '1,2')).toStrictEqual(true);
});

test('isInside test 2', async () => {
  expect(isInside('1,2,3,4,5,6', '7,8')).toStrictEqual(false);
  expect(isInside('1,2,3,4,5,6', '22,23')).toStrictEqual(false);
  expect(isInside('1,2,3,4,5,6', '234')).toStrictEqual(false);
  expect(isInside('1', '234')).toStrictEqual(false);
  expect(isInside('', '234')).toStrictEqual(false);
  expect(isInside('1234', '')).toStrictEqual(false);
});

test('mapSlotToTiming test 1', async () => {
  expect(mapSlotToTiming('2')).toStrictEqual('0730 - 0800');
  expect(mapSlotToTiming('3')).toStrictEqual('0800 - 0830');
  expect(mapSlotToTiming('34')).toStrictEqual('2330 - 0000');
  expect(mapSlotToTiming('0')).toStrictEqual('');
  expect(mapSlotToTiming('99')).toStrictEqual('');
  expect(mapSlotToTiming('323')).toStrictEqual('');
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
  expect(prettifyTiming(['hello'])).toStrictEqual('hello');
  expect(prettifyTiming(['1'])).toStrictEqual('1');
});

test('convertSlotToArray test 1', async () => {
  expect(convertSlotToArray('1,2,3,4', true)).toStrictEqual([1, 2, 3, 4]);
  expect(convertSlotToArray('1,2,3', true)).toStrictEqual([1, 2, 3]);
  expect(convertSlotToArray('1,2,3,4,5,6', true)).toStrictEqual([
    1, 2, 3, 4, 5, 6,
  ]);
  expect(convertSlotToArray('1,2,3,4,5', true)).toStrictEqual([1, 2, 3, 4, 5]);
  expect(convertSlotToArray('1,2', true)).toStrictEqual([1, 2]);
  expect(convertSlotToArray('1', true)).toStrictEqual([1]);
  expect(convertSlotToArray('5', true)).toStrictEqual([5]);
  expect(convertSlotToArray('22', true)).toStrictEqual([22]);
  expect(convertSlotToArray('1,23,', true)).toStrictEqual([1, 23]);
  expect(convertSlotToArray('asd21312', true)).toBeNull();
  expect(convertSlotToArray('gjndgjrdfgdf', true)).toBeNull();
  expect(convertSlotToArray('1,2,null,elephant', true)).toBeNull();
});

test('convertSlotToArray test 2', async () => {
  const res1: TimeSlot[] = [{ id: 1, slot: '0700 - 0800', booked: false }];
  expect(convertSlotToArray(res1, false)).toStrictEqual('1');
  const res2: TimeSlot[] = [
    { id: 1, slot: '0700 - 0800', booked: false },
    { id: 1, slot: '0700 - 0800', booked: false },
    { id: 1, slot: '0700 - 0800', booked: false },
    { id: 1, slot: '0700 - 0800', booked: false },
  ];
  expect(convertSlotToArray(res2, false)).toStrictEqual('1,1,1,1');
  const res3: TimeSlot[] = [
    { id: 1, slot: '0700 - 0800', booked: false },
    { id: 2, slot: '0700 - 0800', booked: false },
    { id: 3, slot: '0700 - 0800', booked: false },
    { id: 4, slot: '0700 - 0800', booked: false },
    { id: 5, slot: '0700 - 0800', booked: false },
    { id: 6, slot: '0700 - 0800', booked: false },
    { id: 7, slot: '0700 - 0800', booked: false },
    { id: 8, slot: '0700 - 0800', booked: false },
    { id: 9, slot: '0700 - 0800', booked: false },
    { id: 10, slot: '0700 - 0800', booked: false },
  ];
  expect(convertSlotToArray(res3, false)).toStrictEqual('1,2,3,4,5,6,7,8,9,10');
  const res4: TimeSlot[] = [
    { id: 1, slot: '0700 - 0800', booked: false },
    { id: 2, slot: '0700 - 0800', booked: false },
    { id: undefined, slot: '0700 - 0800', booked: false },
  ];
  expect(convertSlotToArray(res4, false)).toStrictEqual('1,2');
  const res5: TimeSlot[] = [
    { id: 1, slot: '0700 - 0800', booked: false },
    { id: undefined, slot: undefined, booked: undefined },
    { id: 3, slot: '0700 - 0800', booked: false },
  ];
  expect(convertSlotToArray(res5, false)).toStrictEqual('1,3');
});

test('findSlots test 1', async () => {
  expect(await findSlots('0800', false)).toStrictEqual('2');
  expect(await findSlots('1300', false)).toStrictEqual('12');
  expect(await findSlots('1200', false)).toStrictEqual('10');
  expect(await findSlots('2400', false)).toBeNull();
  expect(await findSlots('2600', false)).toBeNull();
  expect(await findSlots('sdfdsfds', false)).toBeNull();
  expect(await findSlots('260hgfdhgfhgf0', false)).toBeNull();
});

test('findSlots test 2', async () => {
  expect(await findSlots('0800', true)).toStrictEqual('3');
  expect(await findSlots('1300', true)).toStrictEqual('13');
  expect(await findSlots('1200', true)).toStrictEqual('11');
  expect(await findSlots('2400', true)).toBeNull();
  expect(await findSlots('2600', true)).toBeNull();
  expect(await findSlots('htrgfhgff', true)).toBeNull();
  expect(await findSlots('26sgfdssadgfsdfg00', true)).toBeNull();
});

test('findSlotsByID test 1', async () => {
  expect(await findSlotsByID(4)).toStrictEqual('0830');
  expect(await findSlotsByID(6)).toStrictEqual('0930');
  expect(await findSlotsByID(8)).toStrictEqual('1030');
  expect(await findSlotsByID(10)).toStrictEqual('1130');
  expect(await findSlotsByID(12)).toStrictEqual('1230');
  expect(await findSlotsByID(14)).toStrictEqual('1330');
});

test('findSlotsByID test 2', async () => {
  expect(await findSlotsByID(0)).toStrictEqual(null);
  expect(await findSlotsByID(Number('hello world bo bo '))).toStrictEqual(null);
  expect(await findSlotsByID(Number('h124321ewqsadso bo '))).toStrictEqual(
    null,
  );
  expect(await findSlotsByID(Number('dsgdsg43wtwbo '))).toStrictEqual(null);
  expect(await findSlotsByID(Number('hellfdssewqegewhgreah'))).toStrictEqual(
    null,
  );
  expect(await findSlotsByID(1213)).toStrictEqual(null);
  expect(await findSlotsByID(103)).toStrictEqual(null);
  expect(await findSlotsByID(35)).toStrictEqual(null);
});

test('checkerString test 1', async () => {
  expect(checkerString('helo')).toStrictEqual(true);
  expect(checkerString('helo world')).toStrictEqual(true);
  expect(checkerString('null')).toStrictEqual(true);
  expect(checkerString('123456')).toStrictEqual(true);
  expect(checkerString('h e l o')).toStrictEqual(true);
});

test('checkerArray test 1', async () => {
  expect(checkerArray([1234])).toStrictEqual(true);
  expect(checkerArray([1, 2, 3, 4, 5])).toStrictEqual(true);
  expect(checkerArray(['1', '2', 3])).toStrictEqual(true);
  expect(checkerArray(['1', '2', '3'])).toStrictEqual(true);
});

test('checkerNumber test 1', async () => {
  expect(checkerNumber(4)).toStrictEqual(true);
  expect(checkerNumber(Number('1234'))).toStrictEqual(true);
  expect(checkerNumber(Number('dsafougfouegr'))).toStrictEqual(false);
  expect(checkerNumber(12345)).toStrictEqual(true);
});

test('split hours', async () => {
  const res = await splitHours('0700 - 2300');
  expect(res.start).toBe(700);
  expect(res.end).toBe(2300);
});

test('split hours 2', async () => {
  const res = await splitHours('2500 - 6300');
  expect(res.start).toBe(2500);
  expect(res.end).toBe(6300);
});

test('split hours 3', async () => {
  const res = await splitHours('null - hehe');
  expect(res.start).toBeNull();
  expect(res.end).toBeNull();
});

test('split hours 4', async () => {
  const res = await splitHours('null - 2300');
  expect(res.start).toBeNull();
  expect(res.end).toBeNull();
});

test('split hours 5', async () => {
  const res = await splitHours('this is a string');
  expect(res.start).toBeNull();
  expect(res.end).toBeNull();
});
