type Capability = {
  [Model: string]: {
    // biome-ignore lint/suspicious/noExplicitAny: Flexibility allowed
    [Method: string]: (...rest: any[]) => any;
  };
};

type TagCapability<I, C extends Capability> = Tagged<I, "Capability", C>;
type GetCapability<T extends Tagged<unknown, "Capability", Capability>> =
  GetTagMetadata<T, "Capability">;

function defineCapability<C extends Capability = never>(uri: string) {
  return { uri } as TagCapability<{ uri: string }, C>;
}

const x = defineCapability<{
  Email: {
    get: (apple: string, banana: number) => string[];
    query: (foo: string) => false;
  };
  Mailbox: {
    get: <T>(fizz: string, buzz: T) => { fizz: string; buzz: T };
  };
}>("foo");
