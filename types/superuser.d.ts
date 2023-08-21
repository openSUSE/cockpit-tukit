declare module "superuser" {
	type Superuser = {
		allowed: boolean | null;
		reload_page_on_change(): void;
	};

	const superuser: Superuser;
}
