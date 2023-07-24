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
import React, { useState } from "react";
import {
    Badge,
    Button,
    DataListItem,
    DataListToggle,
    DataListItemRow,
    DataListItemCells,
    DataListCell,
    DataListAction,
    DataListContent,
    Dropdown,
    DropdownItem,
    Label,
    Tooltip,
} from "@patternfly/react-core";
import { DropdownPosition, KebabToggle } from "@patternfly/react-core/deprecated";
import { CheckCircleIcon } from "@patternfly/react-icons";

const _ = cockpit.gettext;

const SnapshotItem = ({ item, setDirty, setWaiting, waiting }) => {
    const [expanded, setExpanded] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const rollback = async (snap, msg, reboot) => {
        setWaiting(msg);
        try {
            let script = `transactional-update rollback ${snap.number}`;
            if (reboot) {
                script = script + " && reboot";
            }
            const out = await cockpit.script(script, {
                superuser: "require",
                err: "message",
            });
            console.log("rollback output: " + out);
            setDirty(true);
        } catch (e) {
            console.log("rollback error: " + e);
            // TODO: better error handling
            alert(e);
        }
        setWaiting(null);
    };
    const rollbackAndReboot = (snap) => {
        rollback(snap, _("Rolling back..."), true);
    };
    const rollbackOnly = (snap) => {
        rollback(snap, _("Rolling back..."), false);
    };
    const activateAndReboot = (snap) => {
        rollback(snap, _("Activating..."), true);
    };
    const activateOnly = (snap) => {
        rollback(snap, _("Activating..."), false);
    };
    const actions = (item) => {
        if (item.old) {
            return [
                <DropdownItem
                    key="rollback"
                    isDisabled={waiting}
                    onClick={() => {
                        rollbackOnly(item);
                    }}
                >
                    {_("Rollback without Reboot")}
                </DropdownItem>,
            ];
        }
        if (!item.active && !item.old) {
            return [
                <DropdownItem
                    key="activate"
                    isDisabled={waiting}
                    onClick={() => {
                        activateOnly(item);
                    }}
                >
                    {_("Activate without Reboot")}
                </DropdownItem>,
            ];
        }
        return null;
    };
    return (
        <DataListItem isExpanded={expanded}>
            <DataListItemRow>
                <DataListToggle
                    // hide extension part until we find some good use for it
                    style={{ display: "none" }}
                    onClick={() => {
                        setExpanded(!expanded);
                    }}
                    isExpanded={expanded}
                />
                <DataListItemCells
                    dataListCells={[
                        <DataListCell isIcon key="number">
                            <Badge isRead={item.old}>#{item.number}</Badge>
                        </DataListCell>,
                        <DataListCell key="description">
                            <b>{item.description}</b>
                        </DataListCell>,
                        <DataListCell key="date">
                            <Tooltip
                                content={timeformat.dateTimeSeconds(item.date)}
                            >
                                <span>
                                    {timeformat.distanceToNow(
                                        item.date,
                                        _("ago")
                                    )}
                                </span>
                            </Tooltip>
                        </DataListCell>,
                        <DataListCell key="labels">
                            {item.active && (
                                <Label color="green" icon={<CheckCircleIcon />}>
                                    {_("Active")}
                                </Label>
                            )}
                            {item.default && (
                                <Label color="blue">{_("Default")}</Label>
                            )}
                        </DataListCell>,
                        <DataListCell key="buttons">
                            {!item.active && !item.old && (
                                <Button
                                    variant="primary"
                                    isDisabled={waiting}
                                    onClick={() => {
                                        activateAndReboot(item);
                                    }}
                                    size="sm"
                                >
                                    {_("Activate and Reboot")}
                                </Button>
                            )}
                            {item.old && (
                                <Button
                                    variant="secondary"
                                    isDisabled={waiting}
                                    onClick={() => {
                                        rollbackAndReboot(item);
                                    }}
                                    size="sm"
                                >
                                    {_("Rollback and Reboot")}
                                </Button>
                            )}
                        </DataListCell>,
                    ]}
                />
                <DataListAction>
                    {actions(item) && (
                        <Dropdown
                            isPlain
                            isOpen={menuOpen}
                            position={DropdownPosition.right}
                            toggle={
                                <KebabToggle
                                    onToggle={() => {
                                        setMenuOpen(!menuOpen);
                                    }}
                                />
                            }
                            dropdownItems={actions(item)}
                        />
                    )}
                </DataListAction>
            </DataListItemRow>
            <DataListContent isHidden={!expanded}>
                More details about selected snapshot More details about selected
                snapshot More details about selected snapshot More details about
                selected snapshot
            </DataListContent>
        </DataListItem>
    );
};

export default SnapshotItem;
