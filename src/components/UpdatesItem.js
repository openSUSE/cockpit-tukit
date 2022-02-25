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
import React, { useState } from "react";
import {
    Button,
    DataList,
    DataListItem,
    DataListToggle,
    DataListItemRow,
    DataListItemCells,
    DataListCell,
    DataListAction,
    DataListContent,
    Dropdown,
    DropdownItem,
    DropdownPosition,
    KebabToggle,
    Label,
    Popover,
    Tooltip,
} from "@patternfly/react-core";
import {
    BugIcon,
    ExclamationTriangleIcon,
    InfoCircleIcon,
    PackageIcon,
} from "@patternfly/react-icons";
import { categoryProps, severityProps } from "../update";

const _ = cockpit.gettext;

const UpdateItem = ({ u }) => {
    const icon = () => {
        if (u.kind === "package") return <PackageIcon />;
        else if (u.kind === "patch") return <BugIcon />;
        else return <InfoCircleIcon />;
    };
    const updateCells = (u) => {
        // package
        if (u.kind === "package")
            return [
                <DataListCell key="name">
                    <Tooltip content={u.description}>
                        <span>{u.name}</span>
                    </Tooltip>
                </DataListCell>,
                <DataListCell key="version">
                    <Tooltip content={_("New Version")}>
                        <span>{u.edition}</span>
                    </Tooltip>
                </DataListCell>,
                <DataListCell key="oldversion">
                    <Tooltip content={_("Old Version")}>
                        <span>{u["edition-old"]}</span>
                    </Tooltip>
                </DataListCell>,
            ];
        // patch
        return [
            <DataListCell key="name" width={3}>
                <Tooltip className="tooltip-pre" content={u.description}>
                    <span>{u.name}</span>
                </Tooltip>
            </DataListCell>,
            <DataListCell key="summary" width={2}>
                {u.summary}
            </DataListCell>,
            <DataListCell key="details" width={2}>
                <Label isCompact {...categoryProps(u)}>
                    {u.category}
                </Label>
                <Label isCompact {...severityProps(u)}>
                    {u.severity}
                </Label>
            </DataListCell>,
        ];
    };
    return (
        <DataListItem>
            <DataListItemRow>
                <DataListItemCells
                    dataListCells={[
                        <DataListCell isIcon key="icon">
                            <Tooltip content={_(u.kind)}>{icon()}</Tooltip>
                        </DataListCell>,
                        ...updateCells(u),
                    ]}
                />
                <DataListAction>
                    <Popover bodyContent={JSON.stringify(u)}>
                        <Button variant="link" icon={<InfoCircleIcon />} />
                    </Popover>
                </DataListAction>
            </DataListItemRow>
        </DataListItem>
    );
};

const UpdatesItem = ({ updates }) => {
    const [expanded, setExpanded] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <DataListItem key="updates" isExpanded={expanded}>
            <DataListItemRow>
                <DataListToggle
                    onClick={() => {
                        setExpanded(!expanded);
                    }}
                    isExpanded={expanded}
                />
                <DataListItemCells
                    dataListCells={[
                        <DataListCell isIcon key="icon">
                            <ExclamationTriangleIcon
                                size="md"
                                color="var(--pf-global--warning-color--100)"
                            />
                        </DataListCell>,
                        <DataListCell key="description">
                            <b>Updates available ({updates.length})</b>
                        </DataListCell>,
                        <DataListCell key="date?" />,
                        <DataListCell key="labels?" />,
                        <DataListCell key="buttons">
                            <Button variant="primary" isSmall>
                                {_("Update and Reboot")}
                            </Button>
                        </DataListCell>,
                    ]}
                />
                <DataListAction>
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
                        dropdownItems={[
                            <DropdownItem key="a1">Some Action</DropdownItem>,
                            <DropdownItem key="a2">Other Action</DropdownItem>,
                        ]}
                    />
                </DataListAction>
            </DataListItemRow>
            <DataListContent hasNoPadding isHidden={!expanded}>
                <DataList isCompact>
                    {updates.map((u) => (
                        <UpdateItem key={u.name} u={u} />
                    ))}
                </DataList>
            </DataListContent>
        </DataListItem>
    );
};

export default UpdatesItem;
