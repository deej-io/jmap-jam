import type {
  ConditionalKeys,
  GetTagMetadata,
  Tagged,
  UnionToIntersection
} from "type-fest";
import type { GetArguments, GetResponse } from "../types/jmap.ts";
import type { Identity } from "../types/jmap-mail.ts";

type PluginConfig = {
  uri: string;
  // TODO: Add `entities` to ensure URI can be detected
  // entities: string[];
};

type PluginMetadata = {
  [Model: string]: {
    // biome-ignore lint/suspicious/noExplicitAny: Flexibility allowed
    [Method: string]: (arg: any) => any;
  };
};

type TagPlugin<P, Metadata> = Tagged<P, "Capability", Metadata>;
type GetPluginMetadata<P extends Tagged<unknown, "Capability", unknown>> = GetTagMetadata<
  P,
  "Capability"
>;

type TaggedPlugin = TagPlugin<PluginConfig, PluginMetadata>;

export function definePlugin<Metadata extends PluginMetadata = never>(
  config: PluginConfig
) {
  return config as TagPlugin<PluginConfig, Metadata>;
}

export const Core = definePlugin<{
  Core: {
    echo: <T extends Record<string, unknown>>(input: T) => T;
  };
}>({
  uri: "urn:ietf:params:jmap:core"
});

type G = <T extends GetArguments<Identity>>(arg: T) => GetResponse<Identity, T>;

export const Submission = definePlugin<{
  Identity: {
    get: <T extends GetArguments<Identity>>(arg: T) => GetResponse<Identity, T>;
    changes: () => null;
    set: () => null;
  };
  EmailSubmission: {
    get: () => null;
    changes: () => null;
    query: () => null;
    queryChanges: () => null;
    set: () => null;
  };
}>({
  uri: "urn:ietf:params:jmap:submission"
});

function createClient<T extends TaggedPlugin>(plugins: T[]) {
  // All capabilities
  type Capabilities = UnionToIntersection<GetPluginMetadata<T>>;

  // All entities
  type Entities = keyof Capabilities;
  type MethodsForEntity<T extends Entities> = keyof Capabilities[T];

  type Signature<
    Entity,
    Fn extends (arg: unknown) => unknown,
    Args extends Parameters<Fn>[0] = Parameters<Fn>[0],
    Returning extends ReturnType<Fn<Args>> = ReturnType<Fn>
  > = (entity: Entity, args: Args) => Returning;

  // Exposed API
  type API = UnionToIntersection<
    {
      [Entity in Entities]: {
        [Method in MethodsForEntity<Entity>]: Signature<
          Entity,
          Capabilities[Entity][Method]
        >;
      };
    }[Entities]
  >;

  const proxy = new Proxy<API>({} as API, {
    get(target, method) {
      const trap = (...args: unknown[]) => {
        console.log({
          method,
          args
        });
      };

      return trap;
    }
  });

  return proxy;
}

const x = createClient([Core, Submission]);

const { get, set, changes } = createClient([Core, Submission]);

const identity = get("Identity", {
  accountId: "",
  properties: ["name"]
  // properties: ["name"]
});
