import type { Superuser } from "superuser";

declare module "hooks" {
	function useEvent(obj: Superuser, event: "changed"): void;
}
