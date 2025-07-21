import { AgGridReact } from 'ag-grid-react'

export default function GridWrapper({ forwardedRef, ...rest }) {
  return <AgGridReact ref={forwardedRef} {...rest} />
}