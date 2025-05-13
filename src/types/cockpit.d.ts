declare module 'cockpit' {
    // Records can be literally anything so they need to be defined as such
    // We could use uknown but that would make the type API too cumbersome
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type ProxyRecord = Record<string, (...args: any[]) => any>;

    /**
     * https://github.com/cockpit-project/cockpit/blob/58e4e6c5226ef1bf8e286a5c323fa1c9129c1127/src/cockpit/superuser.py#L129-L141
     * @deprecated boolean is tecnically valid but it's not well documented
     */
    type SuperuserBool = boolean;
    interface ChannelOptions {
        superuser?: "require" | "try" | SuperuserBool;
    }

    type ProxyMethods<T extends ProxyRecord> = {
        [k in keyof T]: T[k];
    };

    type Proxy<T extends ProxyRecord = object> =
        EventSource<DBusProxyEvents> & ProxyMethods<T> & {
            // DBusClient is properly defined by the cockpit module but eslint still
            // complains about if for some reason
            // eslint-disable-next-line no-use-before-define
            client: DBusClient;
            path: string;
            iface: string;
            valid: boolean;
            data: object;
            wait: (callback: () => void) => Promise<void>;
        };

    interface DBusClient {
        proxy<T extends ProxyRecord = object>(
            interface?: string,
            path?: string,
            options?: { watch?: boolean },
        ): Proxy<T>;
    }

    function script(execute: string, args: SpawnOptions): Spawn<string>;
}
