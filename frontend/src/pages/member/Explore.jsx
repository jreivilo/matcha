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
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@radix-ui/react-select'
import { useUser } from '@/components/providers/UserProvider';
import { useUserData } from '@/hooks/useUserData';

const API_URL = "http://localhost:3000";

const ExploreFilters = ({ filters, setFilters, uniqueInterests }) => {

  const handleReset = () => {
    setFilters({
      minAge: '',
      maxAge: '',
      maxDistance: '',
      interest: '',
      hasLocation: false
    });
  };
  
    return (
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm">Age Range:</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              className="w-20"
              placeholder="Min"
              value={filters.minAge || ''}
              onChange={(e) => setFilters({ ...filters, minAge: e.target.value })}
            />
            <span>-</span>
            <Input
              type="number"
              className="w-20"
              placeholder="Max"
              value={filters.maxAge || ''}
              onChange={(e) => setFilters({ ...filters, maxAge: e.target.value })}
            />
          </div>
        </div>
  
        {filters.hasLocation && (
          <div className="flex items-center gap-2">
            <label className="text-sm">Max Distance (km):</label>
            <Input
              type="number"
              className="w-24"
              placeholder="Distance"
              value={filters.maxDistance || ''}
              onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value })}
            />
          </div>
        )}
  
        <div className="flex items-center gap-2">
          <label className="text-sm">Interests:</label>
          <Select
            value={filters.interest || ''}
            onValueChange={(value) => setFilters({ ...filters, interest: value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yeah">Any</SelectItem>
              {uniqueInterests?.map(interest => (
                <SelectItem key={interest} value={interest}>{interest}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
  
        <Button 
          variant="outline"
          onClick={handleReset}
          className="ml-auto"
        >
          Clear Filters
        </Button>
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

  const sortedSuggestions = filteredSuggestions?.sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
  });

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
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Potential suggestiosn</CardTitle>
            <div className="space-y-4">
              <ExploreFilters filters={filters} setFilters={setFilters} uniqueInterests={uniqueInterests}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profile</TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('famerating')}
                      >
                        Fame Rating {sortField === 'famerating' && (sortDirection === 'desc' ? '↓' : '↑')}
                      </Button>
                    </TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Interests</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSuggestions.map((match) => (
                    <TableRow key={match.email}>
                      <TableCell>
                        <Link to={`/profile?username=${match.username}`} className="flex items-center gap-2">
                          {match.picture_path && (
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img
                                src={match.picture_path}
                                alt={match.first_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">
                              {match.first_name} {match.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {match.coordinates}
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>{match.famerating}</TableCell>
                      <TableCell>{match.gender}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {match.interests?.map(interest => (
                            <Badge key={interest} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {match.active ? (
                          <Badge variant="success">Online</Badge>
                        ) : (
                          <Badge variant="secondary">Offline</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/profile?username=${match.username}`}>
                            View Profile
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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