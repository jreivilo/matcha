import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/api';
import CustomLayout from '@/components/MatchaLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUser } from '@/components/providers/UserProvider';
import { useUserData } from '@/hooks/useUserData';

const API_URL = "http://localhost:3000";

const SORT_OPTIONS = [
  { label: 'Fame Rating', field: 'famerating' },
  { label: 'Distance', field: 'distance' },
  { label: 'Common Interests', field: 'commonInterests' }
];

const calculateCommonInterests = (userInterests, matchInterests) => {
  if (!userInterests || !matchInterests) return 0;
  const userInterestSet = new Set(userInterests);
  return matchInterests.filter(interest => userInterestSet.has(interest)).length;
};


const additionalFilters = {
  onlineOnly: false,
  minFameRating: '',
  gender: 'any',
  sortBy: 'distance' // or 'famerating', 'lastActive'
};

const FilterChips = ({ activeFilters, onRemove }) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {Object.entries(activeFilters).map(([key, value]) => (
      <Badge key={key} variant="outline" className="flex items-center gap-1">
        {key}: {value}
        <button onClick={() => onRemove(key)}>&times;</button>
      </Badge>
    ))}
  </div>
);

const SortingHeader = ({ sortField, sortDirection, onSort }) => (
  <div className="flex items-center gap-4 mb-4">
    <span className="text-sm font-medium">Sort by:</span>
    <div className="flex gap-2">
      {SORT_OPTIONS.map(({ label, field }) => (
        <Button
          key={field}
          variant={sortField === field ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onSort(field)}
          className="flex items-center gap-1"
        >
          {label}
          {sortField === field && (
            <span className="ml-1">
              {sortDirection === 'desc' ? '↓' : '↑'}
            </span>
          )}
        </Button>
      ))}
    </div>
  </div>
);

const MatchSkeleton = () => (
  <div className="animate-pulse flex items-center gap-4 p-4">
    <div className="w-12 h-12 rounded-full bg-gray-200" />
    <div className="space-y-2">
      <div className="h-4 w-32 bg-gray-200 rounded" />
      <div className="h-3 w-24 bg-gray-200 rounded" />
    </div>
  </div>
);

