declare type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

declare type SpyObj<T> = DeepPartial<T> &
  {
    [K in keyof Partial<T>]: T[K] extends Function
      ? T[K] & jest.Mock
      : DeepPartial<T[K]>;
  };
