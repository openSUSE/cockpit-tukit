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
    Button,
    Card,
    CardBody,
    CardTitle,
    DataList,
    Flex,
    FlexItem,
    Gallery,
    Page,
    PageSection,
} from "@patternfly/react-core";

import SnapshotItem from "./components/SnapshotItem";
import StatusPanel from "./components/StatusPanel";

import { createSnapshot, snapshotsProxy } from "./tukit";

const _ = cockpit.gettext;

const Application = () => {
    const [snapshots, setSnapshots] = useState([]);
    const [status, setStatus] = useState(null);

    const updatePageStatus = (items) => {
        console.log("Updating page status");
        if (items.length === 0) {
            setStatus(null);
            return;
        }
        if (!items[0].active) {
            setStatus({
                type: "warning",
                title: cockpit.format(
                    _("New snapshot #$1 available: $0"),
                    items[0].description,
                    items[0].number
                ),
            });
        } else {
            setStatus({
                title: _("System is up to date"),
                details: { icon: "check" },
            });
        }
        // TODO:
        // setStatus({
        //     type: num_security_updates > 0 ? "warning" : "info",
        //     title: _("Updates available"),
        // });
    };

    useEffect(() => {
        getSnapshots();
    }, []);

    useEffect(() => {
        updatePageStatus(snapshots);
    }, [snapshots]);

    useEffect(() => {
        page_status.set_own(status);
    }, [status]);

    const getSnapshots = () => {
        snapshotsProxy()
            .call("list", ["number,default,active,date,description"])
            .then((args, options) => {
                const snaps = args[0].map((snap) => createSnapshot(...snap));
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
    };

    return (
        <Page>
            <PageSection>
                <Gallery className="ct-cards-grid" hasGutter>
                    <StatusPanel status={status} />
                    <Card className="ct-card-info">
                        <CardTitle>{_("Updates")}</CardTitle>
                        <CardBody>
                            <Flex>
                                <FlexItem>Last Checked: TODO</FlexItem>
                                <FlexItem align={{ default: "alignRight" }}>
                                    <Button variant="primary">
                                        {_("Check for Updates")}
                                    </Button>
                                </FlexItem>
                            </Flex>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardTitle>{_("Snapshots & Updates")}</CardTitle>
                        <CardBody>
                            <DataList isCompact>
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
