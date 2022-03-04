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
    EmptyState,
    EmptyStateIcon,
    Gallery,
    Page,
    PageSection,
    Spinner,
    Title,
} from "@patternfly/react-core";

import SnapshotItem from "./components/SnapshotItem";
import UpdatesItem from "./components/UpdatesItem";
import StatusPanel from "./components/StatusPanel";
import UpdatesPanel from "./components/UpdatesPanel";

import { createSnapshot, snapshotsProxy } from "./tukit";
import { mostSevereStatus } from "./status";

const _ = cockpit.gettext;

const Application = () => {
    const [snapshots, setSnapshots] = useState([]);
    const [status, setStatus] = useState([]);
    const [updates, setUpdates] = useState([]);

    const [snapshotsWaiting, setSnapshotsWaiting] = useState(false);
    const [updatesWaiting, setUpdatesWaiting] = useState(false);

    useEffect(() => {
        getSnapshots();
    }, []);

    // forward status to Cockpit
    useEffect(() => {
        console.log("Forwarding page status");
        if (status.length > 0) {
            // page_status can show only one status
            // use most important one
            page_status.set_own(mostSevereStatus(status));
        } else {
            page_status.set_own(null);
        }
    }, [status]);

    const getSnapshots = () => {
        setSnapshotsWaiting(true);
        const proxy = snapshotsProxy();
        proxy.wait(async () => {
            // TODO: check proxy.valid
            try {
                const snaps = (
                    await proxy.List("number,default,active,date,description")
                ).map((snap) => createSnapshot(...snap));
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
            } catch (e) {
                alert("ERROR " + e);
            }
            setSnapshotsWaiting(false);
        });
    };

    return (
        <Page>
            <PageSection>
                <Gallery className="ct-cards-grid" hasGutter>
                    <StatusPanel
                        waiting={snapshotsWaiting || updatesWaiting}
                        status={status}
                        setStatus={setStatus}
                        updates={updates}
                        snapshots={snapshots}
                    />
                    <UpdatesPanel
                        setUpdates={setUpdates}
                        waiting={updatesWaiting}
                        setWaiting={setUpdatesWaiting}
                    />
                    <Card>
                        <CardTitle>{_("Snapshots & Updates")}</CardTitle>
                        <CardBody>
                            {(snapshotsWaiting && (
                                <EmptyState>
                                    <EmptyStateIcon
                                        variant="icon"
                                        icon={Spinner}
                                    />
                                    <Title headingLevel="h2">
                                        {_("Loading...")}
                                    </Title>
                                </EmptyState>
                            )) || (
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
                            )}
                        </CardBody>
                    </Card>
                </Gallery>
            </PageSection>
        </Page>
    );
};

export default Application;
