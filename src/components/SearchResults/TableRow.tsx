import React from 'react';
import { TableCell } from './TableCell';
import { StarRating } from '../StarRating';
import { formatPrice } from '../../utils/formatters';
import { TableRowProps } from './types';

export function TableRow({ product, onDoubleClick }: TableRowProps) {
  return (
    <tr 
      className="hover:bg-blue-50/30 transition-colors cursor-pointer"
      onDoubleClick={() => onDoubleClick(product)}
    >
      <TableCell className="w-[40%]">
        <div className="flex items-start">
          <span className="font-medium text-gray-900 line-clamp-3">
            {product.name}
          </span>
        </div>
      </TableCell>
      
      <TableCell className="w-24 pl-2 pr-4">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
          />
        </div>
      </TableCell>
      
      <TableCell className="w-32">
        {product.viscosity_grade}
      </TableCell>
      
      <TableCell className="w-28">
        {product.manufacturer}
      </TableCell>
      
      <TableCell className="w-24" align="right">
        {formatPrice(product.price)}
      </TableCell>
      
      <TableCell className="w-24" align="right">
        {product.sales_volume !== null ? `${product.sales_volume.toLocaleString()}/月` : ''}
      </TableCell>
      
      <TableCell className="w-32" align="center">
        <div className="flex items-center">
          <StarRating rating={product.average_rating || 0} />
          <span className="ml-2">{product.average_rating}</span>
        </div>
      </TableCell>
      
      <TableCell className="w-24" align="right">
        {(product.review_count || 0).toLocaleString()}
      </TableCell>
    </tr>
  );
}