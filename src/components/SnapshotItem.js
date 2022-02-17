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
    DropdownPosition,
    KebabToggle,
    Label,
    Tooltip,
} from "@patternfly/react-core";
import { CheckCircleIcon } from "@patternfly/react-icons";

const _ = cockpit.gettext;

const SnapshotItem = ({ item }) => {
    const [expanded, setExpanded] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <DataListItem key={item.number} isExpanded={expanded}>
            <DataListItemRow>
                <DataListToggle
                    onClick={() => {
                        setExpanded(!expanded);
                    }}
                    isExpanded={expanded}
                />
                <DataListItemCells
                    dataListCells={[
                        <DataListCell isIcon key="number">
                            <Badge>#{item.number}</Badge>
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
                                <Button variant="primary" isSmall>
                                    {_("Activate and Reboot")}
                                </Button>
                            )}
                            {item.old && (
                                <Button variant="secondary" isSmall>
                                    {_("Rollback and Reboot")}
                                </Button>
                            )}
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
            <DataListContent isHidden={!expanded}>
                More details about selected snapshot More details about selected
                snapshot More details about selected snapshot More details about
                selected snapshot
            </DataListContent>
        </DataListItem>
    );
};

export default SnapshotItem;
