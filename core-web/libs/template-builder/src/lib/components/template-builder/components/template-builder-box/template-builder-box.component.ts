import { GridItemHTMLElement } from 'gridstack';

import { NgClass, NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Output
} from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ScrollPanelModule } from 'primeng/scrollpanel';

import { DotContainersService } from '@dotcms/data-access';
import { DotContainer } from '@dotcms/dotcms-models';
import { DotContainerOptionsDirective, DotMessagePipeModule } from '@dotcms/ui';

import { DotTemplateBuilderContainer, TemplateBuilderBoxSize } from '../../models/models';
import { getBoxVariantByWidth } from '../../utils/gridstack-utils';
import { RemoveConfirmDialogComponent } from '../remove-confirm-dialog/remove-confirm-dialog.component';

@Component({
    selector: 'dotcms-template-builder-box',
    templateUrl: './template-builder-box.component.html',
    styleUrls: ['./template-builder-box.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgFor,
        NgIf,
        NgClass,
        ButtonModule,
        ScrollPanelModule,
        DotMessagePipeModule,
        RemoveConfirmDialogComponent,
        DropdownModule,
        DotContainerOptionsDirective
    ]
})
export class TemplateBuilderBoxComponent implements OnChanges {
    protected readonly templateBuilderSizes = TemplateBuilderBoxSize;

    @Output()
    editClasses: EventEmitter<void> = new EventEmitter<void>();
    @Output()
    addContainer: EventEmitter<DotContainer> = new EventEmitter<DotContainer>();
    @Output()
    deleteContainer: EventEmitter<void> = new EventEmitter<void>();
    @Output()
    deleteColumn: EventEmitter<void> = new EventEmitter<void>();
    @Output()
    deleteColumnRejected: EventEmitter<void> = new EventEmitter<void>();

    @Input() items: DotTemplateBuilderContainer[];

    @Input() width = 1;

    boxVariant = TemplateBuilderBoxSize.small;

    constructor(private containerService: DotContainersService, private el: ElementRef) {}

    get nativeElement(): GridItemHTMLElement {
        return this.el.nativeElement;
    }

    ngOnChanges(): void {
        this.boxVariant = getBoxVariantByWidth(this.width);
    }

    onContainerSelect({ value }: { value: DotContainer }) {
        this.addContainer.emit(value);
    }
}