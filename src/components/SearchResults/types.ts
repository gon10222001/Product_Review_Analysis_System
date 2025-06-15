import { Product } from '../../types';

export interface TableProps {
  products: Product[];
  onRowDoubleClick: (product: Product) => void;
  tableRef: React.RefObject<HTMLDivElement>;
}

export interface HeaderProps {
  resultCount: number;
}

export interface TableRowProps {
  product: Product;
  onDoubleClick: (product: Product) => void;
}

export interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}