import React from 'react';
import { MoreVertical, Trash, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const PicItem = React.memo(({ pic, onDelete, onSetMain, isMainPicture }) => {
  return (
    <div className="relative group">
      <img
        src={`data:image/jpeg;base64,${pic.image}`}
        alt={pic.imageName}
        className={`object-cover w-56 h-48 ${isMainPicture ? 'border-4 border-blue-500' : ''}`}
      />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white/90 dark:bg-gray-800/90 text-black dark:text-white">
            <DropdownMenuItem onClick={() => onDelete(pic.imageName)} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400">
              Delete
            </DropdownMenuItem>
            {!isMainPicture && (
              <DropdownMenuItem onClick={() => onSetMain(pic.imageName)} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                Set as main picture
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});