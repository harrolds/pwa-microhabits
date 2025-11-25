import { useSheetStore } from '../state/useSheetStore'
export const openSheet=(id:string)=> useSheetStore.setState({current:id})
export const closeSheet=()=> useSheetStore.setState({current:null})
