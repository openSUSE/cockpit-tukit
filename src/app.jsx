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
import React, { useEffect, useState } from "react";
import { Alert, Card, CardTitle, CardBody } from "@patternfly/react-core";

const _ = cockpit.gettext;

const Application = () => {
    const [hostname, setHostname] = useState(_("Unknown"));
    useEffect(() => {
        cockpit.file("/etc/hostname").watch((content) => {
            setHostname(content.trim());
        });
    }, []);

    return (
        <Card>
            <CardTitle>{_("Software Updates")}</CardTitle>
            <CardBody>
                <Alert
                    variant="info"
                    title={cockpit.format(_("Running on $0"), hostname)}
                />
            </CardBody>
        </Card>
    );
};

export default Application;
