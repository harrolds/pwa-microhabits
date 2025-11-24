import type { ReactNode } from 'react';

export type RouteId = `factory.${string}`;

export type NavigationCategory = 'hub' | 'workbench' | 'runtime' | 'control';

export type BlueprintLayer = 'core' | 'workspace' | 'system';

export type PanelBehavior = 'locked-open' | 'contextual';

export interface PanelRule {
  target: 'left' | 'right';
  mode?: 'inline' | 'overlay';
  behavior: PanelBehavior;
  defaultState: 'open' | 'closed';
  label?: string;
  payloadSlot?: 'navigation' | 'context' | 'manifest' | 'custom';
}

export interface ManifestBinding {
  slot: 'navigation' | 'panel' | 'sheet';
  key: string;
  optional?: boolean;
}

export interface RouteGuard {
  featureFlag?: string;
  manifestKey?: string;
  blueprintMinimum?: string;
}

export interface NavigationRouteDefinition {
  id: RouteId;
  path: string;
  label: string;
  summary: string;
  order: number;
  category: NavigationCategory;
  blueprint: BlueprintLayer;
  parentId?: RouteId;
  icon?: string;
  hero?: ReactNode;
  tags?: string[];
  panelRules?: PanelRule[];
  manifestBinding?: ManifestBinding;
  guards?: RouteGuard;
  children?: NavigationRouteDefinition[];
}

