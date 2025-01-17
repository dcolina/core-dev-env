import { Subject } from 'rxjs';

import { AsyncPipe, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    inject
} from '@angular/core';

import { DotESContentService } from '@dotcms/data-access';
import { DotPageContainerStructure } from '@dotcms/dotcms-models';

import { EditEmaPaletteContentTypeComponent } from './components/edit-ema-palette-content-type/edit-ema-palette-content-type.component';
import { EditEmaPaletteContentletsComponent } from './components/edit-ema-palette-contentlets/edit-ema-palette-contentlets.component';
import { DotPaletteStore, PALETTE_TYPES } from './store/edit-ema-palette.store';

@Component({
    selector: 'dot-edit-ema-palette',
    standalone: true,
    templateUrl: './edit-ema-palette.component.html',
    styleUrls: ['./edit-ema-palette.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgIf,
        AsyncPipe,
        EditEmaPaletteContentTypeComponent,
        EditEmaPaletteContentletsComponent
    ],
    providers: [DotESContentService, DotPaletteStore]
})
export class EditEmaPaletteComponent implements OnInit, OnDestroy {
    @Input() languageId: number;
    @Input() containers: DotPageContainerStructure;

    @Output() dragStart = new EventEmitter();
    @Output() dragEnd = new EventEmitter();

    private readonly store = inject(DotPaletteStore);
    private destroy$ = new Subject<void>();

    readonly vm$ = this.store.vm$;

    PALETTE_TYPES_ENUM = PALETTE_TYPES;

    ngOnInit() {
        this.store.loadAllowedContentTypes({ containers: this.containers });
    }

    /**
     * Event handler for the drag start event.
     * @param event The drag event.
     */
    onDragStart(event: DragEvent) {
        this.dragStart.emit(event);
    }

    /**
     * Handles the drag end event.
     * @param event The drag event.
     */
    onDragEnd(event: DragEvent) {
        this.dragEnd.emit(event);
    }

    /**
     * Shows contentlets from a specific content type.
     *
     * @param contentTypeName - The name of the content type.
     */
    showContentletsFromContentType(contentTypeName: string) {
        this.store.loadContentlets({
            filter: '',
            languageId: this.languageId.toString(),
            contenttypeName: contentTypeName
        });
    }

    /**
     * Shows the content types in the palette.
     */
    showContentTypes() {
        this.store.resetContentlets();
    }

    /**
     *
     *
     * @param {*} { contentTypeVarName, page }
     * @memberof EditEmaPaletteComponent
     */
    onPaginate({ contentTypeVarName, page }) {
        this.store.loadContentlets({
            filter: '',
            languageId: this.languageId.toString(),
            contenttypeName: contentTypeVarName,
            page: page
        });
    }

    loadContentTypes(filter: string, allowedContent: string[]) {
        this.store.loadContentTypes({
            filter,
            allowedContent
        });
    }

    loadContentlets(filter: string, currentContentType: string) {
        this.store.loadContentlets({
            filter,
            contenttypeName: currentContentType,
            languageId: this.languageId.toString()
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
