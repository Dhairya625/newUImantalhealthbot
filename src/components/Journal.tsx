import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { Slider } from "@/components/ui/slider";
import { PenTool, Save, BookOpen, Calendar, Edit3, Trash2, Check, X, Network, Filter, Search, RotateCcw, ZoomIn, ZoomOut, Settings, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { useWellness } from "@/hooks/wellness-context";
import * as d3 from 'd3';

interface LocalEntryDraft {
  title: string;
  content: string;
}

interface JournalNode {
  id: string;
  title: string;
  content: string;
  date: string;
  timestamp: Date;
  sentiment?: 'positive' | 'negative' | 'neutral';
  category?: 'mindfulness' | 'health' | 'reflection' | 'exercise' | 'learning' | 'general';
  mood?: 'very-low' | 'low' | 'moderate' | 'high' | 'very-high';
  cluster?: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface JournalLink {
  source: string | JournalNode;
  target: string | JournalNode;
  strength: number;
  type: 'temporal' | 'semantic' | 'mood' | 'category';
}

const prompts = [
  "What am I grateful for today?",
  "How did I grow today?",
  "What challenged me and how did I handle it?",
  "What brought me joy today?",
  "What would I tell my younger self?",
];

export function Journal() {
  const {
    journalEntries = [],
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
  } = useWellness();
  const [currentEntry, setCurrentEntry] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  
  // Graph-related state
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [simulation, setSimulation] = useState<d3.Simulation<JournalNode, JournalLink> | null>(null);
  const [nodes, setNodes] = useState<JournalNode[]>([]);
  const [links, setLinks] = useState<JournalLink[]>([]);
  const [selectedNode, setSelectedNode] = useState<JournalNode | null>(null);
  const [showGraph, setShowGraph] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showRecentEntries, setShowRecentEntries] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    searchTerm: '',
    dateRange: 'all',
    category: 'all',
    sentiment: 'all',
    mood: 'all',
    showLinks: true,
    showClusters: true
  });
  
  // Graph settings
  const [graphSettings, setGraphSettings] = useState({
    linkDistance: 80,
    nodeSize: 12,
    chargeStrength: -400,
    centerStrength: 0.1,
    clusterStrength: 0.2
  });

  // Analyze journal entry content for sentiment, mood, and category
  const analyzeEntry = useCallback((content: string, title: string) => {
    const text = `${title} ${content}`.toLowerCase();
    
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'awesome', 'amazing', 'happy', 'joyful', 'calm', 'relaxed', 'peaceful', 'grateful', 'better', 'optimistic', 'wonderful', 'excellent', 'fantastic'];
    const negativeWords = ['bad', 'awful', 'terrible', 'horrible', 'sad', 'depressed', 'anxious', 'worried', 'stressed', 'overwhelmed', 'frustrated', 'angry', 'upset', 'disappointed'];
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';
    
    // Mood level detection
    let mood: 'very-low' | 'low' | 'moderate' | 'high' | 'very-high' = 'moderate';
    if (/(great|awesome|fantastic|amazing|grateful|happy|joyful|calm|relaxed|peaceful|wonderful|excellent)/.test(text)) {
      mood = 'very-low';
    } else if (/(good|fine|better|optimistic|content|satisfied|okay|alright)/.test(text)) {
      mood = 'low';
    } else if (/(stressed|anxious|worried|tense|overwhelmed|frustrated|upset)/.test(text)) {
      mood = 'high';
    } else if (/(awful|terrible|horrible|depressed|can't cope|panic|extreme|devastated)/.test(text)) {
      mood = 'very-high';
    }
    
    // Category detection
    let category: 'mindfulness' | 'health' | 'reflection' | 'exercise' | 'learning' | 'general' = 'general';
    if (/(breathing|meditation|mindfulness|calm|relax|zen|present|aware)/.test(text)) category = 'mindfulness';
    else if (/(walk|run|exercise|workout|gym|sport|fitness|physical)/.test(text)) category = 'exercise';
    else if (/(journal|reflect|gratitude|writing|thoughts|feelings|emotions)/.test(text)) category = 'reflection';
    else if (/(learn|read|study|class|course|skill|book|education)/.test(text)) category = 'learning';
    else if (/(health|doctor|medicine|sick|pain|healing|recovery)/.test(text)) category = 'health';
    
    return { sentiment, mood, category };
  }, []);

  const saveEntry = () => {
    const content = currentEntry.trim();
    if (!content) return;
    const title = (currentTitle.trim() || content.slice(0, 40) || "Untitled").trim();
    const date = new Date().toISOString().split('T')[0];
    // This is likely where the error "addJournalEntry is not a function" occurs.
    // Ensure this function is correctly provided by your WellnessProvider context.
    if (addJournalEntry) {
      addJournalEntry({ title, content, date });
    }
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
    if (updateJournalEntry) {
      updateJournalEntry(editingEntry!, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });
    }
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
      if (deleteJournalEntry) {
        deleteJournalEntry(entryId);
      }
    }
  };

  // Create graph data from journal entries
  const createGraphData = useCallback(() => {
    const journalNodes: JournalNode[] = journalEntries.map((entry, index) => {
      const analysis = analyzeEntry(entry.content, entry.title);
      return {
        id: entry.id,
        title: entry.title,
        content: entry.content,
        date: entry.date,
        timestamp: new Date(entry.date),
        ...analysis,
        cluster: Math.floor(index / 3) // Simple clustering by groups of 3
      };
    });

    const journalLinks: JournalLink[] = [];
    
    // Create temporal links (chronological order)
    for (let i = 0; i < journalNodes.length - 1; i++) {
      journalLinks.push({
        source: journalNodes[i].id,
        target: journalNodes[i + 1].id,
        strength: 1.0,
        type: 'temporal'
      });
    }
    
    // Create semantic links (similar content)
    for (let i = 0; i < journalNodes.length; i++) {
      for (let j = i + 1; j < journalNodes.length; j++) {
        const node1 = journalNodes[i];
        const node2 = journalNodes[j];
        
        // Calculate similarity based on common words
        const words1 = `${node1.title} ${node1.content}`.toLowerCase().split(/\s+/);
        const words2 = `${node2.title} ${node2.content}`.toLowerCase().split(/\s+/);
        const commonWords = words1.filter(word => words2.includes(word));
        const similarity = commonWords.length / Math.max(words1.length, words2.length);
        
        if (similarity > 0.2) {
          journalLinks.push({
            source: node1.id,
            target: node2.id,
            strength: similarity,
            type: 'semantic'
          });
        }
      }
    }
    
    // Create mood-based links
    const moodGroups = journalNodes.reduce((acc, node) => {
      if (!acc[node.mood!]) acc[node.mood!] = [];
      acc[node.mood!].push(node);
      return acc;
    }, {} as Record<string, JournalNode[]>);
    
    Object.values(moodGroups).forEach(group => {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          journalLinks.push({
            source: group[i].id,
            target: group[j].id,
            strength: 0.7,
            type: 'mood'
          });
        }
      }
    });
    
    // Create category-based links
    const categoryGroups = journalNodes.reduce((acc, node) => {
      if (!acc[node.category!]) acc[node.category!] = [];
      acc[node.category!].push(node);
      return acc;
    }, {} as Record<string, JournalNode[]>);
    
    Object.values(categoryGroups).forEach(group => {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          journalLinks.push({
            source: group[i].id,
            target: group[j].id,
            strength: 0.6,
            type: 'category'
          });
        }
      }
    });

    setNodes(journalNodes);
    setLinks(journalLinks);
  }, [journalEntries, analyzeEntry]);

  // Initialize and update simulation
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = dimensions.width;
    const height = dimensions.height;

    // Create force simulation
    const newSimulation = d3.forceSimulation<JournalNode>(nodes)
      .force('link', d3.forceLink<JournalNode, JournalLink>(links)
        .id(d => d.id)
        .distance(graphSettings.linkDistance)
        .strength(d => d.strength))
      .force('charge', d3.forceManyBody().strength(graphSettings.chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(graphSettings.centerStrength))
      .force('cluster', d3.forceY(height / 2).strength(graphSettings.clusterStrength));

    setSimulation(newSimulation);

    // Create container
    const container = svg.append('g');

    // Create links
    const link = container.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', d => {
        switch (d.type) {
          case 'temporal': return '#3b82f6';
          case 'semantic': return '#10b981';
          case 'mood': return '#f59e0b';
          case 'category': return '#8b5cf6';
          default: return '#6b7280';
        }
      })
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.strength) * 2);

    // Create nodes
    const node = container.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', graphSettings.nodeSize)
      .attr('fill', d => {
        switch (d.mood) {
          case 'very-low': return '#10b981';
          case 'low': return '#34d399';
          case 'moderate': return '#fbbf24';
          case 'high': return '#f97316';
          case 'very-high': return '#ef4444';
          default: return '#6b7280';
        }
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, JournalNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add labels
    const label = container.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text(d => d.title.length > 20 ? d.title.substring(0, 20) + '...' : d.title)
      .attr('font-size', '10px')
      .attr('font-family', 'Arial, sans-serif')
      .attr('fill', '#374151')
      .attr('text-anchor', 'middle')
      .attr('dy', graphSettings.nodeSize + 15);

    // Add node interactions
    node
      .on('click', (event, d) => {
        setSelectedNode(d);
        event.stopPropagation();
      })
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', graphSettings.nodeSize * 1.5);
        // Show tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${event.pageX - 10}, ${event.pageY - 10})`);
        
        tooltip.append('rect')
          .attr('width', 200)
          .attr('height', 120)
          .attr('fill', 'rgba(0, 0, 0, 0.8)')
          .attr('rx', 5);
        
        tooltip.append('text')
          .attr('x', 10)
          .attr('y', 20)
          .attr('fill', 'white')
          .text(`Title: ${d.title}`);
        
        tooltip.append('text')
          .attr('x', 10)
          .attr('y', 40)
          .attr('fill', 'white')
          .text(`Date: ${d.date}`);
        
        tooltip.append('text')
          .attr('x', 10)
          .attr('y', 60)
          .attr('fill', 'white')
          .text(`Mood: ${d.mood}`);
        
        tooltip.append('text')
          .attr('x', 10)
          .attr('y', 80)
          .attr('fill', 'white')
          .text(`Category: ${d.category}`);
        
        tooltip.append('text')
          .attr('x', 10)
          .attr('y', 100)
          .attr('fill', 'white')
          .text(d.content.length > 50 ? d.content.substring(0, 50) + '...' : d.content);
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', graphSettings.nodeSize);
        svg.selectAll('.tooltip').remove();
      });

    // Update positions on simulation tick
    newSimulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as JournalNode).x!)
        .attr('y1', d => (d.source as JournalNode).y!)
        .attr('x2', d => (d.target as JournalNode).x!)
        .attr('y2', d => (d.target as JournalNode).y!);

      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);

      label
        .attr('x', d => d.x!)
        .attr('y', d => d.y!);
    });

    // Drag functions
    function dragstarted(event: any, d: JournalNode) {
      if (!event.active) newSimulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: JournalNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: JournalNode) {
      if (!event.active) newSimulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      newSimulation.stop();
    };
  }, [nodes, links, dimensions, graphSettings]);

  // Update simulation when settings change
  useEffect(() => {
    if (!simulation) return;

    simulation
      .force('link', d3.forceLink<JournalNode, JournalLink>(links)
        .id(d => d.id)
        .distance(graphSettings.linkDistance)
        .strength(d => d.strength))
      .force('charge', d3.forceManyBody().strength(graphSettings.chargeStrength))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2).strength(graphSettings.centerStrength))
      .force('cluster', d3.forceY(dimensions.height / 2).strength(graphSettings.clusterStrength))
      .alpha(0.3)
      .restart();
  }, [simulation, graphSettings, dimensions, links]);

  // Initialize graph data
  useEffect(() => {
    if (journalEntries.length > 0) {
      createGraphData();
    }
  }, [journalEntries, analyzeEntry]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter journal entries
  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = !filters.searchTerm || 
      entry.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesDate = filters.dateRange === 'all' || 
      (filters.dateRange === 'today' && entry.date === new Date().toISOString().split('T')[0]) ||
      (filters.dateRange === 'week' && new Date(entry.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (filters.dateRange === 'month' && new Date(entry.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesDate;
  });

  const resetSimulation = () => {
    if (simulation) {
      simulation.alpha(1).restart();
    }
  };

  const zoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const container = svg.select('g');
      container.transition().duration(300).attr('transform', 'scale(1.2)');
    }
  };

  const zoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const container = svg.select('g');
      container.transition().duration(300).attr('transform', 'scale(0.8)');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-accent/20 to-tertiary/20 mb-6 float">
            <PenTool className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Daily Journal
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-3xl mx-auto">
            Reflect, process, and grow through mindful writing. Your thoughts matter.
          </p>
        </div>

        {/* Main Content with Popup Support */}
        <div className={`flex gap-6 transition-all duration-500 ${showGraph ? 'flex-row' : 'flex-col'}`}>
          {/* Left Column - Writing Interface */}
          <div className={`flex-1 flex flex-col ${showGraph ? 'w-1/2' : 'w-full max-w-4xl mx-auto'}`}>
            <div className="space-y-6">
              {/* Centered Entry Form */}
              <div className="flex justify-center">
                <Card className="p-8 rounded-2xl w-full max-w-2xl">
                  <div className="flex items-center justify-center mb-8">
                    <div className="bg-gradient-to-br from-accent/20 to-tertiary/20 p-4 rounded-2xl">
                      <PenTool className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-semibold ml-4">
                      {isWriting ? "Write Entry" : "Quick Entry"}
                    </h2>
                  </div>

                {isWriting && (
                  <div className="space-y-6">
                    <Input
                      value={currentTitle}
                      onChange={(e) => setCurrentTitle(e.target.value)}
                      placeholder="Entry title..."
                      className="text-lg rounded-xl"
                    />
                    {selectedPrompt && (
                      <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                        <p className="text-sm text-accent-foreground">Prompt: {selectedPrompt}</p>
                      </div>
                    )}
                    <Textarea
                      value={currentEntry}
                      onChange={(e) => setCurrentEntry(e.target.value)}
                      placeholder="What's on your mind? How was your day? What are you feeling?"
                      className="min-h-[250px] text-base leading-relaxed rounded-xl"
                    />
                    <div className="flex space-x-3">
                      <Button 
                        onClick={saveEntry}
                        disabled={!currentEntry.trim() || !currentTitle.trim()}
                        className="flex items-center space-x-2 rounded-xl"
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
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {!isWriting && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Input
                        value={currentTitle}
                        onChange={(e) => setCurrentTitle(e.target.value)}
                        placeholder="Title (optional)"
                        className="text-lg rounded-xl"
                      />
                      <Textarea
                        value={currentEntry}
                        onChange={(e) => setCurrentEntry(e.target.value)}
                        placeholder="Quick thoughts or reflection..."
                        className="min-h-[150px] rounded-xl"
                      />
                    </div>
                    <div className="flex justify-center">
                      <Button 
                        onClick={saveEntry}
                        disabled={!currentEntry.trim()}
                        size="lg"
                        className="rounded-xl px-8"
                      >
                        Save Entry
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Toggle Button for Journal Network */}
            <div className="flex justify-center mt-6">
              <Toggle
                pressed={showGraph}
                onPressedChange={setShowGraph}
                className="animate-in fade-in-50 duration-1000 delay-300"
              >
                <Network className="h-4 w-4 mr-2" />
                {showGraph ? 'Hide Network' : 'Show Network'}
              </Toggle>
            </div>
            </div>
          </div>

          {/* Journal Network Popup */}
          {showGraph && (
            <div className="w-1/2 animate-in slide-in-from-right-4 duration-700">
              <Card className="h-full flex flex-col p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <Network className="h-6 w-6" />
                    <h3 className="text-xl font-semibold">Journal Network</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowControls(!showControls)}
                      className="rounded-xl"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetSimulation} className="rounded-xl">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={zoomIn} className="rounded-xl">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={zoomOut} className="rounded-xl">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {showControls && (
                  <div className="mb-6 p-4 bg-muted rounded-xl space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Search Entries</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by title or content..."
                            value={filters.searchTerm}
                            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                            className="pl-10 rounded-xl"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Date Range</label>
                        <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Link Distance: {graphSettings.linkDistance}</label>
                        <Slider
                          value={[graphSettings.linkDistance]}
                          onValueChange={([value]) => setGraphSettings(prev => ({ ...prev, linkDistance: value }))}
                          min={20}
                          max={200}
                          step={10}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Node Size: {graphSettings.nodeSize}</label>
                        <Slider
                          value={[graphSettings.nodeSize]}
                          onValueChange={([value]) => setGraphSettings(prev => ({ ...prev, nodeSize: value }))}
                          min={6}
                          max={20}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Force-Directed Graph */}
                <div ref={containerRef} className="relative flex-1">
                  <svg
                    ref={svgRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    className="border rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 w-full h-full"
                  />
                  
                  {selectedNode && (
                    <div className="absolute top-4 right-4 p-4 bg-white rounded-xl shadow-lg max-w-sm">
                      <h4 className="font-semibold mb-2">Entry Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Title:</strong> {selectedNode.title}</div>
                        <div><strong>Date:</strong> {selectedNode.date}</div>
                        <div><strong>Mood:</strong> 
                          <Badge variant="outline" className="ml-2">
                            {selectedNode.mood}
                          </Badge>
                        </div>
                        <div><strong>Category:</strong> 
                          <Badge variant="outline" className="ml-2">
                            {selectedNode.category}
                          </Badge>
                        </div>
                        <div><strong>Content:</strong> {selectedNode.content.substring(0, 100)}...</div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 rounded-xl"
                        onClick={() => setSelectedNode(null)}
                      >
                        Close
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center rounded-xl">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Temporal Links
                  </Badge>
                  <Badge variant="outline" className="flex items-center rounded-xl">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Semantic Links
                  </Badge>
                  <Badge variant="outline" className="flex items-center rounded-xl">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    Mood Links
                  </Badge>
                  <Badge variant="outline" className="flex items-center rounded-xl">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    Category Links
                  </Badge>
                </div>
              </Card>
            </div>
          )}

          {/* Recent Entries Section - Only show when graph is not visible */}
          {!showGraph && (
            <div className="w-full max-w-4xl mx-auto mt-6">
              <Card className="rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowRecentEntries(!showRecentEntries)}
                  className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-secondary" />
                    <h2 className="text-xl font-semibold">
                      Recent Entries ({filteredEntries.length})
                    </h2>
                  </div>
                  {showRecentEntries ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                
                {showRecentEntries && (
                  <div className="px-6 pb-6">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {filteredEntries.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No journal entries found. Start writing to see them here!</p>
                        </div>
                      ) : (
                        filteredEntries.map((entry) => (
                          <div key={entry.id} className="p-4 rounded-xl bg-muted/30 border border-border">
                            {editingEntry === entry.id ? (
                              // Edit mode
                              <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                  <Input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="font-semibold text-base flex-1 mr-2 rounded-xl"
                                    placeholder="Entry title..."
                                  />
                                  <span className="text-sm text-muted-foreground whitespace-nowrap">{entry.date}</span>
                                </div>
                                <Textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="text-sm leading-relaxed min-h-[120px] rounded-xl"
                                  placeholder="Entry content..."
                                />
                                <div className="flex items-center justify-end space-x-2">
                                  <Button
                                    onClick={saveEdit}
                                    disabled={!editTitle.trim() || !editContent.trim()}
                                    size="sm"
                                    className="flex items-center space-x-1 rounded-xl"
                                  >
                                    <Check className="h-3 w-3" />
                                    <span>Save</span>
                                  </Button>
                                  <Button
                                    onClick={cancelEdit}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center space-x-1 rounded-xl"
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
                                        className="h-8 w-8 p-0 hover:bg-accent/20 rounded-xl"
                                      >
                                        <Edit3 className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        onClick={() => handleDelete(entry.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive rounded-xl"
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
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}