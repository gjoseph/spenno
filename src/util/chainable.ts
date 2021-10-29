type Filter<T> = (t: T) => boolean;
type ChainableFilter<T> = Filter<T> & {
  and(other: ChainableFilter<T> | Filter<T>): ChainableFilter<T>;
  or(other: ChainableFilter<T> | Filter<T>): ChainableFilter<T>;
};

export const chainable = <T>(filter: Filter<T>): ChainableFilter<T> => {
  // so much wrapping ...
  const chainableFilter = (t: T) => {
    return filter(t);
  };
  chainableFilter.and = (other: Filter<T>) => {
    return chainable((o: T) => filter(o) && other(o));
  };
  chainableFilter.or = (other: Filter<T>) => {
    return chainable((o: T) => filter(o) || other(o));
  };
  return chainableFilter;
};
