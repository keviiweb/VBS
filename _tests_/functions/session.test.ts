import { currentSession } from '@helper/sys/session';
import { levels } from '@constants/sys/admin';
import { Session } from 'next-auth/core/types';

test('getting mock session in dev mode', async () => {
  if (process.env.NODE_ENV === 'development') {
    const data: Session | null = await currentSession();
    if (data !== null) {
      expect(data.user.admin).toBe(levels.KEWEB);
      expect(data.expires).toBe('1');
      expect(data.user.email).toBe('testing@test.com');
    }
  }
});
