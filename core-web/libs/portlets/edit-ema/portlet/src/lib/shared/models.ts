import { DotDevice } from '@dotcms/dotcms-models';

import { EDITOR_MODE, EDITOR_STATE } from './enums';

import { DotPageApiParams, DotPageApiResponse } from '../services/dot-page-api.service';

export interface ClientData {
    contentlet?: ContentletPayload;
    container: ContainerPayload;
}

export interface PositionPayload extends ClientData {
    position?: 'before' | 'after';
}

export interface ActionPayload extends PositionPayload {
    language_id: string;
    pageContainers: PageContainer[];
    pageId: string;
    personaTag?: string;
    newContentletId?: string;
}

export interface PageContainer {
    personaTag?: string;
    identifier: string;
    uuid: string;
    contentletsId: string[];
}

export interface ContainerPayload {
    acceptTypes: string;
    identifier: string;
    contentletsId?: string[];
    maxContentlets: number;
    variantId: string;
    uuid: string;
}

export interface ContentletPayload {
    identifier: string;
    inode: string;
    title: string;
    contentType: string;
    onNumberOfPages?: number;
}

export interface SetUrlPayload {
    url: string;
}

export interface SavePagePayload {
    pageContainers: PageContainer[];
    params?: DotPageApiParams;
    pageId: string;
    whenSaved?: () => void;
}

export interface ReloadPagePayload {
    params: DotPageApiParams;
    whenReloaded?: () => void;
}

export interface NavigationBarItem {
    icon?: string;
    iconURL?: string;
    label: string;
    href?: string;
    action?: () => void;
    isDisabled?: boolean;
}

export interface PreviewState {
    editorMode: EDITOR_MODE;
    device?: DotDevice & { icon?: string };
    socialMedia?: string;
}

export interface EditEmaState {
    clientHost: string;
    error?: number;
    editor: DotPageApiResponse;
    isEnterpriseLicense: boolean;
    editorState: EDITOR_STATE;
    previewState: PreviewState;
}
