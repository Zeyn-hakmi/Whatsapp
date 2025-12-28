import { Node } from '@xyflow/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NodeEditorProps {
  node: Node | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: Record<string, unknown>) => void;
}

export function NodeEditor({ node, onClose, onUpdate }: NodeEditorProps) {
  if (!node) return null;

  const data = node.data as Record<string, unknown>;

  const handleChange = (key: string, value: unknown) => {
    onUpdate(node.id, { ...data, [key]: value });
  };

  const handleButtonChange = (index: number, field: string, value: string) => {
    const buttons = [...((data.buttons as { id: string; title: string }[]) || [])];
    buttons[index] = { ...buttons[index], [field]: value };
    onUpdate(node.id, { ...data, buttons });
  };

  const addButton = () => {
    const buttons = [...((data.buttons as { id: string; title: string }[]) || [])];
    if (buttons.length < 3) {
      buttons.push({ id: `btn-${Date.now()}`, title: `Option ${buttons.length + 1}` });
      onUpdate(node.id, { ...data, buttons });
    }
  };

  const removeButton = (index: number) => {
    const buttons = [...((data.buttons as { id: string; title: string }[]) || [])];
    buttons.splice(index, 1);
    onUpdate(node.id, { ...data, buttons });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="w-80 bg-sidebar border-l border-sidebar-border p-4 flex flex-col gap-4 overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Edit Node</h3>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={(data.label as string) || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              placeholder="Node label"
            />
          </div>

          {node.type === 'message' && (
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={(data.message as string) || ''}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Enter your message..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Use {'{{variable}}'} for dynamic content
              </p>
            </div>
          )}

          {node.type === 'quickReply' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="body">Body Text</Label>
                <Textarea
                  id="body"
                  value={(data.body as string) || ''}
                  onChange={(e) => handleChange('body', e.target.value)}
                  placeholder="Select an option:"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Buttons (max 3)</Label>
                  {((data.buttons as unknown[]) || []).length < 3 && (
                    <Button variant="ghost" size="sm" onClick={addButton}>
                      <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {((data.buttons as { id: string; title: string }[]) || []).map((btn, idx) => (
                    <div key={btn.id} className="flex items-center gap-2">
                      <Input
                        value={btn.title}
                        onChange={(e) => handleButtonChange(idx, 'title', e.target.value)}
                        placeholder={`Button ${idx + 1}`}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeButton(idx)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {node.type === 'condition' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="variable">Variable</Label>
                <Input
                  id="variable"
                  value={(data.variable as string) || ''}
                  onChange={(e) => handleChange('variable', e.target.value)}
                  placeholder="user_response"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="operator">Operator</Label>
                <Select
                  value={(data.operator as string) || 'equals'}
                  onValueChange={(value) => handleChange('operator', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals (==)</SelectItem>
                    <SelectItem value="not_equals">Not Equals (!=)</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="greater_than">Greater Than (&gt;)</SelectItem>
                    <SelectItem value="less_than">Less Than (&lt;)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  value={(data.value as string) || ''}
                  onChange={(e) => handleChange('value', e.target.value)}
                  placeholder="expected_value"
                />
              </div>
            </>
          )}

          {node.type === 'apiCall' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="method">HTTP Method</Label>
                <Select
                  value={(data.method as string) || 'GET'}
                  onValueChange={(value) => handleChange('method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={(data.url as string) || ''}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="https://api.example.com/endpoint"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="saveAs">Save Response As</Label>
                <Input
                  id="saveAs"
                  value={(data.saveAs as string) || ''}
                  onChange={(e) => handleChange('saveAs', e.target.value)}
                  placeholder="api_response"
                />
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
