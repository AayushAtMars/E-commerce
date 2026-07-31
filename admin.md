# Single Vendor Ecommerce Admin Panel

## 1. Authentication, Role & Access Management

| Screen / Module | Purpose & Content / Widgets | User Actions | Backend / Admin Connections | Next Screens / Flow | Roles & Access | Feature Level | Compliance / Optimization Notes |
|---|---|---|---|---|---|---|---|
| Admin Login | Login form, captcha, forgot password | Login | Auth Service | → Dashboard | All Admin Roles | MVP | CAPTCHA, rate limit |
| Role & Access Manager | Roles list, permission matrix (view/create/edit/delete) | Create/edit roles | RBAC Service | → Role List | Super Admin | MVP | Least privilege |
| Permission Mapping | Module-wise permissions | Assign permissions | RBAC Service | → Admin Users | Super Admin | MVP | Policy-based |
| Admin User Management | Admin list, role assignment, status | Add/edit/block admin | Admin Service | → Admin List | Super Admin | MVP | Full audit logs |
| Session Management | Active sessions | Logout / force logout | Auth Service | → Login | Super Admin | MVP | Token revocation |

## 2. User Management (Customers)

| Screen / Module | Purpose & Content / Widgets | User Actions | Backend / Admin Connections | Next Screens / Flow | Roles & Access | Feature Level | Compliance / Optimization Notes |
|---|---|---|---|---|---|---|---|
| User List | Customer list, status, search | View users | User Service | → User Detail | Admin, Support | MVP | Pagination |
| User Detail | Profile, orders, tickets | View details | User + Order Service | → Orders / Tickets | Admin, Support | MVP | Mask PII |
| Block / Unblock User | User account control | Block / unblock user | User Service | → User List | Admin | MVP | Reason mandatory |
| User Activity Log | Login & activity history | View logs | Audit Service | → User Detail | Admin | MVP | GDPR compliant |
| User Notification Preferences | Opt-in/out status | View preferences | Notification Service | → Marketing Rules | Admin | MVP | Consent enforced |

## 3. Category & Product Management (with Show / Hide)

| Screen / Module | Purpose & Content / Widgets | User Actions | Backend / Admin Connections | Next Screens / Flow | Roles & Access | Feature Level | Compliance / Optimization Notes |
|---|---|---|---|---|---|---|---|
| Category List | Categories & status | Add/edit/disable | Category Service | → Category Detail | Product Manager | MVP | Soft delete |
| Product List | Product ID, name, status, stock | View products | Product Service | → Product Detail | Product Manager | MVP | Indexed |
| Product Detail | Full product data | Edit product | Product Service | → Inventory | Product Manager | MVP | Versioned |
| Product Show / Hide | Visibility toggle by Product ID | Show / hide product | Product Service | → Product List | Product Manager | MVP | Soft hide only |
| Bulk Product Visibility | CSV / bulk action | Bulk show/hide | Product Service | → Summary | Product Manager | MVP | Idempotent |
| Inventory Management | Stock & thresholds | Update stock | Inventory Service | → Product List | Inventory Manager | MVP | Low-stock alerts |

## 4. Order Management & Tracking (Status-Driven)

| Screen / Module | Purpose & Content / Widgets | User Actions | Backend / Admin Connections | Next Screens / Flow | Roles & Access | Feature Level | Compliance / Optimization Notes |
|---|---|---|---|---|---|---|---|
| Order List | Orders table, filters | View order | Order Service | → Order Detail | Order Manager | MVP | SLA timers |
| Order Detail | Items, payment, customer | Update status | Order Orchestrator | → Shipment / Refund | Order Manager | MVP | State machine |
| Order Timeline | Full lifecycle timeline | View timeline | Event Store | → Shipment | Support | MVP | Immutable logs |
| Order Status Update | Status transitions | Confirm update | Order Orchestrator | → Notification | Order Manager | MVP | Rule enforced |

## 5. Shipment, Return, Refund, Replacement

