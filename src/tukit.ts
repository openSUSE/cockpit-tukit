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

import cockpit, { DbusClient, Proxy } from "cockpit";
import { ServiceProxy, proxy as serviceProxy } from "service";
import { stringToBool } from "./utils";

let _dbusClient: DbusClient;
const dbusClient = (): DbusClient => {
    if (!_dbusClient) {
        _dbusClient = cockpit.dbus("org.opensuse.tukit", {
            bus: "system",
            superuser: "try",
        });
    }
    return _dbusClient;
};

type SnapshotRecordKeys<T extends string> = T extends `${infer K},${infer Rest}`
  ? K | SnapshotRecordKeys<Rest>
  : T extends `${infer K}`
  ? K
  : never;

export type SnapshotRecord<T extends string> = {
  [k in SnapshotRecordKeys<T>]: string;
};

type SnapshotMethods = {
  List: <T extends string>(args: T) => SnapshotRecord<T>[];
};

let _snapshotProxy: Proxy<SnapshotMethods>;
const snapshotsProxy = () => {
    if (!_snapshotProxy) {
        _snapshotProxy = dbusClient().proxy<SnapshotMethods>(
            "org.opensuse.tukit.Snapshot",
            "/org/opensuse/tukit/Snapshot"
        );
    }
    return _snapshotProxy;
};

type SnapIn = {
  number: string;
  default: string;
  active: string;
  date: string;
  description: string;
};

export type Snapshot = {
  number: number;
  default: boolean;
  active: boolean;
  date: Date;
  description: string;
  old?: boolean;
};

const createSnapshot = (snap: SnapIn): Snapshot => {
    if (Array.isArray(snap)) {
        const [number, dflt, active, date, description] = snap;
        return {
            number: parseInt(number),
            default: stringToBool(dflt),
            active: stringToBool(active),
            date: new Date(`${date}Z`), // dates are UTC but have no marking
            description,
        };
    } else {
        return {
            number: parseInt(snap.number),
            default: stringToBool(snap.default),
            active: stringToBool(snap.active),
            date: new Date(`${snap.date}Z`), // dates are UTC but have no marking
            description: snap.description,
        };
    }
};

type TransactionEvent = "TransactionOpened" | "CommandExecuted" | "Error";

type TransactionEventCallback<T extends TransactionEvent> =
  T extends "TransactionOpened"
    ? (event: CustomEvent<unknown>, snapshot: string) => void
    : T extends "Error"
    ? (
        event: CustomEvent<unknown>,
        snapshot: string,
        returncode: number,
        output: string
      ) => void
    : T extends "CommandExecuted"
    ? (
        event: CustomEvent<unknown>,
        snapshot: string,
        returncode: number,
        output: string
      ) => void
    : never;

// https://kubic.opensuse.org/documentation/man-pages/transactional-update.conf.5.html#REBOOT_METHOD
type TransactionReboot =
  | "auto"
  | "cured"
  | "rebootmgr"
  | "systemd"
  | "kexec"
  | "notify"
  | "none";
type TransactionsMethods = {
  addEventListener: <T extends TransactionEvent>(
    event: T,
    callback: TransactionEventCallback<T>
  ) => void;
  removeEventListener: <T extends TransactionEvent>(
    event: T,
    callback: TransactionEventCallback<T>
  ) => void;
  ExecuteAndReboot: (
    base: "default" | "base" | string,
    command: string,
    rebootmethod: TransactionReboot
  ) => Promise<string>;
};

let _transactionsProxy: Proxy<TransactionsMethods>;
const transactionsProxy = () => {
    if (!_transactionsProxy) {
        _transactionsProxy = dbusClient().proxy(
            "org.opensuse.tukit.Transaction",
            "/org/opensuse/tukit/Transaction"
        );
    }
    return _transactionsProxy;
};

let _tukitdProxy: ServiceProxy;
const tukitdProxy = () => {
    if (!_tukitdProxy) {
        _tukitdProxy = serviceProxy("tukitd");
    }
    return _tukitdProxy;
};

export {
    dbusClient,
    snapshotsProxy,
    createSnapshot,
    transactionsProxy,
    tukitdProxy,
};