const ExploreFilters = ({ filters, setFilters, uniqueInterests }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Age Range */}
        <div className="flex items-center gap-2 bg-black/5 p-2 rounded-lg">
          <label className="text-sm font-medium">Age:</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              className="w-16 h-8 text-center"
              placeholder="Min"
              value={filters.minAge || ''}
              onChange={(e) => setFilters({ ...filters, minAge: e.target.value })}
            />
            <span>-</span>
            <Input
              type="number"
              className="w-16 h-8 text-center"
              placeholder="Max"
              value={filters.maxAge || ''}
              onChange={(e) => setFilters({ ...filters, maxAge: e.target.value })}
            />
          </div>
        </div>

        {/* Distance if location available */}
        {filters.hasLocation && (
          <div className="flex items-center gap-2 bg-black/5 p-2 rounded-lg">
            <label className="text-sm font-medium">Distance:</label>
            <Input
              type="number"
              className="w-20 h-8 text-center"
              placeholder="km"
              value={filters.maxDistance || ''}
              onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value })}
            />
            <span className="text-sm">km</span>
          </div>
        )}

        {/* Interests Selector */}
        <Dialog>
          <DialogTrigger className="flex items-center gap-2 bg-black/5 p-2 rounded-lg hover:bg-black/10 transition">
            <label className="text-sm font-medium">Interests:</label>
            <span className="text-sm">{filters.interest || 'Any'}</span>
          </DialogTrigger>
          <DialogContent className="max-w-md" aria-label="Interests Selector">
            <DialogHeader>
              <DialogTitle>Select Interest</DialogTitle>
            </DialogHeader>
            <div className="max-h-60 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`p-2 rounded-lg text-sm ${!filters.interest ? 'bg-blue-500 text-white' : 'bg-black/5 hover:bg-black/10'}`}
                  onClick={() => setFilters({ ...filters, interest: '' })}
                >
                  Any
                </button>
                {uniqueInterests?.map(interest => (
                  <button
                    key={interest}
                    className={`p-2 rounded-lg text-sm ${filters.interest === interest ? 'bg-blue-500 text-white' : 'bg-black/5 hover:bg-black/10'}`}
                    onClick={() => setFilters({ ...filters, interest })}
                  >
                    #{interest}
                  </button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button 
          variant="outline"
          onClick={() => setFilters({})}
          className="ml-auto"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

const Explore = () => {
  const { user } = useUser();
  const username = user?.username

  const [sortField, setSortField] = useState('famerating');
  const [sortDirection, setSortDirection] = useState('desc');

  
  const [filters, setFilters] = useState({
    minAge: '',
    maxAge: '',
    maxDistance: '',
    interest: '',
    hasLocation: false
  })

  const { data: userInfo, isLoading: userInfoLoading } = useUserData(username, username);

  const { data: suggestions, isLoading : suggestionsLoading, error } = useQuery({
    queryKey: ['suggestions', username],
    queryFn: async () => fetcher(`${API_URL}/explore/get-suggestions`, { username,}, 'POST'),
    enabled: !!username,
  });

  useEffect(() => {
    if (userInfo?.displayUser?.coordinates) {
      setFilters(prev => ({
        ...prev,
        hasLocation: true
      }));
    }
  }, [userInfo]);

  if (userInfoLoading || suggestionsLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const uniqueInterests = (() => {
    if (!suggestions?.matches) return [];
    const interests = suggestions.matches.map(match => match.interests).flat();
    return [...new Set(interests)];
  })();
  

  const filteredSuggestions = suggestions?.matches?.filter(profile => {
    if (filters.minAge && profile.age < filters.minAge) return false;
    if (filters.maxAge && profile.age > filters.maxAge) return false;
    if (filters.hasLocation && filters.maxDistance && userInfo?.displayUser?.coordinates && profile.coordinates) {
      const distance = calculateDistance(userInfo.displayUser.coordinates, profile.coordinates);
      return distance <= filters.maxDistance;
    }
    if (filters.interest && !profile.interests?.includes(filters.interest)) return false;
    return true;
  });

  const sortedSuggestions = useMemo(() => {
    if (!filteredSuggestions) return [];
    
    return [...filteredSuggestions].sort((a, b) => {
      if (sortField === 'distance') {
        if (!userInfo?.displayUser?.coordinates) return 0;
        const distanceA = calculateDistance(userInfo.displayUser.coordinates, a.coordinates);
        const distanceB = calculateDistance(userInfo.displayUser.coordinates, b.coordinates);
        return sortDirection === 'desc' ? distanceB - distanceA : distanceA - distanceB;
      }
      
      if (sortField === 'commonInterests') {
        const aCommon = calculateCommonInterests(userInfo?.displayUser?.interests, a.interests);
        const bCommon = calculateCommonInterests(userInfo?.displayUser?.interests, b.interests);
        return sortDirection === 'desc' ? bCommon - aCommon : aCommon - bCommon;
      }
      
      // Default famerating sort
      return sortDirection === 'desc' ? b[sortField] - a[sortField] : a[sortField] - b[sortField];
    });
  }, [filteredSuggestions, sortField, sortDirection, userInfo]);
  

  {!sortedSuggestions?.length && (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium">No matches found</h3>
      <p className="text-gray-500">Try adjusting your filters</p>
    </div>
  )}

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <CustomLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="space-y-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Discover People
              </CardTitle>
              <Badge variant="outline" className="px-4 py-1">
                {sortedSuggestions?.length || 0} matches
              </Badge>
            </div>
            <ExploreFilters filters={filters} setFilters={setFilters} uniqueInterests={uniqueInterests} />
            <SortingHeader 
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedSuggestions?.map((match) => (
                <div className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <Link 
                    key={match.email}
                    to={`/member/profile?username=${match.username}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg transition">
                      <div className="flex items-center gap-4">
                        {match.picture_path && (
                          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-100 transition">
                            <img
                              src={match.picture_path}
                              alt={match.first_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                      <div className="font-medium">{match.first_name} {match.last_name}</div>
                      <div className="flex items-center gap-2">
                        <span>Fame: {match.famerating}</span>
                        <span>•</span>
                        <span>{match.gender}</span>
                        {match.coordinates && userInfo?.displayUser?.coordinates && (
                          <>
                            <span>•</span>
                            <span>{Math.round(calculateDistance(userInfo.displayUser.coordinates, match.coordinates))}km away</span>
                          </>
                        )}
                        {match.interests && userInfo?.displayUser?.interests && (
                          <>
                            <span>•</span>
                            <span>{calculateCommonInterests(userInfo.displayUser.interests, match.interests)} common interests</span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {match.interests?.map(interest => (
                          <Badge 
                            key={interest} 
                            variant={userInfo?.displayUser?.interests?.includes(interest) ? "default" : "secondary"}
                            className="text-xs"
                          >
                            #{interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={match.active ? "success" : "secondary"}>
                      {match.active ? "Online" : "Offline"}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </div>
                </div>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomLayout>
  );
};


const calculateDistance = (coords1, coords2) => {
  // Convert coords strings to arrays of numbers
  const [lat1, lon1] = coords1.split(',').map(Number);
  const [lat2, lon2] = coords2.split(',').map(Number);
  
  // Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};



export default Explore;