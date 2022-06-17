import {
  convertDateToUnix,
  convertUnixToDate,
  compareDate,
  dateISO,
  prettifyDate,
} from '@constants/sys/date';
import moment from 'moment-timezone';

test('convertDateToUnix test 1', async () => {
  const res = moment
    .tz('2022-06-19', 'YYYY-MM-DD', true, 'Asia/Singapore')
    .startOf('day')
    .valueOf();
  expect(convertDateToUnix('2022-06-19')).toStrictEqual(res / 1000);
  const res2 = moment
    .tz('2022-06-18', 'YYYY-MM-DD', true, 'Asia/Singapore')
    .startOf('day')
    .valueOf();
  expect(convertDateToUnix('2022-06-18')).toStrictEqual(res2 / 1000);
  const res3 = moment
    .tz('2022-06-15', 'YYYY-MM-DD', true, 'Asia/Singapore')
    .startOf('day')
    .valueOf();
  expect(convertDateToUnix('2022-06-15')).toStrictEqual(res3 / 1000);
});

test('convertDateToUnix test 2', async () => {
  expect(convertDateToUnix('2ugugiuij dsafsafdsfdsf s')).toStrictEqual(0);
  expect(
    convertDateToUnix('20212321312 32145 12-06-19 dsafsafdsfdsf s'),
  ).toStrictEqual(0);
  expect(convertDateToUnix('2022-06-131 421 dsafsafdsfdsf s')).toStrictEqual(0);
  expect(
    convertDateToUnix('2022-06-gfdsgfdgfdgfd19 dsafsafdsfdsf s'),
  ).toStrictEqual(0);
  expect(convertDateToUnix('     ')).toStrictEqual(0);
  expect(convertDateToUnix('')).toStrictEqual(0);
});

test('convertUnixToDate test 1', async () => {
  const res =
    moment
      .tz('2022-06-19', 'YYYY-MM-DD', true, 'Asia/Singapore')
      .startOf('day')
      .valueOf() / 1000;
  expect(convertUnixToDate(res)).toStrictEqual(
    moment.tz(res * 1000, 'Asia/Singapore').toDate(),
  );
  const res2 =
    moment
      .tz('2022-06-18', 'YYYY-MM-DD', true, 'Asia/Singapore')
      .startOf('day')
      .valueOf() / 1000;
  expect(convertUnixToDate(res2)).toStrictEqual(
    moment.tz(res2 * 1000, 'Asia/Singapore').toDate(),
  );
  const res3 =
    moment
      .tz('2022-06-15', 'YYYY-MM-DD', true, 'Asia/Singapore')
      .startOf('day')
      .valueOf() / 1000;
  expect(convertUnixToDate(res3)).toStrictEqual(
    moment.tz(res3 * 1000, 'Asia/Singapore').toDate(),
  );
});

test('convertUnixToDate test 2', async () => {
  expect(convertUnixToDate(-123154151123)).toBeNull();
  expect(convertUnixToDate(-12213131)).toBeNull();
  expect(convertUnixToDate(-1231541511213)).toBeNull();
  expect(convertUnixToDate(1212321312323)).toBeNull();
});

test('compareDate test 1', async () => {
  const res1 =
    moment
      .tz('2022-06-18', 'YYYY-MM-DD', true, 'Asia/Singapore')
      .startOf('day')
      .valueOf() / 1000;
  expect(compareDate(res1, 10)).toBe(false);
  const res2 =
    moment
      .tz('2022-08-25', 'YYYY-MM-DD', true, 'Asia/Singapore')
      .startOf('day')
      .valueOf() / 1000;
  expect(compareDate(res2, 2)).toBe(true);
});

test('dateISO test 1', async () => {
  expect(
    dateISO(
      moment
        .tz('2022-06-17', 'YYYY-MM-DD', true, 'Asia/Singapore')
        .startOf('day')
        .toDate(),
    ),
  ).toStrictEqual('2022-06-17');
  expect(
    dateISO(
      moment
        .tz('2022-06-18', 'YYYY-MM-DD', true, 'Asia/Singapore')
        .startOf('day')
        .toDate(),
    ),
  ).toStrictEqual('2022-06-18');
  expect(
    dateISO(
      moment
        .tz('2022-06-19', 'YYYY-MM-DD', true, 'Asia/Singapore')
        .startOf('day')
        .toDate(),
    ),
  ).toStrictEqual('2022-06-19');
  expect(
    dateISO(
      moment
        .tz('2022-06-20', 'YYYY-MM-DD', true, 'Asia/Singapore')
        .startOf('day')
        .toDate(),
    ),
  ).toStrictEqual('2022-06-20');
});

test('dateISO test 2', async () => {
  expect(
    dateISO(
      moment
        .tz('2022-06-17', 'YYYY-MM-DD', true, 'Asia/Singapore')
        .startOf('day')
        .toDate(),
    ),
  ).toStrictEqual('2022-06-17');
  expect(
    dateISO(
      moment
        .tz('2022-06-17 123131414151', 'YYYY-MM-DD', true, 'Asia/Singapore')
        .startOf('day')
        .toDate(),
    ),
  ).toStrictEqual('Unknown Date');
  expect(
    dateISO(
      moment
        .tz(
          '2022-06-17asdsadsa eafdsadada',
          'YYYY-MM-DD',
          true,
          'Asia/Singapore',
        )
        .startOf('day')
        .toDate(),
    ),
  ).toStrictEqual('Unknown Date');
  expect(
    dateISO(
      moment
        .tz('2022-06-17fgdfsdfhjgjngh', 'YYYY-MM-DD', true, 'Asia/Singapore')
        .startOf('day')
        .toDate(),
    ),
  ).toStrictEqual('Unknown Date');
});

test('prettifyDate test 1', async () => {
  expect(prettifyDate(new Date('2022-06-17'))).toStrictEqual(
    'Friday, 17 June 2022',
  );
  expect(prettifyDate(new Date('2022-06-18'))).toStrictEqual(
    'Saturday, 18 June 2022',
  );
  expect(prettifyDate(new Date('2022-06-19'))).toStrictEqual(
    'Sunday, 19 June 2022',
  );
  expect(prettifyDate(new Date('-1111111112312321@421432d'))).toStrictEqual(
    'Unknown Date',
  );
  expect(prettifyDate(new Date('hello my name is jeff'))).toStrictEqual(
    'Unknown Date',
  );
  expect(prettifyDate(new Date('how are youuuuu'))).toStrictEqual(
    'Unknown Date',
  );
});
