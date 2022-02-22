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
import * as timeformat from "timeformat";
import React, { useState, useEffect } from "react";
import XMLParser from "react-xml-parser";
import {
    Button,
    Card,
    CardBody,
    CardTitle,
    Flex,
    FlexItem,
    Text,
} from "@patternfly/react-core";

const _ = cockpit.gettext;

// simplify structure of XMLParser return values
const flattenXMLData = (data, prefix = "") => {
    const values = {};
    // NOTE: this will make {"": value} for root item
    if (data.value) values[prefix] = data.value;
    if (prefix !== "") prefix = `${prefix}_`;
    Object.keys(data.attributes).forEach((a) => {
        values[`${prefix}${a}`] = data.attributes[a];
    });
    data.children.forEach((c) => {
        Object.assign(values, flattenXMLData(c, `${prefix}${c.name}`));
    });
    return values;
};

const UpdatesPanel = ({ setUpdates }) => {
    const [running, setRunning] = useState(false);
    const [lastCheck, setLastCheck] = useState();

    const checkUpdates = async () => {
        setRunning(true);
        try {
            const refcmd = ["zypper", "ref"];
            await cockpit.spawn(refcmd, { superuser: true });
            const lucmd = ["zypper", "-q", "--xmlout", "list-updates"];
            const luout = await cockpit.spawn(lucmd);
            const xml = new XMLParser().parseFromString(luout);
            const updates = xml
                .getElementsByTagName("update")
                .map((e) => flattenXMLData(e));
            console.log(updates);
            setUpdates(updates);
            setLastCheck(new Date());
        } catch (e) {
            // TODO: better error handling (grab stdout/stderr from commands)
            alert(`error checking for updates: ${e}`);
        }
        setRunning(false);
    };

    useEffect(() => {
        // auto-check updates on initial load
        checkUpdates();
        // TODO: FIX!
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <Card className="ct-card-info">
            <CardTitle>{_("Updates")}</CardTitle>
            <CardBody>
                <Flex>
                    <FlexItem>
                        {lastCheck && (
                            <Text component="small">
                                Last Checked: {timeformat.dateTime(lastCheck)}
                            </Text>
                        )}
                    </FlexItem>
                    <FlexItem align={{ default: "alignRight" }}>
                        <Button
                            variant="primary"
                            isLoading={running}
                            onClick={() => {
                                checkUpdates();
                            }}
                        >
                            {_("Check for Updates")}
                        </Button>
                    </FlexItem>
                </Flex>
            </CardBody>
        </Card>
    );
};

export default UpdatesPanel;
