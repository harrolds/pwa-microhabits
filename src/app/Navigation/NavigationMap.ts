import { NAVIGATION_BLUEPRINT, type NavigationRouteDefinition, type PanelRule, type RouteId } from './routes';

type RouteOrigin = 'blueprint' | 'manifest';

export interface ManifestNavigationExtension
  extends Partial<Omit<NavigationRouteDefinition, 'children' | 'order'>> {
  id: RouteId;
  path: string;
  label: string;
  summary: string;
  order?: number;
  parentId?: RouteId;
  panelRules?: PanelRule[];
  children?: ManifestNavigationExtension[];
}

export interface ManifestNavigationSpecV2 {
  version: string;
  navigation?: {
    extends?: ManifestNavigationExtension[];
  };
}

interface MutableRoute extends Omit<NavigationRouteDefinition, 'children'> {
  children: MutableRoute[];
  __origin: RouteOrigin;
}

export interface NavigationNode extends Omit<NavigationRouteDefinition, 'children'> {
  children: NavigationNode[];
  depth: number;
  breadcrumb: string[];
  origin: RouteOrigin;
  parent?: RouteId;
}

const cloneDefinition = (input: NavigationRouteDefinition): MutableRoute => ({
  ...input,
  children: (input.children ?? []).map(cloneDefinition),
  __origin: 'blueprint',
});

const findRoute = (nodes: MutableRoute[], id: RouteId): MutableRoute | undefined => {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    const child = findRoute(node.children, id);
    if (child) {
      return child;
    }
  }
  return undefined;
};

const addChild = (nodes: MutableRoute[], child: MutableRoute, parentId?: RouteId) => {
  if (!parentId) {
    nodes.push(child);
    return;
  }
  const parent = findRoute(nodes, parentId);
  if (!parent) {
    nodes.push(child);
    return;
  }
  parent.children.push(child);
};

const applyExtension = (route: MutableRoute, patch: ManifestNavigationExtension) => {
  route.label = patch.label ?? route.label;
  route.summary = patch.summary ?? route.summary;
  route.path = patch.path ?? route.path;
  route.order = patch.order ?? route.order;
  route.category = patch.category ?? route.category;
  route.panelRules = patch.panelRules ?? route.panelRules;
  route.parentId = patch.parentId ?? route.parentId;
  route.tags = patch.tags ?? route.tags;
  route.blueprint = patch.blueprint ?? route.blueprint;
};

const integrateExtensions = (tree: MutableRoute[], extensions: ManifestNavigationExtension[]) => {
  extensions.forEach((extension) => {
    const existing = findRoute(tree, extension.id);
    if (existing) {
      applyExtension(existing, extension);
      existing.__origin = existing.__origin === 'blueprint' ? 'blueprint' : existing.__origin;
      if (extension.children?.length) {
        integrateExtensions(existing.children, extension.children);
      }
      return;
    }

    const node: MutableRoute = {
      id: extension.id,
      path: extension.path,
      label: extension.label,
      summary: extension.summary,
      order: extension.order ?? 99,
      category: extension.category ?? 'runtime',
      blueprint: extension.blueprint ?? 'workspace',
      parentId: extension.parentId,
      icon: extension.icon,
      hero: extension.hero,
      tags: extension.tags,
      panelRules: extension.panelRules,
      manifestBinding: extension.manifestBinding,
      guards: extension.guards,
      children: [],
      __origin: 'manifest',
    };

    if (extension.children?.length) {
      integrateExtensions(node.children, extension.children);
    }

    addChild(tree, node, extension.parentId);
  });
};

const sortTree = (nodes: MutableRoute[]) => {
  nodes.sort((a, b) => a.order - b.order);
  nodes.forEach((node) => sortTree(node.children));
};

const toNavigationNode = (route: MutableRoute, parent: NavigationNode | undefined): NavigationNode => {
  const node: NavigationNode = {
    ...route,
    children: [],
    depth: parent ? parent.depth + 1 : 0,
    breadcrumb: parent ? [...parent.breadcrumb, route.label] : [route.label],
    origin: route.__origin,
    parent: parent?.id,
  };
  node.children = route.children.map((child) => toNavigationNode(child, node));
  return node;
};

export const buildNavigationMap = (manifest?: ManifestNavigationSpecV2 | null): NavigationNode[] => {
  const workingTree = NAVIGATION_BLUEPRINT.map(cloneDefinition);

  if (manifest?.navigation?.extends?.length) {
    integrateExtensions(workingTree, manifest.navigation.extends);
  }

  sortTree(workingTree);

  return workingTree.map((route) => toNavigationNode(route, undefined));
};

