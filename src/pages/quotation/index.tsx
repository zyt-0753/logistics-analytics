import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Eye, 
  Pencil, 
  CheckCircle2, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Calendar as CalendarIcon 
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker"

// --- Types ---
interface PurchaseQuote {
  id: string
  quoteNo: string // P0001
  supplier: string
  origin: string
  destination: string
  productName: string
  serviceType: string // B2B/B2C/-
  status: 'DRAFT' | 'CONFIRMED'
  createdTime: string
  confirmedTime?: string
  // Details
  productNo?: string
  kgPerBatch?: string
  transportFee?: string
  operationFee?: string
  taxMode?: string
  currency?: string
  requirements?: string
  productNotes?: string // AI Text
}

interface SalesQuote {
  id: string
  quoteNo: string // S0001
  sourceQuoteNo: string // P0001
  origin: string
  destination: string
  productName: string
  serviceType: string
  status: 'DRAFT' | 'CONFIRMED'
  createdTime: string
  confirmedTime?: string
  // Details
  productNo?: string
  kgPerBatch?: string
  transportFee?: string
  operationFee?: string
  taxMode?: string
  csDeclaredAmount?: string
  compositeTaxRate?: string
  customerNotes?: string // AI Text
}

// --- Mock Data ---
const initialPurchaseQuotes: PurchaseQuote[] = [
  {
    id: '1',
    quoteNo: 'P0001',
    supplier: 'ABC Logistics',
    origin: 'China',
    destination: 'USA',
    productName: 'Electronics',
    serviceType: 'B2B',
    status: 'DRAFT',
    createdTime: '2025-02-01 10:00',
    productNotes: 'Ensure proper packaging for lithium batteries.',
    kgPerBatch: '100',
    transportFee: '5.5',
    operationFee: '2',
    taxMode: 'DDP',
    currency: 'USD'
  },
  {
    id: '2',
    quoteNo: 'P0002',
    supplier: 'XYZ Shipping',
    origin: 'Vietnam',
    destination: 'UK',
    productName: 'Textiles',
    serviceType: 'B2C',
    status: 'CONFIRMED',
    createdTime: '2025-01-28 09:00',
    confirmedTime: '2025-01-29 14:00',
    productNotes: 'Standard shipping.',
    kgPerBatch: '500',
    transportFee: '3.2',
    operationFee: '1.5',
    taxMode: 'DDU',
    currency: 'GBP'
  }
]

const initialSalesQuotes: SalesQuote[] = [
  {
    id: '1',
    quoteNo: 'S0001',
    sourceQuoteNo: 'P0002',
    origin: 'Vietnam',
    destination: 'UK',
    productName: 'Textiles',
    serviceType: 'B2C',
    status: 'DRAFT',
    createdTime: '2025-01-29 14:05',
    customerNotes: 'Estimated delivery: 15-20 days.',
    kgPerBatch: '500',
    transportFee: '4.5',
    operationFee: '2.0',
    taxMode: 'DDU',
    csDeclaredAmount: '5000',
    compositeTaxRate: '20%'
  }
]

