import { AgGridReact } from 'ag-grid-react';

export default function GridWrapper({ forwardedRef, ...props }) {
  const cleanProps = Object.fromEntries(
    Object.entries(props).filter(([key]) => !key.startsWith('data-'))
  );
  return <AgGridReact ref={forwardedRef} {...cleanProps} />;
}