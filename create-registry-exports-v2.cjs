#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// List of all airiot components to create re-exports for
const components = [
  'bar', 'button', 'chart-echarts', 'connect-widget', 'container-app-page',
  'container-card', 'container-carousel', 'container-context-provider',
  'container-iteration', 'container-modal', 'container-panel', 'container-popover',
  'container-tabs', 'data-point', 'data-view-chart', 'datasource-api',
  'datasource-history', 'datasource-interface', 'datasource-message',
  'datasource-realtime', 'datasource-table', 'datasource-view', 'events',
  'filter-area', 'filter-bool', 'filter-date', 'filter-datetime', 'filter-enum',
  'filter-form', 'filter-input-select', 'filter-log-type', 'filter-number',
  'filter-relate-select', 'filter-relate-unique', 'filter-single-date',
  'filter-table-select', 'filter-text', 'filter-text-boolean', 'filter-user-role',
  'filter-warning-type', 'flow-log', 'flow-log-view', 'form', 'form-area',
  'form-array', 'form-bytes-array', 'form-checkbox', 'form-date', 'form-date-range',
  'form-editable-card', 'form-editable-table', 'form-field', 'form-form-info',
  'form-input', 'form-input-number', 'form-link', 'form-map', 'form-object',
  'form-radio', 'form-rate', 'form-reference', 'form-relate', 'form-relate-async-select',
  'form-relate-component', 'form-relate-detail-show', 'form-relate-model-select',
  'form-relate-multi-select', 'form-relate-plus', 'form-relate-plus-add-record-btn',
  'form-relate-plus-data-select', 'form-relate-plus-data-show', 'form-relate-select',
  'form-rich-text', 'form-select', 'form-serial-number', 'form-slider',
  'form-switch', 'form-table-view', 'form-tableField', 'form-textarea', 'form-time',
  'form-upload', 'form-user-role', 'gis-code-editor', 'gis-custom-layer',
  'gis-geojson-parse', 'gis-geoserver-wms', 'gis-kmz-loader', 'gis-map-core',
  'gis-polygon-draw', 'gis-shared-utils', 'gis-table-layer', 'gis-warn-layer',
  'gis-xyz-tile', 'iframe', 'image', 'mobile-calendar', 'mobile-date-picker',
  'mobile-location', 'mobile-nav-bar', 'mobile-picker', 'mobile-popup', 'mobile-scan-qr',
  'model-3d', 'model-3d-card', 'model-3d-geometry-box', 'model-3d-geometry-circle',
  'model-3d-geometry-cone', 'model-3d-geometry-cylinder', 'model-3d-geometry-plane',
  'model-3d-geometry-sphere', 'model-3d-geometry-tube', 'model-3d-layout-3d',
  'model-3d-mesh', 'model-3d-points', 'player', 'qrcode', 'query-editor',
  'query-editor-methods', 'schema-form', 'status', 'svg', 'table-data-select',
  'table-select', 'text', 'textarea', 'video-button', 'video-isc',
  'video-periods-widget', 'video-playback-widget', 'video-time-axis', 'video-widget',
  'view-actions', 'view-advanced-filter', 'view-batch', 'view-data-aggregate',
  'view-data-table', 'view-demo', 'view-detail', 'view-field-attachment',
  'view-field-boolean', 'view-field-bytes-array', 'view-field-date',
  'view-field-date-range', 'view-field-editable-table', 'view-field-form-info',
  'view-field-formula', 'view-field-link', 'view-field-map', 'view-field-number',
  'view-field-password', 'view-field-rate', 'view-field-reference', 'view-field-relate',
  'view-field-rich-text', 'view-field-select', 'view-field-serial-number',
  'view-field-slider', 'view-field-text', 'view-field-textarea', 'view-field-time',
  'view-field-user-role', 'view-filter', 'view-model', 'view-pagination',
  'view-permission', 'view-tools'
];

// Components that don't exist in airiot directory
const nonExistent = ['video-isc', 'video-time-axis', 'view-demo'];

const baseDir = 'D:/我的项目/文件分析/mes-frontend/src/registry/components';

components.forEach(comp => {
  const compDir = path.join(baseDir, comp);
  
  // Create directory
  if (!fs.existsSync(compDir)) {
    fs.mkdirSync(compDir, { recursive: true });
  }
  
  // Create re-export file (without default export to avoid errors)
  const exportFile = path.join(compDir, `${comp}.ts`);
  
  if (nonExistent.includes(comp)) {
    // Create stub for non-existent components
    const stubContent = `// Stub for ${comp} (component does not exist in airiot)\nexport const ${comp.replace(/-([a-z])/g, (g) => g[1].toUpperCase())} = () => null;\n`;
    fs.writeFileSync(exportFile, stubContent, 'utf8');
  } else {
    // Re-export without default
    const content = `// Re-export from airiot ${comp}\nexport * from '@/components/airiot/${comp}/${comp}';\n`;
    fs.writeFileSync(exportFile, content, 'utf8');
  }
  
  console.log(`Created: ${exportFile}`);
});

console.log('Done!');
