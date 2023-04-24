declare module "timeformat" {
	function dateFormatLang(): string;
	function formatter(options?: Intl.DateTimeFormatOptions | undefined): string;
	function time(t: Date | number): string;
	function timeSeconds(t: Date | number): string;
	function date(t: Date | number): string;
	function dateShort(t: Date | number): string;
	function dateTime(t: Date | number): string;
	function dateTimeSeconds(t: Date | number): string;
	function dateTimeNoYear(t: Date | number): string;
	function weekdayDate(t: Date | number): string;
	function dateShortFormat(): string;
	function distanceToNow(t: Date | number, addSuffix?: boolean): string;
}
