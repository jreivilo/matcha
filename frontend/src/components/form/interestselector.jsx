import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const InterestSelector = ({ interests, setInterests, newInterest, setNewInterest }) => {
  const [open, setOpen] = React.useState(false);

  const { data: uniqueInterests } = useQuery({
    queryKey: ['uniqueInterests'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/interest/unique-interests');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data.unique_interests;
    },
    onError: (error) => {
      console.error('Error fetching unique interests:', error);
    }
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

  const handleRemoveInterest = (interestToRemove) => {
    setInterests(interests.filter(interest => interest !== interestToRemove));
  };

  return (
    <div className="space-y-4">
      <Label>Interests</Label>
      
      {/* Selected interests */}
      <div className="flex flex-wrap gap-2 mb-2">
        {interests.map((interest, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-primary/10 rounded-full flex items-center gap-2"
          >
            {interest}
            <button
              type="button"
              onClick={() => handleRemoveInterest(interest)}
              className="text-sm hover:text-red-500"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            placeholder="Add an interest..."
            onClick={() => setOpen(true)}
          />
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search interests..." value={newInterest} onValueChange={setNewInterest} />
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
                  interest.toLowerCase().includes(newInterest.toLowerCase()))
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
