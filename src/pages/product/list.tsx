import { useState, useRef, useEffect, Fragment } from "react"
import { 
  Plus, 
  Search, 
  Download,
  Upload,
  Trash2,
  PlusSquare,
  MinusSquare,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  Settings
} from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { ColumnSettingsDialog, ColumnConfig } from "./column-settings"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
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
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// --- Types ---

interface BoxSpec {
  id: string;
  boxSkuId: string;
  pcsPerBox: number | string;
  length: number | string;
  width: number | string;
  height: number | string;
  weight: number | string;
}

interface Product {
  id: string;
  supplierId: string;
  skuId: string;
  upc: string;
  brand: string;
  nameEn: string;
  nameCn: string;
  imageUrl: string;
  
  // Single Spec
  length: number | string;
  width: number | string;
  height: number | string;
  weight: number | string; // g
  
  remark: string;
  createTime: string;
  
  // Box Specs (1-to-many)
  boxSpecs: BoxSpec[];
  operator: string;
  updateTime: string;
}

interface ProductPairing {
  id: string;
  supplierId: string;
  upc: string;
  shopSku: string;
  productName: string;
  platform: string;
  shopName: string;
  status: '在售' | '停售';
  operator: string;
  createTime: string;
  updateTime: string;
}

const defaultColumns: ColumnConfig[] = [
  { id: 'expand', label: '选择', visible: true, width: '40px', pinned: 'left' },
  { id: 'image', label: '图片', visible: true, width: '80px', pinned: 'left' },
  { id: 'supplierId', label: '供应商标识', visible: true },
  { id: 'upc', label: '商品条码', visible: true },
  { id: 'skuId', label: '商品编码', visible: true },
  { id: 'boxSku', label: '箱规编码', visible: true },
  { id: 'brand', label: '品牌', visible: true },
  { id: 'nameEn', label: '英文商品名称', visible: true, minWidth: '200px' },
  { id: 'nameCn', label: '中文商品名称', visible: true, minWidth: '200px' },
  { id: 'boxSpecs', label: '箱规', visible: true },
  { id: 'weight', label: '重量/KG', visible: true, minWidth: '80px' },
  { id: 'length', label: '长/CM', visible: true, minWidth: '60px' },
  { id: 'width', label: '宽/CM', visible: true, minWidth: '60px' },
  { id: 'height', label: '高/CM', visible: true, minWidth: '60px' },
  { id: 'remark', label: '备注', visible: true },
  { id: 'operator', label: '操作人', visible: true },
  { id: 'createTime', label: '创建时间', visible: true },
  { id: 'updateTime', label: '操作时间', visible: true },
  { id: 'action', label: '操作', visible: true, pinned: 'right', minWidth: '180px' }
];

