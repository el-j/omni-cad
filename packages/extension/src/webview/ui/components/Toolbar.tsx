import React from 'react';
import { ExportFormat } from '../../../types';

interface ToolbarProps {
  showGrid: boolean;
  wireframe: boolean;
  supportedFormats: ExportFormat[];
  engineLabel: string | null;
  onToggleGrid: () => void;
  onToggleWireframe: () => void;
  onExport: (format: ExportFormat) => void;
}

const exportFormats: ExportFormat[] = ['STEP', 'STL', 'IGES', 'glTF'];

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
  supportedFormats,
  engineLabel,
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
    {exportFormats.map((format) => (
      <button
        key={format}
        style={btnStyle}
        onClick={() => onExport(format)}
        disabled={!supportedFormats.includes(format)}
        title={!supportedFormats.includes(format) ? `${engineLabel ?? 'Current engine'} does not support ${format}` : undefined}
      >
        {format}
      </button>
    ))}
  </div>
);
