import { getSession } from 'next-auth/react';

export const currentSession = async (req = null) => {
  let session = null;
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    session = {
      expires: '1',
      user: {
        username: 'Test user',
        email: 'testing@test.com',
        admin: true,
        studentID: 'A7654321',
      },
    };
  } else {
    const isServer = typeof window === 'undefined';
    if (isServer && req) {
      session = await getSession({ req });
    } else {
      session = await getSession();
    }
  }

  return session;
};

export const TestingPurpose = () => {
  // There's nothing wrong. I just dont want to have default export cos it sucks
  return 'HI';
};
