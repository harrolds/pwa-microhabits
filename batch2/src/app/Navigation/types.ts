export interface CommandDef {
  id: string
  path: string
  title: string
}

export interface RouteDef {
  path: string
  component: ()=> JSX.Element
  preload?: ()=> Promise<any>
}

export type CommandRegistry = Record<string, CommandDef>
