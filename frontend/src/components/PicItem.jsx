import React, { memo} from 'react';
import { Trash } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const PicItem = memo(({ pic, onDelete, onSetMain }) => {
  return (
    <div onClick={() => onSetMain(pic)} className="relative flex items-center justify-center">
      <img
        src={`data:image/jpeg;base64,${pic.image}`}
        alt={pic.imageName}
        className={`object-cover w-56 h-48 ${pic.isMain ? 'border-4 border-blue-500' : ''}`}
      />
      <div className="absolute top-2 right-2 opacity-100 group-hover:opacity-100 transition-opacity">
        <Button onClick={(e) => {
          e.stopPropagation();
          onDelete(pic.imageName)
        }}
        variant="ghost" className="h-8 w-8 p-0">
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});