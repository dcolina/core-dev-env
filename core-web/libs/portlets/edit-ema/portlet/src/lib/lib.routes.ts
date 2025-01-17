import { Route } from '@angular/router';

import { CanDeactivateGuardService } from '@dotcms/data-access';
import { portletHaveLicenseResolver } from '@dotcms/ui';

import { DotEmaShellComponent } from './dot-ema-shell/dot-ema-shell.component';
import { editEmaGuard } from './services/guards/edit-ema.guard';

export const DotEmaRoutes: Route[] = [
    {
        path: '',
        canActivate: [editEmaGuard],
        component: DotEmaShellComponent,
        resolve: { haveLicense: portletHaveLicenseResolver },
        runGuardsAndResolvers: 'always',
        children: [
            {
                path: 'content',
                loadComponent: () =>
                    import('./edit-ema-editor/edit-ema-editor.component').then(
                        (mod) => mod.EditEmaEditorComponent
                    )
            },
            {
                path: 'layout',
                loadComponent: () =>
                    import('./edit-ema-layout/edit-ema-layout.component').then(
                        (mod) => mod.EditEmaLayoutComponent
                    ),
                canDeactivate: [CanDeactivateGuardService]
            },
            {
                path: 'rules/:pageId',
                loadChildren: () => import('@dotcms/dot-rules').then((m) => m.DotRulesModule)
            },
            {
                path: 'experiments',
                loadComponent: () =>
                    import('./edit-ema-experiments/edit-ema-experiments.component').then(
                        (mod) => mod.EditEmaExperimentsComponent
                    )
            },
            {
                path: '**',
                redirectTo: 'content',
                pathMatch: 'full'
            },
            {
                path: '',
                redirectTo: 'content',
                pathMatch: 'full'
            }
        ]
    }
];
