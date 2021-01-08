/*
 * Copyright 2020 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    AnchorButton,
    Button,
    Classes as CoreClasses,
    Code,
    FormGroup,
    H5,
    HTMLSelect,
    IButtonProps,
    Intent,
    Label,
    Menu,
    MenuDivider,
    MenuItem,
    PopoverInteractionKind,
    RadioGroup,
    Slider,
    Switch,
} from "@blueprintjs/core";
import {
    Example,
    handleBooleanChange,
    handleNumberChange,
    handleValueChange,
    IExampleProps,
} from "@blueprintjs/docs-theme";
import { Classes, IPopover2SharedProps, Popover2, StrictModifierNames } from "@blueprintjs/popover2";
import { Placement, placements as PLACEMENT_OPTIONS } from "@popperjs/core";
import * as React from "react";

const POPPER_DOCS_URL = "https://popper.js.org/docs/v2/";

const INTERACTION_KINDS = [
    { label: "Click", value: PopoverInteractionKind.CLICK.toString() },
    { label: "Click (target only)", value: PopoverInteractionKind.CLICK_TARGET_ONLY.toString() },
    { label: "Hover", value: PopoverInteractionKind.HOVER.toString() },
    { label: "Hover (target only)", value: PopoverInteractionKind.HOVER_TARGET_ONLY.toString() },
];

export interface IPopover2ExampleState {
    boundary?: "scrollParent" | "body" | "clippingParents";
    canEscapeKeyClose?: boolean;
    exampleIndex?: number;
    hasBackdrop?: boolean;
    inheritDarkTheme?: boolean;
    interactionKind?: PopoverInteractionKind;
    isOpen?: boolean;
    minimal?: boolean;
    modifiers?: IPopover2SharedProps<HTMLElement>["modifiers"];
    placement?: Placement;
    sliderValue?: number;
    usePortal?: boolean;
}

export class Popover2Example extends React.PureComponent<IExampleProps, IPopover2ExampleState> {
    public state: IPopover2ExampleState = {
        boundary: "scrollParent",
        canEscapeKeyClose: true,
        exampleIndex: 0,
        hasBackdrop: false,
        inheritDarkTheme: true,
        interactionKind: PopoverInteractionKind.CLICK,
        isOpen: false,
        minimal: false,
        modifiers: {
            arrow: { enabled: true },
            flip: { enabled: true },
            preventOverflow: { enabled: true },
        },
        placement: "auto",
        sliderValue: 5,
        usePortal: true,
    };

    private scrollParentElement: HTMLElement | null = null;
    private bodyElement: HTMLElement | null = null;

    private handleSliderChange = (value: number) => this.setState({ sliderValue: value });

    private handleExampleIndexChange = handleNumberChange(exampleIndex => this.setState({ exampleIndex }));

    private handleInteractionChange = handleValueChange((interactionKind: PopoverInteractionKind) => {
        const hasBackdrop = this.state.hasBackdrop && interactionKind === PopoverInteractionKind.CLICK;
        this.setState({ interactionKind, hasBackdrop });
    });

    private handlePlacementChange = handleValueChange((placement: Placement) => this.setState({ placement }));
    private handleBoundaryChange = handleValueChange((boundary: IPopover2ExampleState["boundary"]) =>
        this.setState({ boundary }),
    );

    private toggleEscapeKey = handleBooleanChange(canEscapeKeyClose => this.setState({ canEscapeKeyClose }));

    private toggleIsOpen = handleBooleanChange(isOpen => this.setState({ isOpen }));

    private toggleMinimal = handleBooleanChange(minimal => this.setState({ minimal }));

    private toggleUsePortal = handleBooleanChange(usePortal => {
        if (usePortal) {
            this.setState({ hasBackdrop: false, inheritDarkTheme: false });
        }
        this.setState({ usePortal });
    });

    private getModifierChangeHandler<Name extends StrictModifierNames>(name: Name) {
        return handleBooleanChange(enabled => {
            this.setState({
                modifiers: {
                    ...this.state.modifiers,
                    [name]: { ...this.state.modifiers[name], enabled },
                },
            });
        });
    }

    public componentDidMount() {
        this.bodyElement = document.body;
    }

    public render() {
        const { boundary, exampleIndex, sliderValue, ...popoverProps } = this.state;
        return (
            <Example options={this.renderOptions()} {...this.props}>
                <div className="docs-popover-example-scroll" ref={this.centerScroll}>
                    <Popover2<IButtonProps>
                        popoverClassName={exampleIndex <= 2 ? Classes.POPOVER2_CONTENT_SIZING : ""}
                        portalClassName="foo"
                        {...popoverProps}
                        boundary={
                            boundary === "scrollParent"
                                ? this.scrollParentElement ?? undefined
                                : boundary === "body"
                                ? this.bodyElement ?? undefined
                                : boundary
                        }
                        enforceFocus={false}
                        isOpen={this.state.isOpen === true ? /* Controlled */ true : /* Uncontrolled */ undefined}
                        content={this.getContents(exampleIndex)}
                        // tslint:disable-next-line jsx-no-lambda
                        renderTarget={({ ref, isOpen, ...props }) => (
                            <Button intent={Intent.PRIMARY} text="Popover target" {...props} elementRef={ref} />
                        )}
                    />
                    <p>
                        Scroll around this container to experiment
                        <br />
                        with <Code>flip</Code> and <Code>preventOverflow</Code> modifiers.
                    </p>
                </div>
            </Example>
        );
    }

    private renderOptions() {
        const { arrow, flip, preventOverflow } = this.state.modifiers;
        return (
            <>
                <H5>Appearance</H5>
                <FormGroup
                    helperText="May be overridden to prevent overflow"
                    label="Position when opened"
                    labelFor="position"
                >
                    <HTMLSelect
                        value={this.state.placement}
                        onChange={this.handlePlacementChange}
                        options={PLACEMENT_OPTIONS}
                    />
                </FormGroup>
                <Label>
                    Example content
                    <HTMLSelect value={this.state.exampleIndex} onChange={this.handleExampleIndexChange}>
                        <option value="0">Text</option>
                        <option value="1">Input</option>
                        <option value="2">Slider</option>
                        <option value="3">Menu</option>
                        <option value="4">Empty</option>
                    </HTMLSelect>
                </Label>
                <Switch checked={this.state.usePortal} onChange={this.toggleUsePortal}>
                    Use <Code>Portal</Code>
                </Switch>
                <Switch checked={this.state.minimal} label="Minimal appearance" onChange={this.toggleMinimal} />
                <Switch checked={this.state.isOpen} label="Open (controlled mode)" onChange={this.toggleIsOpen} />

                <H5>Interactions</H5>
                <RadioGroup
                    label="Interaction kind"
                    selectedValue={this.state.interactionKind.toString()}
                    options={INTERACTION_KINDS}
                    onChange={this.handleInteractionChange}
                />
                <Switch
                    checked={this.state.canEscapeKeyClose}
                    label="Can escape key close"
                    onChange={this.toggleEscapeKey}
                />

                <H5>Modifiers</H5>
                <Switch checked={arrow.enabled} label="Arrow" onChange={this.getModifierChangeHandler("arrow")} />
                <Switch checked={flip.enabled} label="Flip" onChange={this.getModifierChangeHandler("flip")} />
                <Switch
                    checked={preventOverflow.enabled}
                    label="Prevent overflow"
                    onChange={this.getModifierChangeHandler("preventOverflow")}
                >
                    <br />
                    <div style={{ marginTop: 5 }} />
                    <HTMLSelect
                        disabled={!preventOverflow.enabled}
                        value={this.state.boundary}
                        onChange={this.handleBoundaryChange}
                    >
                        <option value="scrollParent">scrollParent</option>
                        <option value="window">window</option>
                    </HTMLSelect>
                </Switch>
                <Label>
                    <AnchorButton
                        href={POPPER_DOCS_URL}
                        fill={true}
                        intent={Intent.PRIMARY}
                        minimal={true}
                        rightIcon="share"
                        target="_blank"
                        style={{ marginTop: 20 }}
                    >
                        Visit Popper.js docs
                    </AnchorButton>
                </Label>
            </>
        );
    }

    private getContents(index: number): JSX.Element {
        return [
            <div key="text">
                <H5>Confirm deletion</H5>
                <p>Are you sure you want to delete these items? You won't be able to recover them.</p>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 15 }}>
                    <Button className={Classes.POPOVER2_DISMISS} style={{ marginRight: 10 }}>
                        Cancel
                    </Button>
                    <Button intent={Intent.DANGER} className={Classes.POPOVER2_DISMISS}>
                        Delete
                    </Button>
                </div>
            </div>,
            <div key="input">
                <label className={CoreClasses.LABEL}>
                    Enter some text
                    <input autoFocus={true} className={CoreClasses.INPUT} type="text" />
                </label>
            </div>,
            <Slider key="slider" min={0} max={10} onChange={this.handleSliderChange} value={this.state.sliderValue} />,
            <Menu key="menu">
                <MenuDivider title="Edit" />
                <MenuItem icon="cut" text="Cut" label="⌘X" />
                <MenuItem icon="duplicate" text="Copy" label="⌘C" />
                <MenuItem icon="clipboard" text="Paste" label="⌘V" disabled={true} />
                <MenuDivider title="Text" />
                <MenuItem icon="align-left" text="Alignment">
                    <MenuItem icon="align-left" text="Left" />
                    <MenuItem icon="align-center" text="Center" />
                    <MenuItem icon="align-right" text="Right" />
                    <MenuItem icon="align-justify" text="Justify" />
                </MenuItem>
                <MenuItem icon="style" text="Style">
                    <MenuItem icon="bold" text="Bold" />
                    <MenuItem icon="italic" text="Italic" />
                    <MenuItem icon="underline" text="Underline" />
                </MenuItem>
            </Menu>,
        ][index];
    }

    private centerScroll = (div: HTMLDivElement) => {
        this.scrollParentElement = div;

        if (div != null) {
            // if we don't requestAnimationFrame, this function apparently executes
            // before styles are applied to the page, so the centering is way off.
            requestAnimationFrame(() => {
                const container = div.parentElement;
                container.scrollTop = div.clientHeight / 4;
                container.scrollLeft = div.clientWidth / 4;
            });
        }
    };
}
