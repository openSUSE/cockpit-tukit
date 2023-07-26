// TODO: reorganise code so `Status` is part of notifications module
import { Status } from "@/status";

declare module "notifications" {
	class PageStatus {
		constructor();
		get(page: string, host: string): string | null;
		set_own(status: Status | null): void;
	}

	const page_status: PageStatus;
}
