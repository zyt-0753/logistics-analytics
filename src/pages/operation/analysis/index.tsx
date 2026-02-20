import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { addDays, format, startOfMonth, endOfMonth, subDays, subMonths } from "date-fns"
import { zhCN } from "date-fns/locale"
import { DateRange } from "react-day-picker"
import { Calendar as CalendarIcon, HelpCircle } from "lucide-react"
import { Download, Edit2, Search, RefreshCw, Filter } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as XLSX from "xlsx"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// --- 类型定义 ---

interface TaxAnalysisRecord {
  id: string
  createTime: string
  originCountry: string
  destCountry: string
  supplierWaybillNo: string
  merchantOrderNo: string      // 商家订单号
  trackingNo: string
  goodsValue: number
  declaredValue: number
  declaredRatio: string        // 申报比例
  estimatedTax: number
  estimatedTaxRate: string     // 预估税率
  actualTax: number
  actualTaxRate: string        // 实际税率 (原 taxRatio)
  estimatedTaxOnActualValue: number // 实际货值预估税费
  diffAmount: number           // 对比差异
  remark: string
}

const EXCHANGE_RATE = 7.78 // USD to HKD 汇率

// --- 模拟数据辅助函数 ---
const createRecord = (
    id: string, 
    createTime: string, 
    originCountry: string, 
    destCountry: string, 
    supplierWaybillNo: string, 
    merchantOrderNo: string,
    trackingNo: string, 
    goodsValue: number, 
    declaredValue: number, 
    estimatedTax: number, 
    actualTax: number, 
    remark: string
): TaxAnalysisRecord => {
    // 申报比例：（申报货值/实际货值）×100%
    const declaredRatioVal = goodsValue > 0 ? declaredValue / goodsValue : 0
    
    // 预估税率：（预估税费/申报货值）×100%
    // 注意：estimatedTax 为 HKD, declaredValue 为 USD，计算时需统一币种
    const estimatedTaxRateVal = declaredValue > 0 ? estimatedTax / (declaredValue * EXCHANGE_RATE) : 0

    // 实际税率：（实际税费 / 申报货值）×100%
    // 注意：actualTax 为 HKD, declaredValue 为 USD，计算时需统一币种
    const actualTaxRateVal = declaredValue > 0 ? actualTax / (declaredValue * EXCHANGE_RATE) : 0

    // 实际货值预估税费 = 实际货值 × 实际税率
    // 结果转换为 HKD (因为实际货值 goodsValue 是 USD, actualTaxRateVal 是比率, 需乘汇率转为 HKD)
    const estimatedTaxOnActualValue = goodsValue * actualTaxRateVal * EXCHANGE_RATE

    // 对比差异：实际货值预估税费 - 实际税费
    const diffAmount = estimatedTaxOnActualValue - actualTax

    return {
        id,
        createTime,
        originCountry,
        destCountry,
        supplierWaybillNo,
        merchantOrderNo,
        trackingNo,
        goodsValue,
        declaredValue,
        declaredRatio: (declaredRatioVal * 100).toFixed(2) + "%",
        estimatedTax,
        estimatedTaxRate: (estimatedTaxRateVal * 100).toFixed(2) + "%",
        actualTax,
        actualTaxRate: (actualTaxRateVal * 100).toFixed(2) + "%",
        estimatedTaxOnActualValue,
        diffAmount,
        remark
    }
}

