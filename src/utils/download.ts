type ExportValue = string | number | boolean | null | undefined;
type ExportRow = Record<string, ExportValue>;

const triggerDownload = (content: string, mimeType: string, fileName: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
};

const escapeCsvValue = (value: ExportValue) => {
  const normalized = value === null || value === undefined ? "" : String(value);
  return `"${normalized.replaceAll('"', '""')}"`;
};

export const downloadJsonFile = (data: unknown, fileName: string) => {
  triggerDownload(JSON.stringify(data, null, 2), "application/json;charset=utf-8", fileName);
};

export const downloadCsvFile = (rows: ExportRow[], fileName: string) => {
  if (!rows.length) {
    triggerDownload("", "text/csv;charset=utf-8", fileName);
    return;
  }

  const headers = Array.from(
    rows.reduce((acc, row) => {
      Object.keys(row).forEach((key) => acc.add(key));
      return acc;
    }, new Set<string>())
  );

  const csvContent = [
    headers.map((header) => escapeCsvValue(header)).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(","))
  ].join("\n");

  triggerDownload(csvContent, "text/csv;charset=utf-8", fileName);
};
