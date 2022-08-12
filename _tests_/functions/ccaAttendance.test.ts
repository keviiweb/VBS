import { CCAAttendance } from 'types/cca/ccaAttendance';
import { removeDuplicate } from '@constants/sys/ccaAttendance';

test('removeDuplicate test 1', async () => {
  const res1: CCAAttendance[] = [
    {
      ccaID: '1234',
      ccaAttendance: 2,
      sessionEmail: 'testing@test.com',
      sessionName: 'Tester',
    },
    {
      ccaID: '1234',
      ccaAttendance: 3,
      sessionEmail: 'testing@test.com',
      sessionName: 'Tester',
    },
    {
      ccaID: '1234',
      ccaAttendance: 4,
      sessionEmail: 'testing2@test.com',
      sessionName: 'Tester2',
    },
    {
      ccaID: '1234',
      ccaAttendance: 5,
      sessionEmail: 'testing2@test.com',
      sessionName: 'Tester2',
    },
    {
      ccaID: '1234',
      ccaAttendance: 6,
      sessionEmail: 'testing3@test.com',
      sessionName: 'Tester3',
    },
    {
      ccaID: '1234',
      ccaAttendance: 7,
      sessionEmail: 'testing3@test.com',
      sessionName: 'Tester3',
    },
    {
      ccaID: '1234',
      ccaAttendance: 8,
      sessionEmail: 'testing4@test.com',
      sessionName: 'Tester4',
    },
    {
      ccaID: '1234',
      ccaAttendance: 9,
      sessionEmail: 'testing4@test.com',
      sessionName: 'Tester4',
    },
    {
      ccaID: '1234',
      ccaAttendance: 10,
      sessionEmail: 'testing5@test.com',
      sessionName: 'Tester5',
    },
    {
      ccaID: '1234',
      ccaAttendance: 11,
      sessionEmail: 'testing5@test.com',
      sessionName: 'Tester5',
    },
  ];

  const res2: CCAAttendance[] = [
    {
      ccaID: '1234',
      ccaAttendance: 2,
      sessionEmail: 'testing@test.com',
      sessionName: 'Tester',
    },
    {
      ccaID: '1234',
      ccaAttendance: 4,
      sessionEmail: 'testing2@test.com',
      sessionName: 'Tester2',
    },
    {
      ccaID: '1234',
      ccaAttendance: 6,
      sessionEmail: 'testing3@test.com',
      sessionName: 'Tester3',
    },
    {
      ccaID: '1234',
      ccaAttendance: 8,
      sessionEmail: 'testing4@test.com',
      sessionName: 'Tester4',
    },
    {
      ccaID: '1234',
      ccaAttendance: 10,
      sessionEmail: 'testing5@test.com',
      sessionName: 'Tester5',
    },
  ];

  expect(removeDuplicate(res1)).toStrictEqual(res2);
});
