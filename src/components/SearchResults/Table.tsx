import React from 'react';
import { TableHeaderCell } from './TableHeaderCell';
import { TableRow } from './TableRow';
import { TableProps } from './types';

export function Table({ products, onRowDoubleClick, tableRef }: TableProps) {
  // productsが配列でない場合は空の配列を使用
  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div ref={tableRef} className="w-full overflow-x-auto">
      <table className="min-w-full table-fixed divide-y divide-blue-100">
        <thead className="sticky top-0 z-50 bg-blue-100">
          <tr>
            <TableHeaderCell className="w-[35%]">
              商品名
            </TableHeaderCell>
            <TableHeaderCell className="w-24 px-2">
              商品画像
            </TableHeaderCell>
            <TableHeaderCell className="w-32">
              粘度グレード
            </TableHeaderCell>
            <TableHeaderCell className="w-28">
              メーカー
            </TableHeaderCell>
            <TableHeaderCell className="w-24" align="right">
              料金
            </TableHeaderCell>
            <TableHeaderCell className="w-28" align="right">
              セールスVol.
            </TableHeaderCell>
            <TableHeaderCell className="w-32" align="center">
              平均評価
            </TableHeaderCell>
            <TableHeaderCell className="w-24" align="right">
              評価件数
            </TableHeaderCell>
          </tr>
        </thead>
        <tbody className="bg-white/50 divide-y divide-blue-100">
          {safeProducts.map((product) => (
            <TableRow
              key={product.id}
              product={product}
              onDoubleClick={onRowDoubleClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}