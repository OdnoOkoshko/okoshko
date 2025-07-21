import { useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { createRoot } from 'react-dom/client';

export default function GridWrapper(props) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const mountDiv = document.createElement('div');
      mountDiv.className = 'ag-theme-alpine';
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(mountDiv);

      const root = createRoot(mountDiv);
      root.render(<AgGridReact {...props} />);
    }
  }, [props]);

  return <div ref={containerRef} />;
}