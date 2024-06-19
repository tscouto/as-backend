import { getToday } from '../utils/getToday';

export const validatePassword = (password: string): boolean => {
  const currentPassowrd = getToday().split('/').join('');
  // 10/10/2030
  // [10,10,2030]
  // 10102030
  return password === currentPassowrd;
};

export const createToken = () => {
  const currentPassowrd = getToday().split('/').join('');
  return `${process.env.DEFAULT_TOKEN}${currentPassowrd}`;
};

export const validateToken = (token: string) => {
  const currentToken = createToken();
  return token === currentToken;
};
