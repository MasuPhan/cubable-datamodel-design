import {
  AlignLeft, Hash, Calendar, Check, FileText, Link, Image, 
  User, MapPin, Phone, Mail, Percent, DollarSign, Clock,
  File, List, BarChart2, Database, Tag, CircleSlash, Star,
  Box, FileJson, Layers, FileUp, MessageCircle, Palette,
  Code, ToggleLeft, Paperclip, LucideIcon
} from "lucide-react";
import { Search } from "lucide-react";

export type FieldType = {
  value: string;
  label: string;
  icon: LucideIcon;
};

export const fieldTypes: FieldType[] = [
  // Text types
  { value: "id", label: "ID", icon: Hash },
  { value: "text", label: "Văn bản", icon: AlignLeft },
  { value: "longText", label: "Văn bản dài", icon: FileText },
  { value: "richText", label: "Văn bản có định dạng", icon: FileText },
  { value: "email", label: "Email", icon: Mail },
  { value: "url", label: "URL", icon: Link },
  { value: "phone", label: "Số điện thoại", icon: Phone },
  
  // Number types
  { value: "number", label: "Số", icon: Hash },
  { value: "decimal", label: "Số thập phân", icon: Hash },
  { value: "percent", label: "Phần trăm", icon: Percent },
  { value: "currency", label: "Tiền tệ", icon: DollarSign },
  { value: "rating", label: "Đánh giá", icon: Star },
  
  // Date types
  { value: "date", label: "Ngày", icon: Calendar },
  { value: "datetime", label: "Ngày giờ", icon: Calendar },
  { value: "time", label: "Thời gian", icon: Clock },
  
  // Boolean types
  { value: "boolean", label: "True/False", icon: Check },
  { value: "checkbox", label: "Checkbox", icon: Check },
  { value: "toggle", label: "Toggle", icon: ToggleLeft },
  
  // Selection types
  { value: "select", label: "Lựa chọn đơn", icon: List },
  { value: "multiSelect", label: "Lựa chọn nhiều", icon: List },
  { value: "tags", label: "Tags", icon: Tag },
  
  // File types
  { value: "attachment", label: "Tệp đính kèm", icon: Paperclip },
  { value: "image", label: "Hình ảnh", icon: Image },
  { value: "file", label: "Tệp tin", icon: File },
  
  // Reference types
  { value: "reference", label: "Tham chiếu", icon: Link },
  { value: "foreignKey", label: "Khóa ngoại", icon: Link },
  
  // Special types
  { value: "color", label: "Màu sắc", icon: Palette },
  { value: "json", label: "JSON", icon: FileJson },
  { value: "code", label: "Code", icon: Code },
  { value: "formula", label: "Công thức", icon: Code },
  { value: "count", label: "Số lượng", icon: Hash },
  { value: "computed", label: "Tính toán", icon: BarChart2 },
  { value: "lookup", label: "Tra cứu", icon: Search },
  
  // Other types
  { value: "user", label: "Người dùng", icon: User },
  { value: "location", label: "Vị trí", icon: MapPin },
  { value: "status", label: "Trạng thái", icon: Tag },
  { value: "comment", label: "Bình luận", icon: MessageCircle },
];

export const fieldTypeCategories = {
  basic: {
    label: "Cơ bản",
    types: fieldTypes.filter(type => 
      ["id", "text", "number", "date", "boolean", "select", "attachment", "reference"].includes(type.value)
    )
  },
  advanced: {
    label: "Nâng cao",
    types: fieldTypes.filter(type => 
      ["longText", "richText", "email", "url", "phone", "decimal", "percent", "currency", 
       "datetime", "time", "multiSelect", "tags", "image", "file", "foreignKey"].includes(type.value)
    )
  },
  special: {
    label: "Đặc biệt",
    types: fieldTypes.filter(type => 
      ["color", "json", "code", "formula", "count", "computed", "lookup", 
       "user", "location", "status", "comment", "rating"].includes(type.value)
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
    case "richText":
    case "email":
    case "url":
    case "phone":
      return "";
    case "number":
    case "decimal":
    case "percent":
    case "currency":
    case "rating":
      return 0;
    case "date":
    case "datetime":
    case "time":
      return null;
    case "boolean":
    case "checkbox":
    case "toggle":
      return false;
    case "select":
    case "multiSelect":
    case "tags":
      return [];
    case "attachment":
    case "image":
    case "file":
      return null;
    case "reference":
    case "foreignKey":
      return null;
    case "json":
      return {};
    default:
      return null;
  }
}
