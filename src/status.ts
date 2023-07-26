/*
 * Copyright (C) 2022 SUSE LLC
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 *
 * To contact SUSE LLC about this file by physical or electronic mail, you may
 * find current contact information at www.suse.com.
 */

const statusSeverity = {
	"": -1,
	info: 0,
	warning: 1,
	error: 2,
} as const;

type StatusSeverity = keyof typeof statusSeverity;

export type Status = {
	key: "wait" | "updates" | "updates-error" | "new-snapshot" | "system-ok";
	title: string | null | boolean;
	type: StatusSeverity;
	details?: { icon: string };
};

export const mostSevereStatus = (statuses: Status[]): Status | null => {
	if (statuses.length === 0) return null;
	let ret = statuses[0];
	statuses.forEach((s) => {
		if (statusSeverity[s.type] > statusSeverity[ret.type]) ret = s;
	});
	return ret;
};
