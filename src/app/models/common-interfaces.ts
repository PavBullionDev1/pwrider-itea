// 通用接口定义，用于解决TypeScript类型错误

export interface RiderJobDetails {
  tracking_no?: string;
  delivery_status_text?: string;
  service_type?: string;
  customer_name?: string;
  customer_address?: string;
  customer_contact?: string;
  pickup_address?: string;
  delivery_address?: string;
  delivery_status?: number;
  job_log_id?: number;
  sales_order_id?: string;
  [key: string]: any; // 允许其他属性
}

export interface CustomerData {
  customer_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  [key: string]: any;
}

export interface TaskData {
  task_id?: number;
  task_title?: string;
  task_status?: string;
  task_description?: string;
  assigned_user?: string;
  [key: string]: any;
}

export interface BullionData {
  bullion_id?: string;
  weight?: number;
  purity?: number;
  status?: string;
  created_date?: string;
  [key: string]: any;
}

export interface GrnData {
  grn_id?: string;
  grn_number?: string;
  supplier_name?: string;
  status?: string;
  items?: any[];
  [key: string]: any;
}

export interface CollectionData {
  collection_id?: string;
  collection_amount?: number;
  collection_date?: string;
  customer_info?: CustomerData;
  [key: string]: any;
}

export interface WeightData {
  weight_id?: string;
  item_weight?: number;
  gross_weight?: number;
  net_weight?: number;
  [key: string]: any;
}

// 通用的搜索和筛选接口
export interface SearchResult {
  results?: any[];
  total_count?: number;
  page?: number;
  [key: string]: any;
}

export interface PaginationData {
  current_page?: number;
  total_pages?: number;
  total_items?: number;
  items_per_page?: number;
}