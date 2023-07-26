// https://github.com/cockpit-project/cockpit/pull/13214

declare module "cockpit" {
	interface Func1<T, R = void> {
		(arg: T): R;
	}

	type DbusOptions = {
		bus: "session" | "user" | "system" | "none";
		address?: string;
		superuser?: "require" | "try";
		track?: boolean;
	};

	type Fail = {
		message: string;
		problem?: string;
	};

	type SpawnFail = Fail & {
		exit_status?: number;
		exit_signal?: number;
	};

	type ErrorConfig = "message" | "out" | "ignore" | "pty";

	/**
	 * https://github.com/cockpit-project/cockpit/blob/main/src/bridge/cockpitrouter.c#L615-L621
	 * @deprecated boolean is tecnically valid but it's not well documented
	 */
	type SuperUserBool = boolean;
	type Superuser = "require" | "try" | SuperUserBool;
	type ProblemCodes =
		| "access-denied"
		| "authentication-failed"
		| "internal-error"
		| "no-cockpit"
		| "no-session"
		| "not-found"
		| "terminated"
		| "timeout"
		| "unknown-hostkey"
		| "no-forwarding";

	type SpawnConfig = {
		err?: ErrorConfig;
		binary?: boolean;
		directory?: string;
		host?: string;
		environ?: string[];
		pty?: boolean;
		batch?: boolean;
		latency?: number;
		superuser?: Superuser;
	};

	type ProxyMethods<T extends Record<string, (...args: any[]) => any>> = {
		[k in keyof T]: T[k];
	};

	type Proxy<T extends Record<string, (...args: any[]) => any> = {}> =
		ProxyMethods<T> & {
			client: DbusClient;
			path: string;
			iface: string;
			valid: boolean;
			data: Object;
			wait: (callback: () => void) => Promise<void>;
		};

	type DbusEvent = "close" | "owner";

	type DBusEventCallback<T extends DbusEvent> = T extends "close"
		? (event: CustomEvent<unknown>, options: { problem?: string }) => void
		: T extends "owner"
		? (event: CustomEvent<unknown>, owner?: string | null) => void
		: never;

	interface DbusClient {
		wait: (callback: () => void) => Promise<void>;
		close(problem?: string): void;
		proxy<T extends Record<string, (...args: any[]) => any> = {}>(
			interface?: string,
			path?: string,
		): Proxy<T>;
		proxies(interface?: string[], path?: string[]): Proxy[];
		addEventListener<T extends DbusEvent>(
			event: T,
			callback: DBusEventCallback<T>,
		): void;
		options: DbusOptions;
		unique_name: string;
	}

	interface ClosableWithProblem {
		close(problem?: ProblemCodes): void;
	}

	interface SpawnPromise extends Promise<string>, ClosableWithProblem {
		stream(callback: Func1<string>): SpawnPromise;
		input(data?: string | Uint8Array, stream?: boolean): SpawnPromise;
	}

	function gettext(text: string): string;
	function gettext(context: string, text: string): string;
	function format(template: string, args: string | Object): string;
	function format(template: string, ...args: string[] | Object[]): string;
	function dbus(name: string, options?: DbusOptions): DbusClient;
	function jump(todo: string, host?: string | null): void;
	function script(execute: string, args: SpawnConfig): SpawnPromise;
	function spawn(args: string | string[], options?: SpawnConfig): SpawnPromise;

	const transport: { host?: string | null };
}
