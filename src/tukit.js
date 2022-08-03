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

import cockpit from "cockpit";
import { stringToBool } from "./utils";

let _dbusClient;
const dbusClient = () => {
    if (!_dbusClient) {
        _dbusClient = cockpit.dbus("org.opensuse.tukit", {
            bus: "system",
            superuser: "require",
        });
    }
    return _dbusClient;
};

let _snapshotProxy;
const snapshotsProxy = () => {
    if (!_snapshotProxy) {
        _snapshotProxy = dbusClient().proxy(
            "org.opensuse.tukit.Snapshot",
            "/org/opensuse/tukit/Snapshot"
        );
    }
    return _snapshotProxy;
};

const createSnapshot = (snap) => {
    if (Array.isArray(snap)) {
        const [number, dflt, active, date, description] = snap;
        return {
            number: parseInt(number),
            default: stringToBool(dflt),
            active: stringToBool(active),
            date: new Date(date + "Z"), // dates are UTC but have no marking
            description,
        };
    } else {
        return {
            number: parseInt(snap.number),
            default: stringToBool(snap.default),
            active: stringToBool(snap.active),
            date: new Date(snap.date + "Z"), // dates are UTC but have no marking
            description: snap.description,
        };
    }
};

let _transactionsProxy;
const transactionsProxy = () => {
    if (!_transactionsProxy) {
        _transactionsProxy = dbusClient().proxy(
            "org.opensuse.tukit.Transaction",
            "/org/opensuse/tukit/Transaction"
        );
    }
    return _transactionsProxy;
};

export { dbusClient, snapshotsProxy, createSnapshot, transactionsProxy };
