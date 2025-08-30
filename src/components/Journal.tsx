import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PenTool, Save, BookOpen, Calendar, Edit3, Trash2, Check, X } from "lucide-react";
import { useWellness } from "@/hooks/wellness-context";

interface LocalEntryDraft {
  title: string;
  content: string;
}

const prompts = [
  "What am I grateful for today?",
  "How did I grow today?",
  "What challenged me and how did I handle it?",
  "What brought me joy today?",
  "What would I tell my younger self?",
];

export function Journal() {
  const { journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useWellness();
  const [currentEntry, setCurrentEntry] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const saveEntry = () => {
    const content = currentEntry.trim();
    if (!content) return;
    const title = (currentTitle.trim() || content.slice(0, 40) || "Untitled").trim();
    const date = new Date().toISOString().split('T')[0];
    addJournalEntry({ title, content, date });
    setCurrentEntry("");
    setCurrentTitle("");
    setSelectedPrompt("");
    setIsWriting(false);
  };

  const usePrompt = (prompt: string) => {
    setSelectedPrompt(prompt);
    setCurrentTitle(prompt);
    setIsWriting(true);
  };

  const startEdit = (entry: any) => {
    setEditingEntry(entry.id);
    setEditTitle(entry.title);
    setEditContent(entry.content);
  };

  const saveEdit = () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    updateJournalEntry(editingEntry!, {
      title: editTitle.trim(),
      content: editContent.trim()
    });
    setEditingEntry(null);
    setEditTitle("");
    setEditContent("");
  };

  const cancelEdit = () => {
    setEditingEntry(null);
    setEditTitle("");
    setEditContent("");
  };

  const handleDelete = (entryId: string) => {
    if (confirm("Are you sure you want to delete this journal entry?")) {
      deleteJournalEntry(entryId);
    }
  };

  return (
    <div className="space-y-8 wellness-enter max-w-6xl mx-auto">
      {/* Enhanced Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-tertiary/20 mb-4 float">
          <PenTool className="h-8 w-8 text-accent" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Daily Journal
        </h1>
        <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
          Reflect, process, and grow through mindful writing. Your thoughts matter.
        </p>
      </div>

      {/* Enhanced Writing Prompts */}
      {!isWriting && (
        <Card className="glass-card-intense p-8 bg-gradient-to-br from-tertiary/10 to-accent/5 border-0">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent/20 to-tertiary/20 flex items-center justify-center mr-3">
              <BookOpen className="h-5 w-5 text-accent" />
            </div>
            Writing Prompts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => usePrompt(prompt)}
                className="glass-card p-6 text-left group hover:scale-105 transition-all duration-300 interactive-card bg-gradient-to-br from-card/40 to-card/60 border-0"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-br from-accent to-tertiary rounded-full mt-3 flex-shrink-0"></div>
                  <p className="font-medium text-foreground group-hover:text-accent transition-colors duration-200">{prompt}</p>
                </div>
                <div className="mt-4 flex items-center text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span>Click to start writing</span>
                  <div className="ml-2 w-1 h-4 bg-gradient-to-b from-accent to-transparent rounded-full"></div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* New Entry Form */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <PenTool className="h-5 w-5 mr-2 text-primary" />
            {isWriting ? "Write Entry" : "Quick Entry"}
          </h2>
          {!isWriting && (
            <Button onClick={() => setIsWriting(true)} variant="outline" size="sm">
              Start Writing
            </Button>
          )}
        </div>

        {isWriting && (
          <div className="space-y-4">
            <Input
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              placeholder="Entry title..."
              className="text-lg"
            />
            {selectedPrompt && (
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm text-accent-foreground">Prompt: {selectedPrompt}</p>
              </div>
            )}
            <Textarea
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
              placeholder="What's on your mind? How was your day? What are you feeling?"
              className="min-h-[200px] text-base leading-relaxed"
            />
            <div className="flex space-x-2">
              <Button 
                onClick={saveEntry}
                disabled={!currentEntry.trim() || !currentTitle.trim()}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Entry</span>
              </Button>
              <Button 
                onClick={() => {
                  setIsWriting(false);
                  setCurrentEntry("");
                  setCurrentTitle("");
                  setSelectedPrompt("");
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!isWriting && (
          <Textarea
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            placeholder="Quick thoughts or reflection..."
            className="min-h-[100px]"
          />
        )}

        {!isWriting && (
          <div className="mt-4 flex space-x-2">
            <Input
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              placeholder="Title (optional)"
              className="flex-1"
            />
            <Button 
              onClick={saveEntry}
              disabled={!currentEntry.trim()}
              size="sm"
            >
              Save
            </Button>
          </div>
        )}
      </Card>

      {/* Recent Entries */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-secondary" />
          Recent Entries
        </h2>
        <div className="space-y-4">
          {journalEntries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No journal entries yet. Start writing to see them here!</p>
            </div>
          ) : (
            journalEntries.map((entry) => (
              <div key={entry.id} className="p-4 rounded-xl bg-muted/30 border border-border">
                {editingEntry === entry.id ? (
                  // Edit mode
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="font-semibold text-base flex-1 mr-2"
                        placeholder="Entry title..."
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">{entry.date}</span>
                    </div>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="text-sm leading-relaxed min-h-[120px]"
                      placeholder="Entry content..."
                    />
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        onClick={saveEdit}
                        disabled={!editTitle.trim() || !editContent.trim()}
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Check className="h-3 w-3" />
                        <span>Save</span>
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <X className="h-3 w-3" />
                        <span>Cancel</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{entry.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{entry.date}</span>
                        <div className="flex items-center space-x-1">
                          <Button
                            onClick={() => startEdit(entry)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-accent/20"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(entry.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}