| Screen / Module | Purpose & Content / Widgets | User Actions | Backend / Admin Connections | Next Screens / Flow | Roles & Access | Feature Level | Compliance / Optimization Notes |
|---|---|---|---|---|---|---|---|
| Shipment Creation | Courier, tracking ID | Create shipment | Shipment Service | → Tracking | Order Manager | MVP | API/manual |
| Shipment Tracking | Shipment timeline | View tracking | Shipment Service | → Order Detail | Support | MVP | Auto sync |
| Return Requests | Return list | Approve/reject | Return Service | → Refund / Replace | Support | MVP | Policy driven |
| Refund Processing | Refund amount & mode | Initiate refund | Payment Service | → Invoice | Finance | MVP | Ledger safe |
| Replacement Order | Replacement creation | Approve replacement | Order Service | → Shipment | Order Manager | MVP | Linked order |

## 6. Grievance / Ticket Management

| Screen / Module | Purpose & Content / Widgets | User Actions | Backend / Admin Connections | Next Screens / Flow | Roles & Access | Feature Level | Compliance / Optimization Notes |
|---|---|---|---|---|---|---|---|
| Ticket Dashboard | All tickets, SLA | View tickets | Ticket Service | → Ticket Detail | Support | MVP | SLA tagging |
| Ticket Detail | Conversation, attachments | Reply/update | Ticket Service | → Resolution | Support | MVP | Audit trail |
| Ticket Escalation | Escalated tickets | Resolve/escalate | SLA Service | → Admin Review | Admin | MVP | Auto escalation |
| Ticket Closure | Final resolution | Close ticket | Ticket Service | → Notification | Support | MVP | Time bound |

## 7. Payment, Invoice & Status Communication

| Screen / Module | Purpose & Content / Widgets | User Actions | Backend / Admin Connections | Next Screens / Flow | Roles & Access | Feature Level | Compliance / Optimization Notes |
|---|---|---|---|---|---|---|---|
| Payment Logs | Transactions list | View details | Payment Service | → Order Detail | Finance | MVP | PCI compliant |
| Invoice Generation | Auto invoice PDF | Auto-generate | Invoice Service | → Email / Order | System | MVP | Immutable |
| Credit Notes | Refund invoices | Auto-generate | Invoice Service | → Email | Finance | MVP | Accounting safe |
| Status Notifications | Order/ticket status | Auto send | Notification Orchestrator | → Logs | System | MVP | Event-driven |

## 8. Notification, Email & Marketing (Rule-Based)

| Screen / Module | Purpose & Content / Widgets | User Actions | Backend / Admin Connections | Next Screens / Flow | Roles & Access | Feature Level | Compliance / Optimization Notes |
|---|---|---|---|---|---|---|---|
| Notification Templates | Email & push templates | Create/edit | Template Service | → Preview | Admin | MVP | Versioned |
| Event Trigger Mapping | Map events to templates | Configure rules | Rules Engine | → Save | Admin | MVP | No hardcode |
| Notification Logs | Delivery logs | View logs | Notification Service | → Entity | Admin | MVP | Retry + DLQ |
| User-Based Marketing | User segment triggers | Configure | Campaign Service | → Push | Marketing Admin | MVP | Opt-in required |
| Category-Based Marketing | Category triggers | Configure | Rules Engine | → Push | Marketing Admin | MVP | Frequency caps |

## 9. Reports, Audit & System Settings

| Screen / Module | Purpose & Content / Widgets | User Actions | Backend / Admin Connections | Next Screens / Flow | Roles & Access | Feature Level | Compliance / Optimization Notes |
|---|---|---|---|---|---|---|---|
| Reports Dashboard | Sales, tax, orders | Export reports | Report Service | → Download | Admin | MVP | Cached |
| Audit Logs | System-wide actions | View logs | Audit Service | → Entity | Super Admin | MVP | WORM storage |
| Store Settings | Config & toggles | Update config | Config Service | → Dashboard | Super Admin | MVP | Versioned |
| Feature Toggles | Enable/disable modules | Toggle | Config Service | → System | Super Admin | MVP | Kill switch |