import { useState } from "react"
import { 
  Search, 
  Filter, 
  Download,
  MoreHorizontal,
  Plus,
  Plane
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// --- Types ---
interface InternationalLine {
  id: string;
  name: string;
  code: string;
  destinationCountry: string;
  transporter: string;
  status: 'ACTIVE' | 'INACTIVE';
  createTime: string;
}

// --- Mock Data ---
const initialLines: InternationalLine[] = [
  { id: '1', name: 'US Express Special', code: 'US-EXP-001', destinationCountry: 'USA', transporter: 'FedEx', status: 'ACTIVE', createTime: '2024-01-10' },
  { id: '2', name: 'EU Economy Line', code: 'EU-ECO-002', destinationCountry: 'Germany', transporter: 'DHL', status: 'ACTIVE', createTime: '2024-02-15' },
  { id: '3', name: 'Japan Direct', code: 'JP-DIR-003', destinationCountry: 'Japan', transporter: 'Sagawa', status: 'INACTIVE', createTime: '2024-03-20' },
  { id: '4', name: 'Mexico Standard', code: 'MX-STD-004', destinationCountry: 'Mexico', transporter: 'Estafeta', status: 'ACTIVE', createTime: '2024-04-12' },
];

export default function InternationalLineList() {
  const [lines, setLines] = useState<InternationalLine[]>(initialLines);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const toggleSelectAll = () => {
    if (selectedIds.length === lines.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(lines.map(l => l.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredLines = lines.filter(line => {
    const matchesSearch = 
      line.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      line.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = countryFilter === "ALL" || line.destinationCountry === countryFilter;
    const matchesStatus = statusFilter === "ALL" || line.status === statusFilter;
    
    return matchesSearch && matchesCountry && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">国际线路管理</h1>
          <p className="text-muted-foreground">管理跨境物流线路、目的地与承运商配置</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新增线路
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索线路名称或代码..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="目的地国家" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">全部国家</SelectItem>
            <SelectItem value="USA">美国 (USA)</SelectItem>
            <SelectItem value="Germany">德国 (DEU)</SelectItem>
            <SelectItem value="Japan">日本 (JPN)</SelectItem>
            <SelectItem value="Mexico">墨西哥 (MEX)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">全部状态</SelectItem>
            <SelectItem value="ACTIVE">启用</SelectItem>
            <SelectItem value="INACTIVE">停用</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedIds.length === lines.length && lines.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>线路名称</TableHead>
              <TableHead>线路代码</TableHead>
              <TableHead>目的地国家</TableHead>
              <TableHead>承运商</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLines.map((line) => (
              <TableRow key={line.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedIds.includes(line.id)}
                    onCheckedChange={() => toggleSelect(line.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{line.name}</TableCell>
                <TableCell>{line.code}</TableCell>
                <TableCell>{line.destinationCountry}</TableCell>
                <TableCell>{line.transporter}</TableCell>
                <TableCell>
                  <Badge variant={line.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {line.status === 'ACTIVE' ? '启用' : '停用'}
                  </Badge>
                </TableCell>
                <TableCell>{line.createTime}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>操作</DropdownMenuLabel>
                      <DropdownMenuItem>编辑线路</DropdownMenuItem>
                      <DropdownMenuItem>分区配置</DropdownMenuItem>
                      <DropdownMenuItem>价格配置</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">停用线路</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
