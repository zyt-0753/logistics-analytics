import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import LogisticsOrderList from "@/pages/logistics/list"
import CollectionOrderList from "@/pages/collection/list"
import BatchOverviewList from "@/pages/batch/list"
import PayableBillList from "@/pages/finance/payable/list"
import ReceivableBillList from "@/pages/finance/receivable/list"
import SupplierList from "@/pages/base/supplier/list"
import LineList from "@/pages/base/lines/list"
import PortList from "@/pages/base/ports/list"
import ExchangeRateList from "@/pages/base/currency/list"
import AnalysisDashboard from "@/pages/operation/analysis/index"
import ProductList from "@/pages/product/list"
import QuotationList from "@/pages/quotation/index"
import InventoryList from "@/pages/inventory/list"
import InboundList from "@/pages/warehouse/inbound/list"
import OutboundList from "@/pages/warehouse/outbound/list"

function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
      <h1 className="text-2xl font-bold">欢迎使用出海星中台系统</h1>
      <p>请点击左侧菜单进行操作</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="logistics/orders" element={<LogisticsOrderList />} />
          <Route path="logistics/collection-orders" element={<CollectionOrderList />} />
          <Route path="logistics/batch-overview" element={<BatchOverviewList />} />
          <Route path="finance/payable" element={<PayableBillList />} />
          <Route path="finance/receivable" element={<ReceivableBillList />} />
          <Route path="base/suppliers" element={<SupplierList />} />
          <Route path="base/lines" element={<LineList />} />
          <Route path="base/ports" element={<PortList />} />
          <Route path="base/currency" element={<ExchangeRateList />} />
          <Route path="operation/analysis" element={<AnalysisDashboard />} />
          <Route path="product/list" element={<ProductList />} />
          <Route path="quotation" element={<QuotationList />} />
          <Route path="inventory/list" element={<InventoryList />} />
          <Route path="warehouse/inbound" element={<InboundList />} />
          <Route path="warehouse/outbound" element={<OutboundList />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
