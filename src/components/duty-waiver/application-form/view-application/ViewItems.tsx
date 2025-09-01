'use client';
import React, { useEffect, useState } from 'react';
import { Item } from '@/types/ItemModel';
import useApplication from '@/hooks/useApplications';

interface ViewItemsProps {
  items: Item[];
}

export const ViewItems: React.FC<ViewItemsProps> = ({ items }) => {
  const { getUnitOfMeasure } = useApplication();
  const [uomMap, setUomMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const uoms = await getUnitOfMeasure();
        const map: Record<string, string> = {};
        (uoms || []).forEach((u: any) => {
          if (u.code != null) map[String(u.code)] = u.code;
          if (u.id != null) map[String(u.id)] = u.code;
        });
        setUomMap(map);
      } catch {}
    };
    load();
  }, [getUnitOfMeasure]);

  const getUnitOfMeasureLabel = (uomId: number | string) => {
    const key = String(uomId);
    return uomMap[key] || key;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
        Items
      </h3>

      {items.length === 0 ? (
        <p className="text-gray-500 italic">No items have been added to this application.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HS Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value (MWK)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duty Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-800">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {item.hsCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {getUnitOfMeasureLabel(item.uomId || '')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {Number(item.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {Number(item.dutyAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {items.length > 0 && (
        <div className="flex justify-end mt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Total Items:</span>
              <span className="text-sm font-medium text-gray-800">{items.length}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Total Value:</span>
              <span className="text-sm font-medium text-gray-800">
                {items.reduce((sum, item) => sum + Number(item.value || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} MWK
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Total Duty Amount:</span>
              <span className="text-sm font-medium text-gray-800">
                {items.reduce((sum, item) => sum + Number(item.dutyAmount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} MWK
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
