
export const templateModels = [
  {
    id: "customer-management",
    name: "Quản lý khách hàng",
    tables: [
      {
        id: "customers",
        name: "Khách hàng",
        position: { x: 50, y: 50 },
        fields: [
          { id: "customer-id", name: "ID", type: "id", required: true, unique: true },
          { id: "customer-name", name: "Tên khách hàng", type: "text", required: true, unique: false },
          { id: "customer-email", name: "Email", type: "email", required: true, unique: true },
          { id: "customer-phone", name: "Số điện thoại", type: "phone", required: false, unique: false },
          { id: "customer-address", name: "Địa chỉ", type: "text", required: false, unique: false },
          { id: "customer-type", name: "Loại khách hàng", type: "select", required: false, unique: false },
          { id: "customer-created", name: "Ngày tạo", type: "date", required: false, unique: false }
        ]
      },
      {
        id: "orders",
        name: "Đơn hàng",
        position: { x: 400, y: 50 },
        fields: [
          { id: "order-id", name: "ID", type: "id", required: true, unique: true },
          { id: "order-customer", name: "Khách hàng", type: "reference", required: true, unique: false },
          { id: "order-date", name: "Ngày đặt hàng", type: "date", required: true, unique: false },
          { id: "order-total", name: "Tổng giá trị", type: "currency", required: true, unique: false },
          { id: "order-status", name: "Trạng thái", type: "select", required: true, unique: false }
        ]
      },
      {
        id: "products",
        name: "Sản phẩm",
        position: { x: 400, y: 300 },
        fields: [
          { id: "product-id", name: "ID", type: "id", required: true, unique: true },
          { id: "product-name", name: "Tên sản phẩm", type: "text", required: true, unique: false },
          { id: "product-price", name: "Giá", type: "currency", required: true, unique: false },
          { id: "product-description", name: "Mô tả", type: "longText", required: false, unique: false },
          { id: "product-image", name: "Hình ảnh", type: "image", required: false, unique: false }
        ]
      }
    ],
    relationships: [
      {
        id: "customer-orders",
        sourceTableId: "customers",
        sourceFieldId: "customer-id",
        targetTableId: "orders",
        targetFieldId: "order-customer",
        type: "oneToMany"
      },
      {
        id: "order-products",
        sourceTableId: "orders",
        sourceFieldId: "order-id",
        targetTableId: "products",
        targetFieldId: "product-id",
        type: "manyToMany"
      }
    ]
  },
  {
    id: "task-management",
    name: "Quản lý công việc",
    tables: [
      {
        id: "projects",
        name: "Dự án",
        position: { x: 50, y: 50 },
        fields: [
          { id: "project-id", name: "ID", type: "id", required: true, unique: true },
          { id: "project-name", name: "Tên dự án", type: "text", required: true, unique: false },
          { id: "project-description", name: "Mô tả", type: "longText", required: false, unique: false },
          { id: "project-start", name: "Ngày bắt đầu", type: "date", required: false, unique: false },
          { id: "project-end", name: "Ngày kết thúc", type: "date", required: false, unique: false },
          { id: "project-status", name: "Trạng thái", type: "select", required: true, unique: false }
        ]
      },
      {
        id: "tasks",
        name: "Công việc",
        position: { x: 400, y: 50 },
        fields: [
          { id: "task-id", name: "ID", type: "id", required: true, unique: true },
          { id: "task-name", name: "Tên công việc", type: "text", required: true, unique: false },
          { id: "task-description", name: "Mô tả", type: "longText", required: false, unique: false },
          { id: "task-project", name: "Dự án", type: "reference", required: true, unique: false },
          { id: "task-assignee", name: "Người thực hiện", type: "user", required: false, unique: false },
          { id: "task-status", name: "Trạng thái", type: "select", required: true, unique: false },
          { id: "task-due", name: "Hạn chót", type: "date", required: false, unique: false },
          { id: "task-priority", name: "Độ ưu tiên", type: "select", required: false, unique: false }
        ]
      },
      {
        id: "users",
        name: "Người dùng",
        position: { x: 50, y: 300 },
        fields: [
          { id: "user-id", name: "ID", type: "id", required: true, unique: true },
          { id: "user-name", name: "Tên", type: "text", required: true, unique: false },
          { id: "user-email", name: "Email", type: "email", required: true, unique: true },
          { id: "user-role", name: "Vai trò", type: "select", required: true, unique: false }
        ]
      }
    ],
    relationships: [
      {
        id: "project-tasks",
        sourceTableId: "projects",
        sourceFieldId: "project-id",
        targetTableId: "tasks",
        targetFieldId: "task-project",
        type: "oneToMany"
      },
      {
        id: "user-tasks",
        sourceTableId: "users",
        sourceFieldId: "user-id",
        targetTableId: "tasks",
        targetFieldId: "task-assignee",
        type: "oneToMany"
      }
    ]
  },
  {
    id: "content-management",
    name: "Quản lý nội dung",
    tables: [
      {
        id: "articles",
        name: "Bài viết",
        position: { x: 50, y: 50 },
        fields: [
          { id: "article-id", name: "ID", type: "id", required: true, unique: true },
          { id: "article-title", name: "Tiêu đề", type: "text", required: true, unique: false },
          { id: "article-content", name: "Nội dung", type: "richText", required: true, unique: false },
          { id: "article-author", name: "Tác giả", type: "user", required: true, unique: false },
          { id: "article-published", name: "Ngày xuất bản", type: "date", required: false, unique: false },
          { id: "article-status", name: "Trạng thái", type: "select", required: true, unique: false },
          { id: "article-tags", name: "Thẻ", type: "tags", required: false, unique: false }
        ]
      },
      {
        id: "categories",
        name: "Danh mục",
        position: { x: 400, y: 50 },
        fields: [
          { id: "category-id", name: "ID", type: "id", required: true, unique: true },
          { id: "category-name", name: "Tên danh mục", type: "text", required: true, unique: true },
          { id: "category-description", name: "Mô tả", type: "text", required: false, unique: false },
          { id: "category-parent", name: "Danh mục cha", type: "reference", required: false, unique: false },
          { id: "category-image", name: "Hình ảnh", type: "image", required: false, unique: false }
        ]
      },
      {
        id: "media",
        name: "Phương tiện",
        position: { x: 400, y: 300 },
        fields: [
          { id: "media-id", name: "ID", type: "id", required: true, unique: true },
          { id: "media-name", name: "Tên tệp", type: "text", required: true, unique: false },
          { id: "media-file", name: "Tệp", type: "file", required: true, unique: false },
          { id: "media-type", name: "Loại tệp", type: "select", required: true, unique: false },
          { id: "media-size", name: "Kích thước", type: "number", required: false, unique: false },
          { id: "media-uploaded", name: "Ngày tải lên", type: "date", required: true, unique: false }
        ]
      }
    ],
    relationships: [
      {
        id: "article-category",
        sourceTableId: "articles",
        sourceFieldId: "article-id",
        targetTableId: "categories",
        targetFieldId: "category-id",
        type: "manyToMany"
      },
      {
        id: "article-media",
        sourceTableId: "articles",
        sourceFieldId: "article-id",
        targetTableId: "media",
        targetFieldId: "media-id",
        type: "manyToMany"
      }
    ]
  }
];