export const NAVIGATION_BLUEPRINT: NavigationRouteDefinition[] = [
  {
    id: 'factory.hub',
    path: '/',
    label: 'Factory Hub',
    summary: 'Realtime overzicht van de PWA Factory-activiteit en status.',
    order: 0,
    category: 'hub',
    blueprint: 'core',
    tags: ['overview', 'status'],
    panelRules: [
      {
        target: 'left',
        behavior: 'locked-open',
        mode: 'inline',
        defaultState: 'open',
        label: 'Primaire navigatie',
        payloadSlot: 'navigation',
      },
      {
        target: 'right',
        behavior: 'contextual',
        mode: 'overlay',
        defaultState: 'closed',
        label: 'Context panel',
        payloadSlot: 'context',
      },
    ],
    children: [
      {
        id: 'factory.hub.activity',
        path: '/activity',
        label: 'Activiteit',
        summary: 'Logboek van recente deployments, syncs en alerts.',
        order: 1,
        category: 'hub',
        blueprint: 'workspace',
        parentId: 'factory.hub',
        tags: ['timeline'],
      },
    ],
  },
  {
    id: 'factory.workbench',
    path: '/workbench',
    label: 'Workbench',
    summary: 'Overzicht van werkstromen, blueprints en experimenten.',
    order: 1,
    category: 'workbench',
    blueprint: 'workspace',
    panelRules: [
      {
        target: 'left',
        behavior: 'locked-open',
        mode: 'inline',
        defaultState: 'open',
        label: 'Workstreams',
        payloadSlot: 'navigation',
      },
      {
        target: 'right',
        behavior: 'contextual',
        mode: 'overlay',
        defaultState: 'open',
        label: 'Toolkit',
        payloadSlot: 'context',
      },
    ],
    children: [
      {
        id: 'factory.workbench.blueprints',
        path: '/workbench/blueprints',
        label: 'Blueprints',
        summary: 'Beheer en activeer blueprint templates.',
        order: 0,
        category: 'workbench',
        blueprint: 'workspace',
        parentId: 'factory.workbench',
        tags: ['blueprints'],
        manifestBinding: {
          slot: 'navigation',
          key: 'blueprints.catalog',
        },
      },
      {
        id: 'factory.workbench.streams',
        path: '/workbench/streams',
        label: 'Streams',
        summary: 'Focusmodus voor lopende experimenten.',
        order: 1,
        category: 'workbench',
        blueprint: 'workspace',
        parentId: 'factory.workbench',
        guards: {
          featureFlag: 'streams',
        },
      },
    ],
  },
  {
    id: 'factory.runtime.modules',
    path: '/modules',
    label: 'Modules',
    summary: 'Catalogus en runtime status van alle factory-modules.',
    order: 2,
    category: 'runtime',
    blueprint: 'core',
    panelRules: [
      {
        target: 'left',
        behavior: 'locked-open',
        mode: 'inline',
        defaultState: 'open',
        label: 'Module catalogus',
        payloadSlot: 'navigation',
      },
      {
        target: 'right',
        behavior: 'contextual',
        mode: 'overlay',
        defaultState: 'closed',
        label: 'Module details',
        payloadSlot: 'context',
      },
    ],
    children: [
      {
        id: 'factory.runtime.modules.health',
        path: '/modules/health',
        label: 'Health Monitor',
        summary: 'Live status van module pipelines.',
        order: 0,
        category: 'runtime',
        blueprint: 'system',
        parentId: 'factory.runtime.modules',
      },
      {
        id: 'factory.runtime.modules.registry',
        path: '/modules/registry',
        label: 'Registry',
        summary: 'Registratie van inkomende module builds.',
        order: 1,
        category: 'runtime',
        blueprint: 'system',
        parentId: 'factory.runtime.modules',
        manifestBinding: {
          slot: 'navigation',
          key: 'modules.registry',
          optional: true,
        },
      },
    ],
  },
  {
    id: 'factory.runtime.manifest',
    path: '/manifest',
    label: 'Manifest Sync',
    summary: 'Koppeling met Manifest System v2.0.',
    order: 3,
    category: 'runtime',
    blueprint: 'core',
    panelRules: [
      {
        target: 'left',
        behavior: 'locked-open',
        mode: 'inline',
        defaultState: 'open',
        label: 'Manifest status',
        payloadSlot: 'navigation',
      },
      {
        target: 'right',
        behavior: 'contextual',
        mode: 'overlay',
        defaultState: 'open',
        label: 'Diff viewer',
        payloadSlot: 'manifest',
      },
    ],
    children: [
      {
        id: 'factory.runtime.manifest.review',
        path: '/manifest/review',
        label: 'Review & Apply',
        summary: 'Controleer wijzigingen voordat ze live gaan.',
        order: 0,
        category: 'runtime',
        blueprint: 'workspace',
        parentId: 'factory.runtime.manifest',
      },
    ],
  },
  {
    id: 'factory.control.settings',
    path: '/settings',
    label: 'Factory Settings',
    summary: 'Globale instellingen, tokens en toegangsbeheer.',
    order: 4,
    category: 'control',
    blueprint: 'core',
    panelRules: [
      {
        target: 'left',
        behavior: 'locked-open',
        mode: 'inline',
        defaultState: 'open',
        label: 'Instellingsnavigatie',
        payloadSlot: 'navigation',
      },
    ],
    children: [
      {
        id: 'factory.control.settings.access',
        path: '/settings/access',
        label: 'Toegang',
        summary: 'Rol- en toegangsbeheer.',
        order: 0,
        category: 'control',
        blueprint: 'system',
        parentId: 'factory.control.settings',
        guards: {
          featureFlag: 'rbac',
        },
      },
    ],
  },
  {
    id: 'factory.control.support',
    path: '/support',
    label: 'Support & Signals',
    summary: 'Diagnostiek, waarschuwingen en contactpunten.',
    order: 5,
    category: 'control',
    blueprint: 'workspace',
    panelRules: [
      {
        target: 'left',
        behavior: 'locked-open',
        mode: 'inline',
        defaultState: 'open',
        label: 'Supportnavigatie',
        payloadSlot: 'navigation',
      },
      {
        target: 'right',
        behavior: 'contextual',
        mode: 'overlay',
        defaultState: 'closed',
        label: 'Incidentdetails',
        payloadSlot: 'context',
      },
    ],
  },
];

export const FALLBACK_ROUTE_ID: RouteId = 'factory.hub';
