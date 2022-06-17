import { currentSession } from '@helper/sys/session';

test('getting mock session in dev mode', async () => {
  if (process.env.NODE_ENV === 'development') {
    const data = await currentSession();
    expect(data.user.admin).toBe(true);
    expect(data.user.studentID).toBe('A7654321');
    expect(data.expires).toBe('1');
    expect(data.user.email).toBe('testing@test.com');
  }
});
