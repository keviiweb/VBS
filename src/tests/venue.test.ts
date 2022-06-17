import {
  fetchChildVenue,
  splitHours,
  splitHoursISO,
} from '@helper/sys/vbs/venue';

test('fetching child venue', async () => {
  const res = await fetchChildVenue('cl2yuuu5t0039x4drmgorjprv'); // Basketball Court
  expect(res.status).toBe(true);
  expect(res.error).toBeNull();
  expect(res.msg.length).toBe(1);
});

test('fetching child venue 2', async () => {
  const res = await fetchChildVenue('cl30cw3it0013wcdrkkg6qzpb'); // Multi-Purpose Court
  expect(res.status).toBe(true);
  expect(res.error).toBeNull();
  expect(res.msg.length).toBe(0);
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

test('split hours ISO 1', async () => {
  const res = await splitHoursISO(new Date('this is a string'), '2');
  expect(res.start).toBeNull();
  expect(res.end).toBeNull();
});

test('split hours ISO 2', async () => {
  const res = await splitHoursISO(new Date('this is a string'), '0700 - 2300');
  expect(res.start).toBeNull();
  expect(res.end).toBeNull();
});

test('split hours ISO 3', async () => {
  const res = await splitHoursISO(new Date('2022-06-16'), '0700 - 2300');
  expect(res.start).toBe('2022-06-16T07:00:00');
  expect(res.end).toBe('2022-06-16T23:00:00');
});
