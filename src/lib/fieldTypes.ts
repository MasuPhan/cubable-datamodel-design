
import {
  AlignLeft, FileText, Calendar, Check, Link, File, 
  User, Phone, Mail, DollarSign, List, 
  Clock, Database, Tag, Star, Search,
  Code, Paperclip, LucideIcon, ListOrdered,
  CalendarClock, Function, GaugeCircle
} from "lucide-react";

export type FieldType = {
  value: string;
  label: string;
  icon: LucideIcon;
  color?: string;
};

export const fieldTypes: FieldType[] = [
  // Basic types
  { value: "text", label: "Văn bản", icon: AlignLeft, color: "#4c7cff" },
  { value: "longText", label: "Đoạn văn bản", icon: FileText, color: "#4c7cff" },
  { value: "select", label: "Tùy chọn", icon: Tag, color: "#ff8b51" },
  { value: "date", label: "Ngày", icon: Calendar, color: "#ff8b51" },
  { value: "checkbox", label: "Hộp kiểm", icon: Check, color: "#c44cff" },
  { value: "file", label: "Tập tin", icon: Paperclip, color: "#c44cff" },
  { value: "number", label: "Số", icon: ListOrdered, color: "#6155ff" },
  
  // Business types
  { value: "phone", label: "Điện thoại", icon: Phone, color: "#4aad6e" },
  { value: "email", label: "Email", icon: Mail, color: "#4aad6e" },
  { value: "url", label: "Liên kết", icon: Link, color: "#6155ff" },
  { value: "currency", label: "Tiền tệ", icon: DollarSign, color: "#ffc043" },
  { value: "rating", label: "Đánh giá", icon: Star, color: "#ffc043" },
  { value: "autoNumber", label: "Đánh số tự động", icon: ListOrdered, color: "#6155ff" },
  { value: "user", label: "Nhân sự", icon: User, color: "#4aad6e" },
  { value: "progress", label: "Tiến độ", icon: GaugeCircle, color: "#b64cff" },
  
  // Advanced types
  { value: "reference", label: "Tham chiếu", icon: Database, color: "#5446e0" },
  { value: "updatedAt", label: "Cập nhật lần cuối lúc", icon: Clock, color: "#ff8b51" },
  { value: "updatedBy", label: "Cập nhật lần cuối bởi", icon: CalendarClock, color: "#ff8b51" },
  { value: "createdBy", label: "Tạo bởi", icon: User, color: "#ffc043" },
  { value: "createdAt", label: "Tạo lúc", icon: Calendar, color: "#ffc043" },
  { value: "lookup", label: "Tra cứu", icon: Search, color: "#b64cff" },
  { value: "formula", label: "Công thức", icon: Function, color: "#e34a6b" },
];

export const fieldTypeCategories = {
  basic: {
    label: "Cơ bản",
    types: fieldTypes.filter(type => 
      ["text", "longText", "select", "date", "checkbox", "file", "number"].includes(type.value)
    )
  },
  business: {
    label: "Dành cho doanh nghiệp",
    types: fieldTypes.filter(type => 
      ["phone", "email", "url", "currency", "rating", "autoNumber", "user", "progress"].includes(type.value)
    )
  },
  advanced: {
    label: "Nâng cao",
    types: fieldTypes.filter(type => 
      ["reference", "updatedAt", "updatedBy", "createdBy", "createdAt", "lookup", "formula"].includes(type.value)
    )
  }
};

export const getFieldIcon = (fieldType: string): LucideIcon => {
  return fieldTypes.find(type => type.value === fieldType)?.icon || AlignLeft;
};

export function getDefaultValueForType(fieldType: string): any {
  switch (fieldType) {
    case "text":
    case "longText":
    case "email":
    case "url":
    case "phone":
      return "";
    case "number":
    case "currency":
    case "rating":
    case "progress":
    case "autoNumber":
      return 0;
    case "date":
    case "updatedAt":
    case "updatedBy":
    case "createdAt":
    case "createdBy":
      return null;
    case "checkbox":
      return false;
    case "select":
      return [];
    case "file":
      return null;
    case "reference":
    case "lookup":
    case "formula":
    case "user":
      return null;
    default:
      return null;
  }
}
