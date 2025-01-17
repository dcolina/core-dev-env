import { Observable, Subject } from 'rxjs';

import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ConfirmationService } from 'primeng/api';

import { filter, takeUntil } from 'rxjs/operators';

import { DotMessageService } from '@dotcms/data-access';
import { ComponentStatus } from '@dotcms/dotcms-models';

import { AiContentPromptState, AiContentPromptStore } from './store/ai-content-prompt.store';

interface AIContentForm {
    textPrompt: FormControl<string>;
}

@Component({
    selector: 'dot-ai-content-prompt',
    templateUrl: './ai-content-prompt.component.html',
    styleUrls: ['./ai-content-prompt.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AIContentPromptComponent implements OnInit, OnDestroy {
    vm$: Observable<AiContentPromptState> = this.aiContentPromptStore.vm$;
    readonly ComponentStatus = ComponentStatus;
    form: FormGroup<AIContentForm> = new FormGroup<AIContentForm>({
        textPrompt: new FormControl('', Validators.required)
    });
    confirmationService = inject(ConfirmationService);
    dotMessageService = inject(DotMessageService);
    private destroy$: Subject<boolean> = new Subject<boolean>();
    @ViewChild('input') private input: ElementRef;

    constructor(private readonly aiContentPromptStore: AiContentPromptStore) {}

    ngOnInit() {
        this.aiContentPromptStore.status$
            .pipe(
                takeUntil(this.destroy$),
                filter((status) => status === ComponentStatus.IDLE)
            )
            .subscribe(() => {
                this.form.reset();
                this.input.nativeElement.focus();
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    /**
     *  Handle submit event in the form
     * @return {*}  {void}
     * @memberof AIContentPromptComponent
     */
    onSubmit() {
        const textPrompt = this.form.value.textPrompt;
        if (textPrompt) {
            this.aiContentPromptStore.generateContent(textPrompt);
        }
    }

    /**
     *  Handle scape key in the prompt input
     * @param event
     * @return {*}  {void}
     * @memberof AIContentPromptComponent
     */
    handleScape(event: KeyboardEvent): void {
        this.aiContentPromptStore.setStatus(ComponentStatus.INIT);
        event.stopPropagation();
    }

    /**
     * Clears the error at the store on hiding the confirmation dialog.
     *
     * @return {void}
     */
    onHideConfirm(): void {
        this.aiContentPromptStore.cleanError();
    }
}
