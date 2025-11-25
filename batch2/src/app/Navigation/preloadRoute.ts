export async function preloadRoute(loader:()=>Promise<any>){
  return loader()
}
