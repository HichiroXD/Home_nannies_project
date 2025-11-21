/**
 * Index - Barrel export para todos los componentes comunes
 * Permite imports limpios: import { FormBuilder, Modal } from '@/components/common'
 */

// Componentes principales
export { default as FormBuilder, FormBuilder as FormBuilderComponent } from './FormBuilder';
export { default as DataTable, DataTable as DataTableComponent } from './DataTable';
export { default as Modal, Modal as ModalComponent } from './Modal';
export { AlertComponent, AlertComponent as Alert } from './Alert';
export { default as StatCard } from './StatCard';

// Componentes de skeleton/loading
export {
  SkeletonLoader,
  TableSkeleton,
  CardSkeleton,
  ListSkeleton,
  DashboardSkeleton,
  LoadingOverlay,
} from './LoadingSkeleton';

// Componentes de navegación
export { BreadcrumbsComponent } from './Breadcrumbs';

// Componentes de tabs
export { TabsComponent } from './Tabs';

// Componentes de acordeón
export { AccordionComponent } from './Accordion';

// Componentes de paginación
export { PaginationComponent } from './Pagination';

// Componentes de badges
export { BadgeComponent, StatusBadge } from './Badge';

// Custom Hooks
export {
  useForm,
  useAsync,
  usePagination,
  useLocalStorage,
  useFetch,
  useToggle,
} from './hooks';

// Utilidades
export {
  validators,
  formatters,
  storage,
} from './utils';
