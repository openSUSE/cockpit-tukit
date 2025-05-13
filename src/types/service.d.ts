declare module "service" {
    type ServiceProxy = {
        exists: boolean | null;
        state:
            | "starting"
            | "running"
            | "stopping"
            | "stopped"
            | "failed"
            | null
            | undefined;
        enabled: boolean | null | undefined;
        wait: (callback: () => void) => Promise<void>;
    };

    function proxy(name: string, kind?: string): ServiceProxy;
}
