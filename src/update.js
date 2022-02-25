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

import React from "react";
import {
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    InfoCircleIcon,
} from "@patternfly/react-icons";

export const kindPrio = { patch: 0, package: 1 };
export const categoryPrio = { security: 0, recommended: 2 };
export const severityPrio = { important: 0, moderate: 1 };
const prioLabelColor = { 0: "red", 1: "blue", 2: "auto" };
const prioIcon = {
    0: <ExclamationCircleIcon />,
    1: <ExclamationTriangleIcon />,
    2: <InfoCircleIcon />,
};

// remove _disabled to enable props
const prioProps = (p) => {
    return {
        color: prioLabelColor[p],
        icon_disabled: prioIcon[p],
        variant: "outline",
    };
};
export const categoryProps = (u) => prioProps(categoryPrio[u.category]);
export const severityProps = (u) => prioProps(severityPrio[u.severity]);
