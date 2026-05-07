import React from 'react';
import { ExportFormat } from '../../../types';

interface ToolbarProps {
  showGrid: boolean;
  wireframe: boolean;
  scale: number;
  supportedFormats: ExportFormat[];
  engineLabel: string | null;
  onToggleGrid: () => void;
  onToggleWireframe: () => void;
  onScaleChange: (scale: number) => void;
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

const disabledBtnStyle: React.CSSProperties = {
  ...btnStyle,
  opacity: 0.45,
  cursor: 'not-allowed',
};

export const Toolbar: React.FC<ToolbarProps> = ({
  showGrid,
  wireframe,
  scale,
  supportedFormats,
  engineLabel,
  onToggleGrid,
  onToggleWireframe,
  onScaleChange,
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
      alignItems: 'center',
    }}
  >
    <button style={showGrid ? activeBtnStyle : btnStyle} onClick={onToggleGrid}>
      Grid
    </button>
    <button style={wireframe ? activeBtnStyle : btnStyle} onClick={onToggleWireframe}>
      Wireframe
    </button>
    <div style={{ ...btnStyle, display: 'flex', alignItems: 'center', gap: 6, cursor: 'default' }}>
      <span>Scale: {scale.toFixed(2)}</span>
      <input
        className='scale-slider'
        type="range"
        min="0.01"
        max="10.0"
        step="0.01"
        value={scale}
        onChange={(e) => onScaleChange(parseFloat(e.target.value))}
        style={{ width: 80, cursor: 'pointer' }}
      />
    </div>
    {exportFormats.map((format) => (
      <button
        key={format}
        style={supportedFormats.includes(format) ? btnStyle : disabledBtnStyle}
        onClick={() => onExport(format)}
        disabled={!supportedFormats.includes(format)}
        title={!supportedFormats.includes(format) ? `${engineLabel ?? 'Current engine'} does not support ${format}` : undefined}
      >
        {format}
      </button>
    ))}
  </div>
);
