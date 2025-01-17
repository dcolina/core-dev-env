import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { ToolbarModule } from 'primeng/toolbar';

import { DotCMSWorkflowAction } from '@dotcms/dotcms-models';
import { DotWorkflowActionsComponent } from '@dotcms/ui';

@Component({
    selector: 'dot-edit-content-toolbar',
    standalone: true,
    imports: [ToolbarModule, DotWorkflowActionsComponent],
    templateUrl: './dot-edit-content-toolbar.component.html',
    styleUrls: ['./dot-edit-content-toolbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DotEditContentToolbarComponent {
    @Input() actions: DotCMSWorkflowAction[];
    @Output() actionFired = new EventEmitter<DotCMSWorkflowAction>();
}
