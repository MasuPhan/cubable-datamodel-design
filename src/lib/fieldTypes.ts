
import {
  AlignLeft, FileText, Calendar, Check, Link, File, 
  User, Phone, Mail, DollarSign, List, 
  Clock, Database, Tag, Star, Search,
  Code, Paperclip, LucideIcon, ListOrdered,
  CalendarClock, Binary, GaugeCircle
} from "lucide-react";

export type FieldType = {
  value: string;
  label: string;
  icon: LucideIcon;
  color?: string;
};

export const fieldTypes: FieldType[] = [
  // Basic types
  { value: "text", label: "Text", icon: AlignLeft, color: "#4c7cff" },
  { value: "longText", label: "Long Text", icon: FileText, color: "#4c7cff" },
  { value: "select", label: "Select", icon: Tag, color: "#ff8b51" },
  { value: "date", label: "Date", icon: Calendar, color: "#ff8b51" },
  { value: "checkbox", label: "Checkbox", icon: Check, color: "#c44cff" },
  { value: "file", label: "File", icon: Paperclip, color: "#c44cff" },
  { value: "number", label: "Number", icon: ListOrdered, color: "#6155ff" },
  
  // Business types
  { value: "phone", label: "Phone", icon: Phone, color: "#4aad6e" },
  { value: "email", label: "Email", icon: Mail, color: "#4aad6e" },
  { value: "url", label: "URL", icon: Link, color: "#6155ff" },
  { value: "currency", label: "Currency", icon: DollarSign, color: "#ffc043" },
  { value: "rating", label: "Rating", icon: Star, color: "#ffc043" },
  { value: "autoNumber", label: "Auto Number", icon: ListOrdered, color: "#6155ff" },
  { value: "user", label: "User", icon: User, color: "#4aad6e" },
  { value: "progress", label: "Progress", icon: GaugeCircle, color: "#b64cff" },
  
  // Advanced types
  { value: "reference", label: "Reference (1-way)", icon: Database, color: "#5446e0" },
  { value: "referenceTwo", label: "Reference (2-way)", icon: Database, color: "#e34a6b" },
  { value: "updatedAt", label: "Last Updated At", icon: Clock, color: "#ff8b51" },
  { value: "updatedBy", label: "Last Updated By", icon: CalendarClock, color: "#ff8b51" },
  { value: "createdBy", label: "Created By", icon: User, color: "#ffc043" },
  { value: "createdAt", label: "Created At", icon: Calendar, color: "#ffc043" },
  { value: "lookup", label: "Lookup", icon: Search, color: "#b64cff" },
  { value: "formula", label: "Formula", icon: Binary, color: "#e34a6b" },
];

export const fieldTypeCategories = {
  basic: {
    label: "Basic",
    types: fieldTypes.filter(type => 
      ["text", "longText", "select", "date", "checkbox", "file", "number"].includes(type.value)
    )
  },
  business: {
    label: "Business",
    types: fieldTypes.filter(type => 
      ["phone", "email", "url", "currency", "rating", "autoNumber", "user", "progress"].includes(type.value)
    )
  },
  advanced: {
    label: "Advanced",
    types: fieldTypes.filter(type => 
      ["reference", "referenceTwo", "updatedAt", "updatedBy", "createdBy", "createdAt", "lookup", "formula"].includes(type.value)
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
    case "referenceTwo":
    case "lookup":
    case "formula":
    case "user":
      return null;
    default:
      return null;
  }
}
