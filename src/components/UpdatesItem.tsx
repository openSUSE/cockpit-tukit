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
	Label,
	Modal,
	ModalVariant,
	Tooltip,
	DropdownList,
	MenuToggleElement,
	MenuToggle,
} from "@patternfly/react-core";
import { DropdownPosition } from "@patternfly/react-core/deprecated";
import {
	BugIcon,
	ExclamationTriangleIcon,
	InfoCircleIcon,
	PackageIcon,
	EllipsisVIcon,
} from "@patternfly/react-icons";
import { transactionsProxy } from "../tukit";
import { Update, categoryProps, severityProps } from "../update";
import { linkify } from "../utils";

import "./UpdatesItem.scss";

const _ = cockpit.gettext;

const UpdateDetails = ({ u }: { u: Update }) => {
	const [dialogVisible, setDialogVisible] = useState(false);
	return (
		<>
			<Button
				className="tukit-update-details-button"
				variant="plain"
				onClick={() => {
					setDialogVisible(true);
				}}
			>
				<InfoCircleIcon />
			</Button>
			{dialogVisible && (
				<Modal
					isOpen
					variant={ModalVariant.medium}
					title={_("Update Details")}
					onClose={() => setDialogVisible(false)}
					actions={[
						<Button
							key="close"
							variant="primary"
							onClick={() => {
								setDialogVisible(false);
							}}
						>
							{_("Close")}
						</Button>,
					]}
				>
					<DataList isCompact aria-label="TODO_TYPE">
						{Object.entries(u).map(([k, v]) => (
							<DataListItem key={k}>
								<DataListItemRow>
									<DataListItemCells
										dataListCells={[
											<DataListCell key="name" width={1}>
												<strong>{k}</strong>
											</DataListCell>,
											<DataListCell key="value" width={4}>
												<span className="tukit-update-details-text">
													{v ? linkify(v) : ""}
												</span>
											</DataListCell>,
										]}
									/>
								</DataListItemRow>
							</DataListItem>
						))}
					</DataList>
				</Modal>
			)}
		</>
	);
};

const UpdateItem = ({ u }: { u: Update }) => {
	const icon = () => {
		if (u.kind === "package") return <PackageIcon />;
		else if (u.kind === "patch") return <BugIcon />;
		else return <InfoCircleIcon />;
	};
	const updateCells = (u: Update) => {
		// package
		if (u.kind === "package")
			return [
				<DataListCell key="name">
					<Tooltip
						className="tukit-tooltip-pre"
						isContentLeftAligned
						maxWidth="30rem"
						content={u.description}
					>
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
				<Tooltip
					className="tukit-tooltip-pre"
					isContentLeftAligned
					maxWidth="30rem"
					content={u.description}
				>
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
				<DataListAction
					isPlainButtonAction
					aria-label="TODO_TYPE"
					aria-labelledby="TODO_TYPE"
					id="TODO_TYPE"
				>
					<UpdateDetails u={u} />
				</DataListAction>
			</DataListItemRow>
		</DataListItem>
	);
};

type UpdatesItemProps = {
	updates: Update[];
	waiting: string | null | boolean;
	setWaiting: (waiting: string | null) => void;
	setError: (error: string | null) => void;
	setDirty: (dirty: boolean) => void;
};

const UpdatesItem = ({
	updates,
	setError,
	setDirty,
	setWaiting,
	waiting,
}: UpdatesItemProps) => {
	const [expanded, setExpanded] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	const update = async (reboot: boolean) => {
		setWaiting(_("Installing updates..."));
		const proxy = transactionsProxy();

		function finishedHandler(
			ev: CustomEvent<unknown>,
			snapID: string,
			exitcode: number,
			output: string,
		) {
			console.log("command finished");
			console.log(`exit ${exitcode}`);
			console.log(`output: ${output}`);
			setWaiting(null);
			setDirty(true);
			// run once (no {once: true} support in cockpit's event_mixin)
			proxy.removeEventListener("CommandExecuted", finishedHandler);
		}

		function errorHandler(
			ev: CustomEvent<unknown>,
			snapID: string,
			exitcode: number,
			output: string,
		) {
			console.log(`exit ${exitcode}`);
			console.log(`output: ${output}`);
			setError(
				cockpit.format(
					_("Error installing updates: command exited with code $0"),
					exitcode,
				),
			);
			setWaiting(null);
			// don't reload to not loose the error status
			// setDirty(true);
			// run once (no {once: true} support in cockpit's event_mixin)
			proxy.removeEventListener("Error", errorHandler);
		}

		proxy.wait(async () => {
			try {
				// You can find the "CommandExecuted" | "Error" events and `ExecuteAndReboot` function from here:
				// https://github.com/openSUSE/transactional-update/blob/master/dbus/org.opensuse.tukit.Transaction.xml
				proxy.addEventListener("CommandExecuted", finishedHandler);
				proxy.addEventListener("Error", errorHandler);
				const cmd = "zypper --non-interactive up";
				const rebootMethod = reboot ? "systemd" : "none";
				// base: default, active or number of base snapshot
				// reboot: auto, rebootmgr, systemd, kured, kexec, none
				const snapID = await proxy.ExecuteAndReboot(
					"default",
					cmd,
					rebootMethod,
				);
				console.log(`new snapshot: ${snapID}`);
			} catch (_e) {
				const e = _e as Error;
				setWaiting(null);
				// this is "early" error returned directly from method
				setError(e.toString());
			}
		});
	};

	const updateAndReboot = () => {
		update(true);
	};
	const updateOnly = () => {
		update(false);
	};

	return (
		<DataListItem key="updates" isExpanded={expanded}>
			<DataListItemRow>
				<DataListToggle
					id="TODO_TYPE"
					onClick={() => {
						setExpanded(!expanded);
					}}
					isExpanded={expanded}
				/>
				<DataListItemCells
					dataListCells={[
						<DataListCell isIcon key="icon">
							<ExclamationTriangleIcon color="var(--pf-global--warning-color--100)" />
						</DataListCell>,
						<DataListCell key="description" width={3}>
							<b>
								{cockpit.format(_("Available updates ($0)"), updates.length)}
							</b>
						</DataListCell>,
						<DataListCell key="buttons">
							<Button
								variant="primary"
								isDisabled={!!waiting}
								onClick={() => {
									updateAndReboot();
								}}
								size="sm"
							>
								{_("Update and Reboot")}
							</Button>
						</DataListCell>,
					]}
				/>
				<DataListAction
					aria-label="TODO_TYPE"
					aria-labelledby="TODO_TYPE"
					id="TODO_TYPE"
				>
					<Dropdown
						isPlain
						isOpen={menuOpen}
						toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
							<MenuToggle
								variant="plain"
								ref={toggleRef}
								onClick={() => {
									setMenuOpen(!menuOpen);
								}}
								isExpanded={menuOpen}
							>
								<EllipsisVIcon />
							</MenuToggle>
						)}
						popperProps={{
							position: DropdownPosition.right,
						}}
					>
						<DropdownList>
							<DropdownItem
								key="update"
								isDisabled={!!waiting}
								onClick={() => {
									updateOnly();
								}}
							>
								{_("Update without Reboot")}
							</DropdownItem>
						</DropdownList>
					</Dropdown>
				</DataListAction>
			</DataListItemRow>
			<DataListContent hasNoPadding isHidden={!expanded} aria-label="TODO_TYPE">
				<DataList isCompact aria-label="TODO_TYPE">
					{updates.map((u: Update) => (
						<UpdateItem key={u.name} u={u} />
					))}
				</DataList>
			</DataListContent>
		</DataListItem>
	);
};

export default UpdatesItem;
