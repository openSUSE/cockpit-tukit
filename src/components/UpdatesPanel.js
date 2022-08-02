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
import { kindPrio, categoryPrio, severityPrio } from "../update";
import { decodeHTMLEntities } from "../utils";

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

const UpdatesPanel = ({
    setUpdates,
    setError,
    dirty,
    setDirty,
    waiting,
    setWaiting,
}) => {
    const [lastCheck, setLastCheck] = useState();

    const getUpdates = async (arg) => {
        const cmd = ["zypper", "-q", "--xmlout", arg];
        let out = await cockpit.spawn(cmd, {
            superuser: "require",
            err: "message", // TODO: check if it works as expected
        });
        // convert line breaks in descriptions to not loose them during
        // xml parsing
        out = out.replaceAll(/<description>[^<]+<\/description>/g, (d) =>
            d
                // only keep newlines followed by space (indent) or bullet char
                .replaceAll(/\n([-* ])/g, (_, fc) => `&#10;${fc}`)
                // escape percentage sign to avoid URI decoding problems in XMLParser
                .replaceAll(/%/g, "%25")
        );
        const xml = new XMLParser().parseFromString(out);
        return xml
            .getElementsByTagName("update")
            .map((e) => flattenXMLData(e))
            .map((u) => {
                return {
                    ...u,
                    description: decodeHTMLEntities(u.description),
                };
            });
    };
    const updateKey = (u) => {
        return [
            kindPrio[u.kind],
            categoryPrio[u.category],
            severityPrio[u.severity],
            u.name,
        ];
    };
    const updateCmp = (a, b) => {
        const ak = updateKey(a);
        const bk = updateKey(b);
        if (ak > bk) return 1;
        if (ak < bk) return -1;
        return 0;
    };
    const checkUpdates = async () => {
        if (!dirty) {
            return;
        }
        setDirty(false);

        setError(null);
        setWaiting(_("Checking for updates..."));
        try {
            const refcmd = ["zypper", "ref"];
            await cockpit.spawn(refcmd, { superuser: true, err: "message" });
            const updates = [].concat(
                await getUpdates("list-updates"),
                await getUpdates("list-patches")
            );
            updates.sort(updateCmp);
            setUpdates(updates);
            setLastCheck(new Date());
        } catch (e) {
            setError(
                cockpit.format(
                    _("Error checking for updates: $0"),
                    e.toString()
                )
            );
        }
        setWaiting(null);
    };

    useEffect(() => {
        // auto-check updates on initial load
        checkUpdates();
        // TODO: FIX!
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dirty]);
    return (
        <Card className="ct-card-info">
            <CardTitle>{_("Updates")}</CardTitle>
            <CardBody>
                <Flex>
                    <FlexItem>
                        {lastCheck && (
                            <Text component="small">
                                {cockpit.format(
                                    _("Last Checked: $0"),
                                    timeformat.dateTime(lastCheck)
                                )}
                            </Text>
                        )}
                    </FlexItem>
                    <FlexItem align={{ default: "alignRight" }}>
                        <Button
                            variant="primary"
                            isLoading={waiting}
                            isDisabled={waiting}
                            onClick={() => {
                                setDirty(true);
                            }}
                        >
                            {waiting || _("Check for Updates")}
                        </Button>
                    </FlexItem>
                </Flex>
            </CardBody>
        </Card>
    );
};

export default UpdatesPanel;
