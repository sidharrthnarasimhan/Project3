import { useState } from "react";
import { API_BASE_URL } from "@/config";
import { Upload, X, UserPlus, AlertCircle, CheckCircle2, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function BulkInviteDialog({ open, onClose, onInvite }) {
  const [activeTab, setActiveTab] = useState("paste");
  const [emailsText, setEmailsText] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [defaultRole, setDefaultRole] = useState("member");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  // Parse emails from text input
  const parseEmails = (text) => {
    // Split by newlines, commas, or semicolons
    const emails = text
      .split(/[\n,;]/)
      .map(email => email.trim().toLowerCase())
      .filter(email => email && email.includes('@'));

    return emails;
  };

  // Parse CSV file
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const invites = [];

    // Skip header if present
    const startIndex = lines[0].toLowerCase().includes('email') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const columns = lines[i].split(',').map(col => col.trim());

      if (columns.length >= 1 && columns[0].includes('@')) {
        invites.push({
          email: columns[0].toLowerCase(),
          role: columns[1] || defaultRole,
          name: columns[2] || '',
        });
      }
    }

    return invites;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        return;
      }

      setCsvFile(file);
      setError("");
    }
  };

  const handleSubmit = async () => {
    setError("");
    setIsProcessing(true);
    setResults(null);

    try {
      let invitations = [];

      if (activeTab === "paste") {
        // Parse from textarea
        const emails = parseEmails(emailsText);

        if (emails.length === 0) {
          throw new Error("Please enter at least one valid email address");
        }

        invitations = emails.map(email => ({
          email,
          role: defaultRole,
        }));
      } else {
        // Parse from CSV
        if (!csvFile) {
          throw new Error("Please upload a CSV file");
        }

        const text = await csvFile.text();
        invitations = parseCSV(text);

        if (invitations.length === 0) {
          throw new Error("No valid email addresses found in CSV file");
        }
      }

      // Send invitations
      const orgId = localStorage.getItem('current_org_id');
      const token = await window.Clerk.session.getToken();

      const successfulInvites = [];
      const failedInvites = [];

      for (const invitation of invitations) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/orgs/${orgId}/invitations`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(invitation)
          });

          if (response.ok) {
            successfulInvites.push(invitation.email);
          } else {
            const errorData = await response.json();
            failedInvites.push({
              email: invitation.email,
              reason: errorData.error?.message || 'Unknown error'
            });
          }
        } catch (err) {
          failedInvites.push({
            email: invitation.email,
            reason: err.message
          });
        }
      }

      setResults({
        total: invitations.length,
        successful: successfulInvites.length,
        failed: failedInvites.length,
        successfulEmails: successfulInvites,
        failedInvites: failedInvites,
      });

      // If all successful, call onInvite callback
      if (failedInvites.length === 0 && onInvite) {
        onInvite();
      }

      // Clear form if successful
      if (successfulInvites.length > 0) {
        setEmailsText("");
        setCsvFile(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'email,role,name\njohn@example.com,member,John Doe\njane@example.com,manager,Jane Smith';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-invite-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setEmailsText("");
    setCsvFile(null);
    setResults(null);
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Bulk Invite Team Members
          </DialogTitle>
          <DialogDescription>
            Invite multiple team members at once via email list or CSV file
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="paste">Paste Emails</TabsTrigger>
                <TabsTrigger value="csv">Upload CSV</TabsTrigger>
              </TabsList>

              <TabsContent value="paste" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emails">Email Addresses</Label>
                  <Textarea
                    id="emails"
                    placeholder="Enter email addresses (one per line, or separated by commas)&#10;&#10;Example:&#10;john@example.com&#10;jane@example.com, bob@example.com"
                    value={emailsText}
                    onChange={(e) => setEmailsText(e.target.value)}
                    rows={8}
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {parseEmails(emailsText).length} valid email{parseEmails(emailsText).length !== 1 ? 's' : ''} detected
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="csv" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-file">CSV File</Label>
                  <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 text-center">
                    {csvFile ? (
                      <div className="space-y-2">
                        <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" />
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{csvFile.name}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {(csvFile.size / 1024).toFixed(2)} KB
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCsvFile(null)}
                        >
                          Remove File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-12 h-12 mx-auto text-zinc-400" />
                        <div>
                          <label
                            htmlFor="csv-file"
                            className="cursor-pointer text-purple-600 hover:text-purple-700 font-medium"
                          >
                            Click to upload
                          </label>
                          <span className="text-zinc-500 dark:text-zinc-400"> or drag and drop</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          CSV file with email, role, and name columns
                        </p>
                      </div>
                    )}
                    <input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download CSV Template
                </Button>

                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-xs">
                    CSV format: email,role,name<br />
                    Roles: admin, manager, member, guest
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="default-role">Default Role (for paste mode)</Label>
              <Select value={defaultRole} onValueChange={setDefaultRole}>
                <SelectTrigger id="default-role" disabled={isProcessing}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Full access</SelectItem>
                  <SelectItem value="manager">Manager - Team management</SelectItem>
                  <SelectItem value="member">Member - Standard access</SelectItem>
                  <SelectItem value="guest">Guest - Limited access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending Invitations...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Send Invitations
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-4 space-y-4">
            <div className="text-center space-y-2">
              {results.failed === 0 ? (
                <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-600" />
              ) : (
                <AlertCircle className="w-16 h-16 mx-auto text-amber-600" />
              )}
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {results.failed === 0 ? 'All Invitations Sent!' : 'Invitations Processed'}
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{results.total}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Total</p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <p className="text-2xl font-bold text-emerald-600">{results.successful}</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">Successful</p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                <p className="text-2xl font-bold text-red-600">{results.failed}</p>
                <p className="text-sm text-red-700 dark:text-red-400">Failed</p>
              </div>
            </div>

            {results.failedInvites.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Failed Invitations:</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {results.failedInvites.map((fail, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertDescription className="text-xs">
                        <strong>{fail.email}</strong>: {fail.reason}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
