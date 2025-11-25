export function loadPanel(loader:()=>Promise<any>){
  return loader().then(m=> m.default)
}