export const encryptMatch = (id: number): string => {
  return `${process.env.DEFAULT_TOKEN} ${id}${process.env.DEFAULT_TOKEN}`;
};
export const decryptMach = (match: string): number => {
  let idString: string = match.replace(`${process.env.DEFAULT_TOKEN}`, '');
  return parseInt(idString);
};
