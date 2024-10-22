import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/api';
import CustomLayout from '@/components/MatchaLayout';
import ExploreFilters from '@/components/ExploreFilters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser } from '@/components/providers/UserProvider';
import { useUserData } from '@/hooks/useUserData';

const API_URL = "http://localhost:3000";

const Explore = () => {
  const { user } = useUser();
  const username = user?.username
  const { data: userInfo } = useUserData(username, username);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('famerating');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filters, setFilters] = useState({
    minAge: '',
    maxAge: '',
    maxDistance: '',
    interest: '',
    hasLocation: false
  })

  useEffect(() => {
    if (userInfo?.displayUser?.coordinates) {
      setFilters(prev => ({
        ...prev,
        hasLocation: true
      }));
    }
  }, [userInfo?.displayUser?.coordinates]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['suggestions', username],
    queryFn: async () => {
      const res = await fetcher(`${API_URL}/explore/get-suggestions`, { username,}, 'POST')
      setFilters(prev => ({
        ...prev,
        hasLocation: Boolean(userInfo?.displayUser?.coordinates)
      }))
      return res;
    },
    enabled: !!username,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const uniqueInterests = useMemo(() => {
    if (!data?.matches) return [];
    return [...new Set(data.matches.flatMap(match => match.interests || []))];
  }, [data?.matches]);

  const filteredSuggestions = useMemo(() => {
    if (!data?.matches) return [];

    return data.matches.filter(profile => {
      const searchProfiles =
      profile.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.interests?.some(interest => interest.toLowerCase().includes(searchTerm.toLowerCase()))
      if (!searchProfiles) return false;

      if (filters.minAge && profile.age < filters.minAge) return false;
      if (filters.maxAge && profile.age > filters.maxAge) return false;

      if (filters.hasLocation && filters.maxDistance && userInfo?.displayUser?.coordinates && profile.coordinates) {
        const distance = calculateDistance(userInfo.displayUser.coordinates, profile.coordinates);
        return distance <= filters.maxDistance;
      }

      if (filters.interest && !profile.interests?.includes(filters.interest)) return false;

      return true;
    });
  }, [data?.matches, searchTerm, filters, userInfo?.displayUser]);

  const sortedSuggestions = useMemo(() => {
    return [...filteredSuggestions].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }, [filteredSuggestions, sortField, sortDirection]);

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
            <CardTitle className="text-2xl font-bold">Potential Matches</CardTitle>
            <div className="space-y-4">
              <Input
                placeholder="Search by name or interests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <ExploreFilters 
                filters={filters}
                setFilters={setFilters}
              />
            </div>
          </CardHeader>
          <CardContent>
            {/* ... existing table code ... */}
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