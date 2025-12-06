export interface INavigation {
  module: string,
  subModules?: Array<INavigation>
  icon?: string
}