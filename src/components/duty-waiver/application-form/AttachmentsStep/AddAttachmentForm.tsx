
"use client";
import React, { useEffect, useState } from 'react';
import useApplication from '@/hooks/useApplications';
import Label from '@/components/ui-utils/Label';
import Select from '@/components/ui-utils/Select';
import { ChevronDownIcon } from '@/icons';
import Button from '@/components/ui/button/Button';

interface AddAttachmentFormProps {
  onSave: (type: string) => void;
  onCancel: () => void;
}

export const AddAttachmentForm: React.FC<AddAttachmentFormProps> = ({
  onSave,
  onCancel
}) => {
  const [attachmentType, setAttachmentType] = useState("");
  const [attachmentTypeOptions, setAttachmentTypeOptions] = useState<{ value: string, label: string }[]>([]);
  const { getAttachmentTypes } = useApplication();

  useEffect(() => {
    const fetchAttachmentTypes = async () => {
      try {
        const attachmentTypes = await getAttachmentTypes();
        const options = attachmentTypes.map((type: any) => ({
          value: String(type.id),
          label: type.name || type.description || String(type.id)
        }));
        setAttachmentTypeOptions(options);
      } catch (error) {
        console.error('Failed to fetch attachment types:', error);
      }
    };

    fetchAttachmentTypes();
  }, [getAttachmentTypes]);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label>Document Type</Label>
          <div className="relative">
            <Select
              options={attachmentTypeOptions}
              value={attachmentType}
              placeholder="Select document type"
              onChange={(value) => setAttachmentType(value)}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <Button
            onClick={() => onSave(attachmentType)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!attachmentType}
          >
            Save
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

// "use client";
// import React, { useEffect, useState } from 'react';
// // import { attachmentTypeOptions } from '../constants';
// // import { attachmentTypeOptions } from '@/utils/constants';
// import useApplication from '@/hooks/useApplications';
// import Label from '@/components/ui-utils/Label';
// import Select from '@/components/ui-utils/Select';
// import { ChevronDownIcon } from '@/icons';
// import Button from '@/components/ui/button/Button';

// interface AddAttachmentFormProps {
//   onSave: (type: string) => void;
//   onCancel: () => void;
// }

// export const AddAttachmentForm: React.FC<AddAttachmentFormProps> = ({
//   onSave,
//   onCancel
// }) => {
//   const [attachmentType, setAttachmentType] = useState("");

//   const [attachmentTypeOptions, setAttachmentTypeOptions] = useState<{ value: string, label: string }[]>([]);
//   const { getAttachmentTypes } = useApplication();

//   useEffect(() => {

//     const fetchAttachmentTypes = async () => {
//       try {
//         const attachmentTypeOptions = await getAttachmentTypes();
//         const options = attachmentTypeOptions.map((type: any) => ({
//           value: type.name,
//           label: type.name
//         }));
//         setAttachmentTypeOptions(options);
//       } catch (error) {
//         console.error('Failed to fetch project types:', error);
//       }
//     };

//     fetchAttachmentTypes();
//   }, []);

//   return (
//     <div className="border rounded-lg p-4">
//       <div className="flex flex-col md:flex-row gap-4">
//         <div className="flex-1">
//           <Label>Document Type</Label>
//           <div className="relative">
//             <Select
//               options={attachmentTypeOptions}
//               placeholder="Select document type"
//               onChange={setAttachmentType}
//               className="dark:bg-dark-900"
//             />
//             <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
//               <ChevronDownIcon />
//             </span>
//           </div>
//         </div>
//         <div className="flex items-end gap-2">
//           <Button
//             onClick={() => onSave(attachmentType)}
//             className="bg-blue-600 hover:bg-blue-700 text-white"
//             disabled={!attachmentType}
//           >
//             Save
//           </Button>
//           <Button
//             onClick={onCancel}
//             variant="outline"
//           >
//             Cancel
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };