export const isEqual = (x: unknown, y: unknown): boolean => JSON.stringify(x) === JSON.stringify(y);
