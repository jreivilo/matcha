import React, { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetcher } from "@/api";
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

const API_URL = '/api';

const InterestSelector = ({ interests, setInterests }) => {
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('');

  const { data: uniqueInterests, isLoading, isError } = useQuery({
    queryKey: ['uniqueInterests'],
    queryFn: async () => {
      const data = await fetcher('/interest/unique-interests', {}, 'GET');
      return data.unique_interests;
    },
    onError: (error) => {
      console.error('Error fetching unique interests:', error);
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error fetching unique interests.</p>;

  const filteredInterests = uniqueInterests
  .filter((interest) => 
    interest.toLowerCase().includes(filter.toLowerCase()) && 
    !interests.includes(interest))

  const handleRemoveInterest = (interestToRemove) => {
    setInterests(interests.filter(interest => interest !== interestToRemove));
  };

  const handleAddNewInterest = () => {
    const sanitizedInput = inputValue.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (sanitizedInput && !interests.includes(sanitizedInput)) {
      setInterests([...interests, sanitizedInput]);
      setInputValue('');
    }
  }

  const handleAddExistingInterest = (interest) => {
    if (!interests.includes(interest)) {
      setInterests([...interests, interest]);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-wrap gap-2">
        {interests.map((interest) => (
          <span key={interest} className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800">
            #{interest}
          </span>
        ))}
      </div>
      <Dialog>
        <DialogTrigger className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600">
          {(interests.length > 0) ? 'Modify' : 'Add interests'}
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modify Interests</DialogTitle>
            <DialogDescription>Select interests to add or remove.</DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-row gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Current Interests</h3>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <span key={interest}
                    onClick={() => handleRemoveInterest(interest)}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white cursor-pointer">
                    #{interest} <p className='text-red-500'>x</p>
                  </span>
                ))}
              </div>
            </div>


            <div className="space-y-2">
              <h3 className="font-medium">click to add from existing interests</h3>
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="type to filter"
                className="w-full px-3 py-2 border rounded-md"
              />
              <div className="max-h-48 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {filteredInterests.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => handleAddExistingInterest(interest)}
                      className="px-3 py-1 rounded-full bg-black text-white hover:text-blue-100"
                    >
                      #{interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">enter a custom interest</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewInterest(e);
                    }
                }}
                placeholder="Type new interest"
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <button
                onClick={handleAddNewInterest}
                className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600"
              >
                Add
              </button>
            </div>
          </div>

          <DialogClose className="mt-4 w-full px-4 py-2 rounded-md bg-black">
            Close
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InterestSelector;