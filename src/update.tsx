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

type ConstValues<T> = T[keyof T];

export const kindPrio = { patch: 0, package: 1 } as const;
export type KindKeys = keyof typeof kindPrio;
export type KindValues = ConstValues<typeof kindPrio>;
export const categoryPrio = {
    security: 0,
    recommended: 1,
    feature: 2,
} as const;
export type CategoryKeys = keyof typeof categoryPrio;
export type CategoryValues = ConstValues<typeof categoryPrio>;
export const severityPrio = { critical: 0, important: 1, moderate: 2 } as const;
export type SeverityKeys = keyof typeof severityPrio;
export type SeverityValues = ConstValues<typeof severityPrio>;

export type Update = {
  kind: KindKeys;
  category: CategoryKeys;
  severity: SeverityKeys;
  name: string;
  description: string | null;
  edition: string;
  "edition-old": string;
  summary: string;
};

const prioLabelColor = { 0: "red", 1: "blue", 2: "auto" } as const;

// prioLavbelColor is used in
// export const Label: React.FunctionComponent<LabelProps>
// component that doesn't support "auto", so fake auto as undefined
type Undefined<T, E> = T extends E ? undefined : T;
type FAKE_LABEL_TYPE2<T> = Undefined<T[keyof T], "auto">;

const prioIcon = {
    0: <ExclamationCircleIcon />,
    1: <ExclamationTriangleIcon />,
    2: <InfoCircleIcon />,
} as const;

// remove _disabled to enable props
const prioProps = (p: keyof typeof prioLabelColor) => {
    return {
        color: prioLabelColor[p] as unknown as FAKE_LABEL_TYPE2<
      typeof prioLabelColor
    >,
        icon_disabled: prioIcon[p],
        variant: "outline",
    };
};

export const categoryProps = (u: { category: CategoryKeys }) =>
    prioProps(categoryPrio[u.category]);
export const severityProps = (u: { severity: SeverityKeys }) =>
    prioProps(severityPrio[u.severity]);
