import React from 'react';

interface ToolbarProps {
  showGrid: boolean;
  wireframe: boolean;
  onToggleGrid: () => void;
  onToggleWireframe: () => void;
  onExport: (format: 'STEP' | 'STL' | 'IGES' | 'glTF') => void;
}

const btnStyle: React.CSSProperties = {
  background: '#2d2d30',
  color: '#cccccc',
  border: '1px solid #454545',
  borderRadius: 4,
  padding: '4px 10px',
  cursor: 'pointer',
  fontSize: 12,
  userSelect: 'none',
};

const activeBtnStyle: React.CSSProperties = {
  ...btnStyle,
  background: '#094771',
  color: '#ffffff',
};

export const Toolbar: React.FC<ToolbarProps> = ({
  showGrid,
  wireframe,
  onToggleGrid,
  onToggleWireframe,
  onExport,
}) => (
  <div
    style={{
      position: 'absolute',
      top: 8,
      left: 8,
      display: 'flex',
      gap: 6,
      zIndex: 10,
      flexWrap: 'wrap',
    }}
  >
    <button style={showGrid ? activeBtnStyle : btnStyle} onClick={onToggleGrid}>
      Grid
    </button>
    <button style={wireframe ? activeBtnStyle : btnStyle} onClick={onToggleWireframe}>
      Wireframe
    </button>
    <button style={btnStyle} onClick={() => onExport('STEP')}>STEP</button>
    <button style={btnStyle} onClick={() => onExport('STL')}>STL</button>
    <button style={btnStyle} onClick={() => onExport('glTF')}>glTF</button>
  </div>
);