// --- Mock Data ---
const initialProducts: Product[] = [
  { 
    id: '1', 
    supplierId: 'YS',
    skuId: '1120450256', 
    upc: '8809747960903', 
    brand: 'SKIN1004',
    nameEn: 'Madagascar Centella Poremizing Fresh Ampoule Mini', 
    nameCn: '马达加斯加积雪草毛孔新鲜安瓶', 
    imageUrl: 'https://image.distributetop.com/erp-vue/90187652075560960/20260130/6440532e2b334e8eaecb4de82bab47cd.png',
    length: 1, width: 2, height: 3, weight: 0.1,
    remark: '测试',
    operator: 'Pae',
    createTime: '2025-10-12 10:00:00',
    updateTime: '2025-10-12 10:00:00',
    boxSpecs: [
      { id: 'b1', boxSkuId: '1129048957', pcsPerBox: 50, length: 2, width: 3, height: 4, weight: 0.1 },
      { id: 'b2', boxSkuId: '1120454106', pcsPerBox: 200, length: 3, width: 4, height: 5, weight: 0.1 }
    ]
  },
  { 
    id: '2', 
    supplierId: 'KJ',
    skuId: 'SKU-002', 
    upc: 'UPC987654321',
    brand: 'Logitech',
    nameEn: 'Wireless Mouse', 
    nameCn: '无线鼠标', 
    imageUrl: 'https://image.distributetop.com/erp-vue/90187652075560960/20260130/6440532e2b334e8eaecb4de82bab47cd.png',
    length: 12, width: 7, height: 4, weight: 120,
    remark: '',
    operator: 'Admin',
    createTime: '2025-01-21 14:30',
    updateTime: '2025-01-21 14:30',
    boxSpecs: [
      { id: 'b2', boxSkuId: 'BSKU-002-A', pcsPerBox: 50, length: 40, width: 30, height: 20, weight: 6.5 }
    ]
  },
  {
    id: '3',
    supplierId: 'YS',
    skuId: '1120450257',
    upc: '8809747960904',
    brand: 'SKIN1004',
    nameEn: 'Madagascar Centella Toning Toner',
    nameCn: '马达加斯加积雪草爽肤水',
    imageUrl: 'https://image.distributetop.com/erp-vue/90187652075560960/20260130/6440532e2b334e8eaecb4de82bab47cd.png',
    length: 5, width: 5, height: 15, weight: 0.25,
    remark: '热销品',
    operator: 'Pae',
    createTime: '2025-10-12 10:05:00',
    updateTime: '2025-10-12 10:05:00',
    boxSpecs: [
      { id: 'b3', boxSkuId: '1129048958', pcsPerBox: 40, length: 30, width: 30, height: 20, weight: 10.5 }
    ]
  },
  {
    id: '4',
    supplierId: 'YS',
    skuId: '1120450258',
    upc: '8809747960905',
    brand: 'SKIN1004',
    nameEn: 'Madagascar Centella Ampoule Foam',
    nameCn: '马达加斯加积雪草泡沫洁面',
    imageUrl: 'https://image.distributetop.com/erp-vue/90187652075560960/20260130/6440532e2b334e8eaecb4de82bab47cd.png',
    length: 6, width: 4, height: 16, weight: 0.15,
    remark: '',
    operator: 'Pae',
    createTime: '2025-10-12 10:10:00',
    updateTime: '2025-10-12 10:10:00',
    boxSpecs: [
      { id: 'b4', boxSkuId: '1129048959', pcsPerBox: 60, length: 40, width: 40, height: 25, weight: 9.5 }
    ]
  },
  {
    id: '5',
    supplierId: 'DX',
    skuId: 'SKU-005',
    upc: 'UPC888888888',
    brand: 'Anua',
    nameEn: 'Heartleaf 77% Soothing Toner',
    nameCn: '鱼腥草77%舒缓爽肤水',
    imageUrl: 'https://image.distributetop.com/erp-vue/90187652075560960/20260130/6440532e2b334e8eaecb4de82bab47cd.png',
    length: 5, width: 5, height: 18, weight: 0.3,
    remark: '新品上市',
    operator: 'Admin',
    createTime: '2025-10-13 09:00:00',
    updateTime: '2025-10-13 09:00:00',
    boxSpecs: []
  },
  {
    id: '6',
    supplierId: 'KJ',
    skuId: 'SKU-006',
    upc: 'UPC777777777',
    brand: 'Torriden',
    nameEn: 'Dive-In Low Molecule Hyaluronic Acid Serum',
    nameCn: '低分子透明质酸精华',
    imageUrl: 'https://image.distributetop.com/erp-vue/90187652075560960/20260130/6440532e2b334e8eaecb4de82bab47cd.png',
    length: 4, width: 4, height: 10, weight: 0.08,
    remark: '',
    operator: 'Admin',
    createTime: '2025-10-13 09:30:00',
    updateTime: '2025-10-13 09:30:00',
    boxSpecs: [
      { id: 'b6', boxSkuId: 'BSKU-006-A', pcsPerBox: 100, length: 25, width: 25, height: 15, weight: 8.5 }
    ]
  },
  {
    id: '7',
    supplierId: 'YS',
    skuId: '1120450261',
    upc: '8809747960908',
    brand: 'SKIN1004',
    nameEn: 'Madagascar Centella Light Cleansing Oil',
    nameCn: '马达加斯加积雪草轻盈卸妆油',
    imageUrl: 'https://image.distributetop.com/erp-vue/90187652075560960/20260130/6440532e2b334e8eaecb4de82bab47cd.png',
    length: 6, width: 6, height: 18, weight: 0.22,
    remark: '促销中',
    operator: 'Pae',
    createTime: '2025-10-13 10:00:00',
    updateTime: '2025-10-13 10:00:00',
    boxSpecs: []
  }
];

const supplierOptions = [
  { value: 'YS', label: 'YS' },
  { value: '国货', label: '国货' },
];

const initialPairings: ProductPairing[] = [
  {
    id: 'p1',
    supplierId: 'YS',
    upc: '8809747960903',
    shopSku: '887886076015',
    productName: 'goodal/果达儿济州青橘VC精华面膜套装28G*5片',
    platform: 'TikTok',
    shopName: 'QUEMIMULOPS',
    status: '在售',
    operator: 'Pae',
    createTime: '2025-10-12 17:02:39',
    updateTime: '2025-10-12 17:02:39'
  },
  {
    id: 'p2',
    supplierId: 'YS',
    upc: '8809747960903',
    shopSku: '893202946965',
    productName: 'Anua鱼腥草深层清洁毛孔洗面奶150ml',
    platform: 'TikTok',
    shopName: 'QUEMIMULOPS',
    status: '停售',
    operator: 'Pae',
    createTime: '2025-10-12 17:02:39',
    updateTime: '2025-10-12 17:02:39'
  }
];

