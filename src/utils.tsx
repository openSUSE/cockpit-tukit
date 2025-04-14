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
import React, { Key } from "react";
import cockpit from "cockpit";

export const stringToBool = (s: string) => {
    return ["yes", "true", "1"].includes(s.toLowerCase());
};

// decode selected named html entities found in zypper's xml output and generic
// numeric ones.
// see: https://github.com/openSUSE/libzypp/blob/master/zypp-core/parser/xml/XmlEscape.cc
export const decodeHTMLEntities = (s: string | null): string | null => {
    if (!s) return null;

    const entities = { lt: "<", gt: ">", amp: "&", apos: "'", quot: '"' };
    return s
            .replaceAll(/&#(\d+);/g, (_, num) => String.fromCharCode(num))
            .replaceAll(
                /&([a-z]+);/g,
                (m, e: keyof typeof entities) => entities[e] || m
            );
};

const tagURLPrefix = {
    bsc: "https://bugzilla.suse.com/show_bug.cgi?id=",
    boo: "https://bugzilla.opensuse.org/show_bug.cgi?id=",
};
// convert tagged items found in text to clickable links
export const linkify = (s: string) => {
    const parts = s.split(/((?:bsc|boo)#\d+)/);
    return parts.map((p) => {
        const m = p.match(/(bsc|boo)#(\d+)/);
        if (m === null) return p;
        return (
            <a
        key={m as unknown as Key}
        href={tagURLPrefix[m[1] as keyof typeof tagURLPrefix] + m[2]}
        target="_blank"
        rel="noreferrer"
            >
                {m[0]}
            </a>
        );
    });
};

export const is_supported = async () => {
    /* future versions of tr-up will have a way to directly check if a system is transactional, so this will become a slow fallback */
    try {
        const fstype = await cockpit.spawn(["findmnt", "-no", "FSTYPE", "/"]);
        if (fstype.trim() === "btrfs") {
            const mount_options = await cockpit.spawn([
                "findmnt",
                "-no",
                "OPTIONS",
                "/",
            ]);
            if (mount_options.split(",").includes("ro")) {
                try {
                    await cockpit.spawn(["test", "-f", "/usr/sbin/transactional-update"]);
                    return true;
                } catch (error) {
                    console.log(error);
                    return false;
                }
            }
        }
        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
};
