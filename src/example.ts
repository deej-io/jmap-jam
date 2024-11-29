import type { GetTagMetadata, Tagged } from "type-fest";

type Contract = {
  [Model: string]: {
    // biome-ignore lint/suspicious/noExplicitAny: Flexibility allowed
    [Method: string]: (...rest: any[]) => any;
  };
};

type TagCapability<I, C extends Contract> = Tagged<I, "Capability", C>;
type GetCapability<T extends Tagged<unknown, "Capability", Contract>> =
  GetTagMetadata<T, "Capability">;

function defineCapability<C extends Contract = never>(uri: string) {
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

type R = GetCapability<typeof x>;

function createSession<C>(input: {
  token: string;
  endpoint: string;
  capabilities: [];
}) {
  return {} as R;
}

const { echo, copy, get, changes, query, queryChanges } = await createSession({
  token: "<token>",
  endpoint: "https://example.com",
  capabilities: []
});

const mailbox = get("Mailbox", {
  type: "INBOX"
});

const emails = get("Email", {
  inMailbox: ref(mailbox, "/id")
});

const threads = get("Thread", {
  ids: ref(emails, "results.thread")
});

const results = await run({
  threads,
  mailbox,
  emails
});