const ExpandableCell = ({ text, className }: { text: string, className?: string }) => {
  if (!text) return <span className={className}>-</span>;
  return (
    <div className="group relative w-full max-w-full">
      <div className={cn("truncate cursor-default", className)}>{text}</div>
      <div className={cn(
        "hidden group-hover:block absolute left-0 top-0 z-50 min-w-full w-max max-w-[400px]",
        "bg-popover text-popover-foreground p-3 rounded-md border shadow-md",
        "whitespace-normal break-words text-xs leading-relaxed",
        "animate-in fade-in-0 zoom-in-95 duration-200"
      )}>
        {text}
      </div>
    </div>
  );
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [pairings, setPairings] = useState<ProductPairing[]>(initialPairings);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedPairingIds, setSelectedPairingIds] = useState<string[]>([]);
  const [expandedProductIds, setExpandedProductIds] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

  // Filter State
  const [date, setDate] = useState<DateRange | undefined>()
  const [searchField, setSearchField] = useState("upc")
  const [searchValue, setSearchValue] = useState("")
  const [currentBoxSpecs, setCurrentBoxSpecs] = useState<Partial<BoxSpec>[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importSupplierId, setImportSupplierId] = useState<string>("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Column Settings State
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);

  // --- Image Upload Logic ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: "图片大小不能超过5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentProduct(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerImportFile = () => {
    importFileRef.current?.click();
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const extOk = /(xlsx|xls|csv)$/i.test(file.name.split(".").pop() || "");
      if (!extOk) {
        toast({ title: "文件格式错误", description: "仅支持xlsx/xls/csv", variant: "destructive" });
        e.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "文件过大", description: "附件大小不能超过10MB", variant: "destructive" });
        e.target.value = "";
        return;
      }
    }
    setImportFile(file);
  };

  const handleImportConfirm = () => {
    if (!importSupplierId) {
      toast({ title: "校验失败", description: "请选择供应商标识", variant: "destructive" });
      return;
    }
    if (!importFile) {
      toast({ title: "校验失败", description: "请上传附件", variant: "destructive" });
      return;
    }
    toast({ title: "导入已提交", description: `供应商:${importSupplierId}，文件:${importFile.name}` });
    setIsImportOpen(false);
    setImportFile(null);
  };

  // --- Selection Logic ---
  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectPairing = (id: string) => {
    if (selectedPairingIds.includes(id)) {
      setSelectedPairingIds(selectedPairingIds.filter(i => i !== id));
    } else {
      setSelectedPairingIds([...selectedPairingIds, id]);
    }
  };

  // --- Expansion Logic ---
  const toggleExpand = (id: string) => {
    if (expandedProductIds.includes(id)) {
      setExpandedProductIds(expandedProductIds.filter(i => i !== id));
    } else {
      setExpandedProductIds([...expandedProductIds, id]);
    }
  };

  // Translation Logic
  const [isTranslating, setIsTranslating] = useState(false);
  const translationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNameEnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrentProduct(prev => ({ ...prev, nameEn: val }));

    // Debounced Translation
    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }

    if (val && !isViewMode) {
      translationTimeoutRef.current = setTimeout(async () => {
        try {
          setIsTranslating(true);
          const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(val)}&langpair=en|zh`);
          const data = await response.json();
          
          if (data.responseData && data.responseData.translatedText) {
             setCurrentProduct(prev => ({
               ...prev,
               nameCn: data.responseData.translatedText
             }));
          }
        } catch (error) {
          console.error("Translation failed:", error);
        } finally {
          setIsTranslating(false);
        }
      }, 800);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, []);

  // --- Actions ---
  const handleExport = () => {
    toast({ title: "导出成功", description: `已导出 ${selectedIds.length > 0 ? selectedIds.length : products.length} 条数据` });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteDialogOpen(true);
  };

  const handleAdd = () => {
    setCurrentProduct({ 
      supplierId: 'YS', 
      skuId: '', 
      upc: '', 
      nameEn: '', 
      nameCn: '', 
      brand: '', 
      remark: '', 
      length: 0, width: 0, height: 0, weight: 0 
    });
    setCurrentBoxSpecs([
      { id: Math.random().toString(), boxSkuId: '', pcsPerBox: 0, length: 0, width: 0, height: 0, weight: 0 }
    ]);
    setIsEditMode(false);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct({ ...product });
    setCurrentBoxSpecs([...product.boxSpecs]);
    setIsEditMode(true);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleView = (product: Product) => {
    setCurrentProduct({ ...product });
    setCurrentBoxSpecs([...product.boxSpecs]);
    setIsEditMode(false);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const executeDelete = () => {
    if (productToDelete) {
      setProducts(products.filter(p => p.id !== productToDelete.id));
      toast({ title: "删除成功", description: "商品已删除" });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } else if (selectedIds.length > 0) {
      setProducts(products.filter(p => !selectedIds.includes(p.id)));
      toast({ title: "删除成功", description: `已删除 ${selectedIds.length} 个商品` });
      setSelectedIds([]);
      setDeleteDialogOpen(false);
    }
  };

  const getLeftPosition = (columnId: string) => {
    let left = 0;
    for (const col of columns) {
      if (col.id === columnId) return left;
      if (col.visible && col.pinned === 'left') {
        const width = parseInt(col.width?.replace('px', '') || '0');
        left += width;
      }
    }
    return 0;
  };

  const handleSearch = () => {
    toast({ title: "查询中", description: "正在查询商品数据..." });
  };

  const handleReset = () => {
    setSearchField("upc");
    setSearchValue("");
    setDate(undefined);
    toast({ title: "重置成功", description: "查询条件已重置" });
  };

  // --- Box Spec Actions in Dialog ---
  const addBoxSpecRow = () => {
    setCurrentBoxSpecs([
      ...currentBoxSpecs,
      { id: Math.random().toString(), boxSkuId: '', pcsPerBox: 0, length: 0, width: 0, height: 0, weight: 0 }
    ]);
  };

  const removeBoxSpecRow = (index: number) => {
    const newSpecs = [...currentBoxSpecs];
    newSpecs.splice(index, 1);
    setCurrentBoxSpecs(newSpecs);
  };

  const updateBoxSpec = (index: number, field: keyof BoxSpec, value: any) => {
    const newSpecs = [...currentBoxSpecs];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setCurrentBoxSpecs(newSpecs);
  };

  const handleSave = () => {
    // Basic Validation
    if (!currentProduct.supplierId || !currentProduct.upc || !currentProduct.skuId || !currentProduct.nameEn || !currentProduct.nameCn) {
      toast({ title: "保存失败", description: "供应商、商品条码、商品编码、中文名、英文名为必填项", variant: "destructive" });
      return;
    }

    // Check UPC + SKU Uniqueness
    const isDuplicate = products.some(p => p.upc === currentProduct.upc && p.skuId === currentProduct.skuId && p.id !== currentProduct.id);
    if (isDuplicate) {
      toast({ 
        title: "保存失败", 
        description: `当前商品已存在，商品条码为：${currentProduct.upc}，商品编码为：${currentProduct.skuId}`, 
        variant: "destructive" 
      });
      return;
    }

    // Helper to format dimension to 2 decimal places
    const formatDim = (val: number | string | undefined | null) => {
        if (val === '' || val === undefined || val === null) return 0;
        const num = parseFloat(val.toString());
        return isNaN(num) ? 0 : Math.round(num * 100) / 100;
    };

    // Construct Product Object
    const productToSave: Product = {
      ...currentProduct as Product,
      length: formatDim(currentProduct.length),
      width: formatDim(currentProduct.width),
      height: formatDim(currentProduct.height),
      weight: formatDim(currentProduct.weight),
      boxSpecs: currentBoxSpecs.map(spec => ({
          ...spec,
          length: formatDim(spec.length),
          width: formatDim(spec.width),
          height: formatDim(spec.height),
          weight: formatDim(spec.weight)
      })) as BoxSpec[]
    };

    if (isEditMode) {
      setProducts(products.map(p => p.id === currentProduct.id ? productToSave : p));
      toast({ title: "更新成功", description: "商品及箱规信息已更新" });
    } else {
      const newProduct: Product = {
        ...productToSave,
        id: Math.random().toString(36).substr(2, 9),
        createTime: new Date().toLocaleString(),
      };
      setProducts([newProduct, ...products]);

      // Generate Pairings for new product
      // Mock shops for demo purposes
      const mockShops = [
        { platform: 'TikTok', shopName: 'QUEMIMULOPS' },
        { platform: 'Amazon', shopName: 'US-Store' }
      ];

      const newPairings: ProductPairing[] = mockShops.map(shop => ({
        id: Math.random().toString(36).substr(2, 9),
        supplierId: newProduct.supplierId,
        upc: newProduct.upc,
        shopSku: newProduct.upc, // PRD: Shop SKU = UPC
        productName: newProduct.nameCn, // Defaulting to Chinese Name
        platform: shop.platform,
        shopName: shop.shopName,
        status: '在售',
        operator: 'System',
        createTime: new Date().toLocaleString(),
        updateTime: new Date().toLocaleString(),
      }));

      setPairings([...newPairings, ...pairings]);

      toast({ 
        title: "创建成功", 
        description: `商品 ${newProduct.skuId} 已创建，并自动生成 ${newPairings.length} 条配对记录`,
        className: "bg-green-100 border-green-500"
      });
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">商品管理</h1>
          <p className="text-muted-foreground">管理商品基础数据、箱规及物流属性</p>
        </div>
      </div>

      <Tabs defaultValue="product_list" className="w-full">
        <TabsList>
          <TabsTrigger value="product_list">产品管理</TabsTrigger>
          <TabsTrigger value="product_pairing">产品配对</TabsTrigger>
        </TabsList>

        <TabsContent value="product_list" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col gap-4 bg-card p-4 rounded-lg border">
            <div className="flex flex-wrap items-center gap-6">
              {/* Product Info Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium whitespace-nowrap">产品信息:</span>
                <div className="flex w-full max-w-lg items-center">
                  <Select value={searchField} onValueChange={setSearchField}>
                    <SelectTrigger className="w-[130px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0 bg-background z-10">
                      <SelectValue placeholder="选择字段" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upc">商品条码</SelectItem>
                      <SelectItem value="skuId">商品编码</SelectItem>
                      <SelectItem value="boxSku">箱规编码</SelectItem>
                      <SelectItem value="brand">品牌</SelectItem>
                      <SelectItem value="nameCn">中文商品名称</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Input
                      value={searchValue}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)}
                      placeholder="请输入..."
                      className="rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-10"
                    />
                    <div className="absolute right-0 top-0 h-full flex items-center px-3 text-muted-foreground border-l bg-muted/10 cursor-pointer hover:bg-muted/20">
                      <Search className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium whitespace-nowrap">创建时间:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "yyyy-MM-dd")} -{" "}
                            {format(date.to, "yyyy-MM-dd")}
                          </>
                        ) : (
                          format(date.from, "yyyy-MM-dd")
                        )
                      ) : (
                        <span>请选择日期范围</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Search Actions */}
              <div className="flex items-center space-x-2">
                <Button onClick={handleSearch}>查询</Button>
                <Button variant="outline" onClick={handleReset}>重置</Button>
              </div>
            </div>

            {/* Functional Buttons */}
            <div className="flex items-center space-x-2 border-t pt-4">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                导出
              </Button>
              <Button 
                variant="destructive" 
                disabled={selectedIds.length === 0} 
                onClick={handleBulkDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </Button>
              <div className="w-px h-6 bg-border mx-2" />
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                下载模板
              </Button>
              <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Excel导入
              </Button>
              <Button onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" />
                新增产品
              </Button>
            </div>
          </div>

      {/* Main Table */}
      <TooltipProvider>
      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="whitespace-nowrap">
              {columns.map((col) => {
                if (!col.visible) return null;
                
                // Special handling for columns with tooltips or special headers
                if (col.id === 'upc') {
                  return (
                    <TableHead key={col.id}>
                      <div className="flex items-center space-x-1">
                        <span>{col.label}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="h-4 w-4 rounded-full border border-muted-foreground text-[10px] flex items-center justify-center text-muted-foreground cursor-help">?</div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>UPC，通用产品代码</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableHead>
                  );
                }
                if (col.id === 'skuId') {
                  return (
                    <TableHead key={col.id}>
                      <div className="flex items-center space-x-1">
                        <span>{col.label}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="h-4 w-4 rounded-full border border-muted-foreground text-[10px] flex items-center justify-center text-muted-foreground cursor-help">?</div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>SKU，单个商品库存单元的追踪标识</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableHead>
                  );
                }
                if (col.id === 'boxSku') {
                  return (
                    <TableHead key={col.id}>
                      <div className="flex items-center space-x-1">
                        <span>{col.label}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="h-4 w-4 rounded-full border border-muted-foreground text-[10px] flex items-center justify-center text-muted-foreground cursor-help">?</div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>箱规SKU，按箱商品库存单元的追踪标识</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableHead>
                  );
                }
                if (col.id === 'action') {
                   return (
                    <TableHead key={col.id} className={cn("text-center", col.pinned === 'right' && "sticky right-0 bg-muted/50 z-20 shadow-[-1px_0_0_0_rgba(0,0,0,0.1)]")}>
                      <div className="flex items-center justify-center space-x-1">
                        <span>{col.label}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setIsColumnSettingsOpen(true)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableHead>
                   );
                }

                // Default rendering
                return (
                  <TableHead 
                    key={col.id} 
                    className={cn(
                       col.width && `w-[${col.width}]`,
                       col.minWidth && `min-w-[${col.minWidth}]`,
                       col.pinned === 'left' && "sticky left-0 bg-muted/50 z-20 shadow-[1px_0_0_0_rgba(0,0,0,0.1)]"
                    )}
                    style={{ 
                      width: col.width,
                      minWidth: col.minWidth,
                      left: col.pinned === 'left' ? getLeftPosition(col.id) : undefined 
                    }}
                  >
                    {col.label}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <Fragment key={product.id}>
                {/* Main Row */}
                <TableRow className="hover:bg-muted/50 whitespace-nowrap">
                   {columns.map((col) => {
                     if (!col.visible) return null;

                     if (col.id === 'expand') {
                        return (
                          <TableCell key={col.id} className={cn(col.pinned === 'left' && "sticky left-0 bg-card z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.1)]")}>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                checked={selectedIds.includes(product.id)}
                                onCheckedChange={() => toggleSelect(product.id)}
                              />
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                                onClick={() => toggleExpand(product.id)}
                              >
                                {expandedProductIds.includes(product.id) ? 
                                  <MinusSquare className="h-4 w-4" /> : 
                                  <PlusSquare className="h-4 w-4" />
                                }
                              </Button>
                            </div>
                          </TableCell>
                        );
                     }
                     if (col.id === 'image') {
                        return (
                          <TableCell key={col.id} className={cn(col.pinned === 'left' && "sticky left-0 bg-card z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.1)]")} style={{ left: getLeftPosition(col.id) }}>
                             {product.imageUrl && (
                              <div className="relative group w-10 h-10">
                                <img 
                                  src={product.imageUrl} 
                                  alt="Product" 
                                  className="w-full h-full object-cover rounded border transition-transform duration-300 group-hover:scale-[4] group-hover:z-50 group-hover:absolute group-hover:top-0 group-hover:left-0 group-hover:shadow-xl origin-top-left bg-white"
                                />
                              </div>
                            )}
                          </TableCell>
                        );
                     }
                     if (col.id === 'action') {
                        return (
                          <TableCell key={col.id} className={cn("text-center", col.pinned === 'right' && "sticky right-0 bg-card z-10 shadow-[-1px_0_0_0_rgba(0,0,0,0.1)]")}>
                            <div className="flex items-center justify-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-orange-500 hover:text-orange-600 hover:bg-orange-50 px-2"
                                onClick={() => handleEdit(product)}
                              >
                                编辑
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-orange-500 hover:text-orange-600 hover:bg-orange-50 px-2"
                                onClick={() => handleView(product)}
                              >
                                查看详情
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-red-500 hover:text-red-600 hover:bg-red-50 px-2"
                                onClick={() => confirmDelete(product)}
                              >
                                删除
                              </Button>
                            </div>
                          </TableCell>
                        );
                     }
                     
                     // Helper for other fields
                     let content = null;
                     switch(col.id) {
                       case 'supplierId': content = product.supplierId; break;
                       case 'upc': content = product.upc; break;
                       case 'skuId': content = <span className="font-medium">{product.skuId}</span>; break;
                       case 'boxSku': content = '-'; break;
                       case 'brand': content = product.brand; break;
                      case 'nameEn': content = <ExpandableCell text={product.nameEn} className="text-xs" />; break;
                      case 'nameCn': content = <ExpandableCell text={product.nameCn} className="text-xs" />; break;
                      case 'boxSpecs': content = '-'; break;
                       case 'weight': content = product.weight; break;
                       case 'length': content = product.length; break;
                       case 'width': content = product.width; break;
                       case 'height': content = product.height; break;
                       case 'remark': content = <span className="text-xs text-muted-foreground truncate max-w-[100px]">{product.remark}</span>; break;
                       case 'operator': content = product.operator; break;
                       case 'createTime': content = <span className="text-xs whitespace-nowrap">{product.createTime}</span>; break;
                       case 'updateTime': content = <span className="text-xs whitespace-nowrap">{product.updateTime}</span>; break;
                       default: content = null;
                     }
                     
                     return (
                        <TableCell key={col.id}>
                          {content}
                        </TableCell>
                     );

                   })}
                </TableRow>

                {/* Expanded Child Rows */}
                {expandedProductIds.includes(product.id) && product.boxSpecs.map((spec, idx) => (
                  <TableRow key={`${product.id}-spec-${idx}`} className="bg-muted/20 hover:bg-muted/30 whitespace-nowrap">
                    {columns.map((col) => {
                      if (!col.visible) return null;
                      
                      let content = null;
                      // Mapping for expanded row
                      switch(col.id) {
                        case 'expand': content = null; break; // Empty for expand column
                        case 'image': content = <span className="text-center text-muted-foreground">-</span>; break;
                        case 'supplierId': content = <span className="text-muted-foreground">-</span>; break;
                        case 'upc': content = <span className="text-muted-foreground">{product.upc}</span>; break;
                        case 'skuId': content = <span className="text-muted-foreground">{product.skuId}</span>; break;
                        case 'boxSku': content = <span className="font-medium">{spec.boxSkuId}</span>; break;
                        case 'brand': content = <span className="text-muted-foreground">{product.brand}</span>; break;
                        case 'nameEn': content = <ExpandableCell text={product.nameEn} className="text-xs text-muted-foreground" />; break;
                        case 'nameCn': content = <ExpandableCell text={product.nameCn} className="text-xs text-muted-foreground" />; break;
                        case 'boxSpecs': content = spec.pcsPerBox; break; // Map 'boxSpecs' column to pcsPerBox value
                        case 'weight': content = spec.weight; break;
                        case 'length': content = spec.length; break;
                        case 'width': content = spec.width; break;
                        case 'height': content = spec.height; break;
                        case 'remark': content = <span className="text-muted-foreground">-</span>; break;
                        case 'operator': content = <span className="text-muted-foreground">-</span>; break;
                        case 'createTime': content = <span className="text-muted-foreground">-</span>; break;
                        case 'updateTime': content = <span className="text-muted-foreground">-</span>; break;
                        case 'action': content = null; break;
                        default: content = <span className="text-muted-foreground">-</span>;
                      }
                      
                      return (
                        <TableCell key={col.id} className={cn(
                          col.pinned === 'left' && "sticky left-0 bg-muted/20 z-10",
                          col.pinned === 'right' && "sticky right-0 bg-muted/20 z-10"
                        )} style={{ left: col.pinned === 'left' ? getLeftPosition(col.id) : undefined }}>
                          {content}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
      </TooltipProvider>
      
      <ColumnSettingsDialog 
        open={isColumnSettingsOpen} 
        onOpenChange={setIsColumnSettingsOpen}
        columns={columns}
        setColumns={setColumns}
        onReset={() => setColumns(defaultColumns)}
      />
        </TabsContent>

        <TabsContent value="product_pairing" className="space-y-6">
          <div className="rounded-md border bg-card overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="whitespace-nowrap">
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>供应商标识</TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>商品条码</span>
                      <div className="h-4 w-4 rounded-full border border-muted-foreground text-[10px] flex items-center justify-center text-muted-foreground cursor-help" title="UPC，通用产品代码">?</div>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>店铺SKU</span>
                      <div className="h-4 w-4 rounded-full border border-muted-foreground text-[10px] flex items-center justify-center text-muted-foreground cursor-help" title="商品在销售平台的商品编码">?</div>
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[200px]">品名</TableHead>
                  <TableHead>平台</TableHead>
                  <TableHead>店铺</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作人</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pairings.map((pairing) => (
                  <TableRow key={pairing.id} className="hover:bg-muted/50 whitespace-nowrap">
                    <TableCell>
                      <Checkbox 
                        checked={selectedPairingIds.includes(pairing.id)}
                        onCheckedChange={() => toggleSelectPairing(pairing.id)}
                      />
                    </TableCell>
                    <TableCell>{pairing.supplierId}</TableCell>
                    <TableCell>{pairing.upc}</TableCell>
                    <TableCell>{pairing.shopSku}</TableCell>
                    <TableCell className="text-xs" title={pairing.productName}>
                      <div className="truncate max-w-[200px]">{pairing.productName}</div>
                    </TableCell>
                    <TableCell>{pairing.platform}</TableCell>
                    <TableCell>{pairing.shopName}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                        pairing.status === '在售' 
                          ? "bg-green-50 text-green-700 ring-green-600/20" 
                          : "bg-red-50 text-red-700 ring-red-600/20"
                      )}>
                        {pairing.status}
                      </span>
                    </TableCell>
                    <TableCell>{pairing.operator}</TableCell>
                    <TableCell className="text-xs">{pairing.createTime}</TableCell>
                    <TableCell className="text-xs">{pairing.updateTime}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-orange-500 hover:text-orange-600 hover:bg-orange-50 px-2"
                        >
                          编辑
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-orange-500 hover:text-orange-600 hover:bg-orange-50 px-2"
                        >
                          查看详情
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-orange-500 font-bold border-b pb-2">
              {isViewMode ? '查看产品信息' : (isEditMode ? '编辑产品信息' : '新增产品信息')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 1. Basic Info */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-1 h-4 bg-orange-500 mr-2"></div>
                <h3 className="text-lg font-bold text-orange-500">基本信息</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>供应商标识 <span className="text-red-500">*</span></Label>
                  <Select 
                    value={currentProduct.supplierId || ''}
                    onValueChange={(value) => setCurrentProduct({...currentProduct, supplierId: value})}
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择供应商" />
                    </SelectTrigger>
                    <SelectContent>
                      {supplierOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>商品条码 <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="请输入商品条码" 
                    value={currentProduct.upc || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentProduct({...currentProduct, upc: e.target.value})}
                    readOnly={isViewMode}
                    className={isViewMode ? "bg-muted text-muted-foreground" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label>商品编码 <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="请输入商品编码" 
                    value={currentProduct.skuId || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentProduct({...currentProduct, skuId: e.target.value})}
                    readOnly={isViewMode}
                    className={isViewMode ? "bg-muted text-muted-foreground" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label>品牌</Label>
                  <Input 
                    placeholder="请输入品牌信息" 
                    value={currentProduct.brand || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentProduct({...currentProduct, brand: e.target.value})}
                    readOnly={isViewMode}
                    className={isViewMode ? "bg-muted text-muted-foreground" : ""}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 mt-4">
                  <div className="space-y-2">
                  <Label>英文商品名称 <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input 
                    placeholder="请输入英文商品名称" 
                    value={currentProduct.nameEn || ''}
                    onChange={handleNameEnChange}
                    readOnly={isViewMode}
                    className={isViewMode ? "bg-muted text-muted-foreground" : ""}
                  />
                    {isTranslating && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <span className="text-xs text-muted-foreground animate-pulse">翻译中...</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-1">
                    <Label>中文商品名称</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="h-4 w-4 rounded-full border border-muted-foreground text-[10px] flex items-center justify-center text-muted-foreground cursor-help">?</div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>英译中，根据英文自动翻译回显中文</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input 
                    placeholder="请输入中文商品名称" 
                    value={currentProduct.nameCn || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentProduct({...currentProduct, nameCn: e.target.value})}
                    readOnly={isViewMode}
                    className={isViewMode ? "bg-muted text-muted-foreground" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label>备注</Label>
                  <Textarea 
                    placeholder="请输入备注信息" 
                    value={currentProduct.remark || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentProduct({...currentProduct, remark: e.target.value})}
                    className={`h-20 ${isViewMode ? "bg-muted text-muted-foreground" : ""}`}
                    readOnly={isViewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label>图片信息</Label>
                  {!isViewMode ? (
                    <div className="flex items-start space-x-4">
                      <div 
                        className="border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/50 h-24 w-24 shrink-0 relative overflow-hidden bg-muted/5"
                        onClick={triggerFileUpload}
                        title="点击上传本地图片"
                      >
                        {currentProduct.imageUrl ? (
                            <img src={currentProduct.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <ImageIcon className="h-6 w-6 mb-1" />
                                <span className="text-xs scale-90">点击上传</span>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            onChange={handleImageUpload}
                        />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <Input 
                            placeholder="或粘贴图片链接" 
                            value={currentProduct.imageUrl || ''}
                            onChange={(e) => setCurrentProduct({...currentProduct, imageUrl: e.target.value})}
                        />
                        <p className="text-xs text-muted-foreground">
                            支持本地上传或粘贴网络图片链接 (JPG/PNG, Max 5MB)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-md p-2 h-24 w-24 flex items-center justify-center bg-muted/10">
                      {currentProduct.imageUrl ? (
                        <img src={currentProduct.imageUrl} alt="Product" className="h-full w-full object-cover rounded" />
                      ) : (
                        <span className="text-xs text-muted-foreground">无图片</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Spec Info */}
            <div>
              <div className="flex items-center mb-4 mt-6">
                <div className="w-1 h-4 bg-orange-500 mr-2"></div>
                <h3 className="text-lg font-bold text-orange-500">规格信息</h3>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="flex items-center space-x-2">
                  <Label className="w-20 font-bold">单品规格:</Label>
                  <Input 
                    className={`w-20 ${isViewMode ? "bg-muted text-muted-foreground" : ""}`} placeholder="长" 
                    value={currentProduct.length || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentProduct({...currentProduct, length: e.target.value})}
                    readOnly={isViewMode}
                  />
                  <Input 
                    className={`w-20 ${isViewMode ? "bg-muted text-muted-foreground" : ""}`} placeholder="宽" 
                    value={currentProduct.width || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentProduct({...currentProduct, width: e.target.value})}
                    readOnly={isViewMode}
                  />
                  <Input 
                    className={`w-20 ${isViewMode ? "bg-muted text-muted-foreground" : ""}`} placeholder="高" 
                    value={currentProduct.height || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentProduct({...currentProduct, height: e.target.value})}
                    readOnly={isViewMode}
                  />
                  <span className="bg-muted px-2 py-1 rounded text-sm">CM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="w-20 font-bold">单品重量:</Label>
                  <Input 
                    className={`w-40 ${isViewMode ? "bg-muted text-muted-foreground" : ""}`} placeholder="请输入单品重量" 
                    value={currentProduct.weight || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentProduct({...currentProduct, weight: e.target.value})}
                    readOnly={isViewMode}
                  />
                  <span className="bg-muted px-2 py-1 rounded text-sm">KG</span>
                </div>
              </div>

              {/* Box Specs Table */}
              <div className="mt-6 rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[60px]">序号</TableHead>
                      <TableHead>箱规编码</TableHead>
                      <TableHead>单箱数量</TableHead>
                      <TableHead>外箱规格</TableHead>
                      <TableHead>单箱重量/KG</TableHead>
                      {!isViewMode && <TableHead className="w-[80px]">操作</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentBoxSpecs.map((spec, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <Input 
                            value={spec.boxSkuId || ''} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBoxSpec(idx, 'boxSkuId', e.target.value)}
                            placeholder="请输入箱规编码" 
                            className={`h-8 ${isViewMode ? "bg-muted text-muted-foreground" : ""}`}
                            readOnly={isViewMode}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Input 
                              value={spec.pcsPerBox || ''} 
                              onChange={e => updateBoxSpec(idx, 'pcsPerBox', e.target.value)}
                              placeholder="PCS" 
                              className={`h-8 w-24 mr-2 ${isViewMode ? "bg-muted text-muted-foreground" : ""}`}
                              readOnly={isViewMode}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Input 
                              className={`h-8 w-16 ${isViewMode ? "bg-muted text-muted-foreground" : ""}`} placeholder="长" 
                              value={spec.length || ''} 
                              onChange={e => updateBoxSpec(idx, 'length', e.target.value)}
                              readOnly={isViewMode}
                            />
                            <Input 
                              className={`h-8 w-16 ${isViewMode ? "bg-muted text-muted-foreground" : ""}`} placeholder="宽" 
                              value={spec.width || ''} 
                              onChange={e => updateBoxSpec(idx, 'width', e.target.value)}
                              readOnly={isViewMode}
                            />
                            <Input 
                              className={`h-8 w-16 ${isViewMode ? "bg-muted text-muted-foreground" : ""}`} placeholder="高" 
                              value={spec.height || ''} 
                              onChange={e => updateBoxSpec(idx, 'height', e.target.value)}
                              readOnly={isViewMode}
                            />
                            <span className="text-xs text-muted-foreground">CM</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={spec.weight || ''} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBoxSpec(idx, 'weight', e.target.value)}
                            placeholder="输入重量" 
                            className={`h-8 ${isViewMode ? "bg-muted text-muted-foreground" : ""}`}
                            readOnly={isViewMode}
                          />
                        </TableCell>
                        {!isViewMode && (
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                              onClick={() => removeBoxSpecRow(idx)}
                            >
                              删除
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {!isViewMode && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Button 
                            variant="ghost" 
                            className="w-full h-8 text-orange-500 hover:bg-orange-50 border-dashed border border-orange-200"
                            onClick={addBoxSpecRow}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            添加箱规
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <DialogFooter className="py-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {isViewMode ? '关闭' : '取消'}
            </Button>
            {!isViewMode && (
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleSave}>
                确定
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>导入产品</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-2">
            <div className="space-y-2">
              <Label>供应商标识 <span className="text-red-500">*</span></Label>
              <Select
                value={importSupplierId}
                onValueChange={setImportSupplierId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择供应商" />
                </SelectTrigger>
                <SelectContent>
                  {supplierOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>附件 <span className="text-red-500">*</span></Label>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={triggerImportFile} className="h-9">
                  <Upload className="mr-2 h-4 w-4" /> 上传附件
                </Button>
                <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                  {importFile ? importFile.name : "未选择文件"}
                </span>
                <input
                  type="file"
                  ref={importFileRef}
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImportFileChange}
                />
              </div>
              <p className="text-xs text-muted-foreground">支持xlsx/xls/csv，最大10MB</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>取消</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleImportConfirm}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>确定要删除商品 <span className="font-bold text-orange-500">{productToDelete?.skuId}</span> 吗？</p>
            <p className="text-sm text-muted-foreground mt-2">此操作无法撤销，请谨慎操作。</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={executeDelete}>确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
