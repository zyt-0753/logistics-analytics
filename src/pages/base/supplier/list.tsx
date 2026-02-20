import { useState } from "react"
import { 
  Search, 
  Filter, 
  Download,
  MoreHorizontal,
  Plus,
  Truck
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
interface Supplier {
  id: string;
  name: string;
  contactName: string;
  contactPhone: string;
  type: 'LOGISTICS' | 'WAREHOUSE' | 'CUSTOMS';
  status: 'ACTIVE' | 'INACTIVE';
  createTime: string;
}

// --- Mock Data ---
const initialSuppliers: Supplier[] = [
  { id: '1', name: 'FedEx Logistics', contactName: 'John Doe', contactPhone: '+1 555-0101', type: 'LOGISTICS', status: 'ACTIVE', createTime: '2024-01-15' },
  { id: '2', name: 'DHL Express', contactName: 'Jane Smith', contactPhone: '+44 20 7946 0958', type: 'LOGISTICS', status: 'ACTIVE', createTime: '2024-02-20' },
  { id: '3', name: 'Shenzhen Warehouse Co.', contactName: 'Li Wei', contactPhone: '+86 138 0013 8000', type: 'WAREHOUSE', status: 'INACTIVE', createTime: '2024-03-10' },
  { id: '4', name: 'Global Customs Broker', contactName: 'Wang Fang', contactPhone: '+86 139 0000 1111', type: 'CUSTOMS', status: 'ACTIVE', createTime: '2024-04-05' },
];

const typeMap = {
  LOGISTICS: { label: '物流商', color: 'default' },
  WAREHOUSE: { label: '仓储服务', color: 'secondary' },
  CUSTOMS: { label: '报关行', color: 'outline' },
};

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === suppliers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(suppliers.map(s => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">供应商管理</h1>
          <p className="text-muted-foreground">管理物流服务商、仓储服务商等合作伙伴信息</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新增供应商
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索供应商名称..."
            className="pl-8"
          />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="供应商类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">全部类型</SelectItem>
            <SelectItem value="LOGISTICS">物流商</SelectItem>
            <SelectItem value="WAREHOUSE">仓储服务</SelectItem>
            <SelectItem value="CUSTOMS">报关行</SelectItem>
          </SelectContent>
        </Select>
        <Select>
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
                  checked={selectedIds.length === suppliers.length && suppliers.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>供应商名称</TableHead>
              <TableHead>联系人</TableHead>
              <TableHead>联系电话</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedIds.includes(supplier.id)}
                    onCheckedChange={() => toggleSelect(supplier.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.contactName}</TableCell>
                <TableCell>{supplier.contactPhone}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {typeMap[supplier.type].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={supplier.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {supplier.status === 'ACTIVE' ? '启用' : '停用'}
                  </Badge>
                </TableCell>
                <TableCell>{supplier.createTime}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>操作</DropdownMenuLabel>
                      <DropdownMenuItem>编辑信息</DropdownMenuItem>
                      <DropdownMenuItem>费率配置</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">停用供应商</DropdownMenuItem>
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
