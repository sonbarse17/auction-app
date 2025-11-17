import React from 'react';
import { Button } from './Button';
import { Download } from 'lucide-react';
import { useToastStore } from '../stores/toastStore';

interface ExportButtonProps {
  data: any[];
  filename: string;
  type?: 'csv' | 'json';
}

export const ExportButton: React.FC<ExportButtonProps> = ({ data, filename, type = 'csv' }) => {
  const { addToast } = useToastStore();

  const exportToCSV = () => {
    if (data.length === 0) {
      addToast('No data to export', 'warning');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    addToast('Exported successfully', 'success');
  };

  const exportToJSON = () => {
    if (data.length === 0) {
      addToast('No data to export', 'warning');
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
    addToast('Exported successfully', 'success');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={type === 'csv' ? exportToCSV : exportToJSON} variant="secondary">
      <Download className="w-4 h-4 mr-2" />
      Export {type.toUpperCase()}
    </Button>
  );
};
