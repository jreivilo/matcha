import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetcher } from "@/api";

const InterestSelector = ({ interests, setInterests, newInterest, setNewInterest }) => {
  const [open, setOpen] = useState(false);
  const [filteredInterests, setFilteredInterests] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const { data: uniqueInterests } = useQuery({
    queryKey: ['uniqueInterests'],
    queryFn: async () => {
      const data = await fetcher('http://localhost:3000/interest/unique-interests', {}, 'GET');
      return data.unique_interests;
    },
    onError: (error) => {
      console.error('Error fetching unique interests:', error);
    },
  });

  const availableInterests = React.useMemo(() => {
    if (!uniqueInterests) return [];
    return uniqueInterests.filter(interest => !interests.includes(interest));
  }, [uniqueInterests, interests]);

  const handleAddInterest = (interest) => {
    if (!interests.includes(interest)) {
      setInterests([...interests, interest]);
      setNewInterest('');
      setOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddInterest(newInterest);
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setInterests(interests.filter(interest => interest !== interestToRemove));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
  
    if (uniqueInterests && uniqueInterests.length > 0) {
      const filteredInterests = uniqueInterests.filter(interest =>
        interest.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredInterests(filteredInterests);  // Ensure this is initialized
    }
  };
  

  return (
    <div className="space-y-4">
      <Label>Interests</Label>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {interests && interests.map((interest, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-black bg-opacity-50 rounded-full flex items-center gap-2"
          >
            {interest}
            <button
              type="button"
              onClick={() => handleRemoveInterest(interest)}
              className="text-sm hover:text-black-500"
            >
            </button>
          </span>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            value={newInterest}
            onChange={handleInputChange}
            placeholder="Add an interest..."
            onClick={() => setOpen(true)}
            onKeyDown={handleKeyDown} 
          />
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search interests..." 
              value={newInterest} 
              onValueChange={setNewInterest} 
            />
            <CommandEmpty>
              {newInterest && (
                <CommandItem onSelect={() => handleAddInterest(newInterest)}>
                  Add "{newInterest}" (new)
                </CommandItem>
              )}
            </CommandEmpty>
            <CommandGroup>
              {availableInterests
                .filter(interest =>
                  interest.includes(newInterest)
                )
                .map((interest) => (
                  <CommandItem
                    key={interest}
                    onSelect={() => handleAddInterest(interest)}
                  >
                    {interest}
                  </CommandItem>
                ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default InterestSelector;