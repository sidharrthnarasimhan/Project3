import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";

export default function TaskImportDialog({ open, onClose, onImport, users = [] }) {
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    title: "",
    description: "",
    assignee: "",
    priority: "",
    due_date: "",
    status: "",
  });
  const [step, setStep] = useState(1); // 1: Upload, 2: Map Columns, 3: Preview

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    // Validate file type
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(uploadedFile.type) && !uploadedFile.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    setFile(uploadedFile);

    // Read and parse CSV
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      parseCSV(text);
    };
    reader.readAsText(uploadedFile);
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      toast.error("CSV file is empty");
      return;
    }

    // Parse headers
    const headerLine = lines[0];
    const parsedHeaders = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    setHeaders(parsedHeaders);

    // Parse data rows
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      if (values.length === parsedHeaders.length) {
        const row = {};
        parsedHeaders.forEach((header, index) => {
          row[header] = values[index];
        });
        rows.push(row);
      }
    }

    setCsvData(rows);
    setStep(2);
    toast.success(`Loaded ${rows.length} rows from CSV`);
  };

  const generatePreview = () => {
    return csvData.map(row => {
      const task = {};

      Object.entries(columnMapping).forEach(([field, csvColumn]) => {
        if (csvColumn && row[csvColumn]) {
          task[field] = row[csvColumn];
        }
      });

      // Set defaults for missing required fields
      if (!task.title) task.title = "Untitled Task";
      if (!task.status) task.status = "todo";
      if (!task.priority) task.priority = "medium";

      return task;
    }).filter(task => task.title && task.title !== "");
  };

  const handleImport = async () => {
    const tasksToImport = generatePreview();

    if (tasksToImport.length === 0) {
      toast.error("No valid tasks to import");
      return;
    }

    await onImport(tasksToImport);
    handleClose();
    toast.success(`Successfully imported ${tasksToImport.length} tasks!`);
  };

  const handleClose = () => {
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setColumnMapping({
      title: "",
      description: "",
      assignee: "",
      priority: "",
      due_date: "",
      status: "",
    });
    setStep(1);
    onClose();
  };

  const preview = step === 3 ? generatePreview() : [];
  const canProceed = step === 2 && columnMapping.title;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import Tasks from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file and map columns to create tasks in bulk
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Step 1: Upload File */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 text-center hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-zinc-400 dark:text-zinc-500" />
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                    Click to upload CSV file
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Supported format: CSV (.csv)
                  </p>
                </label>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  CSV Format Example:
                </h4>
                <pre className="text-xs text-blue-800 dark:text-blue-400 bg-white dark:bg-zinc-900 p-3 rounded overflow-x-auto">
{`title,description,assignee,priority,due_date,status
"Update documentation","Add API examples",user@example.com,high,2026-01-15,todo
"Fix bug #123","Memory leak in dashboard",dev@example.com,urgent,2026-01-10,in_progress`}
                </pre>
              </div>
            </div>
          )}

          {/* Step 2: Map Columns */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 mb-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Found <span className="font-semibold text-zinc-900 dark:text-zinc-100">{csvData.length} rows</span> with columns: {headers.join(', ')}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1">
                    Title <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={columnMapping.title}
                    onValueChange={(value) => setColumnMapping({ ...columnMapping, title: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column for task title" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map(header => (
                        <SelectItem key={header} value={header}>{header}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <Select
                    value={columnMapping.description}
                    onValueChange={(value) => setColumnMapping({ ...columnMapping, description: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {headers.map(header => (
                        <SelectItem key={header} value={header}>{header}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Assignee</Label>
                  <Select
                    value={columnMapping.assignee}
                    onValueChange={(value) => setColumnMapping({ ...columnMapping, assignee: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {headers.map(header => (
                        <SelectItem key={header} value={header}>{header}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <Select
                      value={columnMapping.priority}
                      onValueChange={(value) => setColumnMapping({ ...columnMapping, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None (default: medium)</SelectItem>
                        {headers.map(header => (
                          <SelectItem key={header} value={header}>{header}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Due Date</Label>
                    <Select
                      value={columnMapping.due_date}
                      onValueChange={(value) => setColumnMapping({ ...columnMapping, due_date: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {headers.map(header => (
                          <SelectItem key={header} value={header}>{header}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Select
                    value={columnMapping.status}
                    onValueChange={(value) => setColumnMapping({ ...columnMapping, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (default: todo)</SelectItem>
                      {headers.map(header => (
                        <SelectItem key={header} value={header}>{header}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!canProceed}
                >
                  Preview Tasks
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-lg p-4">
                <p className="text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Ready to import {preview.length} tasks
                </p>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2 border dark:border-zinc-700 rounded-lg p-4">
                {preview.map((task, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-sm"
                  >
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">{task.title}</div>
                    {task.description && (
                      <div className="text-zinc-600 dark:text-zinc-400 text-xs mt-1">{task.description}</div>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {task.priority && (
                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                          {task.priority}
                        </span>
                      )}
                      {task.status && (
                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                          {task.status}
                        </span>
                      )}
                      {task.due_date && (
                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                          Due: {task.due_date}
                        </span>
                      )}
                      {task.assignee && (
                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                          {task.assignee}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  Back to Mapping
                </Button>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleImport} className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Import {preview.length} Tasks
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