export default function QuotationList() {
  const [purchaseQuotes, setPurchaseQuotes] = useState<PurchaseQuote[]>(initialPurchaseQuotes)
  const [salesQuotes, setSalesQuotes] = useState<SalesQuote[]>(initialSalesQuotes)
  const { toast } = useToast()

  // Dialog States
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<any>(null)
  const [detailType, setDetailType] = useState<'purchase' | 'sales'>('purchase')
  
  // Confirm Dialog
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [recordToConfirm, setRecordToConfirm] = useState<any>(null)
  const [confirmType, setConfirmType] = useState<'purchase' | 'sales'>('purchase')

  // --- Handlers ---

  const handleViewDetail = (record: any, type: 'purchase' | 'sales') => {
    setCurrentRecord(record)
    setDetailType(type)
    setIsDetailOpen(true)
  }

  const handleEdit = (record: any, type: 'purchase' | 'sales') => {
    toast({ title: "编辑功能", description: `编辑 ${type === 'purchase' ? '采购' : '销售'} 报价: ${record.quoteNo} (演示)` })
  }

  const handleConfirmClick = (record: any, type: 'purchase' | 'sales') => {
    setRecordToConfirm(record)
    setConfirmType(type)
    setIsConfirmDialogOpen(true)
  }

  const executeConfirm = () => {
    if (!recordToConfirm) return

    const now = new Date().toLocaleString()

    if (confirmType === 'purchase') {
      // 1. Update Purchase Quote Status
      setPurchaseQuotes(prev => prev.map(q => q.id === recordToConfirm.id ? { ...q, status: 'CONFIRMED', confirmedTime: now } : q))
      
      // 2. Trigger Sales Quote Generation (Mock AI)
      const newSalesQuote: SalesQuote = {
        id: Math.random().toString(36).substr(2, 9),
        quoteNo: `S${(salesQuotes.length + 1).toString().padStart(4, '0')}`,
        sourceQuoteNo: recordToConfirm.quoteNo,
        origin: recordToConfirm.origin,
        destination: recordToConfirm.destination,
        productName: recordToConfirm.productName,
        serviceType: recordToConfirm.serviceType,
        status: 'DRAFT',
        createdTime: now,
        customerNotes: `AI Generated Note based on ${recordToConfirm.productNotes || 'standard terms'}.`,
        kgPerBatch: recordToConfirm.kgPerBatch,
        transportFee: (Number(recordToConfirm.transportFee) * 1.2).toFixed(2), // Mock markup
        operationFee: (Number(recordToConfirm.operationFee) * 1.1).toFixed(2),
        taxMode: recordToConfirm.taxMode,
        csDeclaredAmount: '0',
        compositeTaxRate: '0%'
      }
      
      setSalesQuotes(prev => [newSalesQuote, ...prev])
      
      toast({ 
        title: "采购报价已确认", 
        description: `状态已更新，并自动生成销售报价草稿: ${newSalesQuote.quoteNo}`,
        className: "bg-green-100 border-green-500"
      })
    } else {
      // Sales Confirm
      setSalesQuotes(prev => prev.map(q => q.id === recordToConfirm.id ? { ...q, status: 'CONFIRMED', confirmedTime: now } : q))
       toast({ 
        title: "销售报价已确认", 
        description: `销售报价 ${recordToConfirm.quoteNo} 已生效`,
        className: "bg-green-100 border-green-500"
      })
    }
    
    setIsConfirmDialogOpen(false)
    setRecordToConfirm(null)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">报价管理</h1>
          <p className="text-muted-foreground">管理采购询价与销售报价</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建询价
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm flex-wrap">
         <div className="space-y-2 flex-1 min-w-[200px]">
          <label className="text-sm font-medium">报价单号</label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="搜索单号" className="pl-8" />
          </div>
        </div>
        
        <div className="space-y-2 w-[200px]">
          <label className="text-sm font-medium">状态</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">全部状态</SelectItem>
              <SelectItem value="DRAFT">草稿</SelectItem>
              <SelectItem value="CONFIRMED">已确认</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">创建时间</label>
          <CalendarDateRangePicker className="w-[260px]" />
        </div>
      </div>

      <Tabs defaultValue="purchase" className="space-y-4">
        <TabsList>
          <TabsTrigger value="purchase">采购报价 (Purchase)</TabsTrigger>
          <TabsTrigger value="sales">销售报价 (Sales)</TabsTrigger>
        </TabsList>

        <TabsContent value="purchase" className="space-y-4">
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>单号</TableHead>
                  <TableHead>供应商</TableHead>
                  <TableHead>路线 (起/终)</TableHead>
                  <TableHead>品名/服务</TableHead>
                  <TableHead>运费/操作费</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseQuotes.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.quoteNo}</TableCell>
                    <TableCell>{q.supplier}</TableCell>
                    <TableCell>{q.origin} → {q.destination}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{q.productName}</span>
                        <span className="text-xs text-muted-foreground">{q.serviceType}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{q.currency} {q.transportFee}/kg</span>
                        <span className="text-xs text-muted-foreground">Op: {q.operationFee}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={q.status === 'CONFIRMED' ? 'success' : 'secondary'}>
                        {q.status === 'CONFIRMED' ? '已确认' : '草稿'}
                      </Badge>
                    </TableCell>
                    <TableCell>{q.createdTime}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetail(q, 'purchase')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {q.status === 'DRAFT' && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(q, 'purchase')}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleConfirmClick(q, 'purchase')}>
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
           <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>单号</TableHead>
                  <TableHead>源采购单</TableHead>
                  <TableHead>路线</TableHead>
                  <TableHead>品名/服务</TableHead>
                  <TableHead>报价(预估)</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesQuotes.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.quoteNo}</TableCell>
                    <TableCell className="text-muted-foreground">{q.sourceQuoteNo}</TableCell>
                    <TableCell>{q.origin} → {q.destination}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{q.productName}</span>
                        <span className="text-xs text-muted-foreground">{q.serviceType}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                         {/* Mock currency as USD for sales default */}
                        <span>USD {q.transportFee}/kg</span>
                        <span className="text-xs text-muted-foreground">Op: {q.operationFee}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={q.status === 'CONFIRMED' ? 'success' : 'secondary'}>
                        {q.status === 'CONFIRMED' ? '已确认' : '草稿'}
                      </Badge>
                    </TableCell>
                    <TableCell>{q.createdTime}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetail(q, 'sales')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                         {q.status === 'DRAFT' && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(q, 'sales')}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleConfirmClick(q, 'sales')}>
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>报价详情 - {currentRecord?.quoteNo}</DialogTitle>
            <DialogDescription>
              {detailType === 'purchase' ? '采购报价详情' : '销售报价详情'}
            </DialogDescription>
          </DialogHeader>
          
          {currentRecord && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">路线</Label>
                <div className="font-medium">{currentRecord.origin} → {currentRecord.destination}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">服务类型</Label>
                <div>{currentRecord.serviceType}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">品名</Label>
                <div>{currentRecord.productName}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">单批重量(kg)</Label>
                <div>{currentRecord.kgPerBatch}</div>
              </div>
              
              <div className="col-span-2 border-t my-2"></div>
              
              <div className="space-y-1">
                <Label className="text-muted-foreground">运费单价</Label>
                <div className="font-bold text-lg">{currentRecord.currency || 'USD'} {currentRecord.transportFee}</div>
              </div>
               <div className="space-y-1">
                <Label className="text-muted-foreground">操作费</Label>
                <div>{currentRecord.currency || 'USD'} {currentRecord.operationFee}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">税金模式</Label>
                <div>{currentRecord.taxMode}</div>
              </div>
              
              <div className="col-span-2 space-y-1 bg-muted p-3 rounded-md">
                <Label className="text-muted-foreground">备注 (AI Analysis)</Label>
                <div className="text-sm">
                  {detailType === 'purchase' ? currentRecord.productNotes : currentRecord.customerNotes}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认报价?</DialogTitle>
            <DialogDescription>
              此操作将确认该报价单，并可能触发后续流程（如自动生成销售报价）。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>取消</Button>
            <Button onClick={executeConfirm}>确认生效</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}