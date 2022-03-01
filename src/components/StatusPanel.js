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
import React from "react";
import {
    Card,
    CardBody,
    CardTitle,
    List,
    ListItem,
} from "@patternfly/react-core";
import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    InfoCircleIcon,
} from "@patternfly/react-icons";

import "./StatusPanel.scss";

const _ = cockpit.gettext;

const StatusPanel = ({ status, updates }) => {
    const icon = (s) => {
        const i = (s.details && s.details.icon) || s.type;
        const c = `tukit-status-${i}`;
        if (i === "error") return <ExclamationCircleIcon className={c} />;
        else if (i === "warning")
            return <ExclamationTriangleIcon className={c} />;
        else if (i === "check") return <CheckCircleIcon className={c} />;
        else return <InfoCircleIcon className={c} />;
    };
    return (
        <Card className="ct-card-info tukit-status-panel">
            <CardTitle>{_("Status")}</CardTitle>
            <CardBody>
                <List isPlain iconSize="large">
                    {status.map((s) => (
                        <ListItem icon={icon(s)} key={s.key}>
                            {s.title}
                        </ListItem>
                    ))}
                </List>
            </CardBody>
        </Card>
    );
};

export default StatusPanel;