const initialData: TaxAnalysisRecord[] = [
  createRecord(
    "1", "2023-10-01 10:00:00", "CHN", "USA", "SUP2023001", "M2023001", "TRK888001", 
    1000.00, 800.00, 80.00, 85.00, "首批测试订单"
  ),
  createRecord(
    "2", "2023-10-02 14:30:00", "CHN", "GBR", "SUP2023002", "M2023002", "TRK888002", 
    2000.00, 1800.00, 360.00, 360.00, ""
  ),
  createRecord(
    "3", "2023-10-03 09:15:00", "VNM", "DEU", "SUP2023003", "M2023003", "TRK888003", 
    1500.00, 1500.00, 285.00, 300.00, "需关注清关状态"
  ),
  createRecord(
    "4", "2023-10-05 16:20:00", "CHN", "FRA", "SUP2023004", "M2023004", "TRK888004",
    800.00, 1000.00, 100.00, 120.00, "差异为负数测试"
  ),
  createRecord(
    "5", "2023-10-06 11:10:00", "USA", "JPN", "SUP2023005", "M2023005", "TRK888005",
    1200.00, 1100.00, 110.00, 105.00, "电子产品"
  ),
  createRecord(
    "6", "2023-10-07 13:45:00", "DEU", "CHN", "SUP2023006", "M2023006", "TRK888006",
    3000.00, 2800.00, 420.00, 400.00, "精密仪器"
  ),
  createRecord(
    "7", "2023-10-08 15:20:00", "GBR", "USA", "SUP2023007", "M2023007", "TRK888007",
    500.00, 500.00, 50.00, 48.00, "服装样品"
  ),
  createRecord(
    "8", "2023-10-09 09:30:00", "JPN", "CHN", "SUP2023008", "M2023008", "TRK888008",
    2500.00, 2400.00, 240.00, 230.00, "化妆品"
  ),
  createRecord(
    "9", "2023-10-10 10:50:00", "VNM", "USA", "SUP2023009", "M2023009", "TRK888009",
    1800.00, 1600.00, 160.00, 170.00, "家具配件"
  ),
  createRecord(
    "10", "2023-10-11 14:15:00", "CHN", "DEU", "SUP2023010", "M2023010", "TRK888010",
    4000.00, 3800.00, 570.00, 600.00, "大宗货物"
  ),
]

const countryOptions = [
  { label: "CHN(中国)", value: "CHN" },
  { label: "USA(美国)", value: "USA" },
  { label: "GBR(英国)", value: "GBR" },
  { label: "DEU(德国)", value: "DEU" },
  { label: "VNM(越南)", value: "VNM" },
  { label: "JPN(日本)", value: "JPN" },
]

const countryNameMap: Record<string, string> = {
  "CHN": "中国",
  "USA": "美国",
  "GBR": "英国",
  "DEU": "德国",
  "VNM": "越南",
  "JPN": "日本",
}

const getCountryName = (code: string) => countryNameMap[code] || code

// --- 组件：多选下拉框 ---

