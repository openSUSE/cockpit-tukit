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
import { page_status } from "notifications";
import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    CardTitle,
    DataList,
    Gallery,
    Page,
    PageSection,
} from "@patternfly/react-core";

import SnapshotItem from "./components/SnapshotItem";
import UpdatesItem from "./components/UpdatesItem";
import StatusPanel from "./components/StatusPanel";
import UpdatesPanel from "./components/UpdatesPanel";

import { createSnapshot, snapshotsProxy } from "./tukit";

const _ = cockpit.gettext;

const Application = () => {
    const [snapshots, setSnapshots] = useState([]);
    const [status, setStatus] = useState([]);
    const [updates, setUpdates] = useState([]);

    useEffect(() => {
        getSnapshots();
    }, []);

    // update page status
    useEffect(() => {
        console.log("Updating page status");
        const s = [];
        if (snapshots.length > 0 && !snapshots[0].active) {
            s.push({
                key: "new-snapshot",
                type: "warning",
                title: cockpit.format(
                    _("New snapshot #$1 available: $0"),
                    snapshots[0].description,
                    snapshots[0].number
                ),
            });
        }
        if (updates.length > 0) {
            // TODO: security updates?
            // type: num_security_updates > 0 ? "warning" : "info",
            s.push({
                key: "updates",
                type: "info",
                title: cockpit.format(
                    _("Updates available ($0)"),
                    updates.length
                ),
            });
        }
        // no status? it's good!
        if (s.length === 0) {
            s.push({
                key: "system-ok",
                title: _("System is up to date"),
                details: { icon: "check" },
            });
        }
        setStatus(s);
    }, [snapshots, updates]);

    // forward status to Cockpit
    useEffect(() => {
        if (status.length > 0) {
            // TODO: transform multi-status into page_status
            page_status.set_own(status[0]);
        } else {
            page_status.set_own(null);
        }
    }, [status]);

    const getSnapshots = () => {
        const proxy = snapshotsProxy();
        proxy.wait(() => {
            // TODO: check proxy.valid
            proxy
                .List("number,default,active,date,description")
                .then((ret) => {
                    const snaps = ret.map((snap) => createSnapshot(...snap));
                    // remove "current" snapshot
                    snaps.shift();
                    snaps.sort((a, b) => b.number - a.number);
                    // mark old snapshots
                    let active = null;
                    snaps.forEach((s) => {
                        if (active) s.old = true;
                        if (s.active) active = s;
                    });
                    setSnapshots(snaps);
                })
                .catch((exception) => {
                    alert("ERROR " + exception);
                });
        });
    };

    return (
        <Page>
            <PageSection>
                <Gallery className="ct-cards-grid" hasGutter>
                    <StatusPanel status={status} updates={updates} />
                    <UpdatesPanel setUpdates={setUpdates} />
                    <Card>
                        <CardTitle>{_("Snapshots & Updates")}</CardTitle>
                        <CardBody>
                            <DataList isCompact>
                                {updates.length > 0 && (
                                    <UpdatesItem updates={updates} />
                                )}
                                {snapshots.map((item) => (
                                    <SnapshotItem
                                        key={item.number}
                                        item={item}
                                    />
                                ))}
                            </DataList>
                        </CardBody>
                    </Card>
                </Gallery>
            </PageSection>
        </Page>
    );
};

export default Application;
