
export const templateModels = [
  {
    id: "customer-management",
    name: "Customer Management",
    tables: [
      {
        id: "customers",
        name: "Customers",
        position: { x: 50, y: 50 },
        fields: [
          { id: "customer-id", name: "ID", type: "id", required: true, unique: true },
          { id: "customer-name", name: "Customer Name", type: "text", required: true, unique: false },
          { id: "customer-email", name: "Email", type: "email", required: true, unique: true },
          { id: "customer-phone", name: "Phone", type: "phone", required: false, unique: false },
          { id: "customer-address", name: "Address", type: "text", required: false, unique: false },
          { id: "customer-type", name: "Customer Type", type: "select", required: false, unique: false },
          { id: "customer-created", name: "Created Date", type: "date", required: false, unique: false }
        ]
      },
      {
        id: "orders",
        name: "Orders",
        position: { x: 400, y: 50 },
        fields: [
          { id: "order-id", name: "ID", type: "id", required: true, unique: true },
          { id: "order-customer", name: "Customer", type: "reference", required: true, unique: false },
          { id: "order-date", name: "Order Date", type: "date", required: true, unique: false },
          { id: "order-total", name: "Total Value", type: "currency", required: true, unique: false },
          { id: "order-status", name: "Status", type: "select", required: true, unique: false }
        ]
      },
      {
        id: "products",
        name: "Products",
        position: { x: 400, y: 300 },
        fields: [
          { id: "product-id", name: "ID", type: "id", required: true, unique: true },
          { id: "product-name", name: "Product Name", type: "text", required: true, unique: false },
          { id: "product-price", name: "Price", type: "currency", required: true, unique: false },
          { id: "product-description", name: "Description", type: "longText", required: false, unique: false },
          { id: "product-image", name: "Image", type: "image", required: false, unique: false }
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
    name: "Task Management",
    tables: [
      {
        id: "projects",
        name: "Projects",
        position: { x: 50, y: 50 },
        fields: [
          { id: "project-id", name: "ID", type: "id", required: true, unique: true },
          { id: "project-name", name: "Project Name", type: "text", required: true, unique: false },
          { id: "project-description", name: "Description", type: "longText", required: false, unique: false },
          { id: "project-start", name: "Start Date", type: "date", required: false, unique: false },
          { id: "project-end", name: "End Date", type: "date", required: false, unique: false },
          { id: "project-status", name: "Status", type: "select", required: true, unique: false }
        ]
      },
      {
        id: "tasks",
        name: "Tasks",
        position: { x: 400, y: 50 },
        fields: [
          { id: "task-id", name: "ID", type: "id", required: true, unique: true },
          { id: "task-name", name: "Task Name", type: "text", required: true, unique: false },
          { id: "task-description", name: "Description", type: "longText", required: false, unique: false },
          { id: "task-project", name: "Project", type: "reference", required: true, unique: false },
          { id: "task-assignee", name: "Assignee", type: "user", required: false, unique: false },
          { id: "task-status", name: "Status", type: "select", required: true, unique: false },
          { id: "task-due", name: "Due Date", type: "date", required: false, unique: false },
          { id: "task-priority", name: "Priority", type: "select", required: false, unique: false }
        ]
      },
      {
        id: "users",
        name: "Users",
        position: { x: 50, y: 300 },
        fields: [
          { id: "user-id", name: "ID", type: "id", required: true, unique: true },
          { id: "user-name", name: "Name", type: "text", required: true, unique: false },
          { id: "user-email", name: "Email", type: "email", required: true, unique: true },
          { id: "user-role", name: "Role", type: "select", required: true, unique: false }
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
    name: "Content Management",
    tables: [
      {
        id: "articles",
        name: "Articles",
        position: { x: 50, y: 50 },
        fields: [
          { id: "article-id", name: "ID", type: "id", required: true, unique: true },
          { id: "article-title", name: "Title", type: "text", required: true, unique: false },
          { id: "article-content", name: "Content", type: "richText", required: true, unique: false },
          { id: "article-author", name: "Author", type: "user", required: true, unique: false },
          { id: "article-published", name: "Publish Date", type: "date", required: false, unique: false },
          { id: "article-status", name: "Status", type: "select", required: true, unique: false },
          { id: "article-tags", name: "Tags", type: "tags", required: false, unique: false }
        ]
      },
      {
        id: "categories",
        name: "Categories",
        position: { x: 400, y: 50 },
        fields: [
          { id: "category-id", name: "ID", type: "id", required: true, unique: true },
          { id: "category-name", name: "Category Name", type: "text", required: true, unique: true },
          { id: "category-description", name: "Description", type: "text", required: false, unique: false },
          { id: "category-parent", name: "Parent Category", type: "reference", required: false, unique: false },
          { id: "category-image", name: "Image", type: "image", required: false, unique: false }
        ]
      },
      {
        id: "media",
        name: "Media",
        position: { x: 400, y: 300 },
        fields: [
          { id: "media-id", name: "ID", type: "id", required: true, unique: true },
          { id: "media-name", name: "File Name", type: "text", required: true, unique: false },
          { id: "media-file", name: "File", type: "file", required: true, unique: false },
          { id: "media-type", name: "File Type", type: "select", required: true, unique: false },
          { id: "media-size", name: "Size", type: "number", required: false, unique: false },
          { id: "media-uploaded", name: "Upload Date", type: "date", required: true, unique: false }
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
