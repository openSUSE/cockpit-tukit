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

		/*
		start: start,
		stop: stop,
		restart: restart,
		tryRestart: tryRestart,

		enable: enable,
		disable: disable,

		getRunJournal: getRunJournal, */
	};

	function proxy(name: string, kind?: string): ServiceProxy;
}