function MultiSelect({
  title,
  options,
  selected,
  onChange,
}: {
  title: string
  options: { label: string; value: string }[]
  selected: string[]
  onChange: (values: string[]) => void
}) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-normal">
          <span className="truncate">
            {selected.length === 0
              ? title
              : `已选 ${selected.length} 项`}
          </span>
          <Filter className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <div className="p-2 border-b">
          <div className="flex items-center border rounded-md px-2 bg-background">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input 
              placeholder="搜索..." 
              className="h-8 w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="text-sm text-center py-6 text-muted-foreground">
              无匹配结果
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = selected.includes(option.value)
              return (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  onClick={() => {
                    if (isSelected) {
                      onChange(selected.filter((v) => v !== option.value))
                    } else {
                      onChange([...selected, option.value])
                    }
                  }}
                >
                  <Checkbox checked={isSelected} id={`ms-${title}-${option.value}`} />
                  <label
                    htmlFor={`ms-${title}-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    onClick={(e) => e.stopPropagation()} // Prevent double toggle if label is clicked
                  >
                    {option.label}
                  </label>
                </div>
              )
            })
          )}
        </div>
        {selected.length > 0 && (
            <div className="border-t p-2">
                 <Button variant="ghost" size="sm" className="w-full justify-center h-6 text-xs" onClick={() => onChange([])}>
                    清空选择
                 </Button>
            </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// --- 组件：日期范围选择器 ---
function DatePickerWithRange({
  className,
  date,
  setDate,
}: {
  className?: string
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "yyyy-MM-dd", { locale: zhCN })} -{" "}
                  {format(date.to, "yyyy-MM-dd", { locale: zhCN })}
                </>
              ) : (
                format(date.from, "yyyy-MM-dd", { locale: zhCN })
              )
            ) : (
              <span>请选择日期范围</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <div className="flex flex-col space-y-2 p-2 border-r">
              <Button 
                variant="ghost" 
                className="justify-start text-left font-normal" 
                onClick={() => setDate({ from: subDays(new Date(), 7), to: new Date() })}
              >
                最近7天
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start text-left font-normal" 
                onClick={() => setDate({ from: subDays(new Date(), 30), to: new Date() })}
              >
                最近30天
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start text-left font-normal" 
                onClick={() => setDate({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })}
              >
                本月
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start text-left font-normal" 
                onClick={() => {
                  const lastMonth = subMonths(new Date(), 1)
                  setDate({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) })
                }}
              >
                上月
              </Button>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              locale={zhCN}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// --- 主页面组件 ---

export default function AnalysisDashboard() {
  const [data, setData] = useState<TaxAnalysisRecord[]>(initialData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<TaxAnalysisRecord | null>(null)
  const [remarkInput, setRemarkInput] = useState("")
  const { toast } = useToast()

  // 导出弹窗状态
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportType, setExportType] = useState<"query" | "selection">("query")
  // 列表选择状态
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set())

  // 查询状态
  const [originCountries, setOriginCountries] = useState<string[]>([])
  const [destCountries, setDestCountries] = useState<string[]>([])
  const [supplierWaybillNo, setSupplierWaybillNo] = useState("")
  const [trackingNo, setTrackingNo] = useState("")
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  
  // 统计面板筛选状态 - 移除独立的statsDestCountry，改为使用生效的查询条件
  const [appliedDestCountries, setAppliedDestCountries] = useState<string[]>([])

  // 币种选择状态
  const [currency, setCurrency] = useState<"HKD" | "USD">("HKD")
  const currencySymbol = currency === "HKD" ? "HKD" : "USD"

  // 金额转换辅助函数
  const convertMoney = (amount: number, baseCurrency: "USD" | "HKD") => {
    if (currency === baseCurrency) return amount
    if (currency === "HKD" && baseCurrency === "USD") return amount * EXCHANGE_RATE
    if (currency === "USD" && baseCurrency === "HKD") return amount / EXCHANGE_RATE
    return amount
  }

  // 基础数据源
  const statsSource = {
    "CHN": { totalOrders: 450, goodsValue: 15500.00, declaredValue: 13500.00, actualTax: 10900.00 }, // 调整实际税费以符合约10%税率
    "USA": { totalOrders: 342, goodsValue: 12500.00, declaredValue: 11000.00, actualTax: 9350.00 },
    "GBR": { totalOrders: 256, goodsValue: 9800.00, declaredValue: 8500.00, actualTax: 7400.00 },
    "DEU": { totalOrders: 189, goodsValue: 7500.00, declaredValue: 7000.00, actualTax: 6200.00 },
    "VNM": { totalOrders: 120, goodsValue: 4000.00, declaredValue: 3800.00, actualTax: 3250.00 },
    "JPN": { totalOrders: 80, goodsValue: 3000.00, declaredValue: 2800.00, actualTax: 2350.00 },
  }

  // 计算统计数据
  const getStatsData = (selectedCountries: string[]) => {
    // 如果没有选择目的地，默认统计所有
    const targets = selectedCountries.length === 0 ? Object.keys(statsSource) : selectedCountries
    
    let totalOrders = 0
    let goodsValue = 0
    let declaredValue = 0
    let actualTax = 0
    
    targets.forEach(code => {
      const data = statsSource[code as keyof typeof statsSource]
      if (data) {
        totalOrders += data.totalOrders
        goodsValue += data.goodsValue
        declaredValue += data.declaredValue
        actualTax += data.actualTax
      }
    })

    // 计算实际税率平均比例 = (总实际税费[HKD] / (总申报货值[USD] * 汇率)) * 100%
    // 注意：数据源中 actualTax 为 HKD，declaredValue 为 USD，计算比例时需统一为 HKD
    const taxRatio = declaredValue > 0 ? ((actualTax / (declaredValue * EXCHANGE_RATE)) * 100).toFixed(2) + "%" : "0.00%"

    return {
        totalOrders,
        goodsValue,
        declaredValue,
        actualTax,
        taxRatio
    }
  }

  const currentStats = getStatsData(appliedDestCountries)

  // 处理全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowIds(new Set(data.map(item => item.id)))
    } else {
      setSelectedRowIds(new Set())
    }
  }

  // 处理单行选择
  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRowIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedRowIds(newSelected)
  }

  // 处理导出点击
  const handleExportClick = () => {
    setIsExportDialogOpen(true)
  }

  // 确认导出
  const handleConfirmExport = () => {
    setIsExportDialogOpen(false)
    
    // 1. Determine data to export
    let exportData = data
    if (exportType === "selection") {
        if (selectedRowIds.size === 0) {
        toast({
            title: "导出失败",
            description: "请先勾选需要导出的数据",
            variant: "destructive"
        })
        return
        }
        exportData = data.filter(item => selectedRowIds.has(item.id))
    }

    // 2. Map to Excel rows (matching UI columns)
    // Define headers and data separately to control styling and formulas
    
    // Header
    const headers = [
      "订单创建时间", "起始地国家/地区", "目的地国家/地区", "供应商运单号", "商家订单号", "快递单号",
      `实际货值(${currencySymbol})`, `申报货值(${currencySymbol})`, "申报比例",
      `预估税费(${currencySymbol})`, "预估税率",
      `实际税费(${currencySymbol})`, "实际税率",
      `实际货值预估税费(${currencySymbol})`, `对比差异(${currencySymbol})`, "备注"
    ]

    // Rows
    const dataRows = exportData.map((row, index) => {
        const rowIndex = index + 2 // 1-based index, +1 for header
        
        // Convert monetary values to number type for formulas to work
        // Keep them as numbers, not strings
        const goodsVal = Number(convertMoney(row.goodsValue, "USD").toFixed(2))
        const declaredVal = Number(convertMoney(row.declaredValue, "USD").toFixed(2))
        const estimatedTax = Number(convertMoney(row.estimatedTax, "HKD").toFixed(2))
        const actualTax = Number(convertMoney(row.actualTax, "HKD").toFixed(2))

        return [
            { v: row.createTime, t: 's', s: { alignment: { horizontal: "center", vertical: "center" } } },
            { v: getCountryName(row.originCountry), t: 's', s: { alignment: { horizontal: "center", vertical: "center" } } },
            { v: getCountryName(row.destCountry), t: 's', s: { alignment: { horizontal: "center", vertical: "center" } } },
            { v: row.supplierWaybillNo, t: 's', s: { alignment: { horizontal: "center", vertical: "center" } } },
            { v: row.merchantOrderNo, t: 's', s: { alignment: { horizontal: "center", vertical: "center" } } },
            { v: row.trackingNo, t: 's', s: { alignment: { horizontal: "center", vertical: "center" } } },
            // G: Actual Goods Value
            { v: goodsVal, t: 'n', s: { alignment: { horizontal: "center", vertical: "center" } } },
            // H: Declared Value
            { v: declaredVal, t: 'n', s: { alignment: { horizontal: "center", vertical: "center" } } },
            // I: Declared Ratio = Declared / Actual = H / G
            { f: `H${rowIndex}/G${rowIndex}`, t: 'n', z: '0.00%', s: { alignment: { horizontal: "center", vertical: "center" } } },
            // J: Estimated Tax
            { v: estimatedTax, t: 'n', s: { alignment: { horizontal: "center", vertical: "center" } } },
            // K: Estimated Tax Rate = Est Tax / Declared = J / H
            { f: `J${rowIndex}/H${rowIndex}`, t: 'n', z: '0.00%', s: { alignment: { horizontal: "center", vertical: "center" } } },
            // L: Actual Tax
            { v: actualTax, t: 'n', s: { alignment: { horizontal: "center", vertical: "center" } } },
            // M: Actual Tax Rate = Actual Tax / Declared = L / H
            { f: `L${rowIndex}/H${rowIndex}`, t: 'n', z: '0.00%', s: { alignment: { horizontal: "center", vertical: "center" } } },
            // N: Est Tax on Actual Value = Actual Value * Actual Tax Rate = G * M
            { f: `G${rowIndex}*M${rowIndex}`, t: 'n', s: { alignment: { horizontal: "center", vertical: "center" } } },
            // O: Diff = Est Tax on Actual - Actual Tax = N - L
            { f: `N${rowIndex}-L${rowIndex}`, t: 'n', s: { alignment: { horizontal: "center", vertical: "center" } } },
            // P: Remark
            { v: row.remark || "", t: 's', s: { alignment: { horizontal: "center", vertical: "center" } } }
        ]
    })

    // 3. Generate Worksheet and Workbook manually to support styles
    const worksheet: any = XLSX.utils.aoa_to_sheet([
        headers.map(h => ({ v: h, t: 's', s: { font: { bold: true }, alignment: { horizontal: "center", vertical: "center" }, fill: { fgColor: { rgb: "EFEFEF" } } } })),
        ...dataRows
    ])

    // Set column widths
    const colWidths = [
        { wch: 20 }, // A: Time
        { wch: 15 }, // B: Origin
        { wch: 15 }, // C: Dest
        { wch: 15 }, // D: Supplier No
        { wch: 15 }, // E: Merchant No
        { wch: 15 }, // F: Tracking No
        { wch: 12 }, // G: Goods Val
        { wch: 12 }, // H: Declared Val
        { wch: 10 }, // I: Declared Ratio
        { wch: 12 }, // J: Est Tax
        { wch: 10 }, // K: Est Rate
        { wch: 12 }, // L: Actual Tax
        { wch: 10 }, // M: Actual Rate
        { wch: 15 }, // N: Est Tax on Actual
        { wch: 12 }, // O: Diff
        { wch: 20 }, // P: Remark
    ]
    worksheet["!cols"] = colWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "税费分析数据")

    // 4. Write file
    XLSX.writeFile(workbook, `税费分析数据_${format(new Date(), "yyyyMMddHHmmss")}.xlsx`)

    toast({
      title: "导出成功",
      description: exportType === "query" ? "已根据查询条件导出税费分析报表" : `已导出 ${selectedRowIds.size} 条选中数据`,
    })
  }

  // 打开备注编辑弹窗
  const handleEditRemark = (record: TaxAnalysisRecord) => {
    setCurrentRecord(record)
    setRemarkInput(record.remark)
    setIsDialogOpen(true)
  }

  // 保存备注
  const handleSaveRemark = () => {
    if (currentRecord) {
      const newData = data.map((item) =>
        item.id === currentRecord.id ? { ...item, remark: remarkInput } : item
      )
      setData(newData)
      toast({
        title: "保存成功",
        description: "备注信息已更新",
      })
      setIsDialogOpen(false)
    }
  }

  // 模拟查询
  const handleSearch = () => {
    setAppliedDestCountries(destCountries) // 触发统计数据更新
    toast({ title: "查询成功", description: "统计数据已更新" })
    // 这里应添加实际列表查询逻辑
  }

  const handleReset = () => {
    setOriginCountries([])
    setDestCountries([])
    setSupplierWaybillNo("")
    setTrackingNo("")
    setDate({
        from: addDays(new Date(), -30),
        to: new Date(),
    })
    setAppliedDestCountries([]) // 重置统计数据
    toast({ title: "重置查询条件" })
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">数据分析</h2>
        <div className="flex flex-col items-end gap-1">
            <div className="flex items-center space-x-2">
                <Label>币种：</Label>
                <Select value={currency} onValueChange={(val: "HKD" | "USD") => setCurrency(val)}>
                    <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="选择币种" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="HKD">HKD</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                </Select>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>USD转换HKD的汇率为7.78</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
      </div>

      <Tabs defaultValue="tax" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tax">货值-税费分析</TabsTrigger>
        </TabsList>
        <TabsContent value="tax" className="space-y-4">
          
          {/* 1. 查询条件 (调整至最上方) */}
          <Card>
            <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label>起始地国家/地区</Label>
                        <MultiSelect 
                            title="请选择起始地国家/地区"
                            options={countryOptions}
                            selected={originCountries}
                            onChange={setOriginCountries}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>目的地国家/地区</Label>
                        <MultiSelect 
                            title="请选择目的地国家/地区"
                            options={countryOptions}
                            selected={destCountries}
                            onChange={setDestCountries}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>供应商运单号</Label>
                        <Input 
                            placeholder="请输入供应商运单号" 
                            value={supplierWaybillNo}
                            onChange={(e) => setSupplierWaybillNo(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>快递单号</Label>
                        <Input 
                            placeholder="请输入快递单号" 
                            value={trackingNo}
                            onChange={(e) => setTrackingNo(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>创建时间</Label>
                        <DatePickerWithRange date={date} setDate={setDate} />
                    </div>
                    <div className="flex items-end space-x-2">
                        <Button onClick={handleSearch}>
                            <Search className="mr-2 h-4 w-4" /> 查询
                        </Button>
                        <Button variant="outline" onClick={handleReset}>
                            <RefreshCw className="mr-2 h-4 w-4" /> 重置
                        </Button>
                        <Button variant="secondary" onClick={handleExportClick}>
                            <Download className="mr-2 h-4 w-4" /> 导出
                        </Button>
                    </div>
                </div>
            </CardContent>
          </Card>

          <div className="border-t my-4"></div>

          {/* 2. 数据统计分析面板 (调整至中间，并移除独立筛选) */}
          <TooltipProvider>
          <div className="grid gap-4">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">订单总量</CardTitle>
                    <span className="text-muted-foreground">📦</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{currentStats.totalOrders.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">实际货值</CardTitle>
                    <span className="text-muted-foreground">{currencySymbol}</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{convertMoney(currentStats.goodsValue, "USD").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">申报货值</CardTitle>
                    <span className="text-muted-foreground">{currencySymbol}</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{convertMoney(currentStats.declaredValue, "USD").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">实际税费</CardTitle>
                    <span className="text-muted-foreground">{currencySymbol}</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{convertMoney(currentStats.actualTax, "HKD").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-1">
                      实际税率平均比例
                      <Tooltip>
                        <TooltipTrigger><HelpCircle className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent>
                          <p>计算公式：(总实际税费 ÷ 总申报货值) × 100%</p>
                          <p className="text-xs text-muted-foreground mt-1">说明：基于当前筛选数据的加权平均值，计算时自动统一币种</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardTitle>
                    <span className="text-muted-foreground">%</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{currentStats.taxRatio}</div>
                  </CardContent>
                </Card>
             </div>
          </div>
          </TooltipProvider>

          <div className="border-t my-4"></div>

          {/* 3. 数据列表 */}
          <div className="rounded-md border bg-white overflow-x-auto">
            <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">
                    <Checkbox 
                        checked={data.length > 0 && selectedRowIds.size === data.length}
                        onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                    />
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap">订单创建时间</TableHead>
                  <TableHead className="text-center whitespace-nowrap">起止国家/地区</TableHead>
                  <TableHead className="text-center whitespace-nowrap">供应商运单号</TableHead>
                  <TableHead className="text-center whitespace-nowrap">商家订单号</TableHead>
                  <TableHead className="text-center whitespace-nowrap">快递单号</TableHead>
                  <TableHead className="w-[180px] whitespace-nowrap">
                  实际货值
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="h-3 w-3 ml-1 inline text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent>
                        <p>客户下单时传输的实际货值</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  申报货值
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="h-3 w-3 ml-1 inline text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent>
                        <p>根据不同渠道的申报计算逻辑得到的货值结果</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  申报比例
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="h-3 w-3 ml-1 inline text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent>
                        <p>(申报货值÷实际货值) × 100%</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  预估税费
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="h-3 w-3 ml-1 inline text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent>
                        <p>根据报价表的预估税费进行计算和展示</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  预估税率
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="h-3 w-3 ml-1 inline text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent>
                        <p>(预估税费÷申报货值) × 100%</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  实际税费
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="h-3 w-3 ml-1 inline text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent>
                        <p>EXCEL读取展示 / 根据报价表的实际税费进行计算和展示</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  实际税率
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="h-3 w-3 ml-1 inline text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent>
                        <p>(实际税费 ÷ 申报货值) × 100%</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    实际货值预估税费
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent>
                        <p>实际货值 × 实际税率</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableHead>
                <TableHead className="text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    对比差异
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent>
                        <p>实际货值预估税费 减去 实际税费</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableHead>
                  <TableHead className="text-center whitespace-nowrap">备注</TableHead>
                  <TableHead className="text-center w-[100px] whitespace-nowrap">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-center">
                        <Checkbox 
                            checked={selectedRowIds.has(row.id)}
                            onCheckedChange={(checked) => handleSelectRow(row.id, checked as boolean)}
                        />
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">{row.createTime}</TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-center justify-center">
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">起始地:</span>
                                <Badge variant="secondary" className="bg-orange-400 hover:bg-orange-500 text-white border-none rounded-sm px-1.5 py-0 text-[10px] h-5 min-w-[40px] justify-center">
                                {getCountryName(row.originCountry)}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">目的地:</span>
                                <Badge variant="secondary" className="bg-orange-400 hover:bg-orange-500 text-white border-none rounded-sm px-1.5 py-0 text-[10px] h-5 min-w-[40px] justify-center">
                                {getCountryName(row.destCountry)}
                                </Badge>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">{row.supplierWaybillNo}</TableCell>
                    <TableCell className="text-center whitespace-nowrap">{row.merchantOrderNo}</TableCell>
                    <TableCell className="text-center whitespace-nowrap">{row.trackingNo}</TableCell>
                    <TableCell className="text-center whitespace-nowrap">{currencySymbol}{convertMoney(row.goodsValue, "USD").toFixed(2)}</TableCell>
                    <TableCell className="text-center whitespace-nowrap">{currencySymbol}{convertMoney(row.declaredValue, "USD").toFixed(2)}</TableCell>
                    <TableCell className="text-center whitespace-nowrap">{row.declaredRatio}</TableCell>
                    <TableCell className="text-center whitespace-nowrap">{currencySymbol}{convertMoney(row.estimatedTax, "HKD").toFixed(2)}</TableCell>
                    <TableCell className="text-center whitespace-nowrap">{row.estimatedTaxRate}</TableCell>
                    <TableCell className="text-center whitespace-nowrap">{currencySymbol}{convertMoney(row.actualTax, "HKD").toFixed(2)}</TableCell>
                    <TableCell className="text-center whitespace-nowrap">{row.actualTaxRate}</TableCell>
                    <TableCell className="text-center whitespace-nowrap">{currencySymbol}{convertMoney(row.estimatedTaxOnActualValue, "HKD").toFixed(2)}</TableCell>
                    <TableCell className={cn("text-center whitespace-nowrap", row.diffAmount < 0 ? "text-red-500" : "")}>
                        {currencySymbol}{convertMoney(row.diffAmount, "HKD").toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center max-w-[200px] truncate whitespace-nowrap" title={row.remark}>
                      {row.remark || "-"}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditRemark(row)}
                        title="编辑备注"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </TooltipProvider>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑备注</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={remarkInput}
              onChange={(e) => setRemarkInput(e.target.value)}
              placeholder="请输入备注信息..."
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveRemark}>保存</Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>

        {/* 导出弹窗 */}
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>导出</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <input 
                                type="radio" 
                                id="export-query" 
                                name="export-type" 
                                checked={exportType === "query"} 
                                onChange={() => setExportType("query")}
                                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            />
                            <Label htmlFor="export-query" className="cursor-pointer">根据查询条件导出</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input 
                                type="radio" 
                                id="export-selection" 
                                name="export-type" 
                                checked={exportType === "selection"} 
                                onChange={() => setExportType("selection")}
                                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            />
                            <Label htmlFor="export-selection" className="cursor-pointer">根据列表勾选导出</Label>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                        取消
                    </Button>
                    <Button onClick={handleConfirmExport} className="bg-yellow-500 hover:bg-yellow-600 text-white border-none">
                        确定
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}